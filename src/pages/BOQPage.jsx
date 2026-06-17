import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getBOQs, createBOQ, updateBOQ, deleteBOQ, getSites } from '../api';
import { IconSearch, IconEdit, IconTrash, IconDownload } from '../components/icons';
import { fmtINR } from '../utils/format';

const UNITS = ['sqft', 'sqm', 'cum', 'rmt', 'kg', 'ton', 'nos', 'set', 'lot', 'hr', 'day'];
const ITEM_CATEGORIES = [
  'civil', 'structural', 'electrical', 'plumbing', 'finishing',
  'road', 'earthwork', 'drainage', 'material', 'labor', 'equipment',
  'misc', 'other'
];
const CAT_COLORS = {
  civil:       '#2563EB',
  structural:  '#059669',
  electrical:  '#D97706',
  plumbing:    '#0891B2',
  finishing:   '#7C3AED',
  road:        '#B45309',
  earthwork:   '#78350F',
  drainage:    '#0369A1',
  material:    '#4F46E5',
  labor:       '#0F766E',
  equipment:   '#4B5563',
  misc:        '#6B7280',
  other:       '#6B7280',
};

function emptyItem() { return { description: '', unit: 'sqft', qty: '', rate: '', category: 'civil', notes: '' }; }

// ── BOQ Modal (Create / Edit) ─────────────────────────────────────────────────
function BOQModal({ boq, sites, onClose, onSaved }) {
  const isEdit = !!boq?._id;
  const [name, setName] = useState(boq?.title || boq?.name || '');
  const [siteId, setSiteId] = useState(boq?.siteId?._id || boq?.siteId || '');
  const [items, setItems] = useState(() => {
    if (boq?.items?.length) {
      return boq.items.map(it => ({
        ...it,
        qty: it.quantity !== undefined ? it.quantity : it.qty,
      }));
    }
    return [emptyItem()];
  });
  const [notes, setNotes] = useState(boq?.notes || '');
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeCat, setActiveCat] = useState('all');

  function setItem(i, k, v) {
    setItems(prev => { const c = [...prev]; c[i] = { ...c[i], [k]: v }; return c; });
  }
  function addItem() { setItems(p => [...p, { ...emptyItem(), category: activeCat !== 'all' ? activeCat : 'civil' }]); }
  function removeItem(i) { setItems(p => p.filter((_, idx) => idx !== i)); }

  const total = useMemo(() =>
    items.reduce((s, it) => s + (parseFloat(it.qty) || 0) * (parseFloat(it.rate) || 0), 0), [items]);

  const visibleItems = useMemo(() =>
    activeCat === 'all' ? items.map((it, i) => ({ ...it, _idx: i }))
      : items.map((it, i) => ({ ...it, _idx: i })).filter(it => it.category === activeCat),
    [items, activeCat]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) { setError('BOQ name is required'); return; }
    if (!siteId) { setError('Please select a site'); return; }

    // Filter out completely empty items
    const nonBlank = items.filter(it =>
      it.description.trim() ||
      (it.qty !== '' && parseFloat(it.qty) > 0) ||
      (it.rate !== '' && parseFloat(it.rate) > 0)
    );

    if (nonBlank.length === 0) {
      setError('Please add at least one line item');
      return;
    }

    // Validate that all active items have a description
    const missingDesc = nonBlank.some(it => !it.description.trim());
    if (missingDesc) {
      setError('Description is required for all line items');
      return;
    }

    setLoading(true); setError('');
    try {
      const mappedItems = nonBlank.map((it, idx) => ({
        srNo: idx + 1,
        description: it.description.trim(),
        category: it.category || 'civil',
        unit: it.unit || 'sqft',
        quantity: parseFloat(it.qty) || 0,
        rate: parseFloat(it.rate) || 0,
        notes: it.notes || '',
        completionPct: it.completionPct !== undefined ? it.completionPct : 0,
      }));
      const payload = { title: name, siteId, items: mappedItems, notes };
      if (isEdit) await updateBOQ(boq._id, payload);
      else await createBOQ(payload);
      onSaved(); onClose();
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  }

  const inp = { className: 'input-dark' };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 840, width: '95vw', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{isEdit ? 'Edit BOQ' : 'New BOQ / Estimate'}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>Bill of Quantities — line-item cost estimate</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Estimate</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace' }}>{fmtINR(total)}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 18, padding: 4, borderRadius: 6 }}>✕</button>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 14 : 22, display: 'flex', flexDirection: 'column', gap: 18 }}>
          {/* Name + Site */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 10 : 14 }}>
            <div>
              <label style={L}>BOQ Name *</label>
              <input {...inp} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Phase 1 Civil Work" required style={{ width: '100%' }} />
            </div>
            <div>
              <label style={L}>Site *</label>
              <select {...inp} value={siteId} onChange={e => setSiteId(e.target.value)} style={{ width: '100%' }}>
                <option value="">— Select Site —</option>
                {sites.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          {/* Category filter tabs for items */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              <label style={{ ...L, marginBottom: 0 }}>Line Items ({items.length})</label>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {['all', ...ITEM_CATEGORIES].map(c => (
                  <button type="button" key={c} onClick={() => setActiveCat(c)}
                    style={{ padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 700, border: '1px solid var(--line-2)', cursor: 'pointer', textTransform: 'capitalize', fontFamily: 'Inter, sans-serif',
                      background: activeCat === c ? CAT_COLORS[c] || '#7C3AED' : 'transparent',
                      color: activeCat === c ? '#fff' : 'var(--ink-3)',
                      borderColor: activeCat === c ? 'transparent' : 'var(--line-2)',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* Column headers (Desktop only) */}
            {!isMobile && (
              <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.8fr 1fr 32px', gap: 6, padding: '6px 8px', borderRadius: 8, background: '#F8F9FC', marginBottom: 6, fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                <span>Description</span><span>Category</span><span>Unit</span><span>Qty</span><span>Rate (₹)</span><span style={{ textAlign: 'right' }}>Amount</span><span />
              </div>
            )}

            {/* Line items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 12 : 5 }}>
              {visibleItems.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 12, background: '#FAFAFA', borderRadius: 8, border: '1px dashed var(--line-2)' }}>
                  No items in this category.
                  <button type="button" onClick={addItem} style={{ marginLeft: 8, color: '#7C3AED', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: 'Inter, sans-serif' }}>+ Add one</button>
                </div>
              ) : visibleItems.map(item => {
                const i = item._idx;
                const amt = (parseFloat(item.qty) || 0) * (parseFloat(item.rate) || 0);
                
                if (isMobile) {
                  return (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: 12, borderRadius: 10, border: '1px solid var(--line)', background: '#FFFFFF', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                      {/* Row 1: Description & Delete */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <input {...inp} value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Work item description" style={{ flex: 1, fontSize: 12, padding: '8px 10px' }} />
                        <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 16, padding: 4 }}
                          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>
                          ✕
                        </button>
                      </div>

                      {/* Row 2: Category & Unit */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <div>
                          <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Category</label>
                          <select {...inp} value={item.category} onChange={e => setItem(i, 'category', e.target.value)} style={{ fontSize: 12, padding: '8px', width: '100%' }}>
                            {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Unit</label>
                          <select {...inp} value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)} style={{ fontSize: 12, padding: '8px', width: '100%' }}>
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>

                      {/* Row 3: Qty, Rate & Amount */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: 8, alignItems: 'center' }}>
                        <div>
                          <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Qty</label>
                          <input {...inp} type="number" min="0" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} placeholder="0" style={{ fontSize: 12, padding: '8px', textAlign: 'right', width: '100%' }} />
                        </div>
                        <div>
                          <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Rate (₹)</label>
                          <input {...inp} type="number" min="0" value={item.rate} onChange={e => setItem(i, 'rate', e.target.value)} placeholder="0" style={{ fontSize: 12, padding: '8px', textAlign: 'right', width: '100%' }} />
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <label style={{ fontSize: 9, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', marginBottom: 3, display: 'block' }}>Amount</label>
                          <div style={{ fontSize: 12, fontWeight: 700, color: amt > 0 ? '#7C3AED' : 'var(--ink-4)', fontFamily: 'JetBrains Mono, monospace', padding: '8px 0' }}>
                            {amt > 0 ? fmtINR(amt) : '—'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr 0.8fr 0.8fr 0.8fr 1fr 32px', gap: 6, alignItems: 'center', padding: '6px 6px', borderRadius: 8, border: '1px solid var(--line)', background: '#FFFFFF' }}>
                    <input {...inp} value={item.description} onChange={e => setItem(i, 'description', e.target.value)} placeholder="Work item description" style={{ fontSize: 12, padding: '6px 10px' }} />
                    <select {...inp} value={item.category} onChange={e => setItem(i, 'category', e.target.value)} style={{ fontSize: 11, padding: '6px 8px' }}>
                      {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select {...inp} value={item.unit} onChange={e => setItem(i, 'unit', e.target.value)} style={{ fontSize: 11, padding: '6px 8px' }}>
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <input {...inp} type="number" min="0" value={item.qty} onChange={e => setItem(i, 'qty', e.target.value)} placeholder="0" style={{ fontSize: 12, padding: '6px 8px', textAlign: 'right' }} />
                    <input {...inp} type="number" min="0" value={item.rate} onChange={e => setItem(i, 'rate', e.target.value)} placeholder="0" style={{ fontSize: 12, padding: '6px 8px', textAlign: 'right' }} />
                    <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, color: amt > 0 ? '#7C3AED' : 'var(--ink-4)', fontFamily: 'JetBrains Mono, monospace' }}>
                      {amt > 0 ? fmtINR(amt) : '—'}
                    </div>
                    <button type="button" onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 16, padding: 2, borderRadius: 4 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#DC2626'} onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}>
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>

            <button type="button" onClick={addItem}
              style={{ marginTop: 8, width: '100%', padding: '8px', borderRadius: 8, border: '1.5px dashed #DDD6FE', background: '#FAFAFF', color: '#7C3AED', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif', transition: 'background 0.12s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#F5F3FF'} onMouseLeave={e => e.currentTarget.style.background = '#FAFAFF'}>
              + Add Line Item
            </button>
          </div>

          {/* Notes */}
          <div>
            <label style={L}>Notes / Remarks</label>
            <textarea className="input-dark" value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} placeholder="Scope notes, exclusions, assumptions..." />
          </div>

          {error && <div style={{ padding: '8px 12px', borderRadius: 8, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)', fontSize: 12, color: '#DC2626' }}>{error}</div>}
        </form>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, background: '#FAFAFA' }}>
          <div style={{ fontSize: 14, color: 'var(--ink-3)' }}>
            <span style={{ fontWeight: 700, color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace' }}>{fmtINR(total)}</span>
            <span style={{ fontSize: 11, marginLeft: 6 }}>total across {items.length} item{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : isEdit ? '✓ Update BOQ' : '+ Create BOQ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const L = { fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 5 };

// ── BOQ Detail View ───────────────────────────────────────────────────────────
function BOQDetail({ boq, onClose, onEdit }) {
  const total = (boq.items || []).reduce((s, it) => s + (it.quantity || it.qty || 0) * (it.rate || 0), 0);
  const completedAmt = (boq.items || []).reduce((s, it) => s + (it.quantity || it.qty || 0) * (it.rate || 0) * ((it.completionPct || 0) / 100), 0);

  const byCategory = ITEM_CATEGORIES.map(cat => ({
    cat,
    items: (boq.items || []).filter(it => it.category === cat),
    total: (boq.items || []).filter(it => it.category === cat).reduce((s, it) => s + (it.quantity || it.qty || 0) * (it.rate || 0), 0),
  })).filter(g => g.items.length > 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 740, width: '95vw', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '16px 22px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{boq.title || boq.name}</div>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>{boq.siteId?.name || boq.siteId}</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="btn-primary" onClick={onEdit} style={{ fontSize: 12, padding: '6px 12px' }}><IconEdit size={12} /> Edit</button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', fontSize: 18, padding: 4 }}>✕</button>
          </div>
        </div>

        <div style={{ overflowY: 'auto', padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Total Estimate', value: fmtINR(total), color: '#7C3AED' },
              { label: 'Completed Value', value: fmtINR(completedAmt), color: '#059669' },
              { label: 'Remaining', value: fmtINR(total - completedAmt), color: '#D97706' },
            ].map(k => (
              <div key={k.label} className="card" style={{ padding: '14px 16px', borderTop: `3px solid ${k.color}` }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: k.color, fontFamily: 'JetBrains Mono, monospace' }}>{k.value}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, marginTop: 3 }}>{k.label}</div>
              </div>
            ))}
          </div>

          {/* Items by category */}
          {byCategory.map(({ cat, items, total: catTotal }) => (
            <div key={cat} style={{ borderRadius: 10, border: '1px solid var(--line)', overflow: 'hidden' }}>
              <div style={{ padding: '10px 14px', background: '#F8F9FC', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: CAT_COLORS[cat], textTransform: 'capitalize' }}>● {cat}</span>
                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: 'var(--ink-2)' }}>{fmtINR(catTotal)}</span>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    {['Description', 'Unit', 'Qty', 'Rate', 'Amount'].map(h => (
                      <th key={h} style={{ padding: '7px 12px', textAlign: h === 'Amount' || h === 'Qty' || h === 'Rate' ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it, i) => {
                    const amt = (it.quantity || it.qty || 0) * (it.rate || 0);
                    return (
                      <tr key={i} className="table-row">
                        <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--ink)' }}>{it.description || '—'}</td>
                        <td style={{ padding: '10px 12px', fontSize: 11, color: 'var(--ink-3)' }}>{it.unit}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>{it.quantity !== undefined ? it.quantity : it.qty || 0}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, textAlign: 'right', fontFamily: 'JetBrains Mono, monospace' }}>₹{(it.rate || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '10px 12px', fontSize: 12, textAlign: 'right', fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', color: '#7C3AED' }}>{fmtINR(amt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}

          {boq.notes && (
            <div style={{ padding: '12px 16px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
              <span style={{ fontWeight: 700 }}>Notes: </span>{boq.notes}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main BOQPage ──────────────────────────────────────────────────────────────
export default function BOQPage({ mobileAddTick = 0 }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: boqs = [], isLoading: loadingBOQ } = useQuery({ queryKey: ['boqs'], queryFn: () => getBOQs(), staleTime: 60_000 });
  const { data: sites = [] } = useQuery({ queryKey: ['sites'], queryFn: getSites, staleTime: 120_000 });

  useEffect(() => { if (mobileAddTick > 0) setShowAdd(true); }, [mobileAddTick]);

  function refresh() { qc.invalidateQueries({ queryKey: ['boqs'] }); }

  const filtered = boqs.filter(b => {
    const q = search.toLowerCase();
    return !q || (b.title || b.name || '').toLowerCase().includes(q) || (b.siteId?.name || '').toLowerCase().includes(q);
  });

  const totalEstimate = boqs.reduce((s, b) => s + ((b.items || []).reduce((si, it) => si + (it.quantity || it.qty || 0) * (it.rate || 0), 0)), 0);

  return (
    <>
      {/* KPI cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 16 }}>
        <div className="card kpi-accent-purple" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace' }}>{boqs.length}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, marginTop: 3 }}>Total BOQs</div>
        </div>
        <div className="card kpi-accent-blue" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#2563EB', fontFamily: 'JetBrains Mono, monospace' }}>{fmtINR(totalEstimate)}</div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, marginTop: 3 }}>Total Estimate Value</div>
        </div>
        <div className="card kpi-accent-green" style={{ padding: '16px 18px' }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#059669', fontFamily: 'JetBrains Mono, monospace' }}>
            {boqs.reduce((s, b) => s + (b.items?.length || 0), 0)}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 600, marginTop: 3 }}>Total Line Items</div>
        </div>
      </div>

      {/* Main card */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>BOQ / Estimates</span>
            <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-4)', fontWeight: 600 }}>({filtered.length})</span>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)', pointerEvents: 'none' }}>
              <IconSearch size={12} />
            </span>
            <input className="input-dark" placeholder="Search BOQ or site..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200, paddingLeft: 28, fontSize: 12 }} />
          </div>
          <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ fontSize: 12 }}>+ New BOQ</button>
        </div>

        {/* Grid of BOQ cards */}
        <div style={{ padding: 16 }}>
          {loadingBOQ ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>No BOQs yet</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 20 }}>Create your first Bill of Quantities to estimate project costs</div>
              <button className="btn-primary" onClick={() => setShowAdd(true)}>+ Create First BOQ</button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {filtered.map(boq => {
                const total = (boq.items || []).reduce((s, it) => s + (it.quantity || it.qty || 0) * (it.rate || 0), 0);
                const itemCount = boq.items?.length || 0;
                const siteName = boq.siteId?.name || boq.siteId || 'No site';

                // Category breakdown
                const catTotals = ITEM_CATEGORIES.map(cat => ({
                  cat,
                  total: (boq.items || []).filter(it => it.category === cat).reduce((s, it) => s + (it.quantity || it.qty || 0) * (it.rate || 0), 0),
                })).filter(c => c.total > 0);

                return (
                  <div key={boq._id} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(124,58,237,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
                    onClick={() => setViewTarget(boq)}>
                    {/* Purple top bar */}
                    <div style={{ height: 4, background: 'linear-gradient(90deg, #7C3AED, #5B21B6)' }} />
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 2 }}>{boq.title || boq.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>📍 {siteName}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                          <button className="btn-ghost" style={{ padding: '4px 7px', color: '#7C3AED' }} onClick={() => { setEditTarget(boq); }} title="Edit"><IconEdit size={12} /></button>
                          <button className="btn-ghost" style={{ padding: '4px 7px', color: '#DC2626' }} onClick={() => setDeleteTarget(boq)} title="Delete"><IconTrash size={12} /></button>
                        </div>
                      </div>

                      <div style={{ fontSize: 20, fontWeight: 800, color: '#7C3AED', fontFamily: 'JetBrains Mono, monospace', marginBottom: 4 }}>{fmtINR(total)}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 10 }}>{itemCount} line item{itemCount !== 1 ? 's' : ''}</div>

                      {/* Category mini-bars */}
                      {catTotals.length > 0 && total > 0 && (
                        <div>
                          <div style={{ display: 'flex', height: 6, borderRadius: 999, overflow: 'hidden', gap: 1, marginBottom: 6 }}>
                            {catTotals.map(({ cat, total: ct }) => (
                              <div key={cat} style={{ flex: ct / total, background: CAT_COLORS[cat], minWidth: 4 }} title={`${cat}: ${fmtINR(ct)}`} />
                            ))}
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 8px' }}>
                            {catTotals.map(({ cat }) => (
                              <span key={cat} style={{ fontSize: 9, fontWeight: 700, color: CAT_COLORS[cat], display: 'flex', alignItems: 'center', gap: 3, textTransform: 'capitalize' }}>
                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: CAT_COLORS[cat], display: 'inline-block' }} />{cat}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showAdd && <BOQModal sites={sites} onClose={() => setShowAdd(false)} onSaved={refresh} />}
      {editTarget && <BOQModal boq={editTarget} sites={sites} onClose={() => setEditTarget(null)} onSaved={refresh} />}
      {viewTarget && (
        <BOQDetail
          boq={viewTarget}
          onClose={() => setViewTarget(null)}
          onEdit={() => { setEditTarget(viewTarget); setViewTarget(null); }}
        />
      )}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal" style={{ maxWidth: 360, padding: 28, textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🗑️</div>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Delete BOQ?</div>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 22 }}>
              "<strong>{deleteTarget.title || deleteTarget.name}</strong>" and all its line items will be permanently deleted.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="btn-primary" style={{ background: 'linear-gradient(135deg, #DC2626, #991B1B)' }} disabled={deleting}
                onClick={async () => { setDeleting(true); await deleteBOQ(deleteTarget._id); refresh(); setDeleteTarget(null); setDeleting(false); }}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
