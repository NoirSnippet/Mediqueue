const { pool } = require('../config/db');
const { generateTimeSlots } = require('../utils/slotGenerator');

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// fetch doctors list with optional search and filters
async function getAllDoctors(req, res, next) {
  try {
    const { search, specialization, clinic_id, status } = req.query;

    let sql = `
      SELECT 
        d.id,
        d.user_id,
        u.name AS doctor_name,
        u.email,
        u.phone,
        u.account_status,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.bio,
        d.room_number,
        d.availability_status,
        c.id AS clinic_id,
        c.clinic_name,
        c.address AS clinic_address,
        c.contact_number AS clinic_contact
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN clinics c ON d.clinic_id = c.id
      WHERE u.account_status = 'active'
    `;

    const params = [];

    if (search && search.trim()) {
      sql += ` AND (u.name LIKE ? OR d.specialization LIKE ? OR d.qualification LIKE ?)`;
      const searchWildcard = `%${search.trim()}%`;
      params.push(searchWildcard, searchWildcard, searchWildcard);
    }

    if (specialization && specialization.trim()) {
      sql += ` AND d.specialization = ?`;
      params.push(specialization.trim());
    }

    if (clinic_id) {
      sql += ` AND d.clinic_id = ?`;
      params.push(clinic_id);
    }

    if (status) {
      sql += ` AND d.availability_status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY u.name ASC`;

    const [doctors] = await pool.query(sql, params);

    return res.json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (error) {
    next(error);
  }
}

// distinct specializations list for filter dropdowns
async function getSpecializations(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT DISTINCT specialization 
      FROM doctors 
      ORDER BY specialization ASC
    `);

    const specializations = rows.map((r) => r.specialization);

    return res.json({
      success: true,
      specializations,
    });
  } catch (error) {
    next(error);
  }
}

// get doctor profile by id along with their weekly schedule
async function getDoctorById(req, res, next) {
  try {
    const doctorId = req.params.id;

    const [doctors] = await pool.query(
      `SELECT 
        d.id,
        d.user_id,
        u.name AS doctor_name,
        u.email,
        u.phone,
        u.account_status,
        d.specialization,
        d.qualification,
        d.experience_years,
        d.consultation_fee,
        d.bio,
        d.room_number,
        d.availability_status,
        c.id AS clinic_id,
        c.clinic_name,
        c.address AS clinic_address,
        c.contact_number AS clinic_contact,
        c.opening_time,
        c.closing_time
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      JOIN clinics c ON d.clinic_id = c.id
      WHERE d.id = ?`,
      [doctorId]
    );

    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    const doctor = doctors[0];

    const [schedules] = await pool.query(
      `SELECT id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active
       FROM doctor_schedules
       WHERE doctor_id = ? AND is_active = TRUE
       ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
      [doctorId]
    );

    doctor.schedules = schedules;

    return res.json({
      success: true,
      doctor,
    });
  } catch (error) {
    next(error);
  }
}

