import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Calendar,
  Clock,
  ArrowRight,
  MapPin,
  Star,
  Users,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import DoctorAvatar from '../../components/common/DoctorAvatar';
import Badge from '../../components/common/Badge';

// Realistic, modest beginner ratings for demonstration
const DOCTOR_RATINGS = {
  1: { rating: '4.1', reviews: 18 },
  2: { rating: '4.0', reviews: 12 },
  3: { rating: '4.2', reviews: 15 },
  4: { rating: '4.0', reviews: 9 },
  5: { rating: '4.1', reviews: 14 },
};

export default function HomePage() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    async function fetchTopDoctors() {
      try {
        const res = await api.get('/doctors');
        if (res.data.success) {
          setDoctors(res.data.doctors.slice(0, 3));
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    }
    fetchTopDoctors();
  }, []);

  return (
    <div>
      {/* hero section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-grid">
            {/* Left Column: Clear Text & Actions */}
            <div>
              <div className="hero-eyebrow">
                <span>Clinic Doctor Appointment & Queue System</span>
              </div>

              <h1 className="hero-heading">
                Doctor Appointments <br />
                <span className="gradient-text">Made Simple & Organized.</span>
              </h1>

              <p className="hero-description">
                Browse clinic doctors, book available consultation time slots, and track your daily sequential
                queue token before visiting the outpatient clinic.
              </p>

              {/* Simple Clean Buttons */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                <Link to="/doctors" className="btn btn-primary btn-lg">
                  <Calendar size={17} />
                  Find Doctors & Book
                </Link>
                <Link to="/patient/queue" className="btn btn-secondary btn-lg">
                  <Clock size={17} />
                  Check Live Queue
                </Link>
              </div>
            </div>

            {/* Right Column: Clean, Uncluttered Hero Image */}
            <div className="hero-visual-wrapper">
              <img
                src="/hero-doctor.jpg"
                alt="Clinic Doctor Consultation"
                className="hero-main-img"
              />
            </div>
          </div>
        </div>

        {/* Scroll Cue: Informs user more details are below */}
        <a href="#how-it-works" className="hero-scroll-cue" aria-label="Scroll to learn how it works">
          <span>Explore</span>
          <ChevronDown size={16} />
        </a>
      </section>

      {/* how it works */}
      <section id="how-it-works" style={{ padding: '60px 0', backgroundColor: 'transparent', borderBottom: '1px solid var(--slate-200)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '8px' }}>How The System Works</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.975rem' }}>
              Three straightforward steps to consult a clinic doctor without waiting room confusion.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            <div className="step-card">
              <div className="step-number">1</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Select Doctor</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                Choose a doctor by specialization such as General Medicine, Pediatrics, or Cardiology.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Pick Time Slot</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                Choose an open appointment time slot from the doctor's weekly consultation schedule.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Get Queue Token</h3>
              <p style={{ color: 'var(--slate-600)', fontSize: '0.875rem', lineHeight: 1.55 }}>
                Receive a confirmed booking reference and daily token number to track your turn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* available doctors */}
      {doctors.length > 0 && (
        <section style={{ padding: '54px 0 64px', backgroundColor: 'transparent' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', marginBottom: '4px' }}>Available Doctors</h2>
                <p style={{ color: 'var(--slate-500)', fontSize: '0.925rem' }}>
                  Consultation fees kept low and affordable for general clinic care.
                </p>
              </div>
              <Link to="/doctors" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>View All Doctors</span>
                <ArrowRight size={15} />
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '22px' }}>
              {doctors.map((doc) => {
                const ratingInfo = DOCTOR_RATINGS[doc.id] || { rating: '4.0', reviews: 10 };
                return (
                  <div key={doc.id} className="doctor-card">
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                      <DoctorAvatar
                        doctorId={doc.id}
                        specialization={doc.specialization}
                        name={doc.doctor_name}
                        size={60}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <h3 style={{ fontSize: '1.1rem', color: 'var(--slate-900)' }}>{doc.doctor_name}</h3>
                          <Badge status={doc.availability_status} />
                        </div>
                        <div style={{ color: 'var(--primary-700)', fontWeight: 600, fontSize: '0.85rem' }}>
                          {doc.specialization}
                        </div>
                        <div style={{ color: 'var(--slate-500)', fontSize: '0.78rem' }}>{doc.qualification}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.825rem', color: 'var(--slate-600)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <MapPin size={13} color="var(--slate-400)" />
                        <span>{doc.clinic_name} • {doc.room_number}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={13} color="#f59e0b" fill="#f59e0b" />
                        <span>{ratingInfo.rating} ({ratingInfo.reviews} reviews)</span>
                      </div>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '18px', flex: 1 }}>
                      {doc.bio}
                    </p>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: '14px',
                        borderTop: '1px solid var(--slate-100)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                          Consultation Fee
                        </div>
                        <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                          ₹{parseFloat(doc.consultation_fee).toFixed(0)}
                        </div>
                      </div>

                      <Link
                        to={`/patient/book?doctorId=${doc.id}`}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '7px 16px' }}
                      >
                        <Calendar size={14} />
                        Book Slot
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
