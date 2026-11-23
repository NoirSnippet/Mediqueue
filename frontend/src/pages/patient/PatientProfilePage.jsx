import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Mail, Phone, Calendar, Heart, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function PatientProfilePage() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    date_of_birth: '',
    gender: 'other',
    blood_group: 'Not Specified',
    emergency_contact: '',
    address: '',
    medical_history: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await api.get('/patients/profile');
        if (res.data.success) {
          const p = res.data.profile;
          setProfile(p);
          setFormData({
            name: p.name || '',
            phone: p.phone || '',
            date_of_birth: p.date_of_birth || '',
            gender: p.gender || 'other',
            blood_group: p.blood_group || 'Not Specified',
            emergency_contact: p.emergency_contact || '',
            address: p.address || '',
            medical_history: p.medical_history || '',
          });
        }
      } catch (err) {
        setErrorMessage('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const res = await api.put('/patients/profile', formData);
      if (res.data.success) {
        setSuccessMessage('Profile information saved successfully.');
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Retrieving patient profile..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Patient Profile</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Keep your contact details and medical records up to date for clinical consultations.
          </p>
        </div>
      </div>

      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
      {errorMessage && <Alert type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <User size={20} color="var(--primary-600)" />
              Personal & Account Information
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email (Read-only) */}
            <div className="form-group">
              <label className="form-label">Email (Account ID)</label>
              <input
                type="email"
                className="form-control"
                value={profile?.email || ''}
                disabled
              />
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            {/* Date of Birth */}
            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                className="form-control"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
            </div>

            {/* Gender */}
            <div className="form-group">
              <label className="form-label">Gender</label>
              <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Blood Group */}
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select name="blood_group" className="form-control" value={formData.blood_group} onChange={handleChange}>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Not Specified">Not Specified</option>
              </select>
            </div>

            {/* Emergency Contact */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Emergency Contact Phone</label>
              <input
                type="tel"
                name="emergency_contact"
                className="form-control"
                placeholder="Guardian / Emergency contact number"
                value={formData.emergency_contact}
                onChange={handleChange}
              />
            </div>

            {/* Residential Address */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Residential Address</label>
              <input
                type="text"
                name="address"
                className="form-control"
                placeholder="Home address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>

            {/* Medical History */}
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Known Allergies / Medical Notes</label>
              <textarea
                name="medical_history"
                className="form-control"
                rows="3"
                placeholder="List known allergies, chronic conditions, or current medications..."
                value={formData.medical_history}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Profile Information'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
