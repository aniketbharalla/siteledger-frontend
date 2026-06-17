import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

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

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 32 }}>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#fff' }}>SL</span>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', letterSpacing: '0.04em' }}>SiteLedger</div>
        <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500 }}>Real Estate ERP</div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)', fontSize: 13, color: '#DC2626' }}>
      {msg}
    </div>
  );
}

function Field({ label, type = 'text', value, onChange, placeholder, hint }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type} value={value} onChange={onChange}
        placeholder={placeholder} required style={inputStyle}
        onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
        onBlur={e => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
      />
      {hint && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>{hint}</span>}
    </div>
  );
}

// ── Register Organisation (Owner) ─────────────────────────────────────────────
function RegisterOrg({ onBack, onSwitch }) {
  const { registerOrg } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try { await registerOrg(orgName, name, email, password); }
    catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Logo />
        <div className="card" style={{ padding: '32px 28px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(0,117,255,0.12)', border: '1px solid rgba(0,117,255,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>
              New Organisation
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Create your workspace</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>
              You'll get an invite code to share with your team.
            </p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Field label="Organisation Name" value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="e.g. Sharma Constructions Pvt Ltd" hint="This is your company / workspace name" />
            <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
            <Field label="Your Name" value={name} onChange={e => setName(e.target.value)} placeholder="Arjun Sharma" />
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="arjun@company.com" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 chars" />
              <Field label="Confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat" />
            </div>
            <ErrorBox msg={error} />
            <button type="submit" disabled={loading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', opacity: loading ? 0.7 : 1, marginTop: 4, boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
              {loading ? 'Creating workspace…' : 'Create Organisation'}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
            Already have an account?{' '}
            <button onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Register Admin (join with invite code) ────────────────────────────────────
function RegisterAdmin({ onBack, onSwitch }) {
  const { registerAdmin } = useAuth();
  const [inviteCode, setInviteCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try { await registerAdmin(inviteCode, name, email, password); }
    catch (err) { setError(err.message || 'Registration failed'); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--grad-page)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <Logo />
        <div className="card" style={{ padding: '32px 28px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 12, padding: 0, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            Back
          </button>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'inline-flex', background: 'rgba(0,117,255,0.12)', border: '1px solid rgba(0,117,255,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>
              Join as Admin
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0 }}>Join organisation</h1>
            <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 6 }}>Enter the invite code from your organisation owner.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={labelStyle}>Invite Code</label>
              <input
                type="text" value={inviteCode}
                onChange={e => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. A3F9C2" required maxLength={6}
                style={{ ...inputStyle, fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, letterSpacing: '0.2em', textAlign: 'center', borderColor: inviteCode.length === 6 ? '#7C3AED' : '#E5E7EB' }}
                onFocus={e => { e.target.style.borderColor = '#7C3AED'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = inviteCode.length === 6 ? '#7C3AED' : '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div style={{ height: 1, background: 'var(--line)', margin: '4px 0' }} />
            <Field label="Your Name" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            <Field label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 chars" />
              <Field label="Confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Repeat" />
            </div>
            <ErrorBox msg={error} />
            <button type="submit" disabled={loading} style={{ ...btnStyle, background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', opacity: loading ? 0.7 : 1, marginTop: 4, boxShadow: '0 4px 14px rgba(124,58,237,0.35)' }}>
              {loading ? 'Joining…' : 'Join Organisation'}
            </button>
          </form>
          <div style={{ marginTop: 20, textAlign: 'center', fontSize: 13, color: 'var(--ink-3)' }}>
            Already have an account?{' '}
            <button onClick={onSwitch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main SignupPage (orchestrator) — org/admin only ──────────────────────────
export default function SignupPage({ onSwitchToLogin }) {
  const [flow, setFlow] = useState(null);
  // null = choose between "new org" or "join as admin"

  if (flow === 'new-org') {
    return <RegisterOrg onBack={() => setFlow(null)} onSwitch={() => onSwitchToLogin('admin')} />;
  }

  if (flow === 'join-admin') {
    return <RegisterAdmin onBack={() => setFlow(null)} onSwitch={() => onSwitchToLogin('admin')} />;
  }

  // Choice screen
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-0)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <Logo />
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ display: 'inline-flex', background: 'rgba(0,117,255,0.12)', border: '1px solid rgba(0,117,255,0.25)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 12 }}>
            Organisation / Admin
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--ink)' }}>Get started</h1>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 8 }}>Create a new workspace or join an existing one</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <button
            onClick={() => setFlow('new-org')}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>Create new organisation</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Start fresh — you'll be the owner and get an invite code</div>
            </div>
          </button>

          <button
            onClick={() => setFlow('join-admin')}
            style={{ background: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 16, padding: '20px 24px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.15s, transform 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = 'none'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#F5F3FF', border: '1px solid #DDD6FE', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round"><path d="M15 3h6v6M10 14L21 3M9 21H3v-6"/></svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1F2937' }}>Join with invite code</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>Join an existing organisation as an admin</div>
            </div>
          </button>
        </div>
        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#6B7280' }}>
          Already have an account?{' '}
          <button onClick={() => onSwitchToLogin('admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C3AED', fontWeight: 600, fontSize: 13, fontFamily: 'inherit', padding: 0 }}>
            Sign in
          </button>
        </div>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 11, color: '#9CA3AF' }}>© 2026 SiteLedger · All figures in Indian Rupees</p>
      </div>
    </div>
  );
}
