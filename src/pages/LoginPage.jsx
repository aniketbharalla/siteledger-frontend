import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid var(--line-2)',
  borderRadius: 12,
  padding: '11px 14px',
  fontSize: 14,
  color: 'white',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};
const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--ink-2)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};
const btnStyle = {
  border: 'none', borderRadius: 12, padding: '12px 20px',
  fontSize: 14, fontWeight: 700, color: 'white',
  cursor: 'pointer', width: '100%', fontFamily: 'inherit',
  transition: 'opacity 0.15s, transform 0.15s',
};

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,117,255,0.4)' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: 'white' }}>SL</span>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', letterSpacing: '0.04em' }}>SITE LEDGER</div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>Construction Finance</div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(227,26,26,0.12)', border: '1px solid rgba(227,26,26,0.3)', fontSize: 13, color: '#ff6b6b' }}>
      {msg}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required style={inputStyle}
        onFocus={e => e.target.style.borderColor = 'var(--accent-cyan)'}
        onBlur={e => e.target.style.borderColor = 'var(--line-2)'}
      />
    </div>
  );
}

// ── Portal selector ───────────────────────────────────────────────────────────
function PortalSelect({ onSelect }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Logo />
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>Choose your portal to continue</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Admin / Org portal */}
          <button
            onClick={() => onSelect('admin')}
            style={{
              background: 'var(--grad-card)',
              border: '1px solid var(--line-2)',
              borderRadius: 16,
              padding: '20px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              transition: 'border-color 0.15s, transform 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,117,255,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 9h6M9 12h6M9 15h4"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Organisation / Admin</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>Full dashboard access — manage sites, expenses, investors & payments</div>
            </div>
            <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Member portal */}
          <button
            onClick={() => onSelect('member')}
            style={{
              background: 'var(--grad-card)',
              border: '1px solid var(--line-2)',
              borderRadius: 16,
              padding: '20px 24px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              transition: 'border-color 0.15s, transform 0.15s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(1,181,116,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-2)'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--grad-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Member</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>Log and view expenses for your assigned organisation</div>
            </div>
            <svg style={{ marginLeft: 'auto', flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 11, color: 'var(--ink-3)' }}>© 2026 SiteLedger · All figures in Indian Rupees</p>
      </div>
    </div>
  );
}

// ── Admin / Org login ─────────────────────────────────────────────────────────
function AdminLogin({ onBack, onSwitch }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); }
    catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Logo />
        <div className="card" style={{ padding: '32px 28px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,117,255,0.12)', border: '1px solid rgba(0,117,255,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>
              Organisation / Admin
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>Sign in</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>Access your organisation dashboard.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <ErrorBox msg={error} />
            <button type="submit" disabled={loading} style={{ ...btnStyle, background: 'var(--grad-primary)', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
            No account?{' '}
            <button onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-cyan)', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
              Register organisation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Member login — login ONLY, no self-registration ──────────────────────────
function MemberLogin({ onBack }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); }
    catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Logo />
        <div className="card" style={{ padding: '32px 28px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(1,181,116,0.12)', border: '1px solid rgba(1,181,116,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--accent-green)', marginBottom: 12 }}>
              Member
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'white', margin: 0 }}>Member Sign in</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>Log and view expenses for your team.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <ErrorBox msg={error} />
            <button type="submit" disabled={loading} style={{ ...btnStyle, background: 'var(--grad-green)', opacity: loading ? 0.7 : 1, marginTop: 4 }}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          {/* No signup link — members are created by org admin only */}
          <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
            Don't have an account? Contact your organisation admin to be added.
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--ink-3)' }}>© 2026 SiteLedger · All figures in Indian Rupees</p>
      </div>
    </div>
  );
}

// ── Main LoginPage (orchestrator) ─────────────────────────────────────────────
export default function LoginPage({ onSwitchToSignup }) {
  const [portal, setPortal] = useState(null); // null | 'admin' | 'member'

  if (!portal) return <PortalSelect onSelect={setPortal} />;

  if (portal === 'admin') {
    return <AdminLogin onBack={() => setPortal(null)} onSwitch={onSwitchToSignup} />;
  }

  return <MemberLogin onBack={() => setPortal(null)} />;
}
