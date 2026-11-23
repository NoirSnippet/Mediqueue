import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Search, Filter, Edit, Clock, User, Phone, CheckCircle, XCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Status Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [statusVal, setStatusVal] = useState('');
  const [notesVal, setNotesVal] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus && filterStatus !== 'all') params.status = filterStatus;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await api.get('/appointments/doctor/my-appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch doctor appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [filterDate, filterStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const openEditModal = (appt) => {
    setSelectedAppt(appt);
    setStatusVal(appt.appointment_status);
    setNotesVal(appt.notes || '');
    setEditModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedAppt) return;
    setSaving(true);
    try {
      const res = await api.patch(`/appointments/${selectedAppt.id}/status`, {
        status: statusVal,
        notes: notesVal,
      });

      if (res.data.success) {
        setMessage(`Appointment ${selectedAppt.appointment_reference} status updated to ${statusVal}.`);
        setEditModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update appointment status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>My Appointments</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Review your patient appointments, filter by date, and update consultation progression.
          </p>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Filter and Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search Term */}
          <div style={{ flex: '2', minWidth: '220px', position: 'relative' }}>
            <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search patient name, phone, ref..."
              style={{ paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <input
              type="date"
              className="form-control"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div style={{ flex: '1', minWidth: '160px' }}>
            <select
              className="form-control"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="Booked">Booked</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Waiting">Waiting</option>
              <option value="In Consultation">In Consultation</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
              setFilterStatus('all');
            }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Appointments List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} color="var(--primary-600)" />
            Appointments Log ({appointments.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading patient appointment records..." />
        ) : appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '40px' }}>
            No appointments match your filters.
          </p>
        ) : (
          <div className="table-responsive">
            <div className="mobile-table-hint">
              <span>Doctor Appointments</span>
              <span>👉 Swipe table to view all columns</span>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Ref & Queue</th>
                  <th>Date & Time</th>
                  <th>Patient Details</th>
                  <th>Reason for Consultation</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-400)', fontWeight: 600 }}>
                        {appt.appointment_reference}
                      </div>
                      <div style={{ fontWeight: 700, color: 'var(--primary-700)' }}>
                        Queue #{appt.queue_number || '-'}
                      </div>
                    </td>
                    <td>
                      <strong>{appt.appointment_date}</strong>
                      <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>{appt.appointment_time}</div>
                    </td>
                    <td>
                      <strong>{appt.patient_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {appt.patient_phone} • {appt.patient_gender} • {appt.patient_blood_group}
                      </div>
                    </td>
                    <td style={{ maxWidth: '200px' }}>{appt.reason_for_visit}</td>
                    <td>
                      <Badge status={appt.appointment_status} />
                    </td>
                    <td style={{ maxWidth: '180px', fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {appt.notes || <span style={{ color: 'var(--slate-400)' }}>None</span>}
                    </td>
                    <td>
                      <button
                        onClick={() => openEditModal(appt)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                      >
                        <Edit size={14} />
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Status & Notes Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={selectedAppt ? `Update Appointment: ${selectedAppt.appointment_reference}` : 'Update Status'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleSaveStatus} disabled={saving}>
              {saving ? 'Saving Changes...' : 'Save Status'}
            </button>
          </>
        }
      >
        {selectedAppt && (
          <div>
            <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)' }}>
              <strong>Patient:</strong> {selectedAppt.patient_name} ({selectedAppt.patient_phone})
              <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                Slot: {selectedAppt.appointment_date} at {selectedAppt.appointment_time} (Queue #{selectedAppt.queue_number})
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Status</label>
              <select
                className="form-control"
                value={statusVal}
                onChange={(e) => setStatusVal(e.target.value)}
              >
                <option value="Booked">Booked</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Waiting">Waiting</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Clinical Remarks & Notes</label>
              <textarea
                className="form-control"
                rows="3"
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                placeholder="Diagnosis, prescription notes, follow-up advice..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
