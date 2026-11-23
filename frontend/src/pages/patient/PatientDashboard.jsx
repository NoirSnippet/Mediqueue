import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  CheckCircle,
  PlusCircle,
  ArrowRight,
  User,
  MapPin,
  Activity,
  AlertCircle,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [liveQueue, setLiveQueue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [statsRes, queueRes] = await Promise.all([
          api.get('/patients/dashboard-stats'),
          api.get('/queue/patient/live'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }

        if (queueRes.data.success && queueRes.data.hasQueue) {
          setLiveQueue(queueRes.data.queue);
        }
      } catch (err) {
        console.error('Error loading patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading patient dashboard overview..." />;
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Manage your medical appointments, find doctors, and monitor live queue positions.
          </p>
        </div>

        <Link to="/patient/book" className="btn btn-primary">
          <PlusCircle size={18} />
          Book Appointment
        </Link>
      </div>

      {/* Live Queue Banner for Today (if patient has a consultation today) */}
      {liveQueue && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0369a1, #0d9488)',
            color: 'white',
            borderRadius: 'var(--radius-xl)',
            padding: '24px',
            marginBottom: '28px',
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: '1.5rem',
              }}
            >
              <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', opacity: 0.9 }}>Token</span>
              <span>#{liveQueue.queue_number}</span>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Today's Live Queue</span>
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    padding: '2px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {liveQueue.queue_status}
                </span>
              </div>
              <p style={{ fontSize: '0.95rem', opacity: 0.95 }}>
                {liveQueue.statusMessage}
              </p>
              <div style={{ fontSize: '0.85rem', opacity: 0.85, marginTop: '4px' }}>
                Dr. {liveQueue.doctor_name} ({liveQueue.specialization}) • {liveQueue.room_number} • Time: {liveQueue.appointment_time}
              </div>
            </div>
          </div>

          <Link
            to="/patient/queue"
            className="btn"
            style={{ backgroundColor: 'white', color: 'var(--primary-700)', fontWeight: 700 }}
          >
            <Clock size={16} />
            Open Queue Tracker
          </Link>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          title="Total Appointments"
          value={stats?.totalAppointments || 0}
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Upcoming Consultations"
          value={stats?.upcomingAppointments || 0}
          icon={Clock}
          color="teal"
        />
        <StatCard
          title="Completed Consultations"
          value={stats?.completedAppointments || 0}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Next Appointment Card */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={20} color="var(--primary-600)" />
              Next Scheduled Consultation
            </h3>
            <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
              View All History
            </Link>
          </div>

          {stats?.nextAppointment ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: 'var(--slate-50)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--slate-200)',
                  marginBottom: '18px',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '4px' }}>
                    Reference: <strong>{stats.nextAppointment.appointment_reference}</strong>
                  </div>
                  <h4 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>
                    Dr. {stats.nextAppointment.doctor_name}
                  </h4>
                  <div style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.875rem' }}>
                    {stats.nextAppointment.specialization}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginTop: '4px' }}>
                    {stats.nextAppointment.clinic_name} • {stats.nextAppointment.room_number}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <Badge status={stats.nextAppointment.appointment_status} />
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--slate-900)', marginTop: '8px' }}>
                    {stats.nextAppointment.appointment_date}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: 'var(--slate-600)' }}>
                    {stats.nextAppointment.appointment_time}
                  </div>
                  {stats.nextAppointment.queue_number && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--teal-700)', fontWeight: 700, marginTop: '4px' }}>
                      Queue Token #{stats.nextAppointment.queue_number}
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
                  Manage Booking
                </Link>
                <Link to="/patient/queue" className="btn btn-primary btn-sm">
                  View Queue Status
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 16px' }}>
              <Clock size={40} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--slate-600)', marginBottom: '16px' }}>
                You have no upcoming appointments scheduled.
              </p>
              <Link to="/patient/book" className="btn btn-primary btn-sm">
                Book an Appointment
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions Card */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Quick Actions</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link
              to="/patient/book"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={18} color="var(--primary-600)" />
                Book Doctor Slot
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/doctors"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <User size={18} color="var(--teal-600)" />
                Find Specialists
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/patient/queue"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={18} color="var(--warning-solid)" />
                Live OPD Queue
              </span>
              <ArrowRight size={16} />
            </Link>

            <Link
              to="/patient/profile"
              className="btn btn-secondary"
              style={{ justifyContent: 'space-between', padding: '12px 16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} color="var(--slate-600)" />
                Update Profile Info
              </span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
