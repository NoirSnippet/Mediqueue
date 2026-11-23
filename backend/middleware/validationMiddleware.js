// helper regexes for basic form validation
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
};

const isValidDateString = (dateStr) => {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateStr) && !isNaN(new Date(dateStr).getTime());
};

const isValidTimeString = (timeStr) => {
  return /^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/.test(timeStr);
};

// validate registration form input before hitting the db
function validateRegistration(req, res, next) {
  const { name, email, phone, password } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Full name is required and must be at least 2 characters.');
  }

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!phone || typeof phone !== 'string' || phone.trim().length < 7) {
    errors.push('A valid phone number (at least 7 digits) is required.');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    errors.push('Password must be at least 6 characters long.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

// check email and password presence for login
function validateLogin(req, res, next) {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !isValidEmail(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    errors.push('Password is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

// validate booking payload before starting the transaction
function validateAppointmentBooking(req, res, next) {
  const { doctor_id, appointment_date, appointment_time } = req.body;
  const errors = [];

  if (!doctor_id || isNaN(Number(doctor_id))) {
    errors.push('A valid doctor ID is required.');
  }

  if (!appointment_date || !isValidDateString(appointment_date)) {
    errors.push('A valid appointment date in YYYY-MM-DD format is required.');
  } else {
    // compare YYYY-MM-DD string to avoid timezone parsing drift
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (appointment_date < todayStr) {
      errors.push('Appointments cannot be booked for past dates.');
    }
  }

  if (!appointment_time || !isValidTimeString(appointment_time)) {
    errors.push('A valid appointment time in HH:MM format is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

// validate doctor schedule days and working hours
function validateSchedule(req, res, next) {
  const { day_of_week, start_time, end_time, slot_duration_minutes } = req.body;
  const validDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const errors = [];

  if (!validDays.includes(day_of_week)) {
    errors.push(`Day of week must be one of: ${validDays.join(', ')}.`);
  }

  if (!start_time || !isValidTimeString(start_time)) {
    errors.push('Valid start_time (HH:MM) is required.');
  }

  if (!end_time || !isValidTimeString(end_time)) {
    errors.push('Valid end_time (HH:MM) is required.');
  }

  if (start_time && end_time && start_time >= end_time) {
    errors.push('Start time must be strictly earlier than end time.');
  }

  if (slot_duration_minutes && (isNaN(Number(slot_duration_minutes)) || Number(slot_duration_minutes) < 5)) {
    errors.push('Slot duration must be a number of at least 5 minutes.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
}

module.exports = {
  isValidEmail,
  isValidDateString,
  isValidTimeString,
  validateRegistration,
  validateLogin,
  validateAppointmentBooking,
  validateSchedule,
};
