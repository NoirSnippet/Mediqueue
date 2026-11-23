const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validationMiddleware');
const { authenticateToken } = require('../middleware/authMiddleware');

// POST /api/auth/register - Register new patient
router.post('/register', validateRegistration, authController.registerPatient);

// POST /api/auth/login - Login for patient, doctor, admin
router.post('/login', validateLogin, authController.login);

// GET /api/auth/me - Get current user profile from token
router.get('/me', authenticateToken, authController.getCurrentUser);

// POST /api/auth/logout - Logout
router.post('/logout', authenticateToken, authController.logout);

module.exports = router;
