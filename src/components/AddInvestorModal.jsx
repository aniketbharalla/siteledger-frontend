import React, { useState } from 'react';
import { createInvestor, getInvestors } from '../api';
import { IconX, IconCheck } from './icons';
import { fmtINR } from '../utils/format';

export default function AddInvestorModal({ sites = [], onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '',
    siteId: sites[0]?._id || '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });
  const [siteInvestors, setSiteInvestors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  // When site changes, fetch existing investors to show preview
  async function handleSiteChange(siteId) {
    set('siteId', siteId);
    if (!siteId) { setSiteInvestors([]); return; }
    try {
      const data = await getInvestors(siteId);
      setSiteInvestors(data || []);
    } catch {
      setSiteInvestors([]);
    }
  }

  // Calculate preview share for this new investor
  const existingTotal = siteInvestors.reduce((s, i) => s + (i.amount || 0), 0);
  const newAmount = Number(form.amount) || 0;
  const grandTotal = existingTotal + newAmount;
  const previewShare = grandTotal > 0 ? ((newAmount / grandTotal) * 100) : 0;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Investor name is required'); return; }
    if (!form.siteId) { setError('Please select a site'); return; }
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Enter a valid amount'); return;
    }
    setError('');
    setLoading(true);
    try {
      await createInvestor({
        name: form.name.trim(),
        siteId: form.siteId,
        amount: Number(form.amount),
        date: form.date,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add investor');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: 460,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '28px',
        boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
        position: 'relative',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          position: 'sticky',
          top: 0,
          background: 'var(--bg-2)',
          zIndex: 1,
          paddingBottom: 16,
          borderBottom: '1px solid var(--line)',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800 }}>Add Investor</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Share % is calculated automatically</div>
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
          {/* Name */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Investor Name</label>
            <input className="input-dark" placeholder="e.g. Rajesh Kumar" value={form.name} onChange={e => set('name', e.target.value)} />
          </div>

          {/* Site */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Site</label>
            <div style={{ position: 'relative' }}>
              <select className="select-dark" value={form.siteId} onChange={e => handleSiteChange(e.target.value)}>
                <option value="">Select site...</option>
                {sites.map(s => <option key={s._id} value={s._id}>{s.name} ({s.code})</option>)}
              </select>
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--ink-3)' }}>▾</div>
            </div>
          </div>

          {/* Amount + Share preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Amount (₹)</label>
              <input
                className="input-dark"
                type="number"
                min="0"
                placeholder="0"
                value={form.amount}
                onChange={e => set('amount', e.target.value)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Share % (auto)</label>
              <div style={{
                background: 'rgba(0,117,255,0.08)',
                border: '1px solid rgba(0,117,255,0.2)',
                borderRadius: 10,
                padding: '8px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span className="num" style={{ fontSize: 18, fontWeight: 800, color: 'var(--accent-blue)' }}>
                  {previewShare.toFixed(1)}%
                </span>
                <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>preview</span>
              </div>
            </div>
          </div>

          {/* Existing investors breakdown */}
          {siteInvestors.length > 0 && newAmount > 0 && (
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Updated distribution
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {siteInvestors.map(inv => (
                  <div key={inv._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: 'var(--ink-2)' }}>{inv.name}</span>
                    <span className="num" style={{ color: 'var(--ink-3)' }}>
                      {grandTotal > 0 ? ((inv.amount / grandTotal) * 100).toFixed(1) : '0.0'}%
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, borderTop: '1px solid var(--line)', paddingTop: 6, marginTop: 2 }}>
                  <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{form.name || 'New investor'}</span>
                  <span className="num" style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>{previewShare.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}

          {/* Date */}
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Date</label>
            <input className="input-dark" type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ colorScheme: 'dark' }} />
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose} style={{ flex: 1, justifyContent: 'center', padding: '10px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ flex: 2, justifyContent: 'center', padding: '10px', opacity: loading ? 0.6 : 1 }}>
              <IconCheck size={14} />
              {loading ? 'Saving...' : 'Add Investor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
