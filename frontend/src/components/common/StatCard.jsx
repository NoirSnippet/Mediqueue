import React from 'react';

export default function StatCard({ title, value, icon: Icon, color = 'blue', subtitle }) {
  return (
    <div className="stat-card card-hover">
      <div className="stat-card-top">
        {Icon && (
          <div className={`stat-icon ${color}`}>
            <Icon size={22} />
          </div>
        )}
        <div className="stat-value">{value}</div>
      </div>
      <div className="stat-content">
        <div className="stat-label">{title}</div>
        {subtitle && <small style={{ color: 'var(--slate-400)', fontSize: '0.75rem', marginTop: '2px', display: 'block' }}>{subtitle}</small>}
      </div>
    </div>
  );
}
