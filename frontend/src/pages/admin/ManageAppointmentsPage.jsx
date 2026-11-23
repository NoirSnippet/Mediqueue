import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Calendar, Search, Filter, Edit, Clock, User, Stethoscope, AlertCircle, RefreshCw } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ManageAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedDoctor, setSelectedDoctor] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [search, setSearch] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Status Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [activeAppt, setActiveAppt] = useState(null);
  const [statusVal, setStatusVal] = useState('');
  const [notesVal, setNotesVal] = useState('');
  const [saving, setSaving] = useState(false);

  // Load doctors for dropdown
  useEffect(() => {
    async function loadDocs() {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Failed to load doctors list:', err);
      }
    }
    loadDocs();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedDoctor !== 'all') params.doctor_id = selectedDoctor;
      if (selectedDate) params.date = selectedDate;
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (search.trim()) params.search = search.trim();

      const res = await api.get('/admin/appointments', { params });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setError('Failed to fetch appointment logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDoctor, selectedDate, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAppointments();
  };

  const openEdit = (appt) => {
    setActiveAppt(appt);
    setStatusVal(appt.appointment_status);
    setNotesVal(appt.notes || '');
    setEditModalOpen(true);
  };

  const handleStatusSave = async () => {
    if (!activeAppt) return;
    setSaving(true);
    try {
      const res = await api.patch(`/appointments/${activeAppt.id}/status`, {
        status: statusVal,
        notes: notesVal,
      });

      if (res.data.success) {
        setMessage(`Appointment ${activeAppt.appointment_reference} status changed to ${statusVal}.`);
        setEditModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Appointments & Queue Registry</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Central administration log for all clinic appointments, sequential queue tokens, and statuses.
          </p>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Filter Matrix */}
      <div className="card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: '2', minWidth: '220px', position: 'relative' }}>
            <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search patient, doctor, or reference..."
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ flex: '1', minWidth: '180px' }}>
            <select
              className="form-control"
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="all">All Doctors</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  Dr. {d.doctor_name} ({d.specialization})
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div style={{ flex: '1', minWidth: '150px' }}>
            <select
              className="form-control"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
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
            Filter
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearch('');
              setSelectedDoctor('all');
              setSelectedDate('');
              setSelectedStatus('all');
            }}
          >
            Reset
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Calendar size={20} color="var(--primary-600)" />
            Appointments Roster ({appointments.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner message="Retrieving appointments registry..." />
        ) : appointments.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '30px' }}>
            No appointments matched your query.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Slot & Queue</th>
                  <th>Patient</th>
                  <th>Doctor & Spec</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <strong style={{ fontSize: '0.85rem' }}>{appt.appointment_reference}</strong>
                      <div style={{ fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                        {appt.created_at ? new Date(appt.created_at).toLocaleDateString() : ''}
                      </div>
                    </td>
                    <td>
                      <div><strong>{appt.appointment_date}</strong></div>
                      <small style={{ color: 'var(--slate-600)' }}>{appt.appointment_time}</small>
                      <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.85rem' }}>
                        Token #{appt.queue_number || '-'}
                      </div>
                    </td>
                    <td>
                      <strong>{appt.patient_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{appt.patient_phone}</div>
                    </td>
                    <td>
                      <div>Dr. {appt.doctor_name}</div>
                      <small style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
                        {appt.specialization}
                      </small>
                    </td>
                    <td style={{ maxWidth: '200px' }}>{appt.reason_for_visit}</td>
                    <td>
                      <Badge status={appt.appointment_status} />
                    </td>
                    <td>
                      <button
                        onClick={() => openEdit(appt)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
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

      {/* Edit Status Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={activeAppt ? `Manage Appointment ${activeAppt.appointment_reference}` : 'Update Status'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleStatusSave} disabled={saving}>
              {saving ? 'Updating...' : 'Save Changes'}
            </button>
          </>
        }
      >
        {activeAppt && (
          <div>
            <div style={{ marginBottom: '14px', padding: '12px', backgroundColor: 'var(--slate-50)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }}>
              <div><strong>Patient:</strong> {activeAppt.patient_name} ({activeAppt.patient_phone})</div>
              <div><strong>Doctor:</strong> Dr. {activeAppt.doctor_name} ({activeAppt.specialization})</div>
              <div><strong>Slot:</strong> {activeAppt.appointment_date} at {activeAppt.appointment_time} (Queue #{activeAppt.queue_number})</div>
            </div>

            <div className="form-group">
              <label className="form-label">Appointment & Queue Status</label>
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
              <label className="form-label">Admin Remarks / Notes</label>
              <textarea
                className="form-control"
                rows="2"
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
                placeholder="Operational remarks or notes..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
