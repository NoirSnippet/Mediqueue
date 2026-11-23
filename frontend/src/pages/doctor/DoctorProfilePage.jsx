import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Stethoscope, User, MapPin, Activity, CheckCircle2, ShieldCheck, Mail, Phone } from 'lucide-react';
import Alert from '../../components/common/Alert';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('available');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadDoctorProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setProfile(res.data.user);
        if (res.data.user.doctor) {
          setStatus(res.data.user.doctor.availability_status);
        }
      }
    } catch (err) {
      setError('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctorProfile();
  }, []);

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setMessage('');
    setError('');
    try {
      const res = await api.patch('/doctors/me/status', { availability_status: newStatus });
      if (res.data.success) {
        setStatus(newStatus);
        setMessage(`Your availability status has been updated to "${newStatus.replace('_', ' ')}".`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving doctor profile..." />;
  }

  const doc = profile?.doctor || {};

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Doctor Profile & Availability</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Manage your clinic availability status and review your professional credentials.
          </p>
        </div>

        <Badge status={status} />
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Quick Availability Status Control Card */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          backgroundColor: '#ffffff',
          borderLeft: '4px solid var(--primary-600)',
        }}
      >
        <div className="card-header">
          <h3 className="card-title">
            <Activity size={20} color="var(--primary-600)" />
            Real-Time Clinic Availability
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
            Affects patient slot booking in real time
          </span>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', marginBottom: '16px' }}>
          When set to <em>On Leave</em> or <em>Busy</em>, patients will be notified that consultation slots are temporarily unavailable.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleStatusChange('available')}
            disabled={updating || status === 'available'}
            className={`btn ${status === 'available' ? 'btn-teal' : 'btn-secondary'}`}
          >
            Available for Consultations
          </button>

          <button
            onClick={() => handleStatusChange('on_leave')}
            disabled={updating || status === 'on_leave'}
            className={`btn ${status === 'on_leave' ? 'btn-danger' : 'btn-secondary'}`}
          >
            On Leave
          </button>

          <button
            onClick={() => handleStatusChange('busy')}
            disabled={updating || status === 'busy'}
            className={`btn ${status === 'busy' ? 'btn-secondary' : 'btn-secondary'}`}
            style={status === 'busy' ? { backgroundColor: 'var(--warning-solid)', color: 'white', borderColor: 'var(--warning-solid)' } : {}}
          >
            Busy / In Procedure
          </button>
        </div>
      </div>

      {/* Profile Details Card */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Stethoscope size={20} color="var(--primary-600)" />
            Professional Credentials
          </h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '0.925rem' }}>
          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Doctor Name</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>Dr. {profile?.name}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Specialization</span>
            <strong style={{ fontSize: '1.1rem', color: 'var(--primary-700)' }}>{doc.specialization}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Qualification</span>
            <strong>{doc.qualification}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Experience</span>
            <strong>{doc.experience_years} Years Clinical Practice</strong>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Consultation Fee</span>
            <strong style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>
              ₹{parseFloat(doc.consultation_fee || 0).toFixed(0)}
            </strong>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Room / Cabin</span>
            <strong>{doc.room_number}</strong>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Email ID</span>
            <span>{profile?.email}</span>
          </div>

          <div>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Contact Phone</span>
            <span>{profile?.phone}</span>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Assigned Clinic</span>
            <strong>{doc.clinic_name}</strong>
            <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>{doc.clinic_address}</div>
          </div>

          <div style={{ gridColumn: 'span 2' }}>
            <span style={{ color: 'var(--slate-500)', fontSize: '0.8rem', display: 'block' }}>Doctor Bio</span>
            <p style={{ color: 'var(--slate-700)', lineHeight: 1.6, marginTop: '4px' }}>
              {doc.bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
