const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateSchedule } = require('../middleware/validationMiddleware');

// --- Public / Patient accessible routes ---

// GET /api/doctors - List doctors with search and filters
router.get('/', doctorController.getAllDoctors);

// GET /api/doctors/specializations - List unique specializations
router.get('/specializations', doctorController.getSpecializations);

// GET /api/doctors/:id - Get specific doctor details & public schedule
router.get('/:id', doctorController.getDoctorById);

// GET /api/doctors/:id/availability - Get generated time slots for chosen date
router.get('/:id/availability', doctorController.getDoctorAvailability);

// --- Doctor private routes ---

// GET /api/doctors/me/schedules - Get logged-in doctor's schedule
router.get('/me/schedules', authenticateToken, authorizeRoles('doctor'), doctorController.getMySchedules);

// POST /api/doctors/me/schedules - Create / Update schedule entry
router.post('/me/schedules', authenticateToken, authorizeRoles('doctor'), validateSchedule, doctorController.saveSchedule);

// DELETE /api/doctors/me/schedules/:id - Delete a schedule entry
router.delete('/me/schedules/:id', authenticateToken, authorizeRoles('doctor'), doctorController.deleteSchedule);

// PATCH /api/doctors/me/status - Update availability status (available, on_leave, busy)
router.patch('/me/status', authenticateToken, authorizeRoles('doctor'), doctorController.updateAvailabilityStatus);

module.exports = router;
