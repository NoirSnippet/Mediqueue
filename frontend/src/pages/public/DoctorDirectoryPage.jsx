import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { Search, Filter, Stethoscope, MapPin, Calendar, Clock, DollarSign, Activity, Star, ShieldCheck } from 'lucide-react';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DoctorAvatar from '../../components/common/DoctorAvatar';

const SPECIALTY_OPTIONS = [
  'All',
  'Cardiology',
  'General Medicine',
  'Pediatrics',
  'Orthopedics',
  'Dermatology',
];

const DOCTOR_RATINGS = {
  1: { rating: '4.1', reviews: 18 },
  2: { rating: '4.0', reviews: 12 },
  3: { rating: '4.2', reviews: 15 },
  4: { rating: '4.0', reviews: 9 },
  5: { rating: '4.1', reviews: 14 },
};

export default function DoctorDirectoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [doctors, setDoctors] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSpec, setSelectedSpec] = useState(searchParams.get('specialization') || 'all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Load specializations on mount
  useEffect(() => {
    async function loadSpecs() {
      try {
        const res = await api.get('/doctors/specializations');
        if (res.data.success) {
          setSpecializations(res.data.specializations);
        }
      } catch (err) {
        console.error('Failed to load specializations:', err);
      }
    }
    loadSpecs();
  }, []);

  // Fetch doctors whenever filters change
  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const params = {};
        if (search.trim()) params.search = search.trim();
        if (selectedSpec && selectedSpec !== 'all' && selectedSpec !== 'All') params.specialization = selectedSpec;
        if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;

        const res = await api.get('/doctors', { params });
        if (res.data.success) {
          setDoctors(res.data.doctors);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [search, selectedSpec, selectedStatus]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    const newParams = {};
    if (search.trim()) newParams.search = search.trim();
    if (selectedSpec !== 'all' && selectedSpec !== 'All') newParams.specialization = selectedSpec;
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSpec('all');
    setSelectedStatus('all');
    setSearchParams({});
  };

  const handleQuickSpec = (spec) => {
    setSelectedSpec(spec === 'All' ? 'all' : spec);
  };

  return (
    <div style={{ padding: '40px 0 70px' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--primary-100)', color: 'var(--primary-800)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.825rem', fontWeight: 700, marginBottom: '8px' }}>
            <Stethoscope size={15} />
            <span>Clinical Specialists Directory</span>
          </div>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Find Your Medical Doctor</h1>
          <p style={{ color: 'var(--slate-500)', fontSize: '1.05rem' }}>
            Consult certified hospital doctors, view OPD consultation shifts, and secure guaranteed conflict-free appointment slots.
          </p>
        </div>

        {/* Quick Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {SPECIALTY_OPTIONS.map((spec) => {
            const isActive = (spec === 'All' && (selectedSpec === 'all' || !selectedSpec)) || selectedSpec === spec;
            return (
              <button
                key={spec}
                type="button"
                onClick={() => handleQuickSpec(spec)}
                className={`specialty-chip ${isActive ? 'active' : ''}`}
              >
                <span>{spec}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls Bar */}
        <div className="card" style={{ marginBottom: '32px', padding: '18px 22px' }}>
          <form onSubmit={handleFilterSubmit} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{ flex: '2', minWidth: '240px', position: 'relative' }}>
              <Search
                size={18}
                color="var(--slate-400)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                type="text"
                className="form-control"
                placeholder="Search by doctor name or qualification..."
                style={{ paddingLeft: '40px' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Specialization Filter */}
            <div style={{ flex: '1', minWidth: '180px' }}>
              <select
                className="form-control"
                value={selectedSpec}
                onChange={(e) => setSelectedSpec(e.target.value)}
              >
                <option value="all">All Departments</option>
                {specializations.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div style={{ flex: '1', minWidth: '150px' }}>
              <select
                className="form-control"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available on Duty</option>
                <option value="on_leave">On Leave</option>
                <option value="busy">Busy In OPD</option>
              </select>
            </div>

            <button type="button" onClick={clearFilters} className="btn btn-secondary btn-sm">
              Reset Filters
            </button>
          </form>
        </div>

        {/* Doctors Grid */}
        {loading ? (
          <LoadingSpinner message="Searching real-time doctor schedules..." />
        ) : doctors.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Stethoscope size={48} color="var(--slate-300)" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Doctors Found</h3>
            <p style={{ color: 'var(--slate-500)', marginBottom: '20px' }}>
              No doctors match your query. Try resetting your search filters.
            </p>
            <button onClick={clearFilters} className="btn btn-primary btn-sm" style={{ margin: '0 auto' }}>
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="doctor-directory-grid">
            {doctors.map((doc) => (
              <div key={doc.id} className="doctor-card">
                {/* Doctor Head: Photo Avatar + Info */}
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <DoctorAvatar
                    doctorId={doc.id}
                    specialization={doc.specialization}
                    name={doc.doctor_name}
                    size={72}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', flexWrap: 'wrap', gap: '6px' }}>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--slate-900)' }}>{doc.doctor_name}</h3>
                      <Badge status={doc.availability_status} />
                    </div>
                    <div style={{ color: 'var(--primary-700)', fontWeight: 700, fontSize: '0.9rem', marginBottom: '2px' }}>
                      {doc.specialization}
                    </div>
                    <div style={{ color: 'var(--slate-500)', fontSize: '0.8rem' }}>{doc.qualification}</div>
                  </div>
                </div>

                {/* Details Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.85rem', color: 'var(--slate-600)', marginBottom: '14px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <MapPin size={14} color="var(--slate-400)" />
                    <span>{doc.clinic_name} • {doc.room_number}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Activity size={14} color="var(--teal-600)" />
                    <span>{doc.experience_years} Years Exp.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Star size={14} color="#f59e0b" fill="#f59e0b" />
                    <span>{(DOCTOR_RATINGS[doc.id] || { rating: '4.0', reviews: 10 }).rating} ({(DOCTOR_RATINGS[doc.id] || { rating: '4.0', reviews: 10 }).reviews} reviews)</span>
                  </div>
                </div>

                <p style={{ fontSize: '0.875rem', color: 'var(--slate-600)', lineHeight: 1.5, marginBottom: '20px', flex: 1 }}>
                  {doc.bio}
                </p>

                {/* Card Footer: Fee and Book CTA */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '16px',
                    borderTop: '1px solid var(--slate-100)',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                      Consultation Fee
                    </span>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--slate-900)' }}>
                      ₹{parseFloat(doc.consultation_fee).toFixed(0)}
                    </div>
                  </div>

                  <Link
                    to={`/patient/book?doctorId=${doc.id}`}
                    className="btn btn-primary"
                    style={{ padding: '9px 20px', borderRadius: 'var(--radius-md)' }}
                  >
                    <Calendar size={15} />
                    Book Slot
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
