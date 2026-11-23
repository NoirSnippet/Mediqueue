import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './layouts/Navbar';
import Footer from './layouts/Footer';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import MedicalPlusBackground from './components/common/MedicalPlusBackground';

// Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import DoctorDirectoryPage from './pages/public/DoctorDirectoryPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import DatabaseUsersPage from './pages/public/DatabaseUsersPage';
import ContactPage from './pages/public/ContactPage';
import CurrentBookingsPage from './pages/public/CurrentBookingsPage';

// Patient Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import BookAppointmentPage from './pages/patient/BookAppointmentPage';
import MyAppointmentsPage from './pages/patient/MyAppointmentsPage';
import QueueStatusPage from './pages/patient/QueueStatusPage';
import PatientProfilePage from './pages/patient/PatientProfilePage';

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorQueuePage from './pages/doctor/DoctorQueuePage';
import DoctorAppointmentsPage from './pages/doctor/DoctorAppointmentsPage';
import DoctorSchedulePage from './pages/doctor/DoctorSchedulePage';
import DoctorProfilePage from './pages/doctor/DoctorProfilePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageDoctorsPage from './pages/admin/ManageDoctorsPage';
import ManagePatientsPage from './pages/admin/ManagePatientsPage';
import ManageAppointmentsPage from './pages/admin/ManageAppointmentsPage';
import ClinicSettingsPage from './pages/admin/ClinicSettingsPage';

// Public Layout Wrapper
function PublicLayout() {
  return (
    <div className="app-wrapper">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <MedicalPlusBackground />
      <Routes>
        {/* Public Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/doctors" element={<DoctorDirectoryPage />} />
          <Route path="/bookings" element={<CurrentBookingsPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/users" element={<Navigate to="/admin/users" replace />} />
        </Route>

        {/* Patient Routes (Protected) */}
        <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/book" element={<BookAppointmentPage />} />
            <Route path="/patient/appointments" element={<MyAppointmentsPage />} />
            <Route path="/patient/queue" element={<QueueStatusPage />} />
            <Route path="/patient/profile" element={<PatientProfilePage />} />
          </Route>
        </Route>

        {/* Doctor Routes (Protected) */}
        <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/queue" element={<DoctorQueuePage />} />
            <Route path="/doctor/appointments" element={<DoctorAppointmentsPage />} />
            <Route path="/doctor/schedule" element={<DoctorSchedulePage />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
          </Route>
        </Route>

        {/* Admin Routes (Protected) */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctorsPage />} />
            <Route path="/admin/patients" element={<ManagePatientsPage />} />
            <Route path="/admin/appointments" element={<ManageAppointmentsPage />} />
            <Route path="/admin/clinic" element={<ClinicSettingsPage />} />
            <Route path="/admin/users" element={<DatabaseUsersPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
