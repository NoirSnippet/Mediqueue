const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

// All admin routes strictly require 'admin' role
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

// GET /api/admin/stats - System-wide dashboard statistics
router.get('/stats', adminController.getDashboardStats);

// Doctors management
router.get('/doctors', adminController.getAllDoctorsAdmin);
router.post('/doctors', adminController.createDoctor);
router.put('/doctors/:id', adminController.updateDoctor);
router.patch('/doctors/:id/toggle-status', adminController.toggleDoctorStatus);

// Patients management
router.get('/patients', adminController.getAllPatients);
router.patch('/patients/:id/toggle-status', adminController.togglePatientStatus);

// Appointments management
router.get('/appointments', adminController.getAllAppointmentsAdmin);

// Clinic management
router.get('/clinic', adminController.getClinicSettings);
router.put('/clinic', adminController.updateClinicSettings);

module.exports = router;
