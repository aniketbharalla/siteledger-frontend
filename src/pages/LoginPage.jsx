import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

// ── Shared styles (light mode) ────────────────────────────────────────────────
const inputStyle = {
  background: '#FFFFFF',
  border: '1.5px solid #E5E7EB',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 14,
  color: 'var(--ink)',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const labelStyle = {
  fontSize: 11, fontWeight: 600, color: 'var(--ink-3)',
  textTransform: 'uppercase', letterSpacing: '0.07em',
};

const btnStyle = {
  border: 'none', borderRadius: 10, padding: '12px 20px',
  fontSize: 14, fontWeight: 700, color: 'white',
  cursor: 'pointer', width: '100%', fontFamily: 'inherit',
  transition: 'opacity 0.15s, transform 0.15s, box-shadow 0.15s',
};

// ── Logo ──────────────────────────────────────────────────────────────────────
function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12,
        background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
      }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#fff' }}>SL</span>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>SiteLedger</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500 }}>Real Estate ERP</div>
      </div>
    </div>
  );
}

// ── Error Box ─────────────────────────────────────────────────────────────────
function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 10,
      background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)',
      fontSize: 13, color: '#DC2626',
    }}>
      {msg}
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required style={inputStyle}
        onFocus={e => {
          e.target.style.borderColor = '#7C3AED';
          e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
        }}
        onBlur={e => {
          e.target.style.borderColor = '#E5E7EB';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
}

// ── Portal Selector ───────────────────────────────────────────────────────────
function PortalSelect({ onSelect }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-0)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Logo />

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: 'var(--ink)' }}>Welcome back</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', marginTop: 8 }}>Choose your portal to continue</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Admin / Org portal */}
          <button
            onClick={() => onSelect('admin')}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E5E7EB',
              borderRadius: 14,
              padding: '18px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(124,58,237,0.3)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="3" width="18" height="18" rx="3"/>
                <path d="M9 9h6M9 12h6M9 15h4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Organisation / Admin</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>Full dashboard access — manage sites, expenses, investors & payments</div>
            </div>
            <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Member portal */}
          <button
            onClick={() => onSelect('member')}
            style={{
              background: '#FFFFFF',
              border: '1.5px solid #E5E7EB',
              borderRadius: 14,
              padding: '18px 20px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              textAlign: 'left',
              transition: 'border-color 0.15s, transform 0.15s, box-shadow 0.15s',
              fontFamily: 'inherit',
              width: '100%',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(5,150,105,0.4)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(5,150,105,0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#E5E7EB';
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              width: 46, height: 46, borderRadius: 12,
              background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              boxShadow: '0 4px 12px rgba(5,150,105,0.3)',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4"/>
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Member</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>Log and view expenses for your assigned organisation</div>
            </div>
            <svg style={{ flexShrink: 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        </div>

        <p style={{ textAlign: 'center', marginTop: 28, fontSize: 11, color: 'var(--ink-4)' }}>
          © 2026 SiteLedger · All figures in Indian Rupees
        </p>
      </div>
    </div>
  );
}

// ── Admin / Org Login ─────────────────────────────────────────────────────────
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Logo />
        <div className="card" style={{ padding: '32px 28px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>

          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
              borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700,
              color: '#7C3AED', marginBottom: 12,
            }}>
              Organisation / Admin
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Sign in</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>Access your organisation dashboard.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <ErrorBox msg={error} />
            <button
              type="submit" disabled={loading}
              style={{
                ...btnStyle,
                background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
                boxShadow: '0 4px 14px rgba(124,58,237,0.35)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
            No account?{' '}
            <button
              onClick={onSwitch}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', padding: 0 }}
            >
              Register organisation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Member Login ──────────────────────────────────────────────────────────────
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Logo />
        <div className="card" style={{ padding: '32px 28px' }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>

          <div style={{ marginBottom: 24 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(5,150,105,0.08)', border: '1px solid rgba(5,150,105,0.2)',
              borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700,
              color: '#059669', marginBottom: 12,
            }}>
              Member
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Member Sign in</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 6 }}>Log and view expenses for your team.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            <ErrorBox msg={error} />
            <button
              type="submit" disabled={loading}
              style={{
                ...btnStyle,
                background: 'linear-gradient(135deg, #059669 0%, #0891B2 100%)',
                opacity: loading ? 0.7 : 1,
                marginTop: 4,
                boxShadow: '0 4px 14px rgba(5,150,105,0.3)',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in →'}
            </button>
          </form>

          <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: 10, background: 'var(--bg-0)', border: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'center' }}>
            Don't have an account? Contact your organisation admin to be added.
          </div>
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 11, color: 'var(--ink-4)' }}>© 2026 SiteLedger · All figures in Indian Rupees</p>
      </div>
    </div>
  );
}

// ── Main LoginPage ────────────────────────────────────────────────────────────
export default function LoginPage({ onSwitchToSignup }) {
  const [portal, setPortal] = useState(null);

  if (!portal) return <PortalSelect onSelect={setPortal} />;
  if (portal === 'admin') return <AdminLogin onBack={() => setPortal(null)} onSwitch={onSwitchToSignup} />;
  return <MemberLogin onBack={() => setPortal(null)} />;
}
