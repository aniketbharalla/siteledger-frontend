import React, { useState } from 'react';
import { updateExpense } from '../api';
import { IconX, IconCheck } from './icons';

const CATEGORIES = ['material', 'labor', 'misc'];
const CAT_COLORS = { material: 'var(--grad-pink)', labor: 'var(--grad-primary)', misc: 'var(--grad-amber)' };

export default function EditExpenseModal({ expense, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: expense.name || '',
    vendor: expense.vendor || '',
    amount: expense.amount ?? '',
    category: expense.category || 'material',
    date: expense.date ? expense.date.slice(0, 10) : '',
    status: expense.status || 'pending',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Item name is required'); return; }
    if (!form.vendor.trim()) { setError('Vendor is required'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) { setError('Enter a valid amount'); return; }
    setError('');
    setLoading(true);
    try {
      await updateExpense(expense._id, {
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
      setError(err.message || 'Failed to update expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Edit Expense</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{expense.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink-3)', cursor: 'pointer', padding: '6px', display: 'flex' }}>
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
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Item Name</label>
              <input className="input-dark" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Vendor</label>
              <input className="input-dark" value={form.vendor} onChange={e => set('vendor', e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input className="input-dark" type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Date</label>
              <input className="input-dark" type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Category</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {CATEGORIES.map(c => (
                <button key={c} type="button" onClick={() => set('category', c)} style={{ flex: 1, padding: '9px 0', borderRadius: 10, border: form.category === c ? 'none' : '1px solid var(--line)', background: form.category === c ? CAT_COLORS[c] : 'transparent', color: form.category === c ? '#fff' : 'var(--ink-3)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['pending', 'paid'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)} style={{ flex: 1, padding: '8px 0', borderRadius: 10, border: `1px solid ${form.status === s ? (s === 'paid' ? 'rgba(1,181,116,0.4)' : 'rgba(255,181,71,0.4)') : 'var(--line)'}`, background: form.status === s ? (s === 'paid' ? 'rgba(1,181,116,0.15)' : 'rgba(255,181,71,0.12)') : 'transparent', color: form.status === s ? (s === 'paid' ? '#01B574' : '#FFB547') : 'var(--ink-3)', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize' }}>
                  {s}
                </button>
              ))}
            </div>
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
