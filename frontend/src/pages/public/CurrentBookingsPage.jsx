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
  Phone,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CurrentBookingsPage() {
  const { user, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refSearch, setRefSearch] = useState('');
  const [tracking, setTracking] = useState(false);
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

  // Real Database lookup by reference code
  const handleRefLookup = async (e) => {
    e.preventDefault();
    setSearchError('');
    setSearchResult(null);

    const code = refSearch.trim().toUpperCase();
    if (!code) {
      setSearchError('Please enter a booking reference code.');
      return;
    }

    setTracking(true);
    try {
      const res = await api.get(`/appointments/lookup/${encodeURIComponent(code)}`);
      if (res.data.success) {
        setSearchResult(res.data.appointment);
      }
    } catch (err) {
      setSearchError(
        err.response?.data?.message || `No appointment found matching reference code "${code}". Please check your booking code.`
      );
    } finally {
      setTracking(false);
    }
  };

  const renderLookupCard = () => (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
        <div
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            backgroundColor: 'var(--teal-100)',
            color: 'var(--teal-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Search size={20} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--slate-900)', margin: 0 }}>
            Reference Code Lookup
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--slate-500)', margin: '2px 0 0' }}>
            Instant database verification & live queue status tracker
          </p>
        </div>
      </div>

      <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '16px' }}>
        Have an appointment slip or confirmation code? Enter your reference code to view live room location and queue token status:
      </p>

      <form onSubmit={handleRefLookup} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
            <Search
              size={17}
              color="var(--slate-400)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              className="form-control"
              placeholder="e.g. MQ-DEMO-001"
              value={refSearch}
              onChange={(e) => setRefSearch(e.target.value)}
              style={{ paddingLeft: '38px', fontFamily: 'monospace', textTransform: 'uppercase', fontWeight: 600 }}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ padding: '0 20px', flexShrink: 0 }} disabled={tracking}>
            {tracking ? 'Searching...' : 'Track Slip'}
          </button>
        </div>
      </form>

      {searchError && (
        <div
          style={{
            fontSize: '0.875rem',
            color: 'var(--danger-solid)',
            backgroundColor: '#fef2f2',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1px solid #fecaca',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span>{searchError}</span>
        </div>
      )}

      {searchResult && (
        <div
          style={{
            backgroundColor: '#f8fafc',
            border: '1px solid var(--slate-200)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px 20px',
            marginTop: '12px',
          }}
        >
          {/* Header Strip */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 700 }}>
                Reference Code
              </span>
              <span style={{ fontFamily: 'monospace', fontWeight: 800, color: 'var(--primary-800)', fontSize: '1.05rem', backgroundColor: 'var(--primary-50)', padding: '2px 8px', borderRadius: '4px' }}>
                {searchResult.appointment_reference}
              </span>
            </div>
            <Badge status={searchResult.appointment_status} />
          </div>

          {/* Doctor & Clinic */}
          <div style={{ marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '3px' }}>
              Dr. {searchResult.doctor_name}
            </h3>
            <div style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem' }}>
              {searchResult.specialization}
            </div>
            <div style={{ fontSize: '0.825rem', color: 'var(--slate-500)', marginTop: '2px' }}>
              {searchResult.clinic_name} • <strong>{searchResult.room_number}</strong>
            </div>
          </div>

          {/* Date, Slot & Token Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '10px',
              backgroundColor: 'white',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--slate-200)',
              marginBottom: '14px',
              fontSize: '0.85rem',
            }}
          >
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Consultation Date</span>
              <strong style={{ color: 'var(--slate-800)' }}>{searchResult.appointment_date}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Reserved Slot</span>
              <strong style={{ color: 'var(--slate-800)' }}>{searchResult.appointment_time}</strong>
            </div>
            {searchResult.queue_number && (
              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.75rem' }}>Queue Token</span>
                <strong style={{ color: 'var(--teal-700)', fontSize: '1.05rem' }}>#{searchResult.queue_number}</strong>
              </div>
            )}
          </div>

          {/* Live Queue Notice Banner */}
          {searchResult.queueMessage && (
            <div
              style={{
                backgroundColor: 'var(--primary-50)',
                border: '1px solid var(--primary-100)',
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                fontSize: '0.825rem',
                color: 'var(--primary-900)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '14px',
              }}
            >
              <Clock size={16} color="var(--primary-600)" style={{ flexShrink: 0 }} />
              <span>{searchResult.queueMessage}</span>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <Link to="/patient/queue" className="btn btn-primary btn-sm">
              <Clock size={14} />
              Open Live Queue Tracker
            </Link>
            <button
              type="button"
              onClick={() => {
                setSearchResult(null);
                setRefSearch('');
              }}
              className="btn btn-secondary btn-sm"
            >
              <RotateCcw size={13} />
              Clear Search
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ padding: '40px 0 72px' }}>
      <div className="container" style={{ maxWidth: '1040px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
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
          <h1 style={{ fontSize: '2.4rem', marginBottom: '10px', color: 'var(--slate-900)' }}>Current Bookings</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Track your verified OPD appointments, assigned consultation rooms, and live sequential queue token numbers.
          </p>
        </div>

        {/* 1. If Patient is Authenticated: Show their actual bookings */}
        {isAuthenticated && role === 'patient' && (
          <div style={{ marginBottom: '36px' }}>
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
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
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
                    className="card patient-appt-card"
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
                        Dr. {appt.doctor_name}
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
          <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '36px' }}>
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
          <div className="card" style={{ padding: '32px', textAlign: 'center', marginBottom: '36px' }}>
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

        {/* 4. Guest View: Sign In Box + Reference Code Lookup Side-by-Side */}
        {!isAuthenticated && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '26px' }}>
            {/* Left: Sign in Card */}
            <div className="card" style={{ padding: '28px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: 'var(--primary-100)',
                  color: 'var(--primary-700)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <LogIn size={20} />
              </div>
              <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--slate-900)' }}>
                Access Your Bookings
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.6, marginBottom: '22px' }}>
                Sign in to your registered patient account to view all past and upcoming consultation bookings, monitor queue progress in real-time, or cancel if needed.
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
            {renderLookupCard()}
          </div>
        )}

        {/* 5. For Authenticated Users: Reference Code Lookup Card at bottom */}
        {isAuthenticated && (
          <div style={{ marginTop: '12px' }}>
            {renderLookupCard()}
          </div>
        )}
      </div>
    </div>
  );
}
