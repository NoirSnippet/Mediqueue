const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

// helper for local YYYY-MM-DD date string
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// admin dashboard overview metrics
async function getDashboardStats(req, res, next) {
  try {
    const todayStr = getTodayStr();

    // total patient count
    const [patientCount] = await pool.query('SELECT COUNT(*) AS count FROM patients');

    // total registered doctors
    const [doctorCount] = await pool.query('SELECT COUNT(*) AS count FROM doctors');

    // overall appointment count
    const [appointmentCount] = await pool.query('SELECT COUNT(*) AS count FROM appointments');

    // appointments scheduled for today
    const [todayCount] = await pool.query('SELECT COUNT(*) AS count FROM appointments WHERE appointment_date = ?', [todayStr]);

    // patients currently waiting in line today
    const [waitingCount] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM queues 
       WHERE queue_date = ? AND queue_status = 'Waiting'`,
      [todayStr]
    );

    // currently inside consultation rooms
    const [activeConsultationCount] = await pool.query(
      `SELECT COUNT(*) AS count 
       FROM queues 
       WHERE queue_date = ? AND queue_status = 'In Consultation'`,
      [todayStr]
    );

    // latest 5 appointments
    const [recentAppointments] = await pool.query(
      `SELECT 
        a.id,
        a.appointment_reference,
        a.appointment_date,
        a.appointment_time,
        a.appointment_status,
        u_pat.name AS patient_name,
        u_doc.name AS doctor_name,
        d.specialization,
        q.queue_number,
        q.queue_status
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN users u_pat ON p.user_id = u_pat.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u_doc ON d.user_id = u_doc.id
       LEFT JOIN queues q ON a.id = q.appointment_id
       ORDER BY a.created_at DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      stats: {
        totalPatients: patientCount[0].count || 0,
        totalDoctors: doctorCount[0].count || 0,
        totalAppointments: appointmentCount[0].count || 0,
        todayAppointments: todayCount[0].count || 0,
        waitingAppointments: waitingCount[0].count || 0,
        activeConsultation: activeConsultationCount[0].count || 0,
        recentAppointments,
      },
    });
  } catch (error) {
    next(error);
  }
}

