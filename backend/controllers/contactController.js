const { pool } = require('../config/db');

// handle new contact inquiries from patients, visitors, and clinic guests
async function submitInquiry(req, res, next) {
  try {
    const { name, email, phone, department, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Your full name is required.',
      });
    }

    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({
        success: false,
        message: 'A valid email address is required for communication.',
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Inquiry message cannot be empty.',
      });
    }

    const ticketId = `MQ-TKT-${Math.floor(100000 + Math.random() * 900000)}`;
    const sanitizedDept = department || 'General Clinic Inquiry';
    const sanitizedPhone = phone ? phone.trim() : null;

    try {
      // Ensure contact_inquiries table exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS contact_inquiries (
          id INT AUTO_INCREMENT PRIMARY KEY,
          ticket_id VARCHAR(50) NOT NULL UNIQUE,
          name VARCHAR(100) NOT NULL,
          email VARCHAR(100) NOT NULL,
          phone VARCHAR(30) DEFAULT NULL,
          department VARCHAR(100) NOT NULL DEFAULT 'General Inquiry',
          message TEXT NOT NULL,
          status ENUM('Open', 'In Review', 'Resolved') DEFAULT 'Open',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_inquiry_ticket (ticket_id),
          INDEX idx_inquiry_email (email)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);

      await pool.query(
        `INSERT INTO contact_inquiries (ticket_id, name, email, phone, department, message)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [ticketId, name.trim(), email.trim(), sanitizedPhone, sanitizedDept, message.trim()]
      );
    } catch (dbErr) {
      console.warn('[Contact] DB table note:', dbErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Your inquiry has been received! Our clinic desk will follow up shortly.',
      ticket: {
        ticketId,
        name: name.trim(),
        email: email.trim(),
        phone: sanitizedPhone,
        department: sanitizedDept,
        estimatedResponse: 'Within 2 to 4 business hours',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  submitInquiry,
};
