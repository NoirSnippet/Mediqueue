import React from 'react';

export default function Badge({ status, text }) {
  if (!status) return null;
  const normalized = String(status).toLowerCase().replace(/\s+/g, '-');
  const displayText = text || status;

  return (
    <span className={`badge badge-${normalized}`}>
      <span className="badge-dot" />
      {displayText}
    </span>
  );
}