// list all doctors with admin management info
async function getAllDoctorsAdmin(req, res, next) {
  try {
    const [doctors] = await pool.query(`
      SELECT 
        d.id,
        d.user_id,
        u.name AS doctor_name,
        u.email,
        u.phone,
        u.account_status,
        u.created_at,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.bio,
        d.room_number,
        d.availability_status,
        c.id AS clinic_id,
        c.clinic_name,
        (SELECT COUNT(*) FROM doctor_schedules WHERE doctor_id = d.id AND is_active = TRUE) AS active_schedules_count
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN clinics c ON d.clinic_id = c.id
      ORDER BY d.id ASC
    `);

    return res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
}

// admin creates a new doctor user and attaches default weekly schedule
async function createDoctor(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const {
      name,
      email,
      phone,
      password,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      room_number,
      bio,
      clinic_id,
    } = req.body;

    if (!name || !email || !phone || !specialization || !qualification) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, specialization, and qualification are required.',
      });
    }

    // avoid duplicate email accounts
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    const defaultPass = password && password.trim() ? password.trim() : 'password123';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPass, salt);

    await connection.beginTransaction();

    // create base user record
    const [userResult] = await connection.query(
      `INSERT INTO users (name, email, phone, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, 'doctor', 'active')`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
    );

    const userId = userResult.insertId;

    // insert doctor profile
    const [docResult] = await connection.query(
      `INSERT INTO doctors (user_id, clinic_id, specialization, qualification, experience_years, consultation_fee, bio, room_number, availability_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'available')`,
      [
        userId,
        clinic_id || 1,
        specialization.trim(),
        qualification.trim(),
        experience_years ? parseInt(experience_years, 10) : 0,
        consultation_fee ? parseFloat(consultation_fee) : 300.0,
        bio || 'General medical practitioner.',
        room_number || 'Room 101',
      ]
    );

    const doctorId = docResult.insertId;

    // default Mon-Fri working schedule
    const defaultDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    for (const day of defaultDays) {
      await connection.query(
        `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active)
         VALUES (?, ?, '09:00:00', '13:00:00', 20, 1, TRUE)`,
        [doctorId, day]
      );
    }

    await connection.commit();

    return res.status(201).json({
      success: true,
      message: `Doctor account for Dr. ${name} created successfully with default schedule.`,
      doctorId,
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// update doctor details
async function updateDoctor(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const doctorId = req.params.id;
    const {
      name,
      phone,
      specialization,
      qualification,
      experience_years,
      consultation_fee,
      room_number,
      bio,
      availability_status,
      clinic_id,
    } = req.body;

    await connection.beginTransaction();

    const [doctors] = await connection.query('SELECT user_id FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const userId = doctors[0].user_id;

    if (name || phone) {
      await connection.query('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone) WHERE id = ?', [
        name ? name.trim() : null,
        phone ? phone.trim() : null,
        userId,
      ]);
    }

    await connection.query(
      `UPDATE doctors 
       SET specialization = COALESCE(?, specialization),
           qualification = COALESCE(?, qualification),
           experience_years = COALESCE(?, experience_years),
           consultation_fee = COALESCE(?, consultation_fee),
           room_number = COALESCE(?, room_number),
           bio = COALESCE(?, bio),
           availability_status = COALESCE(?, availability_status),
           clinic_id = COALESCE(?, clinic_id)
       WHERE id = ?`,
      [
        specialization || null,
        qualification || null,
        experience_years !== undefined ? parseInt(experience_years, 10) : null,
        consultation_fee !== undefined ? parseFloat(consultation_fee) : null,
        room_number || null,
        bio || null,
        availability_status || null,
        clinic_id || null,
        doctorId,
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'Doctor details updated successfully.',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// activate or deactivate a doctor's account
async function toggleDoctorStatus(req, res, next) {
  try {
    const doctorId = req.params.id;

    const [doctors] = await pool.query(
      `SELECT d.id, u.id AS user_id, u.name, u.account_status 
       FROM doctors d 
       JOIN users u ON d.user_id = u.id 
       WHERE d.id = ?`,
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const doc = doctors[0];
    const newStatus = doc.account_status === 'active' ? 'inactive' : 'active';

    await pool.query('UPDATE users SET account_status = ? WHERE id = ?', [newStatus, doc.user_id]);

    return res.json({
      success: true,
      message: `Doctor account for ${doc.name} is now ${newStatus}.`,
      account_status: newStatus,
    });
  } catch (error) {
    next(error);
  }
}

// view all patients registered in the clinic
async function getAllPatients(req, res, next) {
  try {
    const { search } = req.query;

    let sql = `
      SELECT 
        p.id AS patient_id,
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.account_status,
        u.created_at,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.emergency_contact,
        p.address,
        (SELECT COUNT(*) FROM appointments WHERE patient_id = p.id) AS appointment_count
      FROM patients p
      JOIN users u ON p.user_id = u.id
    `;

    const params = [];
    if (search && search.trim()) {
      sql += ` WHERE (u.name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
    }

    sql += ` ORDER BY u.created_at DESC`;

    const [patients] = await pool.query(sql, params);

    return res.json({
      success: true,
      count: patients.length,
      patients,
    });
  } catch (error) {
    next(error);
  }
}

// suspend or activate patient account
async function togglePatientStatus(req, res, next) {
  try {
    const patientId = req.params.id;

    const [rows] = await pool.query(
      `SELECT p.id, u.id AS user_id, u.name, u.account_status 
       FROM patients p 
       JOIN users u ON p.user_id = u.id 
       WHERE p.id = ?`,
      [patientId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient record not found.',
      });
    }

    const patient = rows[0];
    const newStatus = patient.account_status === 'active' ? 'suspended' : 'active';

    await pool.query('UPDATE users SET account_status = ? WHERE id = ?', [newStatus, patient.user_id]);

    return res.json({
      success: true,
      message: `Patient account for ${patient.name} is now ${newStatus}.`,
      account_status: newStatus,
    });
  } catch (error) {
    next(error);
  }
}

// global appointment search & filter for admin
async function getAllAppointmentsAdmin(req, res, next) {
  try {
    const { doctor_id, date, status, search } = req.query;

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
        p.id AS patient_id,
        u_pat.name AS patient_name,
        u_pat.phone AS patient_phone,
        d.id AS doctor_id,
        u_doc.name AS doctor_name,
        d.specialization,
        c.clinic_name,
        q.queue_number,
        q.queue_status
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN users u_pat ON p.user_id = u_pat.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN users u_doc ON d.user_id = u_doc.id
      JOIN clinics c ON a.clinic_id = c.id
      LEFT JOIN queues q ON a.id = q.appointment_id
      WHERE 1=1
    `;

    const params = [];

    if (doctor_id && doctor_id !== 'all') {
      sql += ` AND a.doctor_id = ?`;
      params.push(doctor_id);
    }

    if (date) {
      sql += ` AND a.appointment_date = ?`;
      params.push(date);
    }

    if (status && status !== 'all') {
      sql += ` AND a.appointment_status = ?`;
      params.push(status);
    }

    if (search && search.trim()) {
      sql += ` AND (u_pat.name LIKE ? OR a.appointment_reference LIKE ? OR u_doc.name LIKE ?)`;
      const term = `%${search.trim()}%`;
      params.push(term, term, term);
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

// fetch clinic details
async function getClinicSettings(req, res, next) {
  try {
    const [clinics] = await pool.query('SELECT * FROM clinics WHERE id = 1');
    if (clinics.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Default clinic settings not found.',
      });
    }

    return res.json({
      success: true,
      clinic: clinics[0],
    });
  } catch (error) {
    next(error);
  }
}

// update clinic name, contact, operating hours
async function updateClinicSettings(req, res, next) {
  try {
    const { clinic_name, address, contact_number, email, opening_time, closing_time } = req.body;

    await pool.query(
      `UPDATE clinics 
       SET clinic_name = COALESCE(?, clinic_name),
           address = COALESCE(?, address),
           contact_number = COALESCE(?, contact_number),
           email = COALESCE(?, email),
           opening_time = COALESCE(?, opening_time),
           closing_time = COALESCE(?, closing_time)
       WHERE id = 1`,
      [
        clinic_name || null,
        address || null,
        contact_number || null,
        email || null,
        opening_time || null,
        closing_time || null,
      ]
    );

    return res.json({
      success: true,
      message: 'Clinic information updated successfully.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardStats,
  getAllDoctorsAdmin,
  createDoctor,
  updateDoctor,
  toggleDoctorStatus,
  getAllPatients,
  togglePatientStatus,
  getAllAppointmentsAdmin,
  getClinicSettings,
  updateClinicSettings,
};
