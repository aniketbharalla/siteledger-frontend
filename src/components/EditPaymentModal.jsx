import React, { useState } from 'react';
import { updatePayment } from '../api';
import { IconX, IconCheck } from './icons';

export default function EditPaymentModal({ payment, sites = [], onClose, onSaved }) {
  const siteId = payment.siteId?._id || payment.siteId || '';
  const [form, setForm] = useState({
    clientName: payment.clientName || '',
    siteId,
    milestone: payment.milestone || '',
    amount: payment.amount ?? '',
    date: payment.date ? payment.date.slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.clientName.trim()) { setError('Client name is required'); return; }
    if (!form.siteId) { setError('Please select a site'); return; }
    if (!form.milestone.trim()) { setError('Milestone is required'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
    setError('');
    setLoading(true);
    try {
      await updatePayment(payment._id, {
        clientName: form.clientName.trim(),
        siteId: form.siteId,
        milestone: form.milestone.trim(),
        amount: Number(form.amount),
        date: form.date,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 1, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Edit Payment</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{payment.clientName}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', cursor: 'pointer', padding: '6px', display: 'flex', flexShrink: 0 }}>
            <IconX size={16} />
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(227,26,26,0.1)', border: '1px solid rgba(227,26,26,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#E31A1A', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Client Name</label>
              <input className="input-dark" value={form.clientName} onChange={e => set('clientName', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input className="input-dark" type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Site</label>
            <div style={{ position: 'relative' }}>
              <select className="select-dark" value={form.siteId} onChange={e => set('siteId', e.target.value)}>
                <option value="">Select site...</option>
                {sites.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>▾</div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Milestone</label>
            <input className="input-dark" value={form.milestone} onChange={e => set('milestone', e.target.value)} placeholder="e.g. Foundation complete" />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Date</label>
            <input className="input-dark" type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '10px', opacity: loading ? 0.6 : 1 }}>
              <IconCheck size={14} />
              {loading ? 'Saving...' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
