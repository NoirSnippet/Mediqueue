import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Plus, Clock, Edit2, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    day_of_week: 'Monday',
    start_time: '09:00',
    end_time: '13:00',
    slot_duration_minutes: 20,
    is_active: true,
  });

  const loadSchedules = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/doctors/me/schedules');
      if (res.data.success) {
        setSchedules(res.data.schedules);
      }
    } catch (err) {
      setError('Failed to load your working schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const openAddModal = () => {
    setFormData({
      day_of_week: 'Monday',
      start_time: '09:00',
      end_time: '13:00',
      slot_duration_minutes: 20,
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setFormData({
      day_of_week: item.day_of_week,
      start_time: item.start_time.slice(0, 5),
      end_time: item.end_time.slice(0, 5),
      slot_duration_minutes: item.slot_duration_minutes,
      is_active: Boolean(item.is_active),
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/doctors/me/schedules', formData);
      if (res.data.success) {
        setMessage(res.data.message);
        setModalOpen(false);
        loadSchedules();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, day) => {
    if (!window.confirm(`Are you sure you want to remove consultation hours for ${day}?`)) return;

    try {
      const res = await api.delete(`/doctors/me/schedules/${id}`);
      if (res.data.success) {
        setMessage(res.data.message);
        loadSchedules();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete schedule.');
    }
  };

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Manage Working Schedule</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Set your consultation days, shift timings, and slot durations. Appointments are automatically booked into these slots.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button onClick={openAddModal} className="btn btn-primary">
            <Plus size={18} />
            Add / Update Day
          </button>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={20} color="var(--primary-600)" />
            Weekly Consultation Schedule
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading weekly schedule..." />
        ) : schedules.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-400)' }}>
            <Calendar size={48} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
            <p>No working schedules registered. Click "Add / Update Day" to set your hours.</p>
          </div>
        ) : (
          <>
            <div className="mobile-table-hint">
              👉 Swipe table horizontally to view all schedule columns
            </div>
            <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Day of Week</th>
                  <th>Shift Hours</th>
                  <th>Slot Duration</th>
                  <th>Patients / Slot</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong style={{ fontSize: '1rem', color: 'var(--slate-900)' }}>
                        {item.day_of_week}
                      </strong>
                    </td>
                    <td>
                      {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                    </td>
                    <td>{item.slot_duration_minutes} minutes</td>
                    <td>{item.max_patients_per_slot || 1}</td>
                    <td>
                      <span
                        className={`badge ${
                          item.is_active ? 'badge-confirmed' : 'badge-cancelled'
                        }`}
                      >
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEditModal(item)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Timing"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.day_of_week)}
                          className="btn btn-danger btn-sm"
                          title="Remove Day"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      </div>

      {/* Add / Edit Schedule Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Configure Working Day & Hours"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleFormSubmit} disabled={saving}>
              {saving ? 'Saving...' : 'Save Schedule'}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit}>
          <div className="form-group">
            <label className="form-label">Day of Week *</label>
            <select
              className="form-control"
              value={formData.day_of_week}
              onChange={(e) => setFormData({ ...formData, day_of_week: e.target.value })}
              required
            >
              <option value="Monday">Monday</option>
              <option value="Tuesday">Tuesday</option>
              <option value="Wednesday">Wednesday</option>
              <option value="Thursday">Thursday</option>
              <option value="Friday">Friday</option>
              <option value="Saturday">Saturday</option>
              <option value="Sunday">Sunday</option>
            </select>
          </div>

          <div className="register-form-grid" style={{ gap: '14px' }}>
            <div className="form-group">
              <label className="form-label">Start Time (HH:MM) *</label>
              <input
                type="time"
                className="form-control"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time (HH:MM) *</label>
              <input
                type="time"
                className="form-control"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Slot Duration (Minutes) *</label>
            <select
              className="form-control"
              value={formData.slot_duration_minutes}
              onChange={(e) => setFormData({ ...formData, slot_duration_minutes: parseInt(e.target.value, 10) })}
            >
              <option value={15}>15 minutes per patient</option>
              <option value={20}>20 minutes per patient (Standard)</option>
              <option value={30}>30 minutes per patient</option>
              <option value={45}>45 minutes per patient</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <span>Accept consultations on this day (Active)</span>
            </label>
          </div>
        </form>
      </Modal>
    </div>
  );
}
