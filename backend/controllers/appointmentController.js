const { pool } = require('../config/db');
const { generateAppointmentReference } = require('../utils/refGenerator');

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// book a doctor slot and create the queue token
async function bookAppointment(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const patientId = req.user.patient_id;
    if (!patientId) {
      return res.status(403).json({
        success: false,
        message: 'Only registered patients can book appointments.',
      });
    }

    const { doctor_id, appointment_date, appointment_time, reason_for_visit } = req.body;

    // make sure the slot isn't in the past
    const appointmentDateTime = new Date(`${appointment_date}T${appointment_time}`);
    const now = new Date();
    if (appointmentDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book appointments for past dates or elapsed time slots.',
      });
    }

    // get the weekday name for schedule lookup
    const targetDateObj = new Date(appointment_date + 'T00:00:00');
    const dayName = DAYS_OF_WEEK[targetDateObj.getDay()];

    // start transaction to keep booking and queue record consistent
    await connection.beginTransaction();

    // fetch doctor and clinic details (compatible with both MariaDB and MySQL)
    const [doctors] = await connection.query(
      `SELECT d.id, d.clinic_id, d.availability_status, u.name AS doctor_name, c.clinic_name
       FROM doctors d
       JOIN users u ON d.user_id = u.id
       JOIN clinics c ON d.clinic_id = c.id
       WHERE d.id = ?`,
      [doctor_id]
    );

    if (doctors.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'The requested doctor was not found.',
      });
    }

    const doctor = doctors[0];
    if (doctor.availability_status !== 'available') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.doctor_name} is currently ${doctor.availability_status.replace('_', ' ')}. Booking unavailable.`,
      });
    }

    // check if the doctor actually works on this day
    const [schedules] = await connection.query(
      `SELECT start_time, end_time, slot_duration_minutes, is_active
       FROM doctor_schedules
       WHERE doctor_id = ? AND day_of_week = ? AND is_active = TRUE`,
      [doctor_id, dayName]
    );

    if (schedules.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: `Dr. ${doctor.doctor_name} does not hold appointments on ${dayName}s.`,
      });
    }

    // check for double booking on this slot (row lock with FOR UPDATE)
    const normalizedTime = appointment_time.length === 5 ? `${appointment_time}:00` : appointment_time;
    const [existingBookings] = await connection.query(
      `SELECT id, appointment_reference 
       FROM appointments 
       WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND appointment_time = ? 
         AND appointment_status != 'Cancelled'
       FOR UPDATE`,
      [doctor_id, appointment_date, normalizedTime]
    );

    if (existingBookings.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'This time slot was just booked by another patient. Please select another slot.',
      });
    }

    // generate a unique booking reference code
    let appointmentRef = generateAppointmentReference();
    let isUnique = false;
    let attempts = 0;
    while (!isUnique && attempts < 10) {
      attempts++;
      const [checkRef] = await connection.query('SELECT id FROM appointments WHERE appointment_reference = ?', [appointmentRef]);
      if (checkRef.length === 0) {
        isUnique = true;
      } else {
        appointmentRef = generateAppointmentReference();
      }
    }

    // save the appointment record
    const [appointmentResult] = await connection.query(
      `INSERT INTO appointments (
         appointment_reference,
         patient_id,
         doctor_id,
         clinic_id,
         appointment_date,
         appointment_time,
         reason_for_visit,
         appointment_status
       ) VALUES (?, ?, ?, ?, ?, ?, ?, 'Confirmed')`,
      [
        appointmentRef,
        patientId,
        doctor_id,
        doctor.clinic_id,
        appointment_date,
        normalizedTime,
        reason_for_visit || 'General Consultation',
      ]
    );

    const appointmentId = appointmentResult.insertId;

    // calculate next queue token number for this doctor on this day
    const [queueSeq] = await connection.query(
      `SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_queue 
       FROM queues 
       WHERE doctor_id = ? AND queue_date = ? 
       FOR UPDATE`,
      [doctor_id, appointment_date]
    );

    const nextQueueNumber = queueSeq[0].next_queue;

    // insert into queue table with Waiting status
    await connection.query(
      `INSERT INTO queues (appointment_id, doctor_id, queue_date, queue_number, queue_status)
       VALUES (?, ?, ?, ?, 'Waiting')`,
      [appointmentId, doctor_id, appointment_date, nextQueueNumber]
    );

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully and queue token issued!',
      appointment: {
        id: appointmentId,
        appointment_reference: appointmentRef,
        appointment_date,
        appointment_time: normalizedTime,
        status: 'Confirmed',
        queue_number: nextQueueNumber,
        queue_status: 'Waiting',
        doctor_name: doctor.doctor_name,
        clinic_name: doctor.clinic_name,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// get list of appointments for the logged-in patient
async function getPatientAppointments(req, res, next) {
  try {
    const patientId = req.user.patient_id;
    if (!patientId) {
      return res.status(403).json({
        success: false,
        message: 'Patient profile not found for this account.',
      });
    }

    const { status, date } = req.query;

    let sql = `
      SELECT 
        a.id,
        a.appointment_reference,
        a.appointment_date,
        a.appointment_time,
        a.reason_for_visit,
        a.appointment_status,
        a.cancellation_reason,
        a.created_at,
        d.id AS doctor_id,
        u_doc.name AS doctor_name,
        d.specialization,
        d.qualification,
        d.consultation_fee,
        d.room_number,
        c.clinic_name,
        c.address AS clinic_address,
        c.contact_number AS clinic_contact,
        q.queue_number,
        q.queue_status
      FROM appointments a
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u_doc ON d.user_id = u_doc.id
      JOIN clinics c ON a.clinic_id = c.id
      LEFT JOIN queues q ON a.id = q.appointment_id
      WHERE a.patient_id = ?
    `;

    const params = [patientId];

    if (status && status !== 'all') {
      sql += ` AND a.appointment_status = ?`;
      params.push(status);
    }

    if (date) {
      sql += ` AND a.appointment_date = ?`;
      params.push(date);
    }

    sql += ` ORDER BY a.appointment_date DESC, a.appointment_time DESC`;

    const [appointments] = await pool.query(sql, params);

    return res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
}

// get all appointments for the doctor dashboard
async function getDoctorAppointments(req, res, next) {
  try {
    const doctorId = req.user.doctor_id;
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'Doctor profile not found for this account.',
      });
    }

    const { status, date, search } = req.query;

    let sql = `
      SELECT 
        a.id,
        a.appointment_reference,
        a.appointment_date,
        a.appointment_time,
        a.reason_for_visit,
        a.appointment_status,
        a.cancellation_reason,
        a.notes,
        a.created_at,
        p.id AS patient_id,
        u_pat.name AS patient_name,
        u_pat.email AS patient_email,
        u_pat.phone AS patient_phone,
        p.gender AS patient_gender,
        p.blood_group AS patient_blood_group,
        p.date_of_birth AS patient_dob,
        q.id AS queue_id,
        q.queue_number,
        q.queue_status,
        q.called_at,
        q.completed_at
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_pat ON p.user_id = u_pat.id
      LEFT JOIN queues q ON a.id = q.appointment_id
      WHERE a.doctor_id = ?
    `;

    const params = [doctorId];

    if (status && status !== 'all') {
      sql += ` AND a.appointment_status = ?`;
      params.push(status);
    }

    if (date) {
      sql += ` AND a.appointment_date = ?`;
      params.push(date);
    }

    if (search && search.trim()) {
      sql += ` AND (u_pat.name LIKE ? OR a.appointment_reference LIKE ? OR u_pat.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY a.appointment_date ASC, a.appointment_time ASC`;

    const [appointments] = await pool.query(sql, params);

    return res.json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    next(error);
  }
}

// get a single appointment with full patient and doctor details
async function getAppointmentById(req, res, next) {
  try {
    const appointmentId = req.params.id;

    const [rows] = await pool.query(
      `SELECT 
        a.*,
        u_pat.name AS patient_name,
        u_pat.email AS patient_email,
        u_pat.phone AS patient_phone,
        p.gender AS patient_gender,
        p.blood_group,
        u_doc.name AS doctor_name,
        d.specialization,
        d.qualification,
        d.consultation_fee,
        d.room_number,
        c.clinic_name,
        c.address AS clinic_address,
        c.contact_number AS clinic_contact,
        q.queue_number,
        q.queue_status
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u_pat ON p.user_id = u_pat.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doc ON d.user_id = u_doc.id
       JOIN clinics c ON a.clinic_id = c.id
       LEFT JOIN queues q ON a.id = q.appointment_id
       WHERE a.id = ?`,
      [appointmentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    const appointment = rows[0];

    // check role permissions: patients see their own, doctors see theirs, admin can see all
    if (req.user.role === 'patient' && req.user.patient_id !== appointment.patient_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view this appointment.',
      });
    }

    if (req.user.role === 'doctor' && req.user.doctor_id !== appointment.doctor_id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view appointments assigned to other doctors.',
      });
    }

    return res.json({
      success: true,
      appointment,
    });
  } catch (error) {
    next(error);
  }
}

// update status for doctor/admin actions
async function updateAppointmentStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const appointmentId = req.params.id;
    const { status, notes } = req.body;

    const validStatuses = ['Booked', 'Confirmed', 'Waiting', 'In Consultation', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    await connection.beginTransaction();

    const [appointments] = await connection.query(
      'SELECT id, doctor_id, patient_id, appointment_status FROM appointments WHERE id = ? FOR UPDATE',
      [appointmentId]
    );

    if (appointments.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    const appointment = appointments[0];

    if (req.user.role === 'doctor' && req.user.doctor_id !== appointment.doctor_id) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only update appointments assigned to your schedule.',
      });
    }

    await connection.query(
      `UPDATE appointments 
       SET appointment_status = ?, notes = COALESCE(?, notes)
       WHERE id = ?`,
      [status, notes || null, appointmentId]
    );

    // keep the queue table in sync with the appointment status
    let queueStatus = null;
    let callTimeClause = '';
    let callParams = [];

    if (status === 'In Consultation') {
      queueStatus = 'In Consultation';
      callTimeClause = ', called_at = CURRENT_TIMESTAMP';
    } else if (status === 'Completed') {
      queueStatus = 'Completed';
      callTimeClause = ', completed_at = CURRENT_TIMESTAMP';
    } else if (status === 'Cancelled') {
      queueStatus = 'Cancelled';
    } else if (status === 'Waiting' || status === 'Confirmed' || status === 'Booked') {
      queueStatus = 'Waiting';
    }

    if (queueStatus) {
      await connection.query(
        `UPDATE queues 
         SET queue_status = ? ${callTimeClause}
         WHERE appointment_id = ?`,
        [queueStatus, ...callParams, appointmentId]
      );
    }

    await connection.commit();

    return res.json({
      success: true,
      message: `Appointment status updated to "${status}".`,
      appointmentId,
      status,
      queueStatus,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// cancel appointment by patient, doctor, or admin
async function cancelAppointment(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const appointmentId = req.params.id;
    const { cancellation_reason } = req.body;

    await connection.beginTransaction();

    const [appointments] = await connection.query(
      'SELECT id, doctor_id, patient_id, appointment_status, appointment_date, appointment_time FROM appointments WHERE id = ? FOR UPDATE',
      [appointmentId]
    );

    if (appointments.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Appointment not found.',
      });
    }

    const appt = appointments[0];

    if (req.user.role === 'patient' && req.user.patient_id !== appt.patient_id) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments.',
      });
    }

    if (req.user.role === 'doctor' && req.user.doctor_id !== appt.doctor_id) {
      await connection.rollback();
      return res.status(403).json({
        success: false,
        message: 'You can only cancel appointments under your schedule.',
      });
    }

    if (appt.appointment_status === 'Completed') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'Completed appointments cannot be cancelled.',
      });
    }

    if (appt.appointment_status === 'Cancelled') {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        message: 'This appointment is already cancelled.',
      });
    }

    const reason = cancellation_reason || `Cancelled by ${req.user.role} (${req.user.name})`;

    // set status to cancelled
    await connection.query(
      `UPDATE appointments 
       SET appointment_status = 'Cancelled', cancellation_reason = ? 
       WHERE id = ?`,
      [reason, appointmentId]
    );

    // mark queue token cancelled as well
    await connection.query(
      `UPDATE queues 
       SET queue_status = 'Cancelled' 
       WHERE appointment_id = ?`,
      [appointmentId]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'Appointment has been cancelled successfully.',
      appointmentId,
      status: 'Cancelled',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  bookAppointment,
  getPatientAppointments,
  getDoctorAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
