const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');
const { validateAppointmentBooking } = require('../middleware/validationMiddleware');

// Public route: Reference Code verification & live tracking (no login required)
router.get('/lookup/:reference', appointmentController.lookupByReference);

// All subsequent appointment routes require authentication
router.use(authenticateToken);

// POST /api/appointments - Patient books appointment
router.post('/', authorizeRoles('patient'), validateAppointmentBooking, appointmentController.bookAppointment);

// GET /api/appointments/patient/my-appointments - Patient views their appointments
router.get('/patient/my-appointments', authorizeRoles('patient'), appointmentController.getPatientAppointments);

// GET /api/appointments/doctor/my-appointments - Doctor views their appointments
router.get('/doctor/my-appointments', authorizeRoles('doctor'), appointmentController.getDoctorAppointments);

// GET /api/appointments/:id - View single appointment
router.get('/:id', appointmentController.getAppointmentById);

// PATCH /api/appointments/:id/status - Doctor or Admin updates status
router.patch('/:id/status', authorizeRoles('doctor', 'admin'), appointmentController.updateAppointmentStatus);

// POST /api/appointments/:id/cancel - Patient, Doctor, or Admin cancels appointment
router.post('/:id/cancel', appointmentController.cancelAppointment);

module.exports = router;
