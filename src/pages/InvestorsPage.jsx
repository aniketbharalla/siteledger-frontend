import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fmtINR, fmtDate, initials } from '../utils/format';
import { IconSearch, IconDownload, IconSort, IconEdit, IconTrash } from '../components/icons';
import { deleteInvestor } from '../api';
import EditInvestorModal from '../components/EditInvestorModal';
import AddInvestorModal from '../components/AddInvestorModal';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const INVESTOR_COLORS = ['#0075FF', '#FF0080', '#01B574', '#FFB547', '#582CFF', '#01B5EC'];
const SITE_COLORS = ['var(--grad-primary)', 'var(--grad-pink)', 'var(--grad-green)', 'var(--grad-amber)'];

const COLS = [
  { key: 'name',   label: 'Investor' },
  { key: 'site',   label: 'Site' },
  { key: 'amount', label: 'Amount', align: 'right' },
  { key: 'share',  label: 'Share %', align: 'right' },
  { key: 'date',   label: 'Date' },
];

function exportCSV(rows) {
  const header = ['Investor','Site','Amount','Share %','Date'].join(',');
  const lines = rows.map(r => [r.name, r.siteName || r.siteId, r.amount, r.share, fmtDate(r.date)].join(','));
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'investors.csv'; a.click();
}

export default function InvestorsPage({ stats, sites = [] }) {
  const { filteredInvestors } = stats;
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'amount', dir: 'desc' });
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const siteMap = useMemo(() => {
    const m = {};
    sites.forEach((s, i) => { m[s._id] = { ...s, colorIdx: i }; });
    return m;
  }, [sites]);

  const enriched = useMemo(() => filteredInvestors.map(inv => ({
    ...inv,
    siteName: siteMap[inv.siteId?._id || inv.siteId]?.name || '—',
    siteCode: siteMap[inv.siteId?._id || inv.siteId]?.code || '—',
    siteColorIdx: siteMap[inv.siteId?._id || inv.siteId]?.colorIdx ?? 0,
  })), [filteredInvestors, siteMap]);

  const filtered = useMemo(() => {
    let arr = [...enriched];
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(i => i.name?.toLowerCase().includes(q) || i.siteName?.toLowerCase().includes(q));
    }
    arr.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === 'date') { av = new Date(av); bv = new Date(bv); }
      if (sort.key === 'amount' || sort.key === 'share') { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc' ? (av < bv ? -1 : av > bv ? 1 : 0) : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return arr;
  }, [enriched, search, sort]);

  const total = filtered.reduce((s, i) => s + (i.amount || 0), 0);

  function toggleSort(key) {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
  }

  function handleSaved() {
    qc.invalidateQueries({ queryKey: ['investors'] });
  }

  return (
    <>
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Investors</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>({filtered.length})</span>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
            <IconSearch size={13} />
          </span>
          <input
            className="input-dark"
            placeholder="Search investor or site..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: 220, paddingLeft: 28, fontSize: 12 }}
          />
        </div>
        <button className="btn-ghost" style={{ padding: '7px 10px' }} onClick={() => exportCSV(filtered)}>
          <IconDownload size={13} /> CSV
        </button>
        <button className="btn-primary" style={{ padding: '7px 12px', fontSize: 12 }} onClick={() => setShowAdd(true)}>
          + Add Investor
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {COLS.map(col => (
                <th key={col.key} onClick={() => toggleSort(col.key)}
                  style={{ padding: '10px 16px', textAlign: col.align || 'left', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    <IconSort size={11} style={{ opacity: sort.key === col.key ? 1 : 0.3 }} />
                  </span>
                </th>
              ))}
              <th style={{ padding: '10px 16px', fontSize: 11, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap', textAlign: 'center' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                  No investors found
                </td>
              </tr>
            ) : filtered.map((inv, i) => (
              <tr key={inv._id || i} className="table-row">
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: INVESTOR_COLORS[i % INVESTOR_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>
                      {initials(inv.name)}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600 }}>{inv.name}</span>
                  </div>
                </td>
                <td style={{ padding: '13px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: 6, background: SITE_COLORS[inv.siteColorIdx % SITE_COLORS.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8, fontWeight: 800, flexShrink: 0 }}>
                      {inv.siteCode?.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{inv.siteName}</div>
                      <span className="chip chip-blue" style={{ fontSize: 10 }}>{inv.siteCode}</span>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                  <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>{fmtINR(inv.amount)}</span>
                </td>
                <td style={{ padding: '13px 16px', textAlign: 'right' }}>
                  <span className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', background: 'rgba(0,117,255,0.1)', padding: '3px 8px', borderRadius: 999 }}>
                    {(inv.share || 0).toFixed(1)}%
                  </span>
                </td>
                <td style={{ padding: '13px 16px', fontSize: 12, color: 'var(--ink-2)' }}>
                  {fmtDate(inv.date)}
                </td>
                <td style={{ padding: '13px 16px', textAlign: 'center' }}>
                  <div style={{ display: 'inline-flex', gap: 6 }}>
                    <button
                      className="btn-ghost"
                      style={{ padding: '6px 8px', color: 'var(--accent-blue)' }}
                      onClick={() => setEditTarget(inv)}
                      title="Edit"
                    >
                      <IconEdit size={13} />
                    </button>
                    <button
                      className="btn-ghost"
                      style={{ padding: '6px 8px', color: '#E31A1A' }}
                      onClick={() => setDeleteTarget(inv)}
                      title="Delete"
                    >
                      <IconTrash size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between' }}>
        <span>{filtered.length} investors</span>
        <span>Total: <span className="num" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{fmtINR(total)}</span></span>
      </div>

      </div>

      {showAdd && (
        <AddInvestorModal
          sites={sites}
          onClose={() => setShowAdd(false)}
          onSaved={handleSaved}
        />
      )}

      {editTarget && (
        <EditInvestorModal
          investor={editTarget}
          sites={sites}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteModal
          title="Delete Investor"
          message={`Are you sure you want to delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={() => deleteInvestor(deleteTarget._id).then(handleSaved)}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
