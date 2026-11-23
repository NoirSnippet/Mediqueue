import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, ShieldCheck, CheckCircle2, Clock, Users, Database, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div style={{ padding: '50px 0 70px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
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
            Academic BCA Project
          </div>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '16px' }}>About MediQueue</h1>
          <p style={{ color: 'var(--slate-600)', fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto' }}>
            A full-stack clinical appointment booking and appointment-linked queue system built with React.js, Express.js, and MySQL.
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
          <p style={{ color: 'var(--slate-600)', lineHeight: 1.7 }}>
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
            <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>1. Sequential Token Generation</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Tokens (Queue #1, #2, #3...) are generated chronologically per doctor and appointment date within an ACID MySQL transaction.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>2. Honest Position Tracking</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
                Rather than giving false live time predictions, the system informs patients how many people are ahead of them and who is currently inside the consultation room.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontWeight: 700, color: 'var(--slate-900)', marginBottom: '6px' }}>3. Real-Time Status Synchronization</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.6 }}>
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
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" />
              <span><strong>Frontend:</strong> React.js, React Router v6, Axios, Lucide Icons, Modular CSS3.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" />
              <span><strong>Backend:</strong> Node.js, Express.js REST API with modular Controllers, Routes, and Middleware.</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" />
              <span><strong>Security:</strong> bcryptjs password hashing, JWT authentication tokens, Role-Based Access Control (RBAC).</span>
            </li>
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--slate-700)' }}>
              <CheckCircle2 size={18} color="var(--success-solid)" />
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
          <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: 'var(--slate-900)' }}>Ready to Test the System?</h3>
          <p style={{ color: 'var(--slate-600)', marginBottom: '20px' }}>
            Log in with one of our pre-configured accounts or register as a new patient to verify end-to-end workflows.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/login" className="btn btn-primary">
              Access Login Console
            </Link>
            <Link to="/doctors" className="btn btn-secondary">
              Browse Doctors Directory
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
