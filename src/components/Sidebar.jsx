import React from 'react';
import {
  IconDashboard, IconSites, IconInvestors,
  IconExpenses, IconPayments, IconReports,
  IconHelp, IconX,
} from './icons';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'sites',     label: 'Sites',     Icon: IconSites },
  { id: 'investors', label: 'Investors', Icon: IconInvestors },
  { id: 'expenses',  label: 'Expenses',  Icon: IconExpenses },
  { id: 'payments',  label: 'Payments',  Icon: IconPayments },
  { id: 'reports',   label: 'Reports',   Icon: IconReports },
];

function NavItem({ item, active, onClick }) {
  const { label, Icon } = item;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`nav-item w-full text-left${active ? ' active' : ''}`}
    >
      <span
        className="icon-tile"
        style={{
          background: active ? 'var(--grad-primary)' : 'rgba(255,255,255,0.05)',
          color: active ? '#fff' : 'var(--ink-3)',
        }}
      >
        <Icon size={16} />
      </span>
      <span>{label}</span>
    </button>
  );
}

export default function Sidebar({ page, setPage, mobile = false, onClose }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';
  return (
    <div
      style={{
        width: mobile ? '100%' : 240,
        height: '100%',
        background: 'rgba(11,21,55,0.98)',
        borderRight: mobile ? 'none' : '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 12px',
        gap: 4,
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* Logo + close (mobile) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingLeft: 4 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'var(--grad-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: '-0.5px',
            }}
          >
            SL
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', color: 'var(--ink)' }}>
              SITE LEDGER
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-3)', letterSpacing: '0.04em' }}>
              Construction Finance
            </div>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4 }}
          >
            <IconX size={18} />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={(id) => { setPage(id); if (onClose) onClose(); }}
          />
        ))}
      </nav>

      {/* Help card */}
      <div
        style={{
          background: 'var(--grad-primary)',
          borderRadius: 16,
          padding: '16px 14px',
          marginTop: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute', top: -20, right: -20,
            width: 80, height: 80,
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
          }}
        />
        <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>Need Help?</div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, marginBottom: 10 }}>
          Check our docs for guides and FAQs
        </div>
        <a
          href="#"
          style={{
            display: 'inline-block',
            background: '#fff',
            color: '#0075FF',
            fontSize: 11,
            fontWeight: 700,
            padding: '5px 12px',
            borderRadius: 8,
            textDecoration: 'none',
          }}
        >
          View Docs
        </a>
      </div>

      {/* User avatar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginTop: 16,
          padding: '10px 8px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--line)',
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: 'var(--grad-pink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 800,
            flexShrink: 0,
          }}
        >
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{user?.role || 'Owner'}</div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-3)', padding: 4, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.15s',
            flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-pink)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 2h4v12H9M3 8h8M8 5l3 3-3 3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
