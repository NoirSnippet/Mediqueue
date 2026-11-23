import React from 'react';
import { Activity } from 'lucide-react';

export default function LoadingSpinner({ message = 'Loading MediQueue data...' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px' }}>
      <div style={{ color: 'var(--primary-600)', animation: 'spin 1.5s linear infinite', marginBottom: '14px' }}>
        <Activity size={36} />
      </div>
      <p style={{ color: 'var(--slate-500)', fontSize: '0.95rem', fontWeight: 500 }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
