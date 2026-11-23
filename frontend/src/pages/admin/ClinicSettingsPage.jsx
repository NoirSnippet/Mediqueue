import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Settings, MapPin, Phone, Mail, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ClinicSettingsPage() {
  const [formData, setFormData] = useState({
    clinic_name: '',
    address: '',
    contact_number: '',
    email: '',
    opening_time: '08:00:00',
    closing_time: '20:00:00',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClinic() {
      try {
        const res = await api.get('/admin/clinic');
        if (res.data.success) {
          const c = res.data.clinic;
          setFormData({
            clinic_name: c.clinic_name || '',
            address: c.address || '',
            contact_number: c.contact_number || '',
            email: c.email || '',
            opening_time: c.opening_time ? c.opening_time.slice(0, 5) : '08:00',
            closing_time: c.closing_time ? c.closing_time.slice(0, 5) : '20:00',
          });
        }
      } catch (err) {
        setError('Failed to load clinic settings.');
      } finally {
        setLoading(false);
      }
    }
    loadClinic();
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
    setMessage('');
    setError('');

    try {
      const res = await api.put('/admin/clinic', formData);
      if (res.data.success) {
        setMessage('Clinic settings have been updated successfully.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update clinic information.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading clinic configuration..." />;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Clinic Configuration</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Configure clinic branding, primary contact details, address, and daily OPD operational hours.
          </p>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Settings size={20} color="var(--primary-600)" />
              Clinic General Information
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Clinic Facility Name *</label>
              <input
                type="text"
                name="clinic_name"
                className="form-control"
                value={formData.clinic_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">OPD Contact Phone *</label>
              <input
                type="tel"
                name="contact_number"
                className="form-control"
                value={formData.contact_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Official Email</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Physical Facility Address *</label>
              <input
                type="text"
                name="address"
                className="form-control"
                value={formData.address}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Daily Opening Time</label>
              <input
                type="time"
                name="opening_time"
                className="form-control"
                value={formData.opening_time}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Daily Closing Time</label>
              <input
                type="time"
                name="closing_time"
                className="form-control"
                value={formData.closing_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '14px' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Update Clinic Information'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
