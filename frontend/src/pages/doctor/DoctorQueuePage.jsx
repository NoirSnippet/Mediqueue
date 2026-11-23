import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
  Activity,
  PhoneCall,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  User,
  AlertCircle,
  Check,
  Calendar,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function DoctorQueuePage() {
  const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [queueData, setQueueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Status Change Modal
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeQueueItem, setActiveQueueItem] = useState(null);
  const [newStatus, setNewStatus] = useState('Completed');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const loadQueue = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/queue/doctor/live', {
        params: { date: selectedDate },
      });
      if (res.data.success) {
        setQueueData(res.data);
      }
    } catch (err) {
      setError('Failed to load queue roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, [selectedDate]);

  const handleCallNext = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await api.post('/queue/doctor/call-next', { date: selectedDate });
      if (res.data.success) {
        setMessage(res.data.message);
        loadQueue();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to call next patient.');
    } finally {
      setActionLoading(false);
    }
  };

  const openStatusModal = (item) => {
    setActiveQueueItem(item);
    setNewStatus(item.queue_status === 'In Consultation' ? 'Completed' : 'In Consultation');
    setClinicalNotes(item.notes || '');
    setStatusModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!activeQueueItem) return;
    setActionLoading(true);
    try {
      const res = await api.patch(`/appointments/${activeQueueItem.appointment_id}/status`, {
        status: newStatus,
        notes: clinicalNotes,
      });

      if (res.data.success) {
        setMessage(`Queue #${activeQueueItem.queue_number} updated to ${newStatus}.`);
        setStatusModalOpen(false);
        loadQueue();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update queue item.');
    } finally {
      setActionLoading(false);
    }
  };

  const currentServing = queueData?.currentServing;
  const nextWaiting = queueData?.nextWaiting;
  const summary = queueData?.summary || { total: 0, waiting: 0, inConsultation: 0, completed: 0, cancelled: 0 };
  const queueList = queueData?.queueList || [];

  return (
    <div>
      {/* Header */}
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Live OPD Queue Cockpit</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Real-time consultation controls, patient calling engine, and queue status transitions.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} color="var(--slate-500)" />
            <input
              type="date"
              className="form-control"
              style={{ width: '160px', padding: '6px 10px', fontSize: '0.875rem' }}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <button onClick={loadQueue} className="btn btn-secondary btn-sm" title="Refresh Queue Data">
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {message && <Alert type="success" message={message} onClose={() => setMessage('')} />}
      {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

      {/* Main Cockpit Split: Currently Serving vs Next In Line */}
      <div className="doctor-live-hero-grid" style={{ marginBottom: '32px' }}>
        {/* Active Consultation Box */}
        <div
          className="card"
          style={{
            borderLeft: currentServing ? '4px solid var(--primary-600)' : '4px solid var(--slate-300)',
            backgroundColor: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} color="var(--primary-600)" />
              Currently Serving
            </h3>
            <Badge status={currentServing ? 'In Consultation' : 'Completed'} text={currentServing ? 'IN PROGRESS' : 'VACANT'} />
          </div>

          {currentServing ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: 'var(--radius-lg)',
                    backgroundColor: 'var(--primary-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                  }}
                >
                  #{currentServing.queue_number}
                </div>
                <div>
                  <h4 style={{ fontSize: '1.3rem', color: 'var(--slate-900)' }}>{currentServing.patient_name}</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                    Phone: {currentServing.patient_phone} • Slot: {currentServing.appointment_time}
                  </div>
                  {currentServing.called_at && (
                    <small style={{ color: 'var(--primary-700)', fontSize: '0.75rem' }}>
                      Called at: {new Date(currentServing.called_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  )}
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--slate-50)', padding: '12px', borderRadius: 'var(--radius-md)', marginBottom: '16px', fontSize: '0.875rem' }}>
                <div><strong>Reason:</strong> {currentServing.reason_for_visit}</div>
                {currentServing.notes && <div style={{ marginTop: '4px' }}><strong>Notes:</strong> {currentServing.notes}</div>}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => openStatusModal(currentServing)}
                  className="btn btn-teal"
                  style={{ flex: 1 }}
                >
                  <Check size={16} />
                  Mark Completed
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--slate-400)' }}>
              No patient is currently in consultation. Click "Call Next Patient" to start.
            </div>
          )}
        </div>

        {/* Next Waiting Patient Box */}
        <div
          className="card"
          style={{
            borderLeft: nextWaiting ? '4px solid var(--warning-solid)' : '4px solid var(--slate-300)',
            backgroundColor: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-800)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--warning-solid)" />
                Next Eligible Patient
              </h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600 }}>
                {summary.waiting} in waiting line
              </span>
            </div>

            {nextWaiting ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: 'var(--radius-lg)',
                      backgroundColor: 'var(--warning-solid)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.5rem',
                      fontWeight: 800,
                    }}
                  >
                    #{nextWaiting.queue_number}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '1.3rem', color: 'var(--slate-900)' }}>{nextWaiting.patient_name}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-500)' }}>
                      Phone: {nextWaiting.patient_phone} • Slot: {nextWaiting.appointment_time}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-700)', marginTop: '4px' }}>
                      Reason: {nextWaiting.reason_for_visit}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '36px 0', color: 'var(--slate-400)' }}>
                No more waiting patients for this date.
              </div>
            )}
          </div>

          <button
            onClick={handleCallNext}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontWeight: 700 }}
            disabled={actionLoading || !nextWaiting}
          >
            <PhoneCall size={18} />
            {actionLoading ? 'Calling...' : nextWaiting ? `Call Queue #${nextWaiting.queue_number}` : 'Queue Empty'}
          </button>
        </div>
      </div>

      {/* Full Queue Roster for Selected Date */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Users size={20} color="var(--primary-600)" />
            Queue Roster ({queueList.length} total)
          </h3>

          <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 600 }}>
            <span style={{ color: 'var(--warning-solid)' }}>Waiting: {summary.waiting}</span>
            <span style={{ color: 'var(--primary-700)' }}>In Consultation: {summary.inConsultation}</span>
            <span style={{ color: 'var(--success-solid)' }}>Completed: {summary.completed}</span>
            <span style={{ color: 'var(--danger-solid)' }}>Cancelled: {summary.cancelled}</span>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner message="Loading queue records..." />
        ) : queueList.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '30px' }}>
            No queue tokens recorded for {selectedDate}.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Queue #</th>
                  <th>Slot</th>
                  <th>Patient Name</th>
                  <th>Contact</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {queueList.map((item) => (
                  <tr key={item.queue_id}>
                    <td>
                      <strong style={{ color: 'var(--primary-700)', fontSize: '1rem' }}>
                        #{item.queue_number}
                      </strong>
                    </td>
                    <td>{item.appointment_time}</td>
                    <td>
                      <strong>{item.patient_name}</strong>
                    </td>
                    <td>{item.patient_phone}</td>
                    <td>{item.reason_for_visit}</td>
                    <td>
                      <Badge status={item.queue_status} />
                    </td>
                    <td>
                      <button
                        onClick={() => openStatusModal(item)}
                        className="btn btn-secondary btn-sm"
                        disabled={item.queue_status === 'Cancelled'}
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={activeQueueItem ? `Manage Queue #${activeQueueItem.queue_number} - ${activeQueueItem.patient_name}` : 'Update Status'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setStatusModalOpen(false)} disabled={actionLoading}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={handleUpdateStatus} disabled={actionLoading}>
              {actionLoading ? 'Updating...' : 'Save Status Update'}
            </button>
          </>
        }
      >
        {activeQueueItem && (
          <div>
            <div className="form-group">
              <label className="form-label">New Consultation Status</label>
              <select
                className="form-control"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="Waiting">Waiting</option>
                <option value="In Consultation">In Consultation</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Doctor's Clinical Notes (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Prescription summary, diagnosis, or remarks..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
