import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Activity,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Database,
  Calendar,
  Clock,
  Stethoscope,
  User,
  Users,
  Settings,
  CalendarDays,
  CalendarCheck,
  Headphones,
  Globe,
  Search,
  Info,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardPath = () => {
    if (role === 'patient') return '/patient/dashboard';
    if (role === 'doctor') return '/doctor/dashboard';
    if (role === 'admin') return '/admin/dashboard';
    return '/';
  };

  const userInitial = user?.name ? user.name.replace('Dr.', '').trim()[0].toUpperCase() : 'U';

  // Role-adaptive badge next to MediQueue logo
  const getBrandBadge = () => {
    if (role === 'admin') return 'Admin';
    if (role === 'doctor') return 'Doctor';
    if (role === 'patient') return 'Patient';
    return 'Clinic';
  };

  // Role-adaptive desktop navigation links
  const renderDesktopLinks = () => {
    if (role === 'admin') {
      return (
        <>
          <li>
            <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Stethoscope size={14} />
              <span>Doctors</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/patients" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Users size={14} />
              <span>Patients</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/appointments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Calendar size={14} />
              <span>Appointments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/clinic" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Settings size={14} />
              <span>Clinic</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/admin/users" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Database size={14} />
              <span>DB Users</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className="nav-link public-exit-link" title="View Public Clinic Website">
              <Globe size={13} />
              <span>Public Site</span>
            </NavLink>
          </li>
        </>
      );
    }

    if (role === 'doctor') {
      return (
        <>
          <li>
            <NavLink to="/doctor/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/queue" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Activity size={14} />
              <span>Live Queue</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/appointments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Calendar size={14} />
              <span>Appointments</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/schedule" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <CalendarDays size={14} />
              <span>Schedule</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctor/profile" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <User size={14} />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/" className="nav-link public-exit-link" title="View Public Clinic Website">
              <Globe size={13} />
              <span>Public Site</span>
            </NavLink>
          </li>
        </>
      );
    }

    if (role === 'patient') {
      return (
        <>
          <li>
            <NavLink to="/patient/dashboard" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Search size={14} />
              <span>Find Doctors</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/patient/book" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <CalendarDays size={14} />
              <span>Book Slot</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/patient/appointments" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <CalendarCheck size={14} />
              <span>My Bookings</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/patient/queue" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Clock size={14} />
              <span>Live Queue</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Headphones size={14} />
              <span>Contact Us</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Info size={14} />
              <span>About</span>
            </NavLink>
          </li>
        </>
      );
    }

    // Default Guest / Unauthenticated Navbar
    return (
      <>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} end>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/doctors" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Find Doctors
          </NavLink>
        </li>
        <li>
          <NavLink to="/bookings" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <CalendarCheck size={14} />
            <span>Current Bookings</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Headphones size={14} />
            <span>Contact Us</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            <Info size={14} />
            <span>About</span>
          </NavLink>
        </li>
      </>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Part 1: Far Left - Brand Logo & Badge */}
        <Link to={isAuthenticated ? getDashboardPath() : '/'} className="brand-logo" title="MediQueue Home">
          <div className="brand-icon">
            <Activity size={18} />
          </div>
          <span className="brand-name">MediQueue</span>
          <span className={`brand-badge ${role ? `role-${role}` : ''}`}>{getBrandBadge()}</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          <ul className="nav-links">
            {renderDesktopLinks()}
          </ul>
        </nav>

        {/* Desktop Right Actions */}
        <div className="desktop-actions">
          {isAuthenticated ? (
            <div className="user-profile-bar">
              <Link to={getDashboardPath()} className="user-pill-btn" title="Open Your Dashboard">
                <div className="user-avatar-circle">{userInitial}</div>
                <span className="user-name-text">{user?.name?.split(' ')[0]}</span>
                <span className={`role-badge role-${role}`}>{role}</span>
              </Link>
              <button onClick={handleLogout} className="logout-btn" title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="auth-btn-group">
              <Link to="/login" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          type="button"
          className="mobile-toggle-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <ul className="mobile-nav-list">
            {/* If Authenticated: Show User Profile Card at top of mobile menu */}
            {isAuthenticated && (
              <li className="mobile-auth-section" style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div className="user-avatar-circle">{userInitial}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--slate-900)' }}>
                        {user?.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'capitalize' }}>
                        {role} {user?.specialization ? `• ${user.specialization}` : ''}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '5px 10px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <LogOut size={13} />
                    <span>Logout</span>
                  </button>
                </div>
              </li>
            )}

            {/* Admin Mobile Links */}
            {role === 'admin' && (
              <>
                <li className="mobile-group-header">Admin Console</li>
                <li>
                  <NavLink to="/admin/dashboard" end className="mobile-nav-link">
                    <LayoutDashboard size={15} />
                    <span>Admin Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/doctors" className="mobile-nav-link">
                    <Stethoscope size={15} />
                    <span>Manage Doctors</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/patients" className="mobile-nav-link">
                    <Users size={15} />
                    <span>Manage Patients</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/appointments" className="mobile-nav-link">
                    <Calendar size={15} />
                    <span>All Appointments</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/clinic" className="mobile-nav-link">
                    <Settings size={15} />
                    <span>Clinic Settings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/admin/users" className="mobile-nav-link">
                    <Database size={15} />
                    <span>Database Users</span>
                  </NavLink>
                </li>
                <li className="mobile-divider"></li>
                <li className="mobile-group-header">Public Website</li>
                <li>
                  <NavLink to="/" end className="mobile-nav-link">
                    <Globe size={15} />
                    <span>View Public Home</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctors" className="mobile-nav-link">
                    <Search size={15} />
                    <span>Public Doctor Directory</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bookings" className="mobile-nav-link">
                    <CalendarCheck size={15} />
                    <span>Current Bookings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className="mobile-nav-link">
                    <Headphones size={15} />
                    <span>Contact Us</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className="mobile-nav-link">
                    <Info size={15} />
                    <span>About System</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Doctor Mobile Links */}
            {role === 'doctor' && (
              <>
                <li className="mobile-group-header">Doctor Console</li>
                <li>
                  <NavLink to="/doctor/dashboard" end className="mobile-nav-link">
                    <LayoutDashboard size={15} />
                    <span>Doctor Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctor/queue" className="mobile-nav-link">
                    <Activity size={15} />
                    <span>Live Queue Cockpit</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctor/appointments" className="mobile-nav-link">
                    <Calendar size={15} />
                    <span>My Appointments</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctor/schedule" className="mobile-nav-link">
                    <CalendarDays size={15} />
                    <span>Manage Schedule</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctor/profile" className="mobile-nav-link">
                    <User size={15} />
                    <span>My Profile</span>
                  </NavLink>
                </li>
                <li className="mobile-divider"></li>
                <li className="mobile-group-header">Public Website</li>
                <li>
                  <NavLink to="/" end className="mobile-nav-link">
                    <Globe size={15} />
                    <span>View Public Home</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctors" className="mobile-nav-link">
                    <Search size={15} />
                    <span>Doctor Directory</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bookings" className="mobile-nav-link">
                    <CalendarCheck size={15} />
                    <span>Current Bookings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className="mobile-nav-link">
                    <Headphones size={15} />
                    <span>Contact Us</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className="mobile-nav-link">
                    <Info size={15} />
                    <span>About System</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Patient Mobile Links */}
            {role === 'patient' && (
              <>
                <li className="mobile-group-header">Patient Portal</li>
                <li>
                  <NavLink to="/patient/dashboard" end className="mobile-nav-link">
                    <LayoutDashboard size={15} />
                    <span>My Dashboard</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/patient/book" className="mobile-nav-link">
                    <CalendarDays size={15} />
                    <span>Book Appointment</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/patient/appointments" className="mobile-nav-link">
                    <CalendarCheck size={15} />
                    <span>My Appointments</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/patient/queue" className="mobile-nav-link">
                    <Clock size={15} />
                    <span>Live Queue Status</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/patient/profile" className="mobile-nav-link">
                    <User size={15} />
                    <span>My Profile</span>
                  </NavLink>
                </li>
                <li className="mobile-divider"></li>
                <li className="mobile-group-header">Clinic Information</li>
                <li>
                  <NavLink to="/" end className="mobile-nav-link">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctors" className="mobile-nav-link">
                    <Search size={15} />
                    <span>Find Doctors</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bookings" className="mobile-nav-link">
                    <CalendarCheck size={15} />
                    <span>Current Bookings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className="mobile-nav-link">
                    <Headphones size={15} />
                    <span>Contact Us</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className="mobile-nav-link">
                    <Info size={15} />
                    <span>About System</span>
                  </NavLink>
                </li>
              </>
            )}

            {/* Guest / Unauthenticated Mobile Links */}
            {!isAuthenticated && (
              <>
                <li>
                  <NavLink to="/" end className="mobile-nav-link">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/doctors" className="mobile-nav-link">
                    Find Doctors
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/bookings" className="mobile-nav-link">
                    <CalendarCheck size={15} />
                    <span>Current Bookings</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/contact" className="mobile-nav-link">
                    <Headphones size={15} />
                    <span>Contact Us</span>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/about" className="mobile-nav-link">
                    <Info size={15} />
                    <span>About System</span>
                  </NavLink>
                </li>
                <li className="mobile-divider"></li>
                <li style={{ display: 'flex', gap: '10px', paddingTop: '8px' }}>
                  <Link to="/login" className="btn btn-secondary" style={{ flex: 1, textAlign: 'center' }}>
                    Sign In
                  </Link>
                  <Link to="/register" className="btn btn-primary" style={{ flex: 1, textAlign: 'center' }}>
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      )}
    </header>
  );
}
