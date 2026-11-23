import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import {
  LayoutDashboard,
  Calendar,
  Clock,
  User,
  Users,
  Stethoscope,
  Settings,
  CalendarDays,
  Search,
  Activity,
  Database,
} from 'lucide-react';

export default function DashboardLayout() {
  const { role, user } = useAuth();
  const location = useLocation();

  const patientMenu = [
    { to: '/patient/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/patient/book', label: 'Book Appointment', icon: CalendarDays },
    { to: '/patient/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/patient/queue', label: 'Live Queue Status', icon: Clock },
    { to: '/doctors', label: 'Find Doctors', icon: Search },
    { to: '/patient/profile', label: 'My Profile', icon: User },
  ];

  const doctorMenu = [
    { to: '/doctor/dashboard', label: 'Doctor Dashboard', icon: LayoutDashboard },
    { to: '/doctor/queue', label: 'Live Queue Cockpit', icon: Activity },
    { to: '/doctor/appointments', label: 'My Appointments', icon: Calendar },
    { to: '/doctor/schedule', label: 'Manage Schedule', icon: CalendarDays },
    { to: '/doctor/profile', label: 'Doctor Profile', icon: User },
  ];

  const adminMenu = [
    { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctors', label: 'Manage Doctors', icon: Stethoscope },
    { to: '/admin/patients', label: 'Manage Patients', icon: Users },
    { to: '/admin/appointments', label: 'All Appointments', icon: Calendar },
    { to: '/admin/clinic', label: 'Clinic Settings', icon: Settings },
    { to: '/admin/users', label: 'Database Users', icon: Database },
  ];

  let menuItems = [];
  let roleTitle = 'Portal';

  if (role === 'patient') {
    menuItems = patientMenu;
    roleTitle = 'Patient Portal';
  } else if (role === 'doctor') {
    menuItems = doctorMenu;
    roleTitle = 'Doctor Portal';
  } else if (role === 'admin') {
    menuItems = adminMenu;
    roleTitle = 'Admin Portal';
  }

  return (
    <div className="app-wrapper">
      <Navbar />
      <div className="dashboard-layout">
        <aside className="sidebar">
          <div className="sidebar-heading">{roleTitle}</div>
          <ul className="sidebar-menu">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.to;
              return (
                <li key={item.to} className={`sidebar-item ${isActive ? 'active' : ''}`}>
                  <NavLink to={item.to} end={item.to.endsWith('dashboard')}>
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="sidebar-user-footer">
            <div className="sidebar-user-badge">
              <div className="user-avatar-circle" style={{ width: '32px', height: '32px', fontSize: '0.85rem', flexShrink: 0 }}>
                {user?.name ? user.name.replace('Dr.', '').trim()[0].toUpperCase() : 'U'}
              </div>
              <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.68rem', color: 'var(--slate-400)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, lineHeight: 1.2 }}>
                  Logged in as
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-800)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {user?.name}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--primary-700)', textTransform: 'capitalize', fontWeight: 600 }}>
                  {role} {user?.specialization ? `• ${user.specialization}` : ''}
                </div>
              </div>
            </div>
          </div>
        </aside>

        <main className="dashboard-main">
          <div className="dashboard-content-container">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
