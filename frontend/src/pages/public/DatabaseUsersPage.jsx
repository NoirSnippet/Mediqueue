import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, RefreshCw, Users, Shield, Stethoscope, User, Server, Terminal } from 'lucide-react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Alert from '../../components/common/Alert';

export default function DatabaseUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const apiBase = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '';
  const [fetchMethod, setFetchMethod] = useState('/api/users');
  const [responseTimeMs, setResponseTimeMs] = useState(null);

  const fetchUsers = async (endpoint = fetchMethod) => {
    setLoading(true);
    setError('');
    const startTime = performance.now();
    try {
      const fullUrl = endpoint.startsWith('http') ? endpoint : `${apiBase}${endpoint}`;
      const response = await fetch(fullUrl);
      const data = await response.json();

      if (!response.ok) {
        const errorDetail = data.troubleshooting || data.details || data.error || `Server returned HTTP ${response.status}`;
        throw new Error(errorDetail);
      }

      setUsers(Array.isArray(data) ? data : []);
      setResponseTimeMs(Math.round(performance.now() - startTime));
    } catch (err) {
      setError(err.message || 'Could not connect to MySQL backend.');
      setResponseTimeMs(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(fetchMethod);
  }, [fetchMethod]);

  const adminCount = users.filter((u) => u.email?.includes('admin')).length;
  const doctorCount = users.filter((u) => u.name?.startsWith('Dr.') || u.email?.includes('dr.')).length;
  const patientCount = Math.max(0, users.length - adminCount - doctorCount);

  const getRoleBadge = (user) => {
    if (user.email?.includes('admin')) {
      return (
        <span
          style={{
            backgroundColor: '#f3e8ff',
            color: '#6b21a8',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Shield size={12} />
          ADMINISTRATOR
        </span>
      );
    }
    if (user.name?.startsWith('Dr.') || user.email?.includes('dr.')) {
      return (
        <span
          style={{
            backgroundColor: 'var(--primary-100)',
            color: 'var(--primary-800)',
            padding: '3px 10px',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Stethoscope size={12} />
          DOCTOR
        </span>
      );
    }
    return (
      <span
        style={{
          backgroundColor: 'var(--teal-100)',
          color: 'var(--teal-800)',
          padding: '3px 10px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <User size={12} />
        PATIENT
      </span>
    );
  };

  return (
    <div style={{ padding: '40px 0 70px' }}>
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Header */}
        <div style={{ marginBottom: '28px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'var(--teal-100)',
              color: 'var(--teal-800)',
              padding: '4px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.825rem',
              fontWeight: 700,
              marginBottom: '10px',
            }}
          >
            <Database size={15} />
            <span>MySQL 8.0 / MariaDB Relational Connector</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Live MySQL Users Registry</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '1rem', lineHeight: 1.6 }}>
            Demonstrates direct React-to-Express backend communication executing queries against the real MySQL
            database schema (<code style={{ backgroundColor: 'var(--slate-100)', padding: '2px 6px', borderRadius: '4px' }}>mediqueue_db.users</code>).
          </p>
        </div>

        {/* Live Status Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
            border: '1px solid #bbf7d0',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pulse-dot"></span>
            <div>
              <strong style={{ color: '#166534', fontSize: '0.95rem' }}>Database Connection: Active & Healthy</strong>
              <div style={{ color: '#15803d', fontSize: '0.8rem' }}>
                Connected to MySQL Pool (localhost:3306, DB: mediqueue_db)
              </div>
            </div>
          </div>
          {responseTimeMs !== null && (
            <div style={{ fontSize: '0.825rem', color: '#166534', fontWeight: 600 }}>
              Query Latency: <span style={{ color: '#047857', fontWeight: 800 }}>{responseTimeMs} ms</span>
            </div>
          )}
        </div>

        {error && <Alert type="danger" message={error} onClose={() => setError('')} />}

        {/* Telemetry Summary Counters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-700)' }}>{users.length}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Users in DB
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#6b21a8' }}>{adminCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              System Admins
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-600)' }}>{doctorCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Active Doctors
            </div>
          </div>
          <div className="card" style={{ padding: '16px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--teal-700)' }}>{patientCount}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase' }}>
              Registered Patients
            </div>
          </div>
        </div>

        {/* Method Switcher Bar */}
        <div className="card" style={{ marginBottom: '24px', padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--slate-700)', marginBottom: '8px' }}>
                Active Frontend Fetch Endpoint:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${fetchMethod === '/api/users' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFetchMethod('/api/users')}
                >
                  fetch('/api/users') [Standard REST]
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${fetchMethod === '/mysql2/promise' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setFetchMethod('/mysql2/promise')}
                >
                  fetch('/mysql2/promise') [Direct Query Route]
                </button>
              </div>
            </div>

            <button
              onClick={() => fetchUsers(fetchMethod)}
              className="btn btn-secondary btn-sm"
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              <span>Refresh Records</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={20} color="var(--primary-600)" />
              <span>Database Records ({users.length} rows loaded from MySQL)</span>
            </h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}>
              Source: MySQL <code style={{ color: 'var(--primary-700)' }}>users</code> table
            </span>
          </div>

          {loading ? (
            <LoadingSpinner message="Querying users table from MySQL..." />
          ) : users.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--slate-400)' }}>
              <Database size={48} color="var(--slate-300)" style={{ margin: '0 auto 12px' }} />
              <p>No user records found. Run `npm run db:init` in backend to seed database.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: '80px' }}>ID</th>
                    <th>User / Name</th>
                    <th>Email Address</th>
                    <th>Account Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong style={{ color: 'var(--primary-700)', fontFamily: 'var(--font-heading)' }}>#{u.id}</strong>
                      </td>
                      <td>
                        <strong style={{ color: 'var(--slate-900)' }}>{u.name}</strong>
                      </td>
                      <td>
                        <span style={{ color: 'var(--slate-600)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
                          {u.email}
                        </span>
                      </td>
                      <td>{getRoleBadge(u)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
