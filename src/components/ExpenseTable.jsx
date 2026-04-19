import React, { useState, useMemo } from 'react';
import { fmtINR, fmtDate } from '../utils/format';
import { IconSearch, IconDownload, IconSort } from './icons';

const CATS = ['All', 'material', 'labor', 'misc'];

const CAT_CHIP = {
  material: 'chip-pink',
  labor: 'chip-blue',
  misc: 'chip-amber',
};

const STATUS_CHIP = {
  paid: 'chip-green',
  pending: 'chip-amber',
};

const COLS = [
  { key: 'name',     label: 'Item' },
  { key: 'category', label: 'Category' },
  { key: 'vendor',   label: 'Vendor' },
  { key: 'amount',   label: 'Amount', align: 'right' },
  { key: 'date',     label: 'Date' },
  { key: 'status',   label: 'Status', align: 'center' },
];

function exportCSV(rows) {
  const header = ['Item','Category','Vendor','Amount','Date','Status'].join(',');
  const lines = rows.map(r =>
    [r.name, r.category, r.vendor, r.amount, fmtDate(r.date), r.status].join(',')
  );
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = 'expenses.csv'; a.click();
}

export default function ExpenseTable({ expenses = [], compact = false }) {
  const [cat, setCat] = useState('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'date', dir: 'desc' });
  const [page, setPage] = useState(1);
  const PAGE_SIZE = compact ? 6 : 12;

  const filtered = useMemo(() => {
    let arr = [...expenses];
    if (cat !== 'All') arr = arr.filter(e => e.category === cat);
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter(e =>
        e.name?.toLowerCase().includes(q) ||
        e.vendor?.toLowerCase().includes(q)
      );
    }
    arr.sort((a, b) => {
      let av = a[sort.key], bv = b[sort.key];
      if (sort.key === 'date') { av = new Date(av); bv = new Date(bv); }
      if (sort.key === 'amount') { av = Number(av); bv = Number(bv); }
      return sort.dir === 'asc'
        ? (av < bv ? -1 : av > bv ? 1 : 0)
        : (av > bv ? -1 : av < bv ? 1 : 0);
    });
    return arr;
  }, [expenses, cat, search, sort]);

  const total = filtered.length;
  const pages = Math.ceil(total / PAGE_SIZE) || 1;
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const sum = filtered.reduce((s, e) => s + (e.amount || 0), 0);

  function toggleSort(key) {
    setSort(prev => ({ key, dir: prev.key === key && prev.dir === 'asc' ? 'desc' : 'asc' }));
    setPage(1);
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Expense Ledger</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>({total})</span>
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {CATS.map(c => (
            <button
              key={c}
              onClick={() => { setCat(c); setPage(1); }}
              style={{
                padding: '4px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                border: `1px solid ${cat === c ? 'transparent' : 'var(--line)'}`,
                background: cat === c ? 'var(--grad-primary)' : 'transparent',
                color: cat === c ? '#fff' : 'var(--ink-3)',
                cursor: 'pointer',
                transition: 'all 0.15s',
                fontFamily: 'inherit',
              }}
            >
              {c === 'All' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Search */}
        {!compact && (
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
              <IconSearch size={13} />
            </span>
            <input
              className="input-dark"
              placeholder="Search item or vendor..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ width: 200, paddingLeft: 28, fontSize: 12 }}
            />
          </div>
        )}

        <button className="btn-ghost" style={{ padding: '7px 10px' }} onClick={() => exportCSV(filtered)}>
          <IconDownload size={13} />
          {!compact && 'CSV'}
        </button>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {COLS.map(col => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  style={{
                    padding: '10px 16px',
                    textAlign: col.align || 'left',
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--ink-3)',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    userSelect: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.label}
                    <IconSort size={11} style={{ opacity: sort.key === col.key ? 1 : 0.3 }} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                  No expenses found
                </td>
              </tr>
            ) : slice.map(exp => (
              <tr key={exp._id} className="table-row">
                <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 500, maxWidth: 180 }}>
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {exp.name}
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span className={`chip ${CAT_CHIP[exp.category] || 'chip-gray'}`}>
                    {exp.category}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-2)' }}>
                  {exp.vendor}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <span className="num" style={{ fontSize: 13, fontWeight: 700 }}>
                    {fmtINR(exp.amount)}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--ink-2)' }}>
                  {fmtDate(exp.date)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                  <span className={`chip ${STATUS_CHIP[exp.status] || 'chip-gray'}`}>
                    {exp.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Showing <strong style={{ color: 'var(--ink-2)' }}>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</strong> of {total} •{' '}
          Total: <span className="num" style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{fmtINR(sum)}</span>
        </div>
        {!compact && pages > 1 && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className="btn-ghost"
              style={{ padding: '5px 10px', fontSize: 12 }}
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              ←
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  padding: '5px 10px',
                  fontSize: 12,
                  borderRadius: 8,
                  border: '1px solid var(--line)',
                  background: page === p ? 'var(--grad-primary)' : 'transparent',
                  color: page === p ? '#fff' : 'var(--ink-3)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 700,
                }}
              >
                {p}
              </button>
            ))}
            <button
              className="btn-ghost"
              style={{ padding: '5px 10px', fontSize: 12 }}
              disabled={page === pages}
              onClick={() => setPage(p => p + 1)}
            >
              →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
