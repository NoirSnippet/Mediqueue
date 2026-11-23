const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All patient routes require authentication and 'patient' role
router.use(authenticateToken);
router.use(authorizeRoles('patient'));

// GET /api/patients/profile - Get patient profile
router.get('/profile', patientController.getPatientProfile);

// PUT /api/patients/profile - Update patient profile
router.put('/profile', patientController.updatePatientProfile);

// GET /api/patients/dashboard-stats - Get quick metrics for patient dashboard
router.get('/dashboard-stats', patientController.getPatientDashboardStats);

module.exports = router;
