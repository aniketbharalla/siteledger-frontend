import React from 'react';
import {
  IconDashboard, IconSites, IconInvestors,
  IconExpenses, IconPayments, IconReports,
  IconX, IconPeople,
} from './icons';
import { useAuth } from '../context/AuthContext';

// ─── Icons for new pages ──────────────────────────────────────────────────────
function IconBOQ({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="13" y2="16" />
    </svg>
  );
}

function IconVendor({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconGST({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
      <line x1="7" y1="15" x2="7.01" y2="15" strokeWidth="2.5" />
      <line x1="11" y1="15" x2="15" y2="15" />
    </svg>
  );
}

// ─── Nav Config ───────────────────────────────────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'MAIN',
    items: [
      { id: 'dashboard', label: 'Dashboard', Icon: IconDashboard },
      { id: 'sites',     label: 'Sites',     Icon: IconSites },
    ],
  },
  {
    label: 'FINANCE',
    items: [
      { id: 'expenses',  label: 'Expenses',  Icon: IconExpenses },
      { id: 'payments',  label: 'Payments',  Icon: IconPayments },
      { id: 'investors', label: 'Investors', Icon: IconInvestors },
      { id: 'gst',       label: 'GST & Tax', Icon: IconGST },
    ],
  },
  {
    label: 'PROJECT',
    items: [
      { id: 'boq',     label: 'BOQ / Estimates', Icon: IconBOQ },
      { id: 'vendors', label: 'Vendors',          Icon: IconVendor },
      { id: 'reports', label: 'Reports',          Icon: IconReports },
    ],
  },
  {
    label: 'SETTINGS',
    items: [
      { id: 'members', label: 'Members', Icon: IconPeople },
    ],
  },
];

// ─── Nav Item ─────────────────────────────────────────────────────────────────
function NavItem({ item, active, onClick }) {
  const { label, Icon } = item;
  return (
    <button
      onClick={() => onClick(item.id)}
      className={`nav-item${active ? ' active' : ''}`}
      style={{ position: 'relative' }}
    >
      {/* Active indicator bar */}
      {active && (
        <span
          style={{
            position: 'absolute',
            left: 0,
            top: '20%',
            height: '60%',
            width: 3,
            borderRadius: '0 3px 3px 0',
            background: 'var(--accent-purple)',
          }}
        />
      )}
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: active ? 'rgba(124,58,237,0.12)' : 'transparent',
          color: active ? '#7C3AED' : 'var(--ink-3)',
          transition: 'all 0.12s',
        }}
      >
        <Icon size={15} />
      </span>
      <span style={{
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? '#5B21B6' : 'var(--ink-3)',
        transition: 'color 0.12s',
      }}>
        {label}
      </span>
    </button>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export default function Sidebar({ page, setPage, mobile = false, onClose }) {
  const { user, logout } = useAuth();
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  const isMember = user?.role === 'member';

  // Members can only see Expenses
  const sections = isMember
    ? [{ label: 'MAIN', items: [{ id: 'expenses', label: 'Expenses', Icon: IconExpenses }] }]
    : NAV_SECTIONS;

  return (
    <div
      style={{
        width: mobile ? '100%' : 230,
        height: '100%',
        background: '#FFFFFF',
        borderRight: '1px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 10px',
        overflowY: 'auto',
        flexShrink: 0,
      }}
    >
      {/* ── Logo ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 28,
        paddingLeft: 6,
        paddingRight: 4,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Logo mark */}
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 9,
            background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: 13,
            color: '#fff',
            letterSpacing: '-0.5px',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(124,58,237,0.35)',
          }}>
            SL
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', letterSpacing: '0.02em' }}>
              SiteLedger
            </div>
            <div style={{ fontSize: 10, color: 'var(--ink-4)', letterSpacing: '0.02em', marginTop: 1 }}>
              {user?.orgName || 'Real Estate ERP'}
            </div>
          </div>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', padding: 4, borderRadius: 6 }}
          >
            <IconX size={16} />
          </button>
        )}
      </div>

      {/* ── Nav Sections ── */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {sections.map(section => (
          <div key={section.label}>
            <div style={{
              fontSize: 10,
              fontWeight: 700,
              color: 'var(--ink-4)',
              letterSpacing: '0.1em',
              paddingLeft: 12,
              marginBottom: 4,
            }}>
              {section.label}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {section.items.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  active={page === item.id}
                  onClick={(id) => { setPage(id); if (onClose) onClose(); }}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Invite Code ── */}
      {user?.inviteCode && (
        <div style={{
          margin: '12px 4px 8px',
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.15)',
        }}>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 3 }}>Invite Code</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 800, color: '#7C3AED', letterSpacing: '0.15em' }}>
              {user.inviteCode}
            </div>
            <button
              title="Copy"
              onClick={() => navigator.clipboard?.writeText(user.inviteCode)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: 3, borderRadius: 5, display: 'flex' }}
              onMouseEnter={e => e.currentTarget.style.color = '#7C3AED'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
            </button>
          </div>
        </div>
      )}

      {/* ── User row ── */}
      <div style={{
        margin: '0 4px',
        padding: '10px 10px',
        borderRadius: 10,
        background: 'var(--bg-0)',
        border: '1px solid var(--line)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #DB2777 0%, #7C3AED 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 800,
          color: '#fff',
          flexShrink: 0,
        }}>
          {initials}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {user?.name || 'User'}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', textTransform: 'capitalize' }}>
            {user?.role || 'Owner'}
          </div>
        </div>
        <button
          onClick={logout}
          title="Logout"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--ink-4)', padding: 4, borderRadius: 6,
            display: 'flex', transition: 'color 0.12s', flexShrink: 0,
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#DC2626'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
        >
          <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M9 2h4v12H9M3 8h8M8 5l3 3-3 3"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
