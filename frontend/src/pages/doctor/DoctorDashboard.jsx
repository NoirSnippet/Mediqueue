import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  Users,
  Clock,
  CheckCircle,
  Activity,
  ArrowRight,
  PhoneCall,
  Calendar,
  AlertCircle,
  Stethoscope,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [queueSummary, setQueueSummary] = useState(null);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [callingNext, setCallingNext] = useState(false);

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const loadData = async () => {
    try {
      const [queueRes, apptRes] = await Promise.all([
        api.get('/queue/doctor/live', { params: { date: todayStr } }),
        api.get('/appointments/doctor/my-appointments', { params: { date: todayStr } }),
      ]);

      if (queueRes.data.success) {
        setQueueSummary(queueRes.data);
      }

      if (apptRes.data.success) {
        setTodayAppointments(apptRes.data.appointments);
      }
    } catch (err) {
      console.error('Failed to load doctor dashboard:', err);
      setErrorMessage(err.response?.data?.message || 'Could not load clinical dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCallNext = async () => {
    setCallingNext(true);
    setActionMessage('');
    try {
      const res = await api.post('/queue/doctor/call-next', { date: todayStr });
      if (res.data.success) {
        setActionMessage(res.data.message);
        loadData();
      }
    } catch (err) {
      setActionMessage(err.response?.data?.message || 'Failed to call next patient.');
    } finally {
      setCallingNext(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading doctor OPD console..." />;
  }

  const summary = queueSummary?.summary || { total: 0, waiting: 0, inConsultation: 0, completed: 0 };
  const currentServing = queueSummary?.currentServing;
  const nextWaiting = queueSummary?.nextWaiting;

  return (
    <div>
      {/* Page Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>
            Doctor Dashboard — {user?.name?.startsWith('Dr.') ? user.name : `Dr. ${user?.name || 'Physician'}`}
          </h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            {user?.specialization || 'Specialist'} • {user?.clinic_name || 'Central Clinic'}
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/doctor/schedule" className="btn btn-secondary btn-sm">
            <Calendar size={16} />
            Edit Working Schedule
          </Link>
          <Link to="/doctor/queue" className="btn btn-teal btn-sm">
            <Activity size={16} />
            Full Queue Cockpit
          </Link>
        </div>
      </div>

      {errorMessage && <Alert type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />}
      {actionMessage && <Alert type="info" message={actionMessage} onClose={() => setActionMessage('')} />}

      {/* Metric Cards */}
      <div className="doctor-stats-grid">
        <StatCard title="Today's Total Patients" value={summary.total} icon={Users} color="blue" />
        <StatCard title="Waiting in Line" value={summary.waiting} icon={Clock} color="amber" />
        <StatCard title="Currently Serving" value={summary.inConsultation} icon={Activity} color="teal" />
        <StatCard title="Completed Today" value={summary.completed} icon={CheckCircle} color="green" />
      </div>

      {/* Live Queue Call Next Hero */}
      <div className="doctor-live-hero-grid">
        {/* Current Serving Box */}
        <div
          style={{
            backgroundColor: 'var(--slate-50)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--slate-200)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>
              Currently in Consultation
            </span>
            <Badge status={currentServing ? 'In Consultation' : 'Completed'} text={currentServing ? 'ACTIVE' : 'IDLE'} />
          </div>

          {currentServing ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                  }}
                >
                  #{currentServing.queue_number}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>{currentServing.patient_name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    Phone: {currentServing.patient_phone} • Slot: {currentServing.appointment_time}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)' }}>
                Reason: <strong>{currentServing.reason_for_visit}</strong>
              </p>
            </div>
          ) : (
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem', padding: '16px 0' }}>
              No patient is currently inside the consultation room.
            </p>
          )}
        </div>

        {/* Next Waiting & Action Box */}
        <div
          style={{
            backgroundColor: 'var(--primary-50)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            border: '1px solid var(--primary-100)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-900)', textTransform: 'uppercase' }}>
                Next Patient in Line
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--primary-700)', fontWeight: 600 }}>
                {summary.waiting} remaining
              </span>
            </div>

            {nextWaiting ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--warning-solid)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '1.2rem',
                  }}
                >
                  #{nextWaiting.queue_number}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>{nextWaiting.patient_name}</h3>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                    Slot: {nextWaiting.appointment_time} • {nextWaiting.reason_for_visit}
                  </div>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--primary-800)', fontSize: '0.9rem', padding: '16px 0' }}>
                All scheduled patients for today have been served.
              </p>
            )}
          </div>

          <button
            onClick={handleCallNext}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            disabled={callingNext || !nextWaiting}
          >
            <PhoneCall size={18} />
            {callingNext
              ? 'Updating Queue Token...'
              : nextWaiting
              ? `Call Next Patient (#${nextWaiting.queue_number})`
              : 'Queue Empty'}
          </button>
        </div>
      </div>

      {/* Today's Appointments Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} color="var(--primary-600)" />
            Today's Scheduled Consultations ({todayAppointments.length})
          </h3>
          <Link to="/doctor/appointments" className="btn btn-secondary btn-sm">
            View All Dates
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div style={{ color: 'var(--slate-500)', textAlign: 'center', padding: '36px 16px' }}>
            <p style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--slate-700)', marginBottom: '6px' }}>
              No appointments booked for today ({todayStr}).
            </p>
            <p style={{ fontSize: '0.875rem', marginBottom: '16px', color: 'var(--slate-500)' }}>
              Check other dates or manage your clinical queue from the appointments console.
            </p>
            <Link to="/doctor/appointments" className="btn btn-secondary btn-sm">
              <Calendar size={15} />
              <span>View All Consultations</span>
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Queue #</th>
                  <th>Slot Time</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Reason</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayAppointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <strong style={{ color: 'var(--primary-700)' }}>
                        #{appt.queue_number || '-'}
                      </strong>
                    </td>
                    <td>{appt.appointment_time}</td>
                    <td>
                      <strong>{appt.patient_name}</strong>
                    </td>
                    <td>{appt.patient_phone}</td>
                    <td style={{ maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {appt.reason_for_visit}
                    </td>
                    <td>
                      <Badge status={appt.appointment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
