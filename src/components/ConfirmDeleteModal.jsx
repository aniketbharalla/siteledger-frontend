import React, { useState } from 'react';
import { IconX, IconTrash } from './icons';

export default function ConfirmDeleteModal({ title, message, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to delete');
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: 420, padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(227,26,26,0.15)', border: '1px solid rgba(227,26,26,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E31A1A' }}>
              <IconTrash size={16} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>{title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', cursor: 'pointer', padding: '6px', display: 'flex' }}>
            <IconX size={16} />
          </button>
        </div>

        <p style={{ fontSize: 13, color: 'var(--ink-2)', marginBottom: 20, lineHeight: 1.6 }}>{message}</p>

        {error && (
          <div style={{ background: 'rgba(227,26,26,0.1)', border: '1px solid rgba(227,26,26,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#E31A1A', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            style={{ flex: 1, justifyContent: 'center', padding: '10px', display: 'flex', alignItems: 'center', gap: 6, borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#E31A1A,#ff4d4d)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, fontFamily: 'inherit' }}
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
