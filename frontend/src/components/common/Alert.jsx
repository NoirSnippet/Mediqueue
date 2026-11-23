import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="var(--success-solid)" />,
    danger: <AlertCircle size={18} color="var(--danger-solid)" />,
    warning: <AlertCircle size={18} color="var(--warning-solid)" />,
    info: <Info size={18} color="var(--primary-600)" />,
  };

  return (
    <div className={`alert alert-${type}`}>
      <span style={{ display: 'flex', alignItems: 'center' }}>{icons[type] || icons.info}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
