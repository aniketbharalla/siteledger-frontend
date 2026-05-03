import React, { useState } from 'react';
import { updateInvestor } from '../api';
import { IconX, IconCheck } from './icons';

export default function EditInvestorModal({ investor, sites = [], onClose, onSaved }) {
  const siteId = investor.siteId?._id || investor.siteId || '';
  const [form, setForm] = useState({
    name: investor.name || '',
    siteId,
    amount: investor.amount ?? '',
    share: investor.share ?? '',
    date: investor.date ? investor.date.slice(0, 10) : '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Investor name is required'); return; }
    if (!form.siteId) { setError('Please select a site'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) < 0) { setError('Enter a valid amount'); return; }
    if (form.share === '' || isNaN(Number(form.share))) { setError('Enter a valid share %'); return; }
    setError('');
    setLoading(true);
    try {
      await updateInvestor(investor._id, {
        name: form.name.trim(),
        siteId: form.siteId,
        amount: Number(form.amount),
        share: Number(form.share),
        date: form.date,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update investor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 460, padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Edit Investor</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{investor.name}</div>
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
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Investor Name</label>
            <input className="input-dark" value={form.name} onChange={e => set('name', e.target.value)} />
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input className="input-dark" type="number" min="0" value={form.amount} onChange={e => set('amount', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Share %</label>
              <input className="input-dark" type="number" min="0" max="100" step="0.1" value={form.share} onChange={e => set('share', e.target.value)} />
            </div>
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