// calculate available and booked slots for a specific date
async function getDoctorAvailability(req, res, next) {
  try {
    const doctorId = req.params.id;
    const { date } = req.query;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'A valid date parameter (YYYY-MM-DD) is required.',
      });
    }

    // check if doctor is available or on leave
    const [doctors] = await pool.query('SELECT availability_status FROM doctors WHERE id = ?', [doctorId]);
    if (doctors.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found.',
      });
    }

    if (doctors[0].availability_status !== 'available') {
      return res.json({
        success: true,
        date,
        isWorkingDay: false,
        message: `Doctor is currently ${doctors[0].availability_status.replace('_', ' ')}. No slots available.`,
        slots: [],
      });
    }

    // get day name for the requested date
    const targetDateObj = new Date(date + 'T00:00:00');
    const dayName = DAYS_OF_WEEK[targetDateObj.getDay()];

    // find schedule for that day
    const [schedules] = await pool.query(
      `SELECT start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active
       FROM doctor_schedules
       WHERE doctor_id = ? AND day_of_week = ? AND is_active = TRUE`,
      [doctorId, dayName]
    );

    if (schedules.length === 0) {
      return res.json({
        success: true,
        date,
        dayOfWeek: dayName,
        isWorkingDay: false,
        message: `Doctor does not hold consultation hours on ${dayName}s.`,
        slots: [],
      });
    }

    const schedule = schedules[0];

    // fetch all non-cancelled appointments already booked for that date
    const [bookedAppointments] = await pool.query(
      `SELECT appointment_time 
       FROM appointments
       WHERE doctor_id = ? 
         AND appointment_date = ? 
         AND appointment_status != 'Cancelled'`,
      [doctorId, date]
    );

    const bookedTimes = bookedAppointments.map((a) => a.appointment_time);

    // generate discrete slots and tag booked / past ones
    const slots = generateTimeSlots(schedule, bookedTimes, date);

    return res.json({
      success: true,
      date,
      dayOfWeek: dayName,
      isWorkingDay: true,
      schedule: {
        startTime: schedule.start_time,
        endTime: schedule.end_time,
        slotDuration: schedule.slot_duration_minutes,
      },
      availableSlotsCount: slots.filter((s) => s.isAvailable).length,
      totalSlotsCount: slots.length,
      slots,
    });
  } catch (error) {
    next(error);
  }
}

// get schedule list for the logged-in doctor
async function getMySchedules(req, res, next) {
  try {
    const doctorId = req.user.doctor_id;
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        message: 'No doctor profile linked to this account.',
      });
    }

    const [schedules] = await pool.query(
      `SELECT id, day_of_week, start_time, end_time, slot_duration_minutes, max_patients_per_slot, is_active
       FROM doctor_schedules
       WHERE doctor_id = ?
       ORDER BY FIELD(day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')`,
      [doctorId]
    );

    return res.json({
      success: true,
      schedules,
    });
  } catch (error) {
    next(error);
  }
}

// create or update doctor working hours
async function saveSchedule(req, res, next) {
  try {
    const doctorId = req.user.doctor_id;
    const { day_of_week, start_time, end_time, slot_duration_minutes, is_active } = req.body;

    const duration = slot_duration_minutes ? parseInt(slot_duration_minutes, 10) : 20;
    const activeFlag = is_active !== undefined ? Boolean(is_active) : true;

    await pool.query(
      `INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, slot_duration_minutes, is_active)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         start_time = VALUES(start_time),
         end_time = VALUES(end_time),
         slot_duration_minutes = VALUES(slot_duration_minutes),
         is_active = VALUES(is_active)`,
      [doctorId, day_of_week, start_time, end_time, duration, activeFlag]
    );

    return res.json({
      success: true,
      message: `Schedule for ${day_of_week} updated successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

// remove schedule entry
async function deleteSchedule(req, res, next) {
  try {
    const doctorId = req.user.doctor_id;
    const scheduleId = req.params.id;

    const [schedules] = await pool.query(
      'SELECT id, day_of_week FROM doctor_schedules WHERE id = ? AND doctor_id = ?',
      [scheduleId, doctorId]
    );

    if (schedules.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found or not owned by doctor.',
      });
    }

    await pool.query('DELETE FROM doctor_schedules WHERE id = ?', [scheduleId]);

    return res.json({
      success: true,
      message: `Schedule for ${schedules[0].day_of_week} deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
}

// toggle doctor status (available, on_leave, busy)
async function updateAvailabilityStatus(req, res, next) {
  try {
    const doctorId = req.user.doctor_id;
    const { availability_status } = req.body;

    const validStatuses = ['available', 'on_leave', 'busy'];
    if (!validStatuses.includes(availability_status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    await pool.query('UPDATE doctors SET availability_status = ? WHERE id = ?', [availability_status, doctorId]);

    return res.json({
      success: true,
      message: `Doctor status updated to "${availability_status}".`,
      availability_status,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllDoctors,
  getSpecializations,
  getDoctorById,
  getDoctorAvailability,
  getMySchedules,
  saveSchedule,
  deleteSchedule,
  updateAvailabilityStatus,
};
