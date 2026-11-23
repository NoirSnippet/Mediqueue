import React, { useState } from 'react';
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
} from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'General Inquiry',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'General Inquiry',
        message: '',
      });
    }, 600);
  };

  return (
    <div style={{ padding: '48px 0 72px' }}>
      <div className="container" style={{ maxWidth: '1080px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '42px' }}>
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
            <Headphones size={14} />
            <span>Clinic Helpdesk & Support</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px', color: 'var(--slate-900)' }}>Contact MediQueue Clinic</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.05rem', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Have a question about OPD consultation hours, doctor schedules, or your queue token? Our clinic helpdesk is here to help.
          </p>
        </div>

        {/* 3 Contact Cards Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '20px',
            marginBottom: '40px',
          }}
        >
          <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-100)',
                color: 'var(--primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Phone size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--slate-900)' }}>Appointments & Phone</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '8px' }}>
                Direct OPD registration desk:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--primary-700)', fontSize: '0.95rem' }}>+91 98765 43210</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>Toll-free within campus</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'var(--teal-100)',
                color: 'var(--teal-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Mail size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--slate-900)' }}>Email Inquiries</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '8px' }}>
                Online coordination & queries:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--teal-700)', fontSize: '0.95rem' }}>helpdesk@mediqueue.com</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>Response within 24 hours</div>
            </div>
          </div>

          <div className="card" style={{ padding: '24px', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
            <div
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#fef3c7',
                color: '#b45309',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Clock size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '4px', color: 'var(--slate-900)' }}>OPD Timings</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', marginBottom: '8px' }}>
                Regular consultation hours:
              </p>
              <div style={{ fontWeight: 700, color: 'var(--slate-800)', fontSize: '0.925rem' }}>
                Mon – Sat: 08:00 AM – 08:00 PM
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '2px' }}>Sunday: Urgent cases only</div>
            </div>
          </div>
        </div>

        {/* Form and Location Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: '30px',
            alignItems: 'flex-start',
          }}
        >
          {/* Left: Interactive Inquiry Form */}
          <div className="card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px', color: 'var(--slate-900)' }}>Send us a Message</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-500)', marginBottom: '22px' }}>
              Fill in your details and message. A clinic reception coordinator will attend to your request.
            </p>

            {submitted && (
              <div style={{ marginBottom: '20px' }}>
                <Alert
                  type="success"
                  message="Thank you for reaching out! Your inquiry has been submitted. Our clinic team will get in touch shortly."
                  onClose={() => setSubmitted(false)}
                />
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="contact-name">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="register-form-grid" style={{ gap: '14px', marginBottom: '16px' }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="contact-email">
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    className="form-input"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="contact-phone">
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    className="form-input"
                    placeholder="+91 98765 00000"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label className="form-label" htmlFor="contact-dept">
                  Department / Reason
                </label>
                <select
                  id="contact-dept"
                  name="department"
                  className="form-input"
                  value={formData.department}
                  onChange={handleChange}
                >
                  <option value="General Inquiry">General Clinic Inquiry</option>
                  <option value="Appointment Rescheduling">Appointment Rescheduling / Assistance</option>
                  <option value="Doctor Availability">Doctor Availability Question</option>
                  <option value="Live Queue Support">Queue Token & Waiting Room Support</option>
                  <option value="Feedback">Feedback & Suggestions</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '22px' }}>
                <label className="form-label" htmlFor="contact-message">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows="4"
                  className="form-input"
                  placeholder="How can we assist you with your appointment or consultation?"
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                disabled={submitting}
              >
                <Send size={16} />
                <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
              </button>
            </form>
          </div>

          {/* Right: Clinic Address & Emergency Help */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <MapPin size={22} color="var(--primary-700)" />
                <h3 style={{ fontSize: '1.2rem', color: 'var(--slate-900)' }}>Clinic Address & Location</h3>
              </div>
              <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, marginBottom: '14px', fontSize: '0.925rem' }}>
                <strong>MediQueue Central Health Center</strong>
                <br />
                104 Healthcare Boulevard, Medical District
                <br />
                Near Central Metro Station, Wing B
                <br />
                City — 110001
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
                <span>Ample basement parking & wheelchair accessibility available.</span>
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
                MediQueue is an outpatient OPD appointment management system. In the event of a medical emergency, acute trauma, or sudden severe symptoms, please dial <strong>112</strong> or visit the nearest 24-hour Emergency Room immediately.
              </p>
              <div style={{ fontWeight: 700, color: '#be123c', fontSize: '0.9rem' }}>
                Emergency Desk: +91 90000 00001
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
