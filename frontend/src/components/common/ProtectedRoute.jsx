import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingSpinner message="Checking authentication credentials..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to respective dashboard if user does not have permission
    if (role === 'patient') return <Navigate to="/patient/dashboard" replace />;
    if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
