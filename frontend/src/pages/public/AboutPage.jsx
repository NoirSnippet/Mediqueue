import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Users,
  Database,
  Layers,
  LogIn,
  UserPlus,
  Search,
  LayoutDashboard,
  Calendar,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';

export default function AboutPage() {
  const { user, isAuthenticated, role } = useAuth();

  return (
    <div style={{ padding: '40px 0 72px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
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
              marginBottom: '14px',
            }}
          >
            <GraduationCap size={15} />
            <span>Academic BCA Project • C.M.P. Degree College</span>
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '14px', color: 'var(--slate-900)' }}>About MediQueue</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.1rem', maxWidth: '720px', margin: '0 auto', lineHeight: 1.6 }}>
            A full-stack clinical appointment booking and appointment-linked queue management platform built with React.js, Node.js, Express, and MySQL.
          </p>
        </div>

        {/* Student & College Project Attribution Card */}
        <div
          className="card"
          style={{
            marginBottom: '30px',
            background: 'linear-gradient(135deg, #f0f9ff, #f8fafc)',
            border: '1px solid var(--primary-200)',
            padding: '24px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-600)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <GraduationCap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)', margin: 0 }}>
                Project Candidate: Upendra Singh
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--primary-800)', fontWeight: 600 }}>
                Bachelor of Computer Applications (BCA) Final Year Project
              </div>
            </div>
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
            Developed under the Department of Computer Applications, <strong>C.M.P. Degree College</strong> (A Constituent Post-Graduate College of University of Allahabad). Designed to solve physical OPD waiting room congestion and uncoordinated doctor consultations through automated sequential queue algorithms.
          </p>
        </div>

        {/* Problem Statement Card */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 className="card-title" style={{ marginBottom: '14px' }}>
            <Activity size={22} color="var(--primary-600)" />
            The Healthcare Problem & Academic Motivation
          </h3>
          <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, marginBottom: '14px' }}>
            In traditional hospital Outpatient Departments (OPD) and clinics, patients often suffer from excessive waiting times,
            unpredictable queue progression, and physical waiting room congestion. Moreover, manual appointment slips frequently lead to
            untracked cancellations and double-booked consultation time slots.
          </p>
          <p style={{ color: 'var(--slate-600)', lineHeight: 1.7, margin: 0 }}>
            <strong>MediQueue</strong> addresses this problem by integrating a verified appointment booking mechanism directly with
            an appointment-linked sequential queue engine. When a patient books a slot, the system generates a unique reference code
            and assigns an immutable sequential queue token for that doctor and date.
          </p>
        </div>

        {/* How Queue Engine Operates */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 className="card-title" style={{ marginBottom: '16px' }}>
            <Clock size={22} color="var(--teal-600)" />
            How The Queue Engine Operates
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>1. Sequential Token Generation</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
                Tokens (Queue #1, #2, #3...) are generated chronologically per doctor and appointment date within an ACID MySQL transaction.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>2. Honest Position Tracking</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
                Rather than giving false live time predictions, the system informs patients how many people are ahead of them and who is currently inside the consultation room.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>3. Real-Time Status Synchronization</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6, margin: 0 }}>
                When the doctor clicks "Call Next Patient" in their live cockpit, the serving patient shifts from Waiting to In Consultation, and upon wrap-up to Completed.
              </p>
            </div>
          </div>
        </div>

        {/* Architecture & Tech Stack */}
        <div className="card" style={{ marginBottom: '30px' }}>
          <h3 className="card-title" style={{ marginBottom: '14px' }}>
            <Layers size={22} color="var(--primary-700)" />
            Technology Architecture
          </h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" style={{ flexShrink: 0 }} />
              <span><strong>Frontend:</strong> React.js, React Router v6, Axios, Lucide Icons, Modular CSS3.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" style={{ flexShrink: 0 }} />
              <span><strong>Backend:</strong> Node.js, Express.js REST API with modular Controllers, Routes, and Middleware.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" style={{ flexShrink: 0 }} />
              <span><strong>Security:</strong> bcryptjs password hashing, JWT authentication tokens, Role-Based Access Control (RBAC).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" style={{ flexShrink: 0 }} />
              <span><strong>Database:</strong> MySQL relational database with foreign key cascades, unique constraints, and transaction locking.</span>
            </li>
          </ul>
        </div>

        {/* Evaluation CTA */}
        <div
          style={{
            textAlign: 'center',
            backgroundColor: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            borderRadius: 'var(--radius-xl)',
            padding: '36px 20px',
          }}
        >
          <h3 style={{ fontSize: '1.45rem', marginBottom: '8px', color: 'var(--slate-900)' }}>
            Ready to Test the System?
          </h3>

          {isAuthenticated ? (
            <div>
              <p style={{ color: 'var(--slate-600)', marginBottom: '20px', fontSize: '0.95rem' }}>
                You are currently logged in as <strong>{user?.name}</strong> ({role.toUpperCase()}). Explore your portal tools below:
              </p>

              <div className="about-cta-actions">
                {role === 'patient' && (
                  <>
                    <Link to="/patient/dashboard" className="btn btn-primary">
                      <LayoutDashboard size={16} />
                      Patient Dashboard
                    </Link>
                    <Link to="/patient/book" className="btn btn-teal">
                      <Calendar size={16} />
                      Book Doctor Slot
                    </Link>
                    <Link to="/patient/queue" className="btn btn-secondary">
                      <Clock size={16} />
                      Live Queue Status
                    </Link>
                  </>
                )}

                {role === 'doctor' && (
                  <>
                    <Link to="/doctor/dashboard" className="btn btn-primary">
                      <LayoutDashboard size={16} />
                      Doctor Dashboard
                    </Link>
                    <Link to="/doctor/queue" className="btn btn-teal">
                      <Activity size={16} />
                      Live Queue Cockpit
                    </Link>
                    <Link to="/doctor/schedule" className="btn btn-secondary">
                      <Calendar size={16} />
                      Manage Schedule
                    </Link>
                  </>
                )}

                {role === 'admin' && (
                  <>
                    <Link to="/admin/dashboard" className="btn btn-primary">
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                    <Link to="/admin/doctors" className="btn btn-secondary">
                      <Users size={16} />
                      Manage Doctors
                    </Link>
                    <Link to="/admin/appointments" className="btn btn-secondary">
                      <Calendar size={16} />
                      All Appointments
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: 'var(--slate-600)', marginBottom: '22px', fontSize: '0.95rem', maxWidth: '580px', margin: '0 auto 22px' }}>
                Sign in with one of our pre-configured evaluation accounts (Admin, Doctor, Patient) or create a new patient account to test end-to-end appointment booking and live queue transitions.
              </p>

              <div className="about-cta-actions">
                <Link to="/login" className="btn btn-primary">
                  <LogIn size={16} />
                  Access Login Console
                </Link>
                <Link to="/register" className="btn btn-teal">
                  <UserPlus size={16} />
                  Register Patient Account
                </Link>
                <Link to="/doctors" className="btn btn-secondary">
                  <Search size={16} />
                  Browse Doctors Directory
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
