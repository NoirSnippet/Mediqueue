import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Stethoscope, Plus, Edit2, Power, UserCheck, Shield, CheckCircle, Search } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ManageDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Add Doctor Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: 'password123',
    specialization: 'Cardiology',
    qualification: 'MBBS, MD',
    experience_years: 5,
    consultation_fee: 400,
    room_number: 'Room 101',
    bio: '',
  });
  const [creating, setCreating] = useState(false);

  // Edit Doctor Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [updating, setUpdating] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/doctors');
      if (res.data.success) {
        setDoctors(res.data.doctors);
      }
    } catch (err) {
      setError('Failed to load doctors list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleToggleStatus = async (id, name, currentStatus) => {
    try {
      const res = await api.patch(`/admin/doctors/${id}/toggle-status`);
      if (res.data.success) {
        setMessage(res.data.message);
        fetchDoctors();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);
    setError('');
    setMessage('');

    try {
      const res = await api.post('/admin/doctors', addForm);
      if (res.data.success) {
        setMessage(res.data.message);
        setAddModalOpen(false);
        setAddForm({
          name: '',
          email: '',
          phone: '',
          password: 'password123',
          specialization: 'Cardiology',
          qualification: 'MBBS, MD',
          experience_years: 5,
          consultation_fee: 400,
          room_number: 'Room 101',
          bio: '',
        });
        fetchDoctors();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor.');
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (doc) => {
    setEditingDoctorId(doc.id);
    setEditForm({
      name: doc.doctor_name,
      phone: doc.phone,
      specialization: doc.specialization,
      qualification: doc.qualification,
      experience_years: doc.experience_years,
      consultation_fee: doc.consultation_fee,
      room_number: doc.room_number,
      bio: doc.bio || '',
      availability_status: doc.availability_status,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      const res = await api.put(`/admin/doctors/${editingDoctorId}`, editForm);
      if (res.data.success) {
        setMessage(res.data.message);
        setEditModalOpen(false);
        fetchDoctors();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update doctor.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Doctor Profiles & Credentials</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Onboard doctors, configure specializations, adjust consultation fees, and toggle access permissions.
          </p>
        </div>

        <button onClick={() => setAddModalOpen(true)} className="btn btn-primary">
          <Plus size={18} />
          Add New Doctor
        </button>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Stethoscope size={20} color="var(--primary-600)" />
            Medical Staff Registry ({doctors.length} doctors)
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading doctor roster..." />
        ) : doctors.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '30px' }}>No doctors found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization & Qualification</th>
                  <th>Fee</th>
                  <th>Room</th>
                  <th>Active Days</th>
                  <th>Availability</th>
                  <th>Account</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {doctors.map((doc) => (
                  <tr key={doc.id}>
                    <td>
                      <strong>Dr. {doc.doctor_name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>
                        {doc.email} • {doc.phone}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{doc.specialization}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>{doc.qualification}</div>
                    </td>
                    <td>
                      <strong>₹{parseFloat(doc.consultation_fee).toFixed(0)}</strong>
                    </td>
                    <td>{doc.room_number}</td>
                    <td>
                      <span style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                        {doc.active_schedules_count} days/week
                      </span>
                    </td>
                    <td>
                      <Badge status={doc.availability_status} />
                    </td>
                    <td>
                      <Badge status={doc.account_status} text={doc.account_status.toUpperCase()} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => openEdit(doc)}
                          className="btn btn-secondary btn-sm"
                          title="Edit Profile"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(doc.id, doc.doctor_name, doc.account_status)}
                          className={`btn btn-sm ${doc.account_status === 'active' ? 'btn-danger' : 'btn-teal'}`}
                          title={doc.account_status === 'active' ? 'Deactivate Doctor' : 'Activate Doctor'}
                        >
                          <Power size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Doctor Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Onboard New Medical Specialist"
        maxWidth="680px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setAddModalOpen(false)} disabled={creating}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleCreateSubmit} disabled={creating}>
              {creating ? 'Creating Profile & Schedule...' : 'Create Doctor Account'}
            </button>
          </>
        }
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="register-form-grid" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Doctor Name *</label>
              <input
                type="text"
                className="form-control"
                placeholder="Dr. Full Name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Login Email Address *</label>
              <input
                type="email"
                className="form-control"
                placeholder="dr.name@mediqueue.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input
                type="tel"
                className="form-control"
                placeholder="+91-9876543210"
                value={addForm.phone}
                onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Default Password *</label>
              <input
                type="password"
                className="form-control"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Cardiology, Neurology, ENT..."
                value={addForm.specialization}
                onChange={(e) => setAddForm({ ...addForm, specialization: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualification *</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. MBBS, MD (Medicine), DM"
                value={addForm.qualification}
                onChange={(e) => setAddForm({ ...addForm, qualification: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Experience (Years)</label>
              <input
                type="number"
                className="form-control"
                value={addForm.experience_years}
                onChange={(e) => setAddForm({ ...addForm, experience_years: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              <input
                type="number"
                className="form-control"
                value={addForm.consultation_fee}
                onChange={(e) => setAddForm({ ...addForm, consultation_fee: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Assigned Room / Cabin</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Room 204 - OPD Block"
                value={addForm.room_number}
                onChange={(e) => setAddForm({ ...addForm, room_number: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Professional Bio</label>
              <textarea
                className="form-control"
                rows="2"
                placeholder="Specialist background and clinical interests..."
                value={addForm.bio}
                onChange={(e) => setAddForm({ ...addForm, bio: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Edit Doctor Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Doctor Details"
        maxWidth="640px"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setEditModalOpen(false)} disabled={updating}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleEditSubmit} disabled={updating}>
              {updating ? 'Saving Changes...' : 'Save Profile Changes'}
            </button>
          </>
        }
      >
        <form onSubmit={handleEditSubmit}>
          <div className="register-form-grid" style={{ gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Doctor Name</label>
              <input
                type="text"
                className="form-control"
                value={editForm.name || ''}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-control"
                value={editForm.phone || ''}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Specialization</label>
              <input
                type="text"
                className="form-control"
                value={editForm.specialization || ''}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Qualification</label>
              <input
                type="text"
                className="form-control"
                value={editForm.qualification || ''}
                onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Consultation Fee (₹)</label>
              <input
                type="number"
                className="form-control"
                value={editForm.consultation_fee || ''}
                onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Cabin / Room</label>
              <input
                type="text"
                className="form-control"
                value={editForm.room_number || ''}
                onChange={(e) => setEditForm({ ...editForm, room_number: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Availability Status</label>
              <select
                className="form-control"
                value={editForm.availability_status || 'available'}
                onChange={(e) => setEditForm({ ...editForm, availability_status: e.target.value })}
              >
                <option value="available">Available</option>
                <option value="on_leave">On Leave</option>
                <option value="busy">Busy</option>
              </select>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Doctor Bio</label>
              <textarea
                className="form-control"
                rows="2"
                value={editForm.bio || ''}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
