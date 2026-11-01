import React from 'react';
import { useApp } from '../../stores/AppContext';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';

export const Toast = () => {
  const { toast } = useApp();
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success': return <CheckCircle size={18} />;
      case 'warning': return <AlertTriangle size={18} />;
      case 'error': return <XCircle size={18} />;
      default: return <Info size={18} />;
    }
  };

  return (
    <div className="toast-container">
      <div className={`toast toast-${toast.type} animate-fade-in-up`}>
        <div className="toast-icon">{getIcon()}</div>
        <span>{toast.message}</span>
      </div>
    </div>
  );
};
