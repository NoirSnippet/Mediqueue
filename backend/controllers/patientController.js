const { pool } = require('../config/db');

// helper for local YYYY-MM-DD date string
const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// get current patient profile details
async function getPatientProfile(req, res, next) {
  try {
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT 
        u.id AS user_id,
        u.name,
        u.email,
        u.phone,
        u.account_status,
        u.created_at,
        p.id AS patient_id,
        p.date_of_birth,
        p.gender,
        p.blood_group,
        p.emergency_contact,
        p.address,
        p.medical_history
       FROM users u
       JOIN patients p ON u.id = p.user_id
       WHERE u.id = ?`,
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found.',
      });
    }

    return res.json({
      success: true,
      profile: rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// update personal details and medical history
async function updatePatientProfile(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const userId = req.user.id;
    const { name, phone, date_of_birth, gender, blood_group, emergency_contact, address, medical_history } = req.body;

    await connection.beginTransaction();

    if (name || phone) {
      await connection.query(
        `UPDATE users 
         SET name = COALESCE(?, name), phone = COALESCE(?, phone) 
         WHERE id = ?`,
        [name ? name.trim() : null, phone ? phone.trim() : null, userId]
      );
    }

    await connection.query(
      `UPDATE patients 
       SET date_of_birth = COALESCE(?, date_of_birth),
           gender = COALESCE(?, gender),
           blood_group = COALESCE(?, blood_group),
           emergency_contact = COALESCE(?, emergency_contact),
           address = COALESCE(?, address),
           medical_history = COALESCE(?, medical_history)
       WHERE user_id = ?`,
      [
        date_of_birth || null,
        gender || null,
        blood_group || null,
        emergency_contact || null,
        address || null,
        medical_history || null,
        userId,
      ]
    );

    await connection.commit();

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// summary counts and next appointment for patient dashboard
async function getPatientDashboardStats(req, res, next) {
  try {
    const patientId = req.user.patient_id;
    if (!patientId) {
      return res.status(403).json({
        success: false,
        message: 'Patient ID missing from authentication session.',
      });
    }

    const todayStr = getTodayStr();

    // count total bookings made by patient
    const [totalRows] = await pool.query('SELECT COUNT(*) AS total FROM appointments WHERE patient_id = ?', [patientId]);

    // count upcoming active appointments
    const [upcomingRows] = await pool.query(
      `SELECT COUNT(*) AS upcoming 
       FROM appointments 
       WHERE patient_id = ? 
         AND appointment_date >= ? 
         AND appointment_status NOT IN ('Completed', 'Cancelled')`,
      [patientId, todayStr]
    );

    // count completed visits
    const [completedRows] = await pool.query(
      `SELECT COUNT(*) AS completed FROM appointments WHERE patient_id = ? AND appointment_status = 'Completed'`,
      [patientId]
    );

    // fetch the immediate next upcoming appointment
    const [nextAppointmentRows] = await pool.query(
      `SELECT 
        a.id,
        a.appointment_reference,
        a.appointment_date,
        a.appointment_time,
        a.appointment_status,
        u.name AS doctor_name,
        d.specialization,
        d.room_number,
        c.clinic_name,
        q.queue_number,
        q.queue_status
       FROM appointments a
       JOIN doctors d ON a.doctor_id = d.id
       JOIN users u ON d.user_id = u.id
       JOIN clinics c ON a.clinic_id = c.id
       LEFT JOIN queues q ON a.id = q.appointment_id
       WHERE a.patient_id = ? 
         AND a.appointment_date >= ?
         AND a.appointment_status NOT IN ('Completed', 'Cancelled')
       ORDER BY a.appointment_date ASC, a.appointment_time ASC
       LIMIT 1`,
      [patientId, todayStr]
    );

    return res.json({
      success: true,
      stats: {
        totalAppointments: totalRows[0].total || 0,
        upcomingAppointments: upcomingRows[0].upcoming || 0,
        completedAppointments: completedRows[0].completed || 0,
        nextAppointment: nextAppointmentRows.length > 0 ? nextAppointmentRows[0] : null,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientDashboardStats,
};
