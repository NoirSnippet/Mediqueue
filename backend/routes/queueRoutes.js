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

// POST /api/queue/doctor/simulate-walkin - Simulate walk-in patient token for demo
router.post('/doctor/simulate-walkin', authorizeRoles('doctor', 'admin'), queueController.simulateWalkInPatient);

// POST /api/queue/doctor/reset-demo - Prime demo queue with active tokens for evaluation
router.post('/doctor/reset-demo', authorizeRoles('doctor', 'admin'), queueController.resetDemoQueue);

module.exports = router;
