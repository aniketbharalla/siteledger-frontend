import React, { useState } from 'react';
import { createExpense } from '../api';
import { IconX, IconCheck } from './icons';

const CATEGORIES = ['material', 'labor', 'misc'];

const CAT_COLORS = {
  material: 'var(--grad-pink)',
  labor: 'var(--grad-primary)',
  misc: 'var(--grad-amber)',
};

export default function AddExpenseModal({ sites = [], onClose, onSaved }) {
  const [form, setForm] = useState({
    siteId: sites[0]?._id || '',
    name: '',
    vendor: '',
    amount: '',
    category: 'material',
    date: new Date().toISOString().slice(0, 10),
    status: 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.siteId) { setError('Please select a site'); return; }
    if (!form.name.trim()) { setError('Item name is required'); return; }
    if (!form.vendor.trim()) { setError('Vendor is required'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Enter a valid amount'); return;
    }
    setError('');
    setLoading(true);
    try {
      await createExpense({
        siteId: form.siteId,
        name: form.name.trim(),
        vendor: form.vendor.trim(),
        amount: Number(form.amount),
        category: form.category,
        date: form.date,
        status: form.status,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 480,
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 1, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Log Expense</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Add a new expense entry</div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', cursor: 'pointer', padding: '6px', display: 'flex', flexShrink: 0 }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(227,26,26,0.1)', border: '1px solid rgba(227,26,26,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 12, color: '#E31A1A', marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Site */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Site</label>
            <div style={{ position: 'relative' }}>
              <select
                className="select-dark"
                value={form.siteId}
                onChange={e => set('siteId', e.target.value)}
              >
                <option value="">Select site...</option>
                {sites.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                ))}
              </select>
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>
                ▾
              </div>
            </div>
          </div>

          {/* Row: Item + Vendor */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Item Name</label>
              <input
                className="input-dark"
                placeholder="e.g. TMT Steel Bars"
                value={form.name}
                onChange={e => set('name', e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Vendor</label>
              <input
                className="input-dark"
                placeholder="Vendor name"
                value={form.vendor}
                onChange={e => set('vendor', e.target.value)}
              />
            </div>
          </div>

          {/* Row: Amount + Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input
                className="input-dark"
                type="number"
                placeholder="0"
                min="0"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Date</label>
              <input
                className="input-dark"
                type="date"
                value={form.date}
                onChange={e => set('date', e.target.value)}
                style={{ colorScheme: 'dark' }}
              />
            </div>
          </div>

          {/* Category toggle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Category</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set('category', c)}
                  style={{
                    flex: 1,
                    padding: '9px 0',
                    borderRadius: 10,
                    border: form.category === c ? 'none' : '1px solid var(--line)',
                    background: form.category === c ? CAT_COLORS[c] : 'transparent',
                    color: form.category === c ? '#fff' : 'var(--ink-3)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Status toggle */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['pending', 'paid'].map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => set('status', s)}
                  style={{
                    flex: 1,
                    padding: '8px 0',
                    borderRadius: 10,
                    border: `1px solid ${form.status === s ? (s === 'paid' ? 'rgba(1,181,116,0.4)' : 'rgba(255,181,71,0.4)') : 'var(--line)'}`,
                    background: form.status === s
                      ? s === 'paid' ? 'rgba(1,181,116,0.15)' : 'rgba(255,181,71,0.12)'
                      : 'transparent',
                    color: form.status === s
                      ? s === 'paid' ? '#01B574' : '#FFB547'
                      : 'var(--ink-3)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              type="button"
              className="btn-ghost"
              onClick={onClose}
              style={{ flex: 1, justifyContent: 'center', padding: '10px' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
              style={{ flex: 2, justifyContent: 'center', padding: '10px', opacity: loading ? 0.6 : 1 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.8s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3"/>
                    <path d="M12 2a10 10 0 0110 10" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                  Saving...
                </span>
              ) : (
                <>
                  <IconCheck size={14} />
                  Save expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
