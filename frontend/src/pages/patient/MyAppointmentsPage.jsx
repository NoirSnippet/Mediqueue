import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, MapPin, XCircle, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Cancel Modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedApptToCancel, setSelectedApptToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('Change of plans');
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await api.get('/appointments/patient/my-appointments', {
        params: { status: activeTab },
      });
      if (res.data.success) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setErrorMessage('Failed to load appointments history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [activeTab]);

  const openCancelModal = (appt) => {
    setSelectedApptToCancel(appt);
    setCancellationReason('Schedule conflict');
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedApptToCancel) return;
    setCancelling(true);
    try {
      const res = await api.post(`/appointments/${selectedApptToCancel.id}/cancel`, {
        cancellation_reason: cancellationReason,
      });

      if (res.data.success) {
        setSuccessMessage('Appointment has been successfully cancelled.');
        setCancelModalOpen(false);
        fetchAppointments();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All Appointments' },
    { id: 'Confirmed', label: 'Confirmed' },
    { id: 'Waiting', label: 'Waiting' },
    { id: 'In Consultation', label: 'In Consultation' },
    { id: 'Completed', label: 'Completed' },
    { id: 'Cancelled', label: 'Cancelled' },
  ];

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>My Appointments</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Review your upcoming consultations, view issued queue numbers, or cancel if needed.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/patient/book" className="btn btn-primary">
            <PlusCircle size={18} />
            Book New Slot
          </Link>
        </div>
      </div>

      {successMessage && <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />}
      {errorMessage && <Alert type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />}

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '12px',
          marginBottom: '20px',
          borderBottom: '1px solid var(--slate-200)',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`btn btn-sm ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: 'var(--radius-full)' }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {loading ? (
        <LoadingSpinner message="Retrieving appointments..." />
      ) : appointments.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <Calendar size={48} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Appointments Found</h3>
          <p style={{ color: 'var(--slate-500)', marginBottom: '20px' }}>
            You do not have any appointments in this status category.
          </p>
          <Link to="/patient/book" className="btn btn-primary btn-sm">
            Book an Appointment
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {appointments.map((appt) => {
            const canCancel =
              appt.appointment_status === 'Booked' ||
              appt.appointment_status === 'Confirmed' ||
              appt.appointment_status === 'Waiting';

            return (
              <div
                key={appt.id}
                className="card card-hover patient-appt-card"
              >
                {/* Doctor and Clinic Info */}
                <div className="patient-appt-doc-info">
                  <div
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--primary-100)',
                      color: 'var(--primary-700)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      flexShrink: 0,
                    }}
                  >
                    #{appt.queue_number || '-'}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>
                      REF: {appt.appointment_reference}
                    </div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', marginBottom: '1px' }}>
                      Dr. {appt.doctor_name}
                    </h4>
                    <div style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.85rem' }}>
                      {appt.specialization}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                      {appt.clinic_name} • {appt.room_number}
                    </div>
                  </div>
                </div>

                {/* Schedule and Queue Details */}
                <div className="patient-appt-details">
                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)' }}>Date & Slot</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--slate-900)' }}>
                      {appt.appointment_date}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--slate-600)' }}>
                      {appt.appointment_time}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '4px' }}>
                      Status & Queue
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <Badge status={appt.appointment_status} />
                      {appt.queue_number && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: 'var(--teal-50)',
                            color: 'var(--teal-700)',
                            padding: '2px 8px',
                            borderRadius: 'var(--radius-full)',
                            fontWeight: 700,
                            border: '1px solid var(--teal-100)',
                          }}
                        >
                          Queue #{appt.queue_number}
                        </span>
                      )}
                    </div>
                    {appt.cancellation_reason && (
                      <small style={{ color: 'var(--danger-solid)', display: 'block', marginTop: '4px', fontSize: '0.75rem' }}>
                        Reason: {appt.cancellation_reason}
                      </small>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="patient-appt-actions">
                  {appt.queue_status !== 'Cancelled' && (
                    <Link to="/patient/queue" className="btn btn-secondary btn-sm">
                      <Clock size={15} />
                      Queue
                    </Link>
                  )}
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => openCancelModal(appt)}
                      className="btn btn-danger btn-sm"
                    >
                      <XCircle size={15} />
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Cancel Appointment"
        footer={
          <>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setCancelModalOpen(false)}
              disabled={cancelling}
            >
              Keep Appointment
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleConfirmCancel}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </>
        }
      >
        {selectedApptToCancel && (
          <div>
            <p style={{ color: 'var(--slate-600)', marginBottom: '16px' }}>
              Are you sure you want to cancel your appointment with{' '}
              <strong>Dr. {selectedApptToCancel.doctor_name}</strong> scheduled on{' '}
              <strong>{selectedApptToCancel.appointment_date}</strong> at{' '}
              <strong>{selectedApptToCancel.appointment_time}</strong>?
            </p>

            <div
              style={{
                padding: '12px',
                backgroundColor: 'var(--warning-bg)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--warning-text)',
                fontSize: '0.875rem',
                marginBottom: '18px',
              }}
            >
              Note: Cancelling will release your reserved slot and revoke Queue Token #{selectedApptToCancel.queue_number}.
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Reason for Cancellation</label>
              <textarea
                className="form-control"
                rows="2"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Please state why you are cancelling..."
                required
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
