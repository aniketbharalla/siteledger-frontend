import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getVendors, createVendor, updateVendor, deleteVendor } from '../api';
import { IconSearch, IconEdit, IconTrash, IconDownload } from '../components/icons';

const CATEGORIES = ['material', 'labor', 'subcontract', 'equipment', 'other'];

const CAT_COLORS = {
  material:    { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  labor:       { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
  subcontract: { bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' },
  equipment:   { bg: '#FFF7ED', color: '#9A3412', border: '#FED7AA' },
  other:       { bg: '#F9FAFB', color: '#374151', border: '#E5E7EB' },
};

const CAT_ICONS = {
  material: '🧱', labor: '👷', subcontract: '🏗️', equipment: '⚙️', other: '📦',
};

function VendorModal({ vendor, onClose, onSaved }) {
  const isEdit = !!vendor?._id;
  const [form, setForm] = useState({
    name: vendor?.name || '',
    category: vendor?.category || 'material',
    phone: vendor?.phone || '',
    email: vendor?.email || '',
    gstin: vendor?.gstin || '',
    address: vendor?.address || '',
    notes: vendor?.notes || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Vendor name is required'); return; }
    setLoading(true); setError('');
    try {
      if (isEdit) await updateVendor(vendor._id, form);
      else await createVendor(form);
      onSaved(); onClose();
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  const inp = { className: 'input-dark', style: { width: '100%' } };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '18px 22px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{isEdit ? 'Edit Vendor' : 'Add Vendor'}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>Manage supplier details and GSTIN</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 18, lineHeight: 1, padding: 4, borderRadius: 6 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Name + Category */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Vendor Name *</label>
              <input {...inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Rajan Steel Traders" required />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Category</label>
              <select {...inp} value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Phone + Email */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Phone</label>
              <input {...inp} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Email</label>
              <input {...inp} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="vendor@email.com" />
            </div>
          </div>

          {/* GSTIN */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>
              GSTIN <span style={{ color: 'var(--ink-4)', fontSize: 10, fontWeight: 400, textTransform: 'none' }}>— Required to claim ITC</span>
            </label>
            <input {...inp} value={form.gstin} onChange={e => set('gstin', e.target.value.toUpperCase())} placeholder="27AABCU9603R1ZX" maxLength={15}
              style={{ ...inp.style, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em' }} />
          </div>

          {/* Address */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Address</label>
            <textarea {...inp} value={form.address} onChange={e => set('address', e.target.value)} rows={2} style={{ ...inp.style, resize: 'vertical' }} placeholder="Vendor address..." />
          </div>

          {/* Notes */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 }}>Notes</label>
            <textarea {...inp} value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} style={{ ...inp.style, resize: 'vertical' }} placeholder="Payment terms, credit limit, etc." />
          </div>

          {error && (
            <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', fontSize: 12, color: '#DC2626' }}>{error}</div>
          )}

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', paddingTop: 4 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? '✓ Update Vendor' : '+ Add Vendor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmModal({ name, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 380, padding: 28 }} onClick={e => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, margin: '0 auto 16px' }}>🗑️</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Delete Vendor?</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 22 }}>
            "<strong>{name}</strong>" will be permanently removed.
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }} disabled={loading}
              onClick={async () => { setLoading(true); await onConfirm(); setLoading(false); }}>
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage({ mobileAddTick = 0 }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: vendors = [], isLoading } = useQuery({
    queryKey: ['vendors'],
    queryFn: getVendors,
    staleTime: 60_000,
  });

  useEffect(() => { if (mobileAddTick > 0) setShowAdd(true); }, [mobileAddTick]);

  function refresh() { qc.invalidateQueries({ queryKey: ['vendors'] }); }

  const filtered = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchSearch = !q || v.name.toLowerCase().includes(q) || (v.gstin || '').toLowerCase().includes(q) || (v.phone || '').includes(q);
    const matchCat = catFilter === 'all' || v.category === catFilter;
    return matchSearch && matchCat;
  });

  // Stats
  const totalByCategory = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = vendors.filter(v => v.category === cat).length;
    return acc;
  }, {});

  return (
    <>
      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)' }}>{vendors.length}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, marginTop: 2 }}>Total Vendors</div>
        </div>
        {CATEGORIES.slice(0, 4).map(cat => (
          <div key={cat} className="card" style={{ padding: '14px 16px', cursor: 'pointer', borderTop: `3px solid ${CAT_COLORS[cat].color}` }}
            onClick={() => setCatFilter(catFilter === cat ? 'all' : cat)}>
            <div style={{ fontSize: 20, fontWeight: 800, color: CAT_COLORS[cat].color }}>{totalByCategory[cat] || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, marginTop: 2, textTransform: 'capitalize' }}>
              {CAT_ICONS[cat]} {cat}
            </div>
          </div>
        ))}
      </div>

      {/* Main table card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Vendors</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-4)', fontWeight: 600 }}>({filtered.length})</span>
          </div>
          <div style={{ flex: 1 }} />

          {/* Category filter pills */}
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            <button className={`range-btn${catFilter === 'all' ? ' active' : ''}`} onClick={() => setCatFilter('all')}>All</button>
            {CATEGORIES.map(c => (
              <button key={c} className={`range-btn${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)} style={{ textTransform: 'capitalize' }}>
                {CAT_ICONS[c]} {c}
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', pointerEvents: 'none' }}>
              <IconSearch size={12} />
            </span>
            <input className="input-dark" placeholder="Search vendor..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: 190, paddingLeft: 28, fontSize: 12 }} />
          </div>

          <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ fontSize: 12 }}>+ Add Vendor</button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', background: '#FAFAFA' }}>
                {['Vendor', 'Category', 'Phone', 'Email', 'GSTIN', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading vendors...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '52px', textAlign: 'center' }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🏪</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>No vendors yet</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 16 }}>Add your suppliers and contractors to track expenses and ITC</div>
                    <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Add First Vendor</button>
                  </td>
                </tr>
              ) : filtered.map(v => {
                const cat = CAT_COLORS[v.category] || CAT_COLORS.other;
                return (
                  <tr key={v._id} className="table-row">
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: cat.bg, border: `1px solid ${cat.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                          {CAT_ICONS[v.category] || '📦'}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{v.name}</div>
                          {v.address && <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1, maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.address}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: cat.bg, color: cat.color, border: `1px solid ${cat.border}`, textTransform: 'capitalize' }}>
                        {v.category}
                      </span>
                    </td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--ink-2)' }}>{v.phone || '—'}</td>
                    <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--ink-2)' }}>
                      {v.email ? <a href={`mailto:${v.email}`} style={{ color: '#7C3AED', textDecoration: 'none' }}>{v.email}</a> : '—'}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      {v.gstin ? (
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, color: '#059669', background: '#ECFDF5', border: '1px solid #A7F3D0', padding: '2px 8px', borderRadius: 6 }}>
                          {v.gstin}
                        </span>
                      ) : (
                        <span style={{ fontSize: 11, color: '#DC2626', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', padding: '2px 8px', borderRadius: 6 }}>
                          ⚠ Missing
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '13px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn-ghost" style={{ padding: '5px 8px', color: '#7C3AED' }} onClick={() => setEditTarget(v)} title="Edit">
                          <IconEdit size={13} />
                        </button>
                        <button className="btn-ghost" style={{ padding: '5px 8px', color: '#DC2626' }} onClick={() => setDeleteTarget(v)} title="Delete">
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-4)' }}>
            <span>{filtered.length} vendor{filtered.length !== 1 ? 's' : ''} shown</span>
            <span style={{ color: '#DC2626', fontWeight: 600 }}>
              {vendors.filter(v => !v.gstin).length > 0 && `⚠ ${vendors.filter(v => !v.gstin).length} missing GSTIN`}
            </span>
          </div>
        )}
      </div>

      {showAdd && <VendorModal onClose={() => setShowAdd(false)} onSaved={refresh} />}
      {editTarget && <VendorModal vendor={editTarget} onClose={() => setEditTarget(null)} onSaved={refresh} />}
      {deleteTarget && (
        <ConfirmModal
          name={deleteTarget.name}
          onConfirm={async () => { await deleteVendor(deleteTarget._id); refresh(); setDeleteTarget(null); }}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
