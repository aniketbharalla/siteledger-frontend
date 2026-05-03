import React, { useState } from 'react';
import { createSite } from '../api';
import { IconX, IconCheck } from './icons';

export default function AddSiteModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    location: '',
    code: '',
    status: 'active',
    totalBudget: '',
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Site name is required'); return; }
    if (!form.location.trim()) { setError('Location is required'); return; }
    if (!form.totalBudget || isNaN(Number(form.totalBudget)) || Number(form.totalBudget) < 0) {
      setError('Enter a valid budget'); return;
    }
    if (!form.startDate) { setError('Start date is required'); return; }
    setError('');
    setLoading(true);
    try {
      await createSite({
        name: form.name.trim(),
        location: form.location.trim(),
        ...(form.code.trim() ? { code: form.code.trim().toUpperCase() } : {}),
        status: form.status,
        totalBudget: Number(form.totalBudget),
        startDate: form.startDate,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create site');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{ width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: '0 30px 80px rgba(0,0,0,0.7)', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, position: 'sticky', top: 0, background: 'var(--bg-2)', zIndex: 1, paddingBottom: 16, borderBottom: '1px solid var(--line)' }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Add Site</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Create a new construction site</div>
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
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Site Name</label>
              <input className="input-dark" placeholder="e.g. Green Valley Phase 2" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Code <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>(optional)</span></label>
              <input className="input-dark" placeholder="e.g. GVP2" value={form.code} onChange={e => set('code', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Location</label>
            <input className="input-dark" placeholder="e.g. Bangalore, Karnataka" value={form.location} onChange={e => set('location', e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Budget (₹)</label>
              <input className="input-dark" type="number" min="0" placeholder="0" value={form.totalBudget} onChange={e => set('totalBudget', e.target.value)} />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Start Date</label>
              <input className="input-dark" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} style={{ colorScheme: 'dark' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 8 }}>Status</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['active', 'completed'].map(s => (
                <button key={s} type="button" onClick={() => set('status', s)}
                  style={{
                    flex: 1, padding: '8px 0', borderRadius: 10,
                    border: `1px solid ${form.status === s ? (s === 'active' ? 'rgba(1,181,116,0.4)' : 'rgba(0,117,255,0.4)') : 'var(--line)'}`,
                    background: form.status === s ? (s === 'active' ? 'rgba(1,181,116,0.15)' : 'rgba(0,117,255,0.12)') : 'transparent',
                    color: form.status === s ? (s === 'active' ? '#01B574' : '#0075FF') : 'var(--ink-3)',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textTransform: 'capitalize',
                  }}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '10px', opacity: loading ? 0.6 : 1 }}>
              <IconCheck size={14} />
              {loading ? 'Creating...' : 'Create Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
