import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Calendar, Clock, Stethoscope, MapPin, CheckCircle2, AlertCircle, Info, ChevronRight } from 'lucide-react';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DoctorAvatar from '../../components/common/DoctorAvatar';

export default function BookAppointmentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState(searchParams.get('doctorId') || '');
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  // default date to today in local timezone
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [availability, setAvailability] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState('General Consultation');

  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Confirmation Modal state
  const [bookingResult, setBookingResult] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Load all doctors
  useEffect(() => {
    async function loadDoctors() {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors);
          if (searchParams.get('doctorId')) {
            const found = res.data.doctors.find((d) => String(d.id) === searchParams.get('doctorId'));
            if (found) setSelectedDoctor(found);
          }
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    }
    loadDoctors();
  }, [searchParams]);

  // When doctor ID changes, update selectedDoctor object and clear chosen slot
  const handleDoctorChange = (id) => {
    setSelectedDoctorId(id);
    setSelectedSlot(null);
    const found = doctors.find((d) => String(d.id) === String(id));
    setSelectedDoctor(found || null);
  };

  // Fetch slots whenever doctor ID or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) {
      setAvailability(null);
      return;
    }

    async function fetchSlots() {
      setLoadingSlots(true);
      setErrorMessage('');
      setSelectedSlot(null);
      try {
        const res = await api.get(`/doctors/${selectedDoctorId}/availability`, {
          params: { date: selectedDate },
        });
        if (res.data.success) {
          setAvailability(res.data);
        }
      } catch (err) {
        setErrorMessage(err.response?.data?.message || 'Failed to load doctor slots.');
      } finally {
        setLoadingSlots(false);
      }
    }

    fetchSlots();
  }, [selectedDoctorId, selectedDate]);

  // Handle Booking submission
  const handleBookSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedDoctorId) {
      setErrorMessage('Please select a doctor.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Please select an appointment date.');
      return;
    }

    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot.');
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        doctor_id: parseInt(selectedDoctorId, 10),
        appointment_date: selectedDate,
        appointment_time: selectedSlot.time,
        reason_for_visit: reason,
      };

      const res = await api.post('/appointments', payload);
      if (res.data.success) {
        setBookingResult(res.data.appointment);
        setShowConfirmModal(true);
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Failed to book appointment. The slot may have just been taken.'
      );
      // Refresh slots in case slot was taken
      try {
        const res = await api.get(`/doctors/${selectedDoctorId}/availability`, {
          params: { date: selectedDate },
        });
        if (res.data.success) setAvailability(res.data);
      } catch (_) {}
    } finally {
      setBookingLoading(false);
    }
  };

  if (loadingDoctors) {
    return <LoadingSpinner message="Loading booking engine..." />;
  }

  return (
    <div style={{ maxWidth: '840px', margin: '0 auto' }}>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Book Doctor Appointment</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            Select your specialist, choose an available date and verified time slot, and receive an instant queue token.
          </p>
        </div>
      </div>

      {errorMessage && <Alert type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />}

      <form onSubmit={handleBookSubmit}>
        {/* Step 1: Doctor Selection */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Stethoscope size={20} color="var(--primary-600)" />
              Step 1: Choose Doctor
            </h3>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label">Specialist Doctor *</label>
            <select
              className="form-control"
              value={selectedDoctorId}
              onChange={(e) => handleDoctorChange(e.target.value)}
              required
            >
              <option value="">-- Select Doctor --</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.doctor_name} — {doc.specialization} ({doc.qualification})
                </option>
              ))}
            </select>
          </div>

          {selectedDoctor && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '14px 18px',
                backgroundColor: 'var(--primary-50)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--primary-100)',
              }}
            >
              <DoctorAvatar
                doctorId={selectedDoctor.id}
                specialization={selectedDoctor.specialization}
                name={selectedDoctor.doctor_name}
                size={52}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--slate-900)' }}>
                  {selectedDoctor.doctor_name}
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 600, marginTop: '1px' }}>
                  {selectedDoctor.specialization} • {selectedDoctor.room_number}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--slate-600)', marginTop: '2px' }}>
                  Fee: <strong>₹{parseFloat(selectedDoctor.consultation_fee).toFixed(0)}</strong> • {selectedDoctor.clinic_name}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Date & Available Slots Picker */}
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Calendar size={20} color="var(--primary-600)" />
              Step 2: Select Date & Available Time Slot
            </h3>
          </div>

          <div className="form-group" style={{ maxWidth: '280px' }}>
            <label className="form-label">Consultation Date *</label>
            <input
              type="date"
              className="form-control"
              min={todayStr}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
            />
          </div>

          {/* Slot Grid Container */}
          <div style={{ marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>
                Available Consultation Slots
              </label>
              {availability && availability.isWorkingDay && (
                <span style={{ fontSize: '0.825rem', color: 'var(--teal-700)', fontWeight: 600 }}>
                  {availability.availableSlotsCount} of {availability.totalSlotsCount} slots available
                </span>
              )}
            </div>

            {loadingSlots ? (
              <LoadingSpinner message="Checking doctor schedule and existing bookings..." />
            ) : !selectedDoctorId ? (
              <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem' }}>
                Please select a doctor above to check available slots.
              </p>
            ) : availability && !availability.isWorkingDay ? (
              <div
                style={{
                  padding: '16px',
                  backgroundColor: 'var(--warning-bg)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--warning-border)',
                  color: 'var(--warning-text)',
                  fontSize: '0.9rem',
                }}
              >
                {availability.message || 'No slots available on this date.'}
              </div>
            ) : availability && availability.slots.length > 0 ? (
              <div>
                <div className="slot-grid">
                  {availability.slots.map((slot) => {
                    const isSelected = selectedSlot?.time === slot.time;
                    let btnClass = 'slot-btn';
                    if (isSelected) btnClass += ' selected';
                    else if (slot.isBooked) btnClass += ' booked';
                    else if (slot.isPast) btnClass += ' past';

                    return (
                      <button
                        key={slot.time}
                        type="button"
                        className={btnClass}
                        disabled={!slot.isAvailable}
                        onClick={() => setSelectedSlot(slot)}
                        title={slot.reason}
                      >
                        {slot.displayTime}
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div
                  style={{
                    display: 'flex',
                    gap: '20px',
                    fontSize: '0.8rem',
                    color: 'var(--slate-500)',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--slate-100)',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', border: '1px solid var(--slate-300)', background: 'white' }} />
                    Available
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--primary-600)' }} />
                    Selected
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--slate-200)', textDecoration: 'line-through' }} />
                    Booked
                  </span>
                </div>
              </div>
            ) : (
              <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
                No slots configured for this date.
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Reason for Visit */}
        <div className="card" style={{ marginBottom: '28px' }}>
          <div className="card-header">
            <h3 className="card-title">
              <Info size={20} color="var(--primary-600)" />
              Step 3: Reason for Consultation
            </h3>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Symptoms / Reason for Visit</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="e.g. Chest discomfort, high blood pressure follow-up, general health checkup..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px' }}>
          <Link to="/patient/dashboard" className="btn btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={bookingLoading || !selectedSlot}
          >
            {bookingLoading ? 'Securing Slot & Queue Token...' : 'Confirm Appointment Booking'}
          </button>
        </div>
      </form>

      {/* Booking Confirmation Popover Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          navigate('/patient/appointments');
        }}
        title="Appointment Confirmed!"
      >
        {bookingResult && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--success-bg)',
                color: 'var(--success-solid)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '1.4rem', color: 'var(--slate-900)', marginBottom: '8px' }}>
              Your Slot is Verified & Booked!
            </h3>
            <p style={{ color: 'var(--slate-600)', fontSize: '0.925rem', marginBottom: '24px' }}>
              Your appointment has been registered in the database. A sequential queue token has been issued for your consultation.
            </p>

            {/* Big Token Display */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--primary-700), var(--teal-600))',
                color: 'white',
                padding: '20px',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '20px',
              }}
            >
              <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                Issued Queue Number
              </div>
              <div style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.1, margin: '6px 0' }}>
                #{bookingResult.queue_number}
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                Status: {bookingResult.queue_status}
              </div>
            </div>

            {/* Details Box */}
            <div
              style={{
                textAlign: 'left',
                backgroundColor: 'var(--slate-50)',
                padding: '16px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--slate-200)',
                fontSize: '0.9rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Reference Code:</span>
                <strong>{bookingResult.appointment_reference}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Doctor:</span>
                <strong>Dr. {bookingResult.doctor_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Date & Slot:</span>
                <strong>{bookingResult.appointment_date} at {bookingResult.appointment_time}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--slate-500)' }}>Clinic:</span>
                <span>{bookingResult.clinic_name}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Link to="/patient/appointments" className="btn btn-secondary">
                View My Appointments
              </Link>
              <Link to="/patient/queue" className="btn btn-primary">
                Open Live Queue Tracker
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
