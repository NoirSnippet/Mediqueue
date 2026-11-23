import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  return (
    <div className="stat-card card-hover">
      {Icon && (
        <div className={`stat-icon ${color}`}>
          <Icon size={26} />
        </div>
      )}
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtitle && <small style={{ color: 'var(--slate-400)', fontSize: '0.75rem' }}>{subtitle}</small>}
      </div>
    </div>
  );
}
