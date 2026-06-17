import React, { useState } from 'react';
import SiteSwitcher from './SiteSwitcher';
import { IconSearch, IconBell, IconPlus, IconDownload, IconMenu } from './icons';

const RANGES = ['7D', '30D', 'QTD', 'YTD', 'All'];

const PAGE_LABELS = {
  dashboard: 'Dashboard',
  sites:     'Sites',
  investors: 'Investors',
  expenses:  'Expenses',
  payments:  'Payments',
  reports:   'Reports',
  members:   'Members',
  boq:       'BOQ / Estimates',
  vendors:   'Vendors',
  gst:       'GST & Tax',
};

const ADD_LABELS = {
  expenses:  'Add Expense',
  sites:     'Add Site',
  investors: 'Add Investor',
  payments:  'Add Payment',
  members:   'Add Member',
  boq:       'New BOQ',
  vendors:   'Add Vendor',
};

export default function Topbar({
  page,
  sites,
  selectedIds,
  setSelectedIds,
  range,
  setRange,
  onLogExpense,
  onMenuClick,
  isMobile,
  isMember = false,
  onAdd,
}) {
  const [searchVal, setSearchVal] = useState('');

  function handleMobileAdd() {
    if (onAdd) onAdd(page);
    else onLogExpense();
  }

  const addLabel = ADD_LABELS[page] || 'Add';
  const pageLabel = PAGE_LABELS[page] || page;

  return (
    <header
      style={{
        background: '#FFFFFF',
        borderBottom: '1px solid var(--line)',
        padding: isMobile ? '0 12px' : '0 24px',
        height: 60,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexShrink: 0,
        zIndex: 100,
        position: 'sticky',
        top: 0,
        boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
      }}
    >
      {/* ── Mobile ── */}
      {isMobile ? (
        <>
          <button
            onClick={onMenuClick}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4, display: 'flex', flexShrink: 0 }}
          >
            <IconMenu size={20} />
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              SiteLedger
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)' }}>{pageLabel}</div>
          </div>

          {sites?.length > 0 && (
            <SiteSwitcher
              sites={sites}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
            />
          )}

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4, display: 'flex' }}>
              <IconBell size={18} />
            </button>
            <div style={{ position: 'absolute', top: 5, right: 4, width: 6, height: 6, borderRadius: '50%', background: '#DC2626' }} />
          </div>
        </>
      ) : (
        /* ── Desktop ── */
        <>
          {/* Page title + breadcrumb */}
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-4)', marginBottom: 1 }}>
              Pages / <span style={{ color: 'var(--ink-3)' }}>{pageLabel}</span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{pageLabel}</div>
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
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-4)' }}>
              <IconSearch size={13} />
            </span>
            <input
              className="input-dark"
              placeholder="Search..."
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              style={{ width: 170, paddingLeft: 30, fontSize: 12, padding: '7px 10px 7px 30px' }}
            />
          </div>

          {/* Date range buttons */}
          <div style={{ display: 'flex', gap: 3 }}>
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
          <button className="btn-ghost" style={{ padding: '7px 12px', fontSize: 12 }}>
            <IconDownload size={13} />
            Export
          </button>

          {/* Primary action */}
          {!isMember && (
            <button className="btn-primary" onClick={onLogExpense} style={{ fontSize: 12 }}>
              <IconPlus size={13} />
              Log Expense
            </button>
          )}

          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button style={{
              background: 'var(--bg-0)',
              border: '1px solid var(--line-2)',
              borderRadius: 8,
              color: 'var(--ink-3)',
              cursor: 'pointer',
              padding: '7px 9px',
              display: 'flex',
              transition: 'background 0.12s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-0)'}
            >
              <IconBell size={16} />
            </button>
            <div style={{ position: 'absolute', top: 5, right: 5, width: 7, height: 7, borderRadius: '50%', background: '#DC2626', border: '1.5px solid #fff' }} />
          </div>
        </>
      )}
    </header>
  );
}
