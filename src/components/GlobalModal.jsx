import { useState, useEffect } from 'react';
import { modalService } from '../lib/modalService.js';
import './GlobalModal.css';

export default function GlobalModal() {
  const [modalData, setModalData] = useState({ isOpen: false });

  useEffect(() => {
    const unsubscribe = modalService.subscribe(setModalData);
    return () => unsubscribe();
  }, []);

  if (!modalData.isOpen) return null;

  return (
    <div className="global-modal-overlay">
      <div className="global-modal-content">
        <p className="global-modal-text">{modalData.message}</p>
        <div className="global-modal-actions">
          {modalData.type === 'confirm' && (
            <button className="button outline" onClick={modalData.onCancel}>
              CANCELAR
            </button>
          )}
          <button className="button red" onClick={modalData.onConfirm}>
            ACEPTAR
          </button>
        </div>
      </div>
    </div>
  );
}
