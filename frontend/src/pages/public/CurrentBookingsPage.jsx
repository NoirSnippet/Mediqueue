import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CalendarCheck,
  Calendar,
  Clock,
  User,
  Stethoscope,
  MapPin,
  CheckCircle2,
  ArrowRight,
  LogIn,
  Search,
  AlertCircle,
  Tag,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CurrentBookingsPage() {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refSearch, setRefSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  // If authenticated as a patient, load their active appointments
  useEffect(() => {
    if (isAuthenticated && role === 'patient') {
      const fetchPatientAppointments = async () => {
        setLoading(true);
        try {
          const res = await api.get('/appointments/patient/my-appointments');
          if (res.data.success) {
            setAppointments(res.data.appointments);
          }
        } catch (err) {
          console.error('Failed to load patient appointments:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPatientAppointments();
    }
  }, [isAuthenticated, role]);

  // Demo lookup for unauthenticated visitors by reference code
  const handleRefLookup = (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);

    const code = refSearch.trim().toUpperCase();
    if (!code) {
      setSearchError('Please enter a booking reference code.');
      return;
    }

    // Demo matching for pre-seeded appointments
    const demoBookings = [
      {
        ref: 'MQ-DEMO-001',
        doctor: 'Dr. Sarah Jenkins',
        spec: 'Cardiology',
        room: 'Room 101',
        date: 'Today',
        time: '09:00 AM',
        queue: 1,
        status: 'In Consultation',
      },
      {
        ref: 'MQ-DEMO-002',
        doctor: 'Dr. Sarah Jenkins',
        spec: 'Cardiology',
        room: 'Room 101',
        date: 'Today',
        time: '09:30 AM',
        queue: 2,
        status: 'Waiting',
      },
      {
        ref: 'MQ-DEMO-004',
        doctor: 'Dr. Rajesh Sharma',
        spec: 'General Medicine',
        room: 'Room 102',
        date: 'Today',
        time: '10:00 AM',
        queue: 1,
        status: 'Waiting',
      },
    ];

    const match = demoBookings.find((b) => b.ref === code);
    if (match) {
      setSearchResult(match);
    } else {
      setSearchError(
        `No public record found for "${code}". Please log in to your patient account to view and manage all private bookings.`
      );
    }
  };

  return (
    <div style={{ padding: '48px 0 72px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '38px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            <CalendarCheck size={14} />
            <span>Consultation Schedule & Active Tokens</span>
          </div>
          <h1 style={{ fontSize: '2.3rem', marginBottom: '10px', color: 'var(--slate-900)' }}>Current Bookings</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Track your verified OPD appointments, assigned consultation rooms, and live sequential queue token numbers.
          </p>
        </div>

        {/* 1. If Patient is Authenticated: Show their actual bookings */}
        {isAuthenticated && role === 'patient' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div>
                <h2 style={{ fontSize: '1.35rem', color: 'var(--slate-900)' }}>Your Active Bookings</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)' }}>
                  Logged in as <strong>{user?.name}</strong>
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to="/patient/queue" className="btn btn-secondary btn-sm">
                  <Clock size={14} />
                  <span>Live Queue Status</span>
                </Link>
                <Link to="/patient/book" className="btn btn-primary btn-sm">
                  <Calendar size={14} />
                  <span>Book New Slot</span>
                </Link>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner message="Loading your appointments..." />
            ) : appointments.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
                <Calendar size={48} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.15rem', marginBottom: '8px', color: 'var(--slate-800)' }}>
                  No Bookings Found
                </h3>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.925rem', marginBottom: '20px' }}>
                  You currently have no scheduled appointments. Book a consultation slot with a specialist doctor.
                </p>
                <Link to="/patient/book" className="btn btn-primary">
                  Book an Appointment
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '16px' }}>
                {appointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="card"
                    style={{
                      padding: '20px 24px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '16px',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            color: 'var(--primary-800)',
                            backgroundColor: 'var(--primary-50)',
                            border: '1px solid var(--primary-200)',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.85rem',
                          }}
                        >
                          {appt.appointment_reference}
                        </span>
                        <Badge status={appt.appointment_status} />
                      </div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '4px' }}>
                        {appt.doctor_name}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--slate-600)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <span>
                          <strong>Date:</strong> {appt.appointment_date}
                        </span>
                        <span>
                          <strong>Time:</strong> {appt.appointment_time}
                        </span>
                        <span>
                          <strong>Room:</strong> {appt.room_number}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {appt.queue_number && (
                        <div
                          style={{
                            textAlign: 'center',
                            backgroundColor: 'var(--teal-50)',
                            border: '1px solid var(--teal-200)',
                            borderRadius: '10px',
                            padding: '8px 16px',
                          }}
                        >
                          <div style={{ fontSize: '0.72rem', color: 'var(--teal-700)', textTransform: 'uppercase', fontWeight: 700 }}>
                            Queue Token
                          </div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--teal-800)' }}>
                            #{appt.queue_number}
                          </div>
                        </div>
                      )}
                      <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
                        Manage
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 2. If Doctor is Authenticated */}
        {isAuthenticated && role === 'doctor' && (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <Stethoscope size={44} color="var(--primary-600)" style={{ margin: '0 auto 14px' }} />
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--slate-900)' }}>
              Doctor Consultations Cockpit
            </h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: '500px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
              You are logged in as a specialist doctor. View your daily assigned appointments and call the next waiting patient from your cockpit.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/doctor/queue" className="btn btn-primary">
                Open Live Queue Cockpit
              </Link>
              <Link to="/doctor/appointments" className="btn btn-secondary">
                View All Consultations
              </Link>
            </div>
          </div>
        )}

        {/* 3. If Admin is Authenticated */}
        {isAuthenticated && role === 'admin' && (
          <div className="card" style={{ padding: '32px', textAlign: 'center' }}>
            <CalendarCheck size={44} color="var(--primary-600)" style={{ margin: '0 auto 14px' }} />
            <h2 style={{ fontSize: '1.4rem', marginBottom: '8px', color: 'var(--slate-900)' }}>
              Clinic-Wide Booking Management
            </h2>
            <p style={{ color: 'var(--slate-600)', maxWidth: '500px', margin: '0 auto 24px', fontSize: '0.95rem' }}>
              You are logged in as the System Administrator. Access global appointment logs, filters, and clinic OPD metrics.
            </p>
            <Link to="/admin/appointments" className="btn btn-primary">
              Open Admin Appointments Console
            </Link>
          </div>
        )}

        {/* 4. If Unauthenticated Guest: Provide Sign-In & Quick Reference Tracker */}
        {!isAuthenticated && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '26px' }}>
            {/* Left: Sign in Card */}
            <div className="card" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <LogIn size={22} />
              </div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--slate-900)' }}>
                Access Your Bookings
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '24px' }}>
                Sign in to your registered patient account to view all past and upcoming consultation bookings, monitor queue progress in real-time, or reschedule.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Link
                  to="/login?redirect=/patient/appointments"
                  className="btn btn-primary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <LogIn size={16} />
                  <span>Sign In as Patient</span>
                </Link>
                <Link
                  to="/register"
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  <User size={16} />
                  <span>Create New Account</span>
                </Link>
              </div>
            </div>

            {/* Right: Quick Reference Number Lookup */}
            <div className="card" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--teal-100)',
                  color: 'var(--teal-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <Search size={22} />
              </div>
              <h2 style={{ fontSize: '1.35rem', marginBottom: '8px', color: 'var(--slate-900)' }}>
                Reference Code Lookup
              </h2>
              <p style={{ fontSize: '0.925rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '18px' }}>
                Have an appointment slip? Enter your reference code (e.g. <code>MQ-DEMO-001</code>) to quickly verify booking details:
              </p>

              <form onSubmit={handleRefLookup} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. MQ-DEMO-001"
                    value={refSearch}
                    onChange={(e) => setRefSearch(e.target.value)}
                    style={{ fontFamily: 'monospace', textTransform: 'uppercase' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 18px', flexShrink: 0 }}>
                    Track
                  </button>
                </div>
              </form>

              {searchError && (
                <div style={{ fontSize: '0.85rem', color: '#dc2626', marginBottom: '12px' }}>{searchError}</div>
              )}

              {searchResult && (
                <div
                  style={{
                    backgroundColor: 'var(--teal-50)',
                    border: '1px solid var(--teal-200)',
                    borderRadius: 'var(--radius-md)',
                    padding: '14px 16px',
                    fontSize: '0.875rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--teal-900)' }}>{searchResult.ref}</span>
                    <Badge status={searchResult.status} />
                  </div>
                  <div style={{ color: 'var(--slate-700)', marginBottom: '4px' }}>
                    <strong>Doctor:</strong> {searchResult.doctor} ({searchResult.spec})
                  </div>
                  <div style={{ color: 'var(--slate-600)', display: 'flex', gap: '12px' }}>
                    <span>
                      <strong>Slot:</strong> {searchResult.time}
                    </span>
                    <span>
                      <strong>Queue:</strong> #{searchResult.queue}
                    </span>
                    <span>
                      <strong>Room:</strong> {searchResult.room}
                    </span>
                  </div>
                </div>
              )}

              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '16px' }}>
                Tip: Try <code>MQ-DEMO-001</code> or <code>MQ-DEMO-002</code> to test lookup.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
