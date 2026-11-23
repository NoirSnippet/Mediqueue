import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Users, Search, Power, Phone, Mail, Calendar, Heart, Shield } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ManagePatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/patients', {
        params: { search: searchTerm },
      });
      if (res.data.success) {
        setPatients(res.data.patients);
      }
    } catch (err) {
      setError('Failed to load registered patients list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleToggleStatus = async (id, name) => {
    try {
      const res = await api.patch(`/admin/patients/${id}/toggle-status`);
      if (res.data.success) {
        setMessage(res.data.message);
        fetchPatients();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Patient Directory</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Manage registered clinic patients, check appointment histories, and manage account statuses.
          </p>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Search Bar */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="var(--slate-400)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search by patient name, email, or contact number..."
              style={{ paddingLeft: '38px' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-sm">
            Search
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              api.get('/admin/patients').then((r) => setPatients(r.data.patients));
            }}
          >
            Reset
          </button>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={20} color="var(--primary-600)" />
            Registered Patients ({patients.length})
          </h3>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading patient database records..." />
        ) : patients.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '30px' }}>
            No patient records found.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Contact Details</th>
                  <th>Demographics</th>
                  <th>Total Bookings</th>
                  <th>Registered</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.patient_id}>
                    <td>
                      <strong>{p.name}</strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>ID: #{p.patient_id}</div>
                    </td>
                    <td>
                      <div>{p.phone}</div>
                      <small style={{ color: 'var(--slate-500)' }}>{p.email}</small>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize' }}>{p.gender || 'Other'}</span>
                      {p.blood_group && (
                        <span style={{ marginLeft: '6px', color: 'var(--primary-700)', fontWeight: 600 }}>
                          • {p.blood_group}
                        </span>
                      )}
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                        {p.appointment_count} appointments
                      </span>
                    </td>
                    <td>
                      <small style={{ color: 'var(--slate-500)' }}>
                        {p.created_at ? new Date(p.created_at).toLocaleDateString() : '-'}
                      </small>
                    </td>
                    <td>
                      <Badge status={p.account_status} text={p.account_status.toUpperCase()} />
                    </td>
                    <td>
                      <button
                        onClick={() => handleToggleStatus(p.patient_id, p.name)}
                        className={`btn btn-sm ${p.account_status === 'active' ? 'btn-danger' : 'btn-teal'}`}
                      >
                        <Power size={14} />
                        {p.account_status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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
