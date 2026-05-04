import React, { useState } from 'react';
import SiteSwitcher from './SiteSwitcher';
import { IconSearch, IconBell, IconPlus, IconDownload, IconMenu } from './icons';

const RANGES = ['7D', '30D', 'QTD', 'YTD', 'All'];

const PAGE_LABELS = {
  dashboard:  'Dashboard',
  sites:      'Sites',
  investors:  'Investors',
  expenses:   'Expenses',
  payments:   'Payments',
  reports:    'Reports',
  members:    'Members',
};

// Label for the mobile add button per page
const ADD_LABELS = {
  expenses:  'Add Expense',
  sites:     'Add Site',
  investors: 'Add Investor',
  payments:  'Add Payment',
  members:   'Add Member',
};

export default function Topbar({
  page,
  sites,
  selectedIds,
  setSelectedIds,
  range,
  setRange,
  onLogExpense,   // opens add expense modal (used on all pages as fallback)
  onMenuClick,
  isMobile,
  isMember = false,
  onAdd,          // optional: page-specific add handler passed from App
}) {
  const [searchVal, setSearchVal] = useState('');

  // On mobile, the add button triggers the page's own add action.
  // Each page has its own "+ Add X" button in its header — on mobile
  // we mirror that in the topbar for quick access.
  function handleMobileAdd() {
    if (onAdd) {
      onAdd(page);
    } else {
      onLogExpense();
    }
  }

  const addLabel = ADD_LABELS[page] || 'Add';

  return (
    <header
      style={{
        background: 'rgba(11,21,55,0.85)',
        borderBottom: '1px solid var(--line)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: isMobile ? '0 12px' : '0 28px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* ── Mobile layout ── */}
      {isMobile ? (
        <>
          {/* Hamburger */}
          <button
            onClick={onMenuClick}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-2)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            <IconMenu size={22} />
          </button>

          {/* Page title */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.05em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              SITE LEDGER
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{PAGE_LABELS[page] || page}</div>
          </div>

          {/* Context-aware add button — hidden on dashboard & reports */}
          {page !== 'dashboard' && page !== 'reports' && (
            <button
              className="btn-primary"
              onClick={handleMobileAdd}
              style={{ padding: '7px 10px', fontSize: 11, gap: 4, flexShrink: 0 }}
            >
              <IconPlus size={12} />
              {addLabel}
            </button>
          )}

          {/* Bell */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-2)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <IconBell size={20} />
            </button>
            <div style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-pink)', border: '1px solid var(--bg-2)' }} />
          </div>
        </>
      ) : (
        /* ── Desktop layout ── */
        <>
          {/* Breadcrumb */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 1 }}>
              Pages / <span style={{ color: 'var(--ink-2)' }}>{PAGE_LABELS[page]}</span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1 }}>{PAGE_LABELS[page]}</div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Site switcher */}
          {sites?.length > 0 && (
            <SiteSwitcher
              sites={sites}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          )}

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}>
              <IconSearch size={14} />
            </span>
            <input
              className="input-dark"
              placeholder="Search..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              style={{ width: 180, paddingLeft: 32 }}
            />
          </div>

          {/* Range buttons */}
          <div style={{ display: 'flex', gap: 4 }}>
            {RANGES.map(r => (
              <button
                key={r}
                className={`range-btn${range === r ? ' active' : ''}`}
                onClick={() => setRange(r)}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Export */}
          <button className="btn-ghost" style={{ padding: '8px 12px' }}>
            <IconDownload size={14} />
            Export
          </button>

          {/* Log expense */}
          <button className="btn-primary" onClick={onLogExpense}>
            <IconPlus size={14} />
            Log expense
          </button>

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line)', borderRadius: 10, color: 'var(--ink-2)', cursor: 'pointer', padding: '8px 10px', display: 'flex' }}>
              <IconBell size={18} />
            </button>
            <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-pink)', border: '1.5px solid var(--bg-2)' }} />
          </div>
        </>
      )}
    </header>
  );
}
