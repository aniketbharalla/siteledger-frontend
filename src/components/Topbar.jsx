import React, { useState } from 'react';
import SiteSwitcher from './SiteSwitcher';
import { IconSearch, IconBell, IconPlus, IconDownload, IconMenu } from './icons';

const RANGES = ['7D', '30D', 'QTD', 'YTD', 'All'];

const PAGE_LABELS = {
  dashboard: 'Dashboard',
  sites: 'Sites',
  investors: 'Investors',
  expenses: 'Expenses',
  payments: 'Payments',
  reports: 'Reports',
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
}) {
  const [searchVal, setSearchVal] = useState('');

  return (
    <header
      style={{
        background: 'rgba(11,21,55,0.85)',
        borderBottom: '1px solid var(--line)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: isMobile ? '0 16px' : '0 28px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        flexShrink: 0,
        zIndex: 100,
        position: 'sticky',
        top: 0,
      }}
    >
      {/* Mobile: hamburger + logo */}
      {isMobile ? (
        <>
          <button
            onClick={onMenuClick}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-2)', cursor: 'pointer', padding: 4, display: 'flex' }}
          >
            <IconMenu size={22} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.05em' }}>SITE LEDGER</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{PAGE_LABELS[page] || page}</div>
          </div>
          {/* Log expense (compact) */}
          <button
            className="btn-primary"
            onClick={onLogExpense}
            style={{ padding: '7px 12px', fontSize: 12 }}
          >
            <IconPlus size={13} />
            Log
          </button>
          {/* Bell */}
          <div style={{ position: 'relative' }}>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--ink-2)', cursor: 'pointer', padding: 4 }}>
              <IconBell size={20} />
            </button>
            <div style={{ position: 'absolute', top: 4, right: 4, width: 7, height: 7, borderRadius: '50%', background: 'var(--accent-pink)', border: '1px solid var(--bg-2)' }} />
          </div>
        </>
      ) : (
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
