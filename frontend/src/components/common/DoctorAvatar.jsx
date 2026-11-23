import React, { useState } from 'react';
import { ShieldCheck, Stethoscope } from 'lucide-react';

const DOCTOR_AVATARS = {
  1: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=360&h=360',
  2: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=360&h=360',
  3: 'https://images.unsplash.com/photo-1594824813515-5389439f0458?auto=format&fit=crop&q=80&w=360&h=360',
  4: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=360&h=360',
  5: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=360&h=360',
};

const SPEC_AVATARS = {
  Cardiology: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=360&h=360',
  'General Medicine': 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=360&h=360',
  Pediatrics: 'https://images.unsplash.com/photo-1594824813515-5389439f0458?auto=format&fit=crop&q=80&w=360&h=360',
  Orthopedics: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=360&h=360',
  Dermatology: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=360&h=360',
};

export default function DoctorAvatar({ doctorId, specialization, name, size = 68, showBadge = true, className = '' }) {
  const [imgError, setImgError] = useState(false);
  const avatarUrl = DOCTOR_AVATARS[doctorId] || SPEC_AVATARS[specialization] || DOCTOR_AVATARS[1];

  const initials = name
    ? name
        .replace('Dr.', '')
        .trim()
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
    : 'DR';

  return (
    <div
      style={{
        width: size,
        height: size,
        minWidth: size,
        position: 'relative',
        display: 'inline-block',
      }}
      className={className}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: size > 80 ? '22px' : '18px',
          overflow: 'hidden',
          backgroundColor: 'var(--primary-100)',
          border: '2px solid #ffffff',
          boxShadow: '0 4px 14px rgba(2, 132, 199, 0.16)',
        }}
      >
        {imgError || !avatarUrl ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, var(--primary-600), var(--teal-600))',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: size > 60 ? '1.25rem' : '0.95rem',
            }}
          >
            {initials}
          </div>
        ) : (
          <img
            src={avatarUrl}
            alt={name || 'Doctor'}
            onError={() => setImgError(true)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
          />
        )}
      </div>

      {showBadge && (
        <div
          title="Verified Specialist"
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            backgroundColor: 'var(--primary-600)',
            color: '#ffffff',
            borderRadius: '50%',
            width: size > 60 ? '22px' : '18px',
            height: size > 60 ? '22px' : '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
        >
          <ShieldCheck size={size > 60 ? 13 : 11} />
        </div>
      )}
    </div>
  );
}
