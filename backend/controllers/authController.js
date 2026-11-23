const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { JWT_SECRET } = require('../middleware/authMiddleware');

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// register a new patient account
async function registerPatient(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { name, email, phone, password, date_of_birth, gender, blood_group, emergency_contact, address } = req.body;

    // prevent duplicate email registration
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // hash password before saving
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // save user row and patient row together in a transaction
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users (name, email, phone, password_hash, role, account_status)
       VALUES (?, ?, ?, ?, 'patient', 'active')`,
      [name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
    );

    const userId = userResult.insertId;

    const [patientResult] = await connection.query(
      `INSERT INTO patients (user_id, date_of_birth, gender, blood_group, emergency_contact, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        date_of_birth || null,
        gender || 'other',
        blood_group || 'Not Specified',
        emergency_contact || null,
        address || null,
      ]
    );

    const patientId = patientResult.insertId;

    await connection.commit();

    // issue jwt so user is logged in right after signup
    const token = jwt.sign(
      {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'patient',
        patient_id: patientId,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to MediQueue.',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        role: 'patient',
        patient_id: patientId,
      },
    });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// unified login endpoint for patients, doctors, and admins
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // lookup user by email
    const [users] = await pool.query(
      `SELECT id, name, email, phone, password_hash, role, account_status
       FROM users
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const user = users[0];

    // check if account is active
    if (user.account_status !== 'active') {
      return res.status(403).json({
        success: false,
        message: `Your account is currently ${user.account_status}. Please contact clinic support.`,
      });
    }

    // verify hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // attach role profile id (patient_id or doctor_id)
    let roleProfile = {};
    if (user.role === 'patient') {
      const [patients] = await pool.query('SELECT id, gender, blood_group FROM patients WHERE user_id = ?', [user.id]);
      if (patients.length > 0) {
        roleProfile = { patient_id: patients[0].id };
      }
    } else if (user.role === 'doctor') {
      const [doctors] = await pool.query(
        `SELECT d.id, d.specialization, d.qualification, d.consultation_fee, d.clinic_id, c.clinic_name
         FROM doctors d
         LEFT JOIN clinics c ON d.clinic_id = c.id
         WHERE d.user_id = ?`,
        [user.id]
      );
      if (doctors.length > 0) {
        roleProfile = {
          doctor_id: doctors[0].id,
          specialization: doctors[0].specialization,
          clinic_id: doctors[0].clinic_id,
          clinic_name: doctors[0].clinic_name,
        };
      }
    }

    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      ...roleProfile,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        ...roleProfile,
      },
    });
  } catch (error) {
    next(error);
  }
}

// return info for the currently authenticated user session
async function getCurrentUser(req, res, next) {
  try {
    const userId = req.user.id;

    const [users] = await pool.query(
      `SELECT id, name, email, phone, role, account_status, created_at
       FROM users
       WHERE id = ?`,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.',
      });
    }

    const user = users[0];
    let profileData = {};

    if (user.role === 'patient') {
      const [patients] = await pool.query('SELECT * FROM patients WHERE user_id = ?', [userId]);
      if (patients.length > 0) profileData = { patient: patients[0] };
    } else if (user.role === 'doctor') {
      const [doctors] = await pool.query(
        `SELECT d.*, c.clinic_name, c.address AS clinic_address, c.contact_number AS clinic_contact
         FROM doctors d
         LEFT JOIN clinics c ON d.clinic_id = c.id
         WHERE d.user_id = ?`,
        [userId]
      );
      if (doctors.length > 0) profileData = { doctor: doctors[0] };
    }

    return res.json({
      success: true,
      user: {
        ...user,
        ...profileData,
      },
    });
  } catch (error) {
    next(error);
  }
}

// client-side clears token, this endpoint confirms logout
function logout(req, res) {
  return res.json({
    success: true,
    message: 'User logged out successfully.',
  });
}

module.exports = {
  registerPatient,
  login,
  getCurrentUser,
  logout,
};
