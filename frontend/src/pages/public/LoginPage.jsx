import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    try {
      const loggedInUser = await login(email, password);
      if (loggedInUser.role === 'patient') navigate('/patient/dashboard');
      else if (loggedInUser.role === 'doctor') navigate('/doctor/dashboard');
      else if (loggedInUser.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Quick autofill helper for BCA examiner
  const fillCredentials = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div style={{ padding: '60px 0 80px', display: 'flex', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card" style={{ padding: '36px', boxShadow: 'var(--shadow-xl)' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--primary-600), var(--teal-600))',
                color: 'white',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
              }}
            >
              <Activity size={28} />
            </div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '6px' }}>Sign In to MediQueue</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.9rem' }}>
              Access patient bookings, doctor queues, or administrator controls.
            </p>
          </div>

          {isExpired && (
            <Alert type="warning" message="Your session has expired. Please log in again to continue." />
          )}

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  className="form-control"
                  placeholder="name@example.com"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
                <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>Demo: password123</span>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="var(--slate-400)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter your password"
                  style={{ paddingLeft: '38px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Quick Demo Logins Box for Viva / College Evaluation */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--slate-200)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase', marginBottom: '12px' }}>
              <ShieldCheck size={16} color="var(--primary-600)" />
              <span>Project Evaluator Demo Quick Fill</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillCredentials('admin@mediqueue.com', 'password123')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillCredentials('dr.sarah@mediqueue.com', 'password123')}
              >
                Dr. Sarah (Cardio)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillCredentials('dr.rajesh@mediqueue.com', 'password123')}
              >
                Dr. Rajesh (Medicine)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => fillCredentials('john.doe@example.com', 'password123')}
              >
                John Doe (Patient)
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            New patient?{' '}
            <Link to="/register" style={{ fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
