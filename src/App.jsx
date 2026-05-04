import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import AddExpenseModal from './components/AddExpenseModal';
import TweaksPanel from './components/TweaksPanel';

import DashboardPage from './pages/DashboardPage';
import SitesPage from './pages/SitesPage';
import InvestorsPage from './pages/InvestorsPage';
import ExpensesPage from './pages/ExpensesPage';
import PaymentsPage from './pages/PaymentsPage';
import ReportsPage from './pages/ReportsPage';
import MembersPage from './pages/MembersPage';

import { useStats } from './hooks/useStats';
import { getSites, getInvestors, getExpenses, getPayments } from './api';

import {
  IconDashboard, IconSites, IconInvestors,
  IconExpenses, IconPayments, IconReports,
  IconSettings, IconPeople,
} from './components/icons';

// ── Local storage helpers ──────────────────────────────
function loadLS(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function saveLS(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// ── Loading skeleton ───────────────────────────────────
function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className="card"
          style={{ height: 120, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
              animation: 'shimmer 1.4s infinite',
            }}
          />
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ── Error state ─────────────────────────────────────────
function ErrorState({ error, refetch }) {
  return (
    <div
      className="card"
      style={{
        padding: '48px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: 'rgba(227,26,26,0.15)',
          border: '1px solid rgba(227,26,26,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 24,
        }}
      >
        ⚠
      </div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Failed to load data</div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{error?.message || 'Unknown error'}</div>
      </div>
      <button className="btn-primary" onClick={refetch}>Retry</button>
    </div>
  );
}

// ── Mobile bottom tab bar ───────────────────────────────
const BOTTOM_TABS = [
  { id: 'dashboard',  label: 'Home',      Icon: IconDashboard },
  { id: 'sites',      label: 'Sites',     Icon: IconSites },
  { id: 'investors',  label: 'Investors', Icon: IconInvestors },
  { id: 'expenses',   label: 'Expenses',  Icon: IconExpenses },
  { id: 'payments',   label: 'Payments',  Icon: IconPayments },
  { id: 'reports',    label: 'Reports',   Icon: IconReports },
  { id: 'members',    label: 'Members',   Icon: IconPeople },
];

const MEMBER_TABS = [
  { id: 'expenses', label: 'Expenses', Icon: IconExpenses },
];

function BottomNav({ page, setPage, isMember = false }) {
  const tabs = isMember ? MEMBER_TABS : BOTTOM_TABS;
  return (
    <nav className="bottom-nav" style={{ display: 'flex', height: 62 }}>
      {tabs.map(tab => {
        const active = page === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setPage(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 3,
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: active ? 'var(--accent-blue)' : 'var(--ink-3)',
              transition: 'color 0.15s',
              padding: '8px 2px',
              minWidth: 0,
            }}
          >
            <tab.Icon size={18} />
            <span style={{ fontSize: 8, fontWeight: active ? 700 : 500, letterSpacing: '0.02em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── Auth gate ───────────────────────────────────────────
function AuthGate() {
  const [screen, setScreen] = useState('login'); // 'login' | 'signup'

  if (screen === 'signup') {
    return (
      <SignupPage
        onSwitchToLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <LoginPage
      onSwitchToSignup={() => setScreen('signup')}
    />
  );
}

// ── Main App ────────────────────────────────────────────
export default function App() {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <AuthGate />;

  const isMember = user?.role === 'member';

  const [page, setPage] = useState(() => {
    const saved = loadLS('sl_page', 'dashboard');
    // Members always start on expenses
    return isMember ? 'expenses' : saved;
  });
  const [selectedIds, setSelectedIds] = useState(() => loadLS('sl_sites', []));
  const [range, setRange] = useState(() => loadLS('sl_range', '30D'));
  const [donutView, setDonutView] = useState(() => loadLS('sl_donut', 'pl'));
  const [tweaks, setTweaks] = useState(() => loadLS('sl_tweaks', { hideSidebar: false, compactCards: false, monoMode: false }));
  const [showModal, setShowModal] = useState(false);
  const [showTweaks, setShowTweaks] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  // Triggers the add modal in the current page on mobile
  const [mobileAddTick, setMobileAddTick] = useState(0);

  const qc = useQueryClient();

  // Persist state
  useEffect(() => { saveLS('sl_page', page); }, [page]);
  useEffect(() => { saveLS('sl_sites', selectedIds); }, [selectedIds]);
  useEffect(() => { saveLS('sl_range', range); }, [range]);
  useEffect(() => { saveLS('sl_donut', donutView); }, [donutView]);
  useEffect(() => { saveLS('sl_tweaks', tweaks); }, [tweaks]);

  // Responsive
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Data queries
  const {
    data: sites = [],
    isLoading: loadingSites,
    error: errorSites,
    refetch: refetchSites,
  } = useQuery({ queryKey: ['sites'], queryFn: getSites, staleTime: 60_000 });

  const {
    data: investors = [],
    isLoading: loadingInvestors,
  } = useQuery({ queryKey: ['investors'], queryFn: () => getInvestors(), staleTime: 60_000 });

  const {
    data: expenses = [],
    isLoading: loadingExpenses,
  } = useQuery({ queryKey: ['expenses'], queryFn: () => getExpenses(), staleTime: 30_000 });

  const {
    data: payments = [],
    isLoading: loadingPayments,
  } = useQuery({ queryKey: ['payments'], queryFn: () => getPayments(), staleTime: 30_000 });

  const isLoading = loadingSites || loadingInvestors || loadingExpenses || loadingPayments;
  const mainError = errorSites;

  // Aggregate stats
  const stats = useStats({ sites, expenses, investors, payments, selectedIds });

  const handleSaved = useCallback(() => {
    qc.invalidateQueries({ queryKey: ['expenses'] });
    qc.invalidateQueries({ queryKey: ['sites'] });
  }, [qc]);

  // Render the current page
  function renderPage() {
    if (isLoading) return <LoadingState />;
    if (mainError) return <ErrorState error={mainError} refetch={refetchSites} />;

    switch (page) {
      case 'dashboard':
        return (
          <DashboardPage
            stats={stats}
            donutView={donutView}
            setDonutView={setDonutView}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            isMobile={isMobile}
          />
        );
      case 'sites':
        return (
          <SitesPage
            stats={stats}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            mobileAddTick={mobileAddTick}
          />
        );
      case 'investors':
        return <InvestorsPage stats={stats} sites={sites} mobileAddTick={mobileAddTick} />;
      case 'expenses':
        return <ExpensesPage stats={stats} sites={sites} mobileAddTick={mobileAddTick} />;
      case 'payments':
        return <PaymentsPage stats={stats} sites={sites} mobileAddTick={mobileAddTick} />;
      case 'reports':
        return <ReportsPage stats={stats} />;
      case 'members':
        if (isMember) return null;
        return <MembersPage mobileAddTick={mobileAddTick} />;
      default:
        return null;
    }
  }

  const showSidebar = !isMobile && !tweaks.hideSidebar;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        background: 'var(--grad-page)',
      }}
    >
      {/* Desktop sidebar */}
      {showSidebar && (
        <Sidebar page={page} setPage={setPage} />
      )}

      {/* Mobile drawer overlay */}
      {isMobile && drawerOpen && (
        <>
          <div className="drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <div className="drawer">
            <Sidebar page={page} setPage={setPage} mobile={true} onClose={() => setDrawerOpen(false)} />
          </div>
        </>
      )}

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
        {/* Topbar */}
        <Topbar
          page={page}
          sites={sites}
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          range={range}
          setRange={setRange}
          onLogExpense={() => setShowModal(true)}
          onMenuClick={() => setDrawerOpen(true)}
          isMobile={isMobile}
          isMember={isMember}
          onAdd={(p) => {
              if (p === 'expenses') setShowModal(true);
              else setMobileAddTick(t => t + 1);
            }}
        />

        {/* Page content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px 12px 80px' : '24px 28px',
          }}
        >
          {renderPage()}
        </main>

        {/* Mobile bottom nav */}
        {isMobile && <BottomNav page={page} setPage={setPage} isMember={isMember} />}
      </div>

      {/* Tweaks FAB (desktop) */}
      {!isMobile && (
        <button
          onClick={() => setShowTweaks(v => !v)}
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 42,
            height: 42,
            borderRadius: '50%',
            background: 'var(--grad-primary)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 400,
            boxShadow: '0 8px 24px rgba(0,117,255,0.4)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <IconSettings size={18} />
        </button>
      )}

      {/* Tweaks panel */}
      {showTweaks && !isMobile && (
        <TweaksPanel
          tweaks={tweaks}
          setTweaks={setTweaks}
          onClose={() => setShowTweaks(false)}
        />
      )}

      {/* Add expense modal */}
      {showModal && (
        <AddExpenseModal
          sites={sites}
          onClose={() => setShowModal(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
