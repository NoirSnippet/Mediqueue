import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Lock, Calendar, Heart, Shield, Home, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Alert from '../../components/common/Alert';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: 'other',
    blood_group: 'O+',
    emergency_contact: '',
    address: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};

    if (!formData.name.trim()) {
      errs.name = 'Full name is required.';
    } else if (formData.name.trim().length < 2) {
      errs.name = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address (e.g. name@example.com).';
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required.';
    } else if (phoneDigits.length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number.';
    }

    if (!formData.password) {
      errs.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required.';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match.';
    }

    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Instantly clear field-level error when user starts typing correction
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    // Dynamic password match checking
    if (name === 'confirmPassword' && formData.password && value === formData.password) {
      setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please resolve the highlighted field errors below.');
      return;
    }

    setFieldErrors({});
    setLoading(true);

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        password: formData.password,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender,
        blood_group: formData.blood_group,
        emergency_contact: formData.emergency_contact || null,
        address: formData.address || null,
      });

      navigate('/patient/dashboard');
    } catch (err) {
      const serverMsg = err.response?.data?.message || err.message || 'Registration failed.';
      setError(serverMsg);

      // Pinpoint error location right near the affected field
      const lower = serverMsg.toLowerCase();
      if (lower.includes('email') || lower.includes('already exists')) {
        setFieldErrors((prev) => ({
          ...prev,
          email: 'This email is already registered. Please sign in or use another email.',
        }));
      } else if (lower.includes('phone') || lower.includes('mobile')) {
        setFieldErrors((prev) => ({
          ...prev,
          phone: serverMsg,
        }));
      } else if (lower.includes('password')) {
        setFieldErrors((prev) => ({
          ...prev,
          password: serverMsg,
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="container" style={{ maxWidth: '640px' }}>
        <div className="card register-card">
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '6px' }}>Patient Registration</h2>
            <p style={{ color: 'var(--slate-500)', fontSize: '0.925rem' }}>
              Create your MediQueue account to book doctor slots and track queue status.
            </p>
          </div>

          {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} noValidate>
            <div className="register-form-grid">
              {/* Full Name */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">
                  Full Name <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={18} color={fieldErrors.name ? '#ef4444' : 'var(--slate-400)'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    name="name"
                    className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
                    placeholder="Enter your full name"
                    style={{ paddingLeft: '38px' }}
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.name && (
                  <div className="field-error-message">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">
                  Email Address <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color={fieldErrors.email ? '#ef4444' : 'var(--slate-400)'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    name="email"
                    className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
                    placeholder="name@example.com"
                    style={{ paddingLeft: '38px' }}
                    value={formData.email}
                    onChange={handleChange}
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

              {/* Phone */}
              <div className="form-group">
                <label className="form-label">
                  Phone Number <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} color={fieldErrors.phone ? '#ef4444' : 'var(--slate-400)'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="tel"
                    name="phone"
                    className={`form-control ${fieldErrors.phone ? 'is-invalid' : ''}`}
                    placeholder="+91-9888800000"
                    style={{ paddingLeft: '38px' }}
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                {fieldErrors.phone && (
                  <div className="field-error-message">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.phone}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="form-group">
                <label className="form-label">
                  Password <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color={fieldErrors.password ? '#ef4444' : 'var(--slate-400)'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
                    placeholder="Min 6 characters"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    value={formData.password}
                    onChange={handleChange}
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

              {/* Confirm Password */}
              <div className="form-group">
                <label className="form-label">
                  Confirm Password <span className="required-star">*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color={fieldErrors.confirmPassword ? '#ef4444' : 'var(--slate-400)'} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    className={`form-control ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                    placeholder="Repeat password"
                    style={{ paddingLeft: '38px', paddingRight: '40px' }}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <div className="field-error-message">
                    <AlertCircle size={14} />
                    <span>{fieldErrors.confirmPassword}</span>
                  </div>
                )}
              </div>

              {/* Date of Birth */}
              <div className="form-group">
                <label className="form-label">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  className="form-control"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div className="form-group">
                <label className="form-label">Gender</label>
                <select name="gender" className="form-control" value={formData.gender} onChange={handleChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select name="blood_group" className="form-control" value={formData.blood_group} onChange={handleChange}>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="Not Specified">Not Specified</option>
                </select>
              </div>

              {/* Emergency Contact */}
              <div className="form-group">
                <label className="form-label">Emergency Contact Phone</label>
                <input
                  type="tel"
                  name="emergency_contact"
                  className="form-control"
                  placeholder="Guardian / Emergency contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Residential Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  placeholder="Street address, city"
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Complete Registration'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--slate-600)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
