import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Headphones,
  ShieldAlert,
  User,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function ContactPage() {
  const { user, isAuthenticated, role } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Clinic Inquiry',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState(null);

  // Auto-fill logged-in user credentials
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage('Please fill in your name, email, and message.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/contact', formData);
      if (res.data.success) {
        setSubmittedTicket(res.data.ticket);
        setFormData({
          name: isAuthenticated && user?.name ? user.name : '',
          email: isAuthenticated && user?.email ? user.email : '',
          phone: isAuthenticated && user?.phone ? user.phone : '',
          department: 'General Clinic Inquiry',
          message: '',
        });
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Could not send message. Please check your connection or call our desk directly.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'How do I check my live OPD queue token number?',
      a: 'When you book an appointment, a sequential digital queue token (e.g. #1, #2) is automatically assigned. You can track your position anytime by visiting the "Live Queue Status" page in your patient portal.',
    },
    {
      q: 'Can I cancel or reschedule my scheduled consultation?',
      a: 'Yes. You can manage or cancel any upcoming appointment directly from "My Appointments" in your dashboard up to your consultation time with zero cancellation penalty.',
    },
    {
      q: 'What if I arrive at the clinic without booking an appointment online?',
      a: 'Walk-in patients are welcomed at our reception desk. Our receptionist issues instant walk-in queue tokens into available gaps in the doctor’s schedule.',
    },
    {
      q: 'Where are consultation rooms and parking facilities located?',
      a: 'All doctor rooms (Rooms 101 to 105) are located on the Ground Floor, Wing B. Free underground visitor parking and wheelchair ramps are available at the main boulevard entrance.',
    },
  ];

  return (
    <div style={{ padding: '40px 0 72px' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--primary-100)',
              color: 'var(--primary-800)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.85rem',
              fontWeight: 700,
              marginBottom: '12px',
            }}
          >
            <Headphones size={15} />
            <span>Clinic Helpdesk & Patient Support</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '10px', color: 'var(--slate-900)' }}>Contact MediQueue Clinic</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Have a question about OPD consultation hours, doctor schedules, or your queue token? Our clinic team is here to assist you.
          </p>
        </div>

        {/* 3 Contact Cards Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '18px',
            marginBottom: '36px',
          }}
        >
          <div className="card" style={{ padding: '22px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Phone size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--slate-900)' }}>Direct OPD Desk</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '6px' }}>
                Phone assistance & inquiries:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.95rem' }}>+91 98765 43210</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>Toll-free campus line</div>
            </div>
          </div>

          <div className="card" style={{ padding: '22px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--teal-100)',
                color: 'var(--teal-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--slate-900)' }}>Email Inquiries</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '6px' }}>
                Online coordination & queries:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--teal-700)', fontSize: '0.95rem' }}>helpdesk@mediqueue.com</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>Response within 2-4 hours</div>
            </div>
          </div>

          <div className="card" style={{ padding: '22px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--slate-900)' }}>OPD Working Hours</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '6px' }}>
                Specialist doctor shifts:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.925rem' }}>
                Mon – Sat: 08:00 AM – 08:00 PM
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>Sunday: Urgent care only</div>
            </div>
          </div>
        </div>

        {/* Main Section: Interactive Form + Location Info */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: '28px',
            alignItems: 'flex-start',
            marginBottom: '44px',
          }}
        >
          {/* Left: Send us a Message Card */}
          <div className="card" style={{ padding: '28px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '4px', color: 'var(--slate-900)' }}>Send us a Message</h2>
                <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', margin: 0 }}>
                  Fill in your details below and a clinic coordinator will attend to your request.
                </p>
              </div>
              {isAuthenticated && (
                <span
                  style={{
                    backgroundColor: 'var(--primary-50)',
                    color: 'var(--primary-800)',
                    border: '1px solid var(--primary-200)',
                    borderRadius: 'var(--radius-full)',
                    padding: '3px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  }}
                >
                  Profile Connected
                </span>
              )}
            </div>

            {errorMessage && <Alert type="danger" message={errorMessage} onClose={() => setErrorMessage('')} />}

            {submittedTicket ? (
              /* Success Confirmation Card */
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 20px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--success-solid)',
                    color: 'white',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '14px',
                  }}
                >
                  <CheckCircle2 size={30} />
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#166534', marginBottom: '6px' }}>
                  Inquiry Successfully Received!
                </h3>
                <p style={{ fontSize: '0.9rem', color: '#15803d', marginBottom: '20px', maxWidth: '420px', margin: '0 auto 20px' }}>
                  Thank you, <strong>{submittedTicket.name}</strong>. Your support inquiry has been registered in the system.
                </p>

                {/* Ticket Details Strip */}
                <div
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid #dcfce7',
                    padding: '16px',
                    textAlign: 'left',
                    fontSize: '0.875rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--slate-500)' }}>Assigned Ticket Reference:</span>
                    <strong style={{ color: 'var(--primary-700)', fontFamily: 'monospace', fontSize: '0.95rem' }}>
                      {submittedTicket.ticketId}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--slate-500)' }}>Department:</span>
                    <strong>{submittedTicket.department}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--slate-500)' }}>Estimated Response:</span>
                    <span style={{ color: 'var(--teal-700)', fontWeight: 600 }}>{submittedTicket.estimatedResponse}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setSubmittedTicket(null)}
                    className="btn btn-secondary btn-sm"
                  >
                    <RotateCcw size={14} />
                    Send Another Message
                  </button>
                  {isAuthenticated ? (
                    <Link to={role === 'patient' ? '/patient/dashboard' : '/'} className="btn btn-primary btn-sm">
                      Go to Dashboard
                    </Link>
                  ) : (
                    <Link to="/doctors" className="btn btn-primary btn-sm">
                      Browse Doctors
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Contact Form */
              <form onSubmit={handleSubmit}>
                {/* Full Name */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="contact-name">
                    Full Name *
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={17}
                      color="var(--slate-400)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      id="contact-name"
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="e.g. Upendra Singh"
                      style={{ paddingLeft: '38px' }}
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="register-form-grid" style={{ gap: '14px', marginBottom: '16px' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-email">
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail
                        size={17}
                        color="var(--slate-400)"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <input
                        id="contact-email"
                        type="email"
                        name="email"
                        className="form-control"
                        placeholder="name@example.com"
                        style={{ paddingLeft: '38px' }}
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="contact-phone">
                      Phone Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone
                        size={17}
                        color="var(--slate-400)"
                        style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                      />
                      <input
                        id="contact-phone"
                        type="tel"
                        name="phone"
                        className="form-control"
                        placeholder="+91 98765 00000"
                        style={{ paddingLeft: '38px' }}
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Department */}
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label" htmlFor="contact-dept">
                    Department / Assistance Type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <HelpCircle
                      size={17}
                      color="var(--slate-400)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
                    />
                    <select
                      id="contact-dept"
                      name="department"
                      className="form-control"
                      style={{ paddingLeft: '38px' }}
                      value={formData.department}
                      onChange={handleChange}
                    >
                      <option value="General Clinic Inquiry">General Clinic Inquiry</option>
                      <option value="Appointment Rescheduling">Appointment Booking & Rescheduling</option>
                      <option value="Doctor Availability">Doctor Availability & Shift Inquiry</option>
                      <option value="Live Queue Support">OPD Queue Token & Lobby Waiting Support</option>
                      <option value="Feedback & Suggestions">Feedback & Suggestions</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="form-group" style={{ marginBottom: '22px' }}>
                  <label className="form-label" htmlFor="contact-message">
                    Message Content *
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows="4"
                    className="form-control"
                    placeholder="Describe your inquiry, symptoms question, or appointment assistance request in detail..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 700 }}
                  disabled={submitting}
                >
                  <Send size={16} />
                  <span>{submitting ? 'Submitting Inquiry...' : 'Send Message to Helpdesk'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right: Clinic Address & Emergency Help */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <MapPin size={22} color="var(--primary-700)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>Clinic Address & Location</h3>
              </div>
              <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, marginBottom: '14px', fontSize: '0.925rem' }}>
                <strong>MediQueue Central Health Center</strong>
                <br />
                C.M.P. Degree College Medical District
                <br />
                Near Central Metro Wing B, Room 101–105
                <br />
                Prayagraj / Allahabad — 211002
              </p>
              <div
                style={{
                  backgroundColor: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  fontSize: '0.85rem',
                  color: 'var(--slate-600)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Clock size={16} color="var(--slate-400)" />
                <span>Ample basement parking & wheelchair accessibility on site.</span>
              </div>
            </div>

            {/* Emergency OPD Notice */}
            <div
              style={{
                backgroundColor: '#fff1f2',
                border: '1px solid #fecdd3',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#be123c' }}>
                <ShieldAlert size={20} />
                <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Emergency Cases Notice</h4>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#9f1239', lineHeight: 1.6, marginBottom: '12px' }}>
                MediQueue manages scheduled outpatient OPD appointments. In the event of a medical emergency, acute trauma, or sudden severe symptoms, please dial <strong>112</strong> or visit the 24-hour Emergency Room immediately.
              </p>
              <div style={{ fontWeight: 700, color: '#be123c', fontSize: '0.9rem' }}>
                Emergency Desk: +91 90000 00001
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Quick Helpdesk FAQ */}
        <div className="card" style={{ padding: '28px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
            <HelpCircle size={20} color="var(--primary-600)" />
            <h3 style={{ fontSize: '1.25rem', color: 'var(--slate-900)' }}>Frequently Asked Questions</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((faq, idx) => {
              const isOpen = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--slate-200)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: isOpen ? 'var(--slate-50)' : 'white',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: 600,
                      fontSize: '0.925rem',
                      color: 'var(--slate-800)',
                      gap: '12px',
                    }}
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp size={18} color="var(--primary-600)" /> : <ChevronDown size={18} color="var(--slate-400)" />}
                  </button>
                  {isOpen && (
                    <div style={{ padding: '14px 18px', fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6, borderTop: '1px solid var(--slate-200)', backgroundColor: '#fafafa' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
