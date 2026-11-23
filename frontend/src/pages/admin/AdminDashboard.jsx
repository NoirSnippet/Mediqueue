import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import {
  Users,
  Stethoscope,
  Calendar,
  Clock,
  Activity,
  PlusCircle,
  Settings,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.stats);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating clinical metrics & queue data..." />;
  }

  return (
    <div>
      <div className="dashboard-page-header">
        <div>
          <h1 style={{ fontSize: '1.85rem', marginBottom: '4px' }}>Administrator Console</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem' }}>
            System-wide overview of patient registrations, medical specialists, appointment volumes, and active queues.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/doctors" className="btn btn-primary btn-sm">
            <PlusCircle size={16} />
            Manage Doctors
          </Link>
          <Link to="/admin/clinic" className="btn btn-secondary btn-sm">
            <Settings size={16} />
            Clinic Setup
          </Link>
        </div>
      </div>

      {/* Summary KPI Metrics */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '18px',
          marginBottom: '32px',
        }}
      >
        <StatCard title="Registered Patients" value={stats?.totalPatients || 0} icon={Users} color="blue" />
        <StatCard title="Active Doctors" value={stats?.totalDoctors || 0} icon={Stethoscope} color="teal" />
        <StatCard title="Total Appointments" value={stats?.totalAppointments || 0} icon={Calendar} color="green" />
        <StatCard title="Today's Appointments" value={stats?.todayAppointments || 0} icon={Clock} color="amber" />
        <StatCard title="Today's Waiting Queue" value={stats?.waitingAppointments || 0} icon={Activity} color="amber" />
      </div>

      {/* Quick Administration Actions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                <Stethoscope size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Doctor Profiles & Credentials</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Onboard new medical specialists, edit consultation fees, assign room cabins, or deactivate accounts.
            </p>
          </div>
          <Link to="/admin/doctors" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', justifyContent: 'space-between' }}>
            <span>Manage Doctors</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--teal-100)', color: 'var(--teal-700)' }}>
                <Users size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Patient Directory</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Search registered patients, review contact records, and manage patient account statuses.
            </p>
          </div>
          <Link to="/admin/patients" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', justifyContent: 'space-between' }}>
            <span>Manage Patients</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <div style={{ padding: '8px', borderRadius: 'var(--radius-md)', backgroundColor: '#fef3c7', color: '#b45309' }}>
                <Calendar size={20} />
              </div>
              <h3 style={{ fontSize: '1.15rem' }}>Clinic Appointments Log</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5 }}>
              Filter complete appointment records across all clinic doctors, monitor queue positions and statuses.
            </p>
          </div>
          <Link to="/admin/appointments" className="btn btn-secondary btn-sm" style={{ marginTop: '16px', justifyContent: 'space-between' }}>
            <span>View All Appointments</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Recent Appointments Feed */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            <Clock size={20} color="var(--primary-600)" />
            Recent Appointment Activity
          </h3>
          <Link to="/admin/appointments" className="btn btn-secondary btn-sm">
            View Complete Registry
          </Link>
        </div>

        {stats?.recentAppointments?.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--slate-400)', padding: '24px' }}>
            No recent appointments recorded.
          </p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Queue #</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAppointments?.map((appt) => (
                  <tr key={appt.id}>
                    <td>
                      <strong style={{ fontSize: '0.85rem' }}>{appt.appointment_reference}</strong>
                    </td>
                    <td>
                      <div>{appt.appointment_date}</div>
                      <small style={{ color: 'var(--slate-500)' }}>{appt.appointment_time}</small>
                    </td>
                    <td>
                      <strong>{appt.patient_name}</strong>
                    </td>
                    <td>Dr. {appt.doctor_name}</td>
                    <td>
                      <span style={{ color: 'var(--primary-700)', fontWeight: 600 }}>
                        {appt.specialization}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--teal-700)' }}>
                        #{appt.queue_number || '-'}
                      </span>
                    </td>
                    <td>
                      <Badge status={appt.appointment_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
