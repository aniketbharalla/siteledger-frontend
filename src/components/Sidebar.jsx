import React from 'react';
import {
  IconDashboard, IconSites, IconInvestors,
  IconExpenses, IconPayments, IconReports,
  IconHelp, IconX, IconPeople,
} from './icons';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
  { id: 'sites',     label: 'Sites',     Icon: IconSites },
  { id: 'investors', label: 'Investors', Icon: IconInvestors },
  { id: 'expenses',  label: 'Expenses',  Icon: IconExpenses },
  { id: 'payments',  label: 'Payments',  Icon: IconPayments },
  { id: 'reports',   label: 'Reports',   Icon: IconReports },
  { id: 'members',   label: 'Members',   Icon: IconPeople },
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

  const isMember = user?.role === 'member';

  // Members only see Expenses; members page only for owner/admin
  const visibleNav = isMember
    ? NAV_ITEMS.filter(i => i.id === 'expenses')
    : NAV_ITEMS;
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
              {user?.orgName || 'Construction Finance'}
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
        {visibleNav.map(item => (
          <NavItem
            key={item.id}
            item={item}
            active={page === item.id}
            onClick={(id) => { setPage(id); if (onClose) onClose(); }}
          />
        ))}
      </nav>

      {/* Help card */}
   

      {/* User avatar + invite code for owners */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          marginTop: 16,
          gap: 8,
        }}
      >
        {/* Invite code chip — visible to owner/admin */}
        {user?.inviteCode && (
          <div style={{
            padding: '8px 12px',
            borderRadius: 10,
            background: 'rgba(0,117,255,0.08)',
            border: '1px solid rgba(0,117,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invite Code</div>
              <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 800, color: 'var(--accent-blue)', letterSpacing: '0.15em' }}>
                {user.inviteCode}
              </div>
            </div>
            <button
              title="Copy invite code"
              onClick={() => navigator.clipboard?.writeText(user.inviteCode)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-3)', padding: 4, borderRadius: 6, display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
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
        </div>  {/* end user row */}
      </div>  {/* end bottom section */}
    </div>
  );
}
