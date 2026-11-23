import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Clock,
  RefreshCw,
  UserCheck,
  Stethoscope,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Users,
  Calendar,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function QueueStatusPage() {
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchLiveQueue = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    setError('');
    try {
      const res = await api.get('/queue/patient/live');
      if (res.data.success) {
        if (res.data.hasQueue) {
          setQueueData(res.data.queue);
        } else {
          setQueueData(null);
        }
      }
    } catch (err) {
      setError('Could not retrieve queue updates.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Connecting to OPD queue monitor..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Page Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Live OPD Queue Status</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Real-time queue tracking for your consultation today. No guesswork or false estimations.
          </p>
        </div>

        <button
          onClick={() => fetchLiveQueue(true)}
          className="btn btn-secondary btn-sm"
          disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
          <span>{refreshing ? 'Refreshing...' : 'Refresh Status'}</span>
        </button>
      </div>

      {!queueData ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Clock size={48} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.3rem', marginBottom: '8px' }}>No Active Queue Token Today</h3>
          <p style={{ color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto 24px' }}>
            You do not have any appointments scheduled for today. Queue tokens are generated automatically when an appointment is booked.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/patient/book" className="btn btn-primary">
              Book Doctor Slot
            </Link>
            <Link to="/patient/appointments" className="btn btn-secondary">
              View Appointments
            </Link>
          </div>
        </div>
      ) : (
        <div>
          {/* Main Queue Hero Display */}
          <div className="queue-token-card" style={{ marginBottom: '28px' }}>
            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.9 }}>
              Your Issued Queue Token
            </div>
            <div className="queue-token-number">
              #{queueData.queue_number}
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.2)', padding: '6px 18px', borderRadius: 'var(--radius-full)', fontWeight: 700, fontSize: '0.95rem' }}>
              <span className="badge-dot" style={{ backgroundColor: '#ffffff' }} />
              <span>Status: {queueData.queue_status}</span>
            </div>

            <p style={{ marginTop: '16px', fontSize: '1.1rem', fontWeight: 600, opacity: 0.95 }}>
              {queueData.statusMessage}
            </p>
          </div>

          {/* Real-Time Live Counters */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '28px' }}>
            {/* Currently Serving Box */}
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Currently Serving
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>
                {queueData.currentServingNumber ? `#${queueData.currentServingNumber}` : 'None'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                {queueData.currentServingNumber ? 'In Consultation with Doctor' : 'Waiting for next patient call'}
              </div>
            </div>

            {/* Patients Ahead in Queue */}
            <div className="card" style={{ textAlign: 'center', padding: '24px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                Patients Ahead in Line
              </div>
              <div
                style={{
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: queueData.aheadCount === 0 ? 'var(--teal-600)' : 'var(--slate-800)',
                  fontFamily: 'var(--font-heading)',
                }}
              >
                {queueData.aheadCount}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                {queueData.aheadCount === 0 ? 'You are next!' : `${queueData.totalWaiting} total waiting today`}
              </div>
            </div>
          </div>

          {/* Consultation & Doctor Info Card */}
          <div className="card" style={{ marginBottom: '28px' }}>
            <div className="card-header">
              <h3 className="card-title">
                <Stethoscope size={20} color="var(--primary-600)" />
                Consultation Details
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.925rem' }}>
              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.8rem' }}>Doctor Name</span>
                <strong style={{ color: 'var(--slate-900)' }}>Dr. {queueData.doctor_name}</strong>
                <span style={{ color: 'var(--primary-700)', display: 'block', fontSize: '0.85rem' }}>
                  {queueData.specialization}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.8rem' }}>Clinic & Room</span>
                <strong style={{ color: 'var(--slate-900)' }}>{queueData.room_number}</strong>
                <span style={{ color: 'var(--slate-600)', display: 'block', fontSize: '0.85rem' }}>
                  {queueData.clinic_name}
                </span>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.8rem' }}>Reserved Slot Time</span>
                <strong style={{ color: 'var(--slate-900)' }}>{queueData.appointment_time}</strong>
              </div>

              <div>
                <span style={{ color: 'var(--slate-500)', display: 'block', fontSize: '0.8rem' }}>Appointment Ref</span>
                <strong style={{ color: 'var(--slate-900)' }}>{queueData.appointment_reference}</strong>
              </div>
            </div>
          </div>

          {/* Queue Guidelines Note */}
          <div
            style={{
              padding: '16px 20px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--primary-100)',
              display: 'flex',
              gap: '12px',
              alignItems: 'flex-start',
            }}
          >
            <CheckCircle2 size={20} color="var(--primary-600)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div style={{ fontSize: '0.875rem', color: 'var(--primary-900)', lineHeight: 1.5 }}>
              <strong>Queue Guidelines:</strong> Please arrive near <strong>{queueData.room_number}</strong> when there are 1 or 2 patients ahead of you.
              When your number is called, your status will turn to <em>In Consultation</em>.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
