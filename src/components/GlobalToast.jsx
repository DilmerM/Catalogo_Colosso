import { useState, useEffect } from 'react';
import { toastService } from '../lib/toastService.js';
import './GlobalToast.css';

// SVG Icons
const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

function ToastItem({ toast, onRemove }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    // Allow animation to finish before removing from state
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div className={`toast toast-${toast.type} ${isClosing ? 'toast-closing' : ''}`}>
      <div className="toast-icon">
        {toast.type === 'success' ? <CheckIcon /> : <XIcon />}
      </div>
      <div className="toast-message">
        {toast.message}
      </div>
      <button className="toast-close" onClick={handleClose} aria-label="Close">
        <CloseIcon />
      </button>
    </div>
  );
}

export default function GlobalToast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts);
    return () => unsubscribe();
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="global-toast-container">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={toastService.remove} 
        />
      ))}
    </div>
  );
}
