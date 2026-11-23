const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const db = require('./db');
const { testConnection } = require('./config/db');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const patientRoutes = require('./routes/patientRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const queueRoutes = require('./routes/queueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
  });
}

// Root info route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MediQueue Backend API is active and running!',
    health: '/api/health',
    version: '1.0.0',
  });
});

// System Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    application: 'MediQueue - Smart Doctor Appointment and Queue System',
    status: 'ONLINE',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

// Users endpoint (direct database query from MySQL)
app.get(['/api/users', '/mysql2/promise', '/api/mysql2/promise'], async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, email FROM users');
    res.json(users);
  } catch (error) {
    console.error('[MySQL Error]:', error.message);
    res.status(500).json({
      error: 'Could not load users',
      details: error.message,
      troubleshooting:
        error.code === 'ECONNREFUSED'
          ? 'MySQL Server is not running on port 3306. Please start MySQL (e.g. in XAMPP).'
          : error.code === 'ER_BAD_DB_ERROR'
          ? 'Database "mediqueue_db" does not exist yet. Run: npm run db:init'
          : error.code === 'ER_ACCESS_DENIED_ERROR'
          ? 'Access denied. Check DB_USER and DB_PASSWORD in backend/.env'
          : error.message,
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Catch-all 404 handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// Start Server only when executed directly (not when required by tests)
if (require.main === module) {
  app.listen(PORT, async () => {
    console.log(`Backend running at http://localhost:${PORT}`);
    console.log(`📡 Base API URL: http://localhost:${PORT}/api`);
    console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
    console.log(`👥 Users route:  http://localhost:${PORT}/api/users`);
    await testConnection();
  });
}

module.exports = app;
