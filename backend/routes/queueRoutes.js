const express = require('express');
const router = express.Router();
const queueController = require('../controllers/queueController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All queue routes require authentication
router.use(authenticateToken);

// GET /api/queue/patient/live - Get patient's live queue status for today
router.get('/patient/live', authorizeRoles('patient'), queueController.getPatientQueueStatus);

// GET /api/queue/doctor/live - Get doctor's live queue dashboard
router.get('/doctor/live', authorizeRoles('doctor', 'admin'), queueController.getDoctorLiveQueue);

// POST /api/queue/doctor/call-next - Doctor calls next waiting patient
router.post('/doctor/call-next', authorizeRoles('doctor', 'admin'), queueController.callNextPatient);

// PATCH /api/queue/:id/status - Doctor or Admin manually updates queue token status
router.patch('/:id/status', authorizeRoles('doctor', 'admin'), queueController.updateQueueStatus);

module.exports = router;
