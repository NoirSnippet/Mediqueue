import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Activity, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errs = {};
    if (!email.trim()) {
      errs.email = 'Please enter your registered email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Please enter your account password.';
    }

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      const loggedInUser = await login(email.trim(), password);
      if (loggedInUser.role === 'patient') navigate('/patient/dashboard');
      else if (loggedInUser.role === 'doctor') navigate('/doctor/dashboard');
      else if (loggedInUser.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      setError(serverMsg);

      if (serverMsg.toLowerCase().includes('password') || serverMsg.toLowerCase().includes('credential')) {
        setFieldErrors({
          email: 'Check this email address',
          password: 'Or check this password',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Quick email selector helper for BCA examiner
  const selectAccount = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('');
    setError('');
    setFieldErrors({});
  };

  return (
    <div className="auth-wrapper">
      <div className="container" style={{ maxWidth: '480px' }}>
        <div className="card auth-card">
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

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label">
                Email Address <span className="required-star">*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color={fieldErrors.email ? '#ef4444' : 'var(--slate-400)'}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                  placeholder="name@example.com"
                  style={{ paddingLeft: '38px' }}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  required
                />
              </div>
              {fieldErrors.email && (
                <div className="field-error-message">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.email}</span>
                </div>
              )}
            </div>

            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  Password <span className="required-star">*</span>
                </label>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color={fieldErrors.password ? '#ef4444' : 'var(--slate-400)'}
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                  placeholder="Enter your password"
                  style={{ paddingLeft: '38px', paddingRight: '40px' }}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="field-error-message">
                  <AlertCircle size={14} />
                  <span>{fieldErrors.password}</span>
                </div>
              )}
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
              <span>Project Evaluator — Select Account Email</span>
            </div>
            <div className="demo-login-grid">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectAccount('admin@mediqueue.com')}
              >
                Admin
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectAccount('dr.sarah@mediqueue.com')}
              >
                Dr. Sarah (Cardio)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectAccount('dr.rajesh@mediqueue.com')}
              >
                Dr. Rajesh (Medicine)
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => selectAccount('john.doe@example.com')}
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
