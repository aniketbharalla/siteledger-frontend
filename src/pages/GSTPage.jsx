import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getGSTDashboard, getGSTProfile, updateGSTProfile,
  getITCExpenses, claimITC, unclaimITC,
  getOutputGST, getGSTReturns, markGSTReturn,
  getGSTAlerts, getGSTSavings,
} from '../api';
import { fmtINR, fmtDate } from '../utils/format';

// ─── GST Rate constants ───────────────────────────────────────────────────────
const GST_RATES = [0, 5, 12, 18, 28];
const INDIAN_STATES = [
  { code: '01', name: 'Jammu & Kashmir' }, { code: '02', name: 'Himachal Pradesh' },
  { code: '03', name: 'Punjab' }, { code: '04', name: 'Chandigarh' },
  { code: '05', name: 'Uttarakhand' }, { code: '06', name: 'Haryana' },
  { code: '07', name: 'Delhi' }, { code: '08', name: 'Rajasthan' },
  { code: '09', name: 'Uttar Pradesh' }, { code: '10', name: 'Bihar' },
  { code: '11', name: 'Sikkim' }, { code: '12', name: 'Arunachal Pradesh' },
  { code: '13', name: 'Nagaland' }, { code: '14', name: 'Manipur' },
  { code: '15', name: 'Mizoram' }, { code: '16', name: 'Tripura' },
  { code: '17', name: 'Meghalaya' }, { code: '18', name: 'Assam' },
  { code: '19', name: 'West Bengal' }, { code: '20', name: 'Jharkhand' },
  { code: '21', name: 'Odisha' }, { code: '22', name: 'Chhattisgarh' },
  { code: '23', name: 'Madhya Pradesh' }, { code: '24', name: 'Gujarat' },
  { code: '27', name: 'Maharashtra' }, { code: '28', name: 'Andhra Pradesh' },
  { code: '29', name: 'Karnataka' }, { code: '30', name: 'Goa' },
  { code: '31', name: 'Lakshadweep' }, { code: '32', name: 'Kerala' },
  { code: '33', name: 'Tamil Nadu' }, { code: '34', name: 'Puducherry' },
  { code: '36', name: 'Telangana' }, { code: '38', name: 'Ladakh' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatPeriod(p) {
  if (!p) return '—';
  const [y, m] = p.split('-');
  return `${MONTHS[parseInt(m) - 1]} ${y}`;
}

function alertColor(status) {
  if (status === 'overdue') return '#E31A1A';
  if (status === 'critical') return '#E31A1A';
  if (status === 'warning') return '#FFB547';
  return '#01B574';
}

function alertBg(status) {
  if (status === 'overdue' || status === 'critical') return 'rgba(227,26,26,0.12)';
  if (status === 'warning') return 'rgba(255,181,71,0.12)';
  return 'rgba(1,181,116,0.08)';
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, value, sub, color, bg }) {
  return (
    <div className="card" style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div className="num" style={{ fontSize: 22, fontWeight: 700, color: color || 'var(--ink)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = ['Dashboard', 'ITC Tracker', 'Output GST', 'Filing Calendar', 'GST Advisor', 'Settings'];
const TAB_ICONS = ['📊', '📥', '📤', '📅', '💡', '⚙️'];

// ─── Mark Return Modal ────────────────────────────────────────────────────────
function MarkReturnModal({ alert, onClose, onSaved }) {
  const [filedDate, setFiledDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await markGSTReturn({
        returnType: alert.returnType,
        period: alert.period,
        filedDate,
        notes,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Mark {alert.returnType} as Filed</div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{formatPeriod(alert.period)}</div>
          </div>
          <button className="btn-ghost" style={{ padding: '6px 8px' }} onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Date Filed</label>
            <input className="input-dark" type="date" value={filedDate} onChange={e => setFiledDate(e.target.value)} required style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Notes (optional)</label>
            <textarea className="input-dark" value={notes} onChange={e => setNotes(e.target.value)} rows={2} style={{ width: '100%', resize: 'vertical' }} placeholder="Challan no., remarks..." />
          </div>
          {error && <div style={{ fontSize: 12, color: 'var(--accent-red)', background: 'rgba(227,26,26,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : '✅ Mark Filed'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── GST Profile Settings ─────────────────────────────────────────────────────
function GSTSettings({ profile, onSaved }) {
  const [form, setForm] = useState({
    gstin: profile?.gstin || '',
    legalName: profile?.legalName || '',
    tradeName: profile?.tradeName || '',
    registrationType: profile?.registrationType || 'regular',
    filingFrequency: profile?.filingFrequency || 'monthly',
    stateCode: profile?.stateCode || '',
    stateName: profile?.stateName || '',
    address: profile?.address || '',
    panNumber: profile?.panNumber || '',
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function handleStateChange(e) {
    const code = e.target.value;
    const state = INDIAN_STATES.find(s => s.code === code);
    setForm(prev => ({ ...prev, stateCode: code, stateName: state?.name || '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await updateGSTProfile(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const inp = { className: 'input-dark', style: { width: '100%' } };

  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>GST Business Profile</div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 20 }}>Set up your GSTIN and filing preferences for accurate alerts</div>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>GSTIN *</label>
            <input {...inp} value={form.gstin} onChange={e => setForm(p => ({ ...p, gstin: e.target.value.toUpperCase() }))} placeholder="27AABCU9603R1ZX" maxLength={15} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>PAN Number</label>
            <input {...inp} value={form.panNumber} onChange={e => setForm(p => ({ ...p, panNumber: e.target.value.toUpperCase() }))} placeholder="AABCU9603R" maxLength={10} />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Legal Name</label>
            <input {...inp} value={form.legalName} onChange={e => setForm(p => ({ ...p, legalName: e.target.value }))} placeholder="As per GST certificate" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Trade Name</label>
            <input {...inp} value={form.tradeName} onChange={e => setForm(p => ({ ...p, tradeName: e.target.value }))} placeholder="Business name" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Registration Type</label>
            <select {...inp} value={form.registrationType} onChange={e => setForm(p => ({ ...p, registrationType: e.target.value }))}>
              <option value="regular">Regular Taxpayer (Monthly)</option>
              <option value="qrmp">QRMP Scheme (Quarterly GSTR-1)</option>
              <option value="composition">Composition Scheme</option>
              <option value="unregistered">Unregistered</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>State</label>
            <select {...inp} value={form.stateCode} onChange={handleStateChange}>
              <option value="">Select State</option>
              {INDIAN_STATES.map(s => <option key={s.code} value={s.code}>{s.code} — {s.name}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-2)', display: 'block', marginBottom: 6 }}>Business Address</label>
            <textarea {...inp} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} rows={2} style={{ ...inp.style, resize: 'vertical' }} placeholder="Registered business address" />
          </div>
        </div>
        {error && <div style={{ marginTop: 12, fontSize: 12, color: 'var(--accent-red)', background: 'rgba(227,26,26,0.1)', padding: '8px 12px', borderRadius: 8 }}>{error}</div>}
        <div style={{ marginTop: 20, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving...' : '💾 Save GST Profile'}</button>
          {saved && <span style={{ fontSize: 12, color: 'var(--accent-green)' }}>✅ Saved successfully!</span>}
        </div>
      </form>
    </div>
  );
}

// ─── Main GSTPage ─────────────────────────────────────────────────────────────
export default function GSTPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [markReturnModal, setMarkReturnModal] = useState(null);
  const qc = useQueryClient();

  const { data: dashboard } = useQuery({ queryKey: ['gst-dashboard'], queryFn: getGSTDashboard });
  const { data: profile } = useQuery({ queryKey: ['gst-profile'], queryFn: getGSTProfile });
  const { data: itcExpenses = [] } = useQuery({ queryKey: ['gst-itc'], queryFn: getITCExpenses });
  const { data: outputGST = [] } = useQuery({ queryKey: ['gst-output'], queryFn: getOutputGST });
  const { data: returns = [] } = useQuery({ queryKey: ['gst-returns'], queryFn: getGSTReturns });
  const { data: alerts = [] } = useQuery({ queryKey: ['gst-alerts'], queryFn: getGSTAlerts });
  const { data: savings = [] } = useQuery({ queryKey: ['gst-savings'], queryFn: getGSTSavings });

  function invalidate() {
    qc.invalidateQueries({ queryKey: ['gst-dashboard'] });
    qc.invalidateQueries({ queryKey: ['gst-itc'] });
    qc.invalidateQueries({ queryKey: ['gst-returns'] });
    qc.invalidateQueries({ queryKey: ['gst-alerts'] });
    qc.invalidateQueries({ queryKey: ['gst-savings'] });
  }

  async function handleClaim(id, claimed) {
    try {
      if (claimed) await unclaimITC(id);
      else await claimITC(id);
      invalidate();
    } catch (err) {
      console.error(err);
    }
  }

  // Overdue alerts for the persistent banner
  const overdueAlerts = alerts.filter(a => a.status === 'overdue' || a.status === 'critical');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Overdue alert banner */}
      {overdueAlerts.length > 0 && (
        <div style={{ background: 'rgba(227,26,26,0.12)', border: '1px solid rgba(227,26,26,0.3)', borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 18 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#E31A1A' }}>GST Return Overdue!</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)' }}>
              {overdueAlerts.map(a => `${a.returnType} for ${formatPeriod(a.period)}`).join(' · ')} — File immediately to avoid late fees
            </div>
          </div>
          <button className="btn-primary" style={{ background: '#E31A1A', fontSize: 12, padding: '6px 14px' }} onClick={() => setActiveTab(3)}>
            File Now
          </button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--line)', paddingBottom: 0 }}>
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '10px 14px',
              fontSize: 12,
              fontWeight: 600,
              color: activeTab === i ? 'var(--accent-blue)' : 'var(--ink-3)',
              borderBottom: activeTab === i ? '2px solid var(--accent-blue)' : '2px solid transparent',
              marginBottom: -1,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            {TAB_ICONS[i]} {tab}
          </button>
        ))}
      </div>

      {/* ── Tab 0: Dashboard ── */}
      {activeTab === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* KPI row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            <KPICard label="Output GST (Collected)" value={fmtINR(dashboard?.outputGST || 0)} color="var(--accent-blue)" />
            <KPICard label="ITC Available" value={fmtINR(dashboard?.eligibleITC || 0)} color="#01B574" sub={`${dashboard?.pendingITCCount || 0} unclaimed`} />
            <KPICard label="Net GST Payable" value={fmtINR(dashboard?.netPayable || 0)} color={dashboard?.netPayable > 0 ? '#E31A1A' : '#01B574'} />
            <KPICard label="ITC Claimed" value={fmtINR(dashboard?.claimedITC || 0)} color="var(--ink)" />
            <KPICard label="Pending ITC" value={fmtINR(dashboard?.pendingITC || 0)} color="#FFB547" sub="Claim to reduce liability" />
            <KPICard label="Blocked ITC" value={fmtINR(dashboard?.blockedITC || 0)} color="var(--ink-3)" sub="Section 17(5)" />
          </div>

          {/* Filing Alerts */}
          {alerts.length > 0 && (
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>📅 Filing Alerts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, background: alertBg(alert.status), borderRadius: 10, padding: '12px 16px', border: `1px solid ${alertColor(alert.status)}30` }}>
                    <span style={{ fontSize: 18 }}>{alert.status === 'overdue' ? '🔴' : alert.status === 'critical' ? '🔴' : alert.status === 'warning' ? '🟡' : '🟢'}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: alertColor(alert.status) }}>{alert.returnType} — {formatPeriod(alert.period)}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        Due: {alert.dueDate ? new Date(alert.dueDate).toLocaleDateString('en-IN') : '—'} ·{' '}
                        {alert.daysLeft < 0 ? `${Math.abs(alert.daysLeft)} days overdue` : `${alert.daysLeft} days left`}
                      </div>
                    </div>
                    <button className="btn-primary" style={{ fontSize: 11, padding: '6px 12px' }} onClick={() => setMarkReturnModal(alert)}>
                      Mark Filed
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GST Split breakdown */}
          {dashboard && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Output GST Split</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'CGST (Central)', value: dashboard.totalCGST, color: '#0075FF' },
                  { label: 'SGST (State)', value: dashboard.totalSGST, color: '#582CFF' },
                  { label: 'IGST (Integrated)', value: dashboard.totalIGST, color: '#01B5EC' },
                ].map(item => (
                  <div key={item.label} className="card-inner" style={{ padding: 16, textAlign: 'center' }}>
                    <div className="num" style={{ fontSize: 18, fontWeight: 700, color: item.color }}>{fmtINR(item.value)}</div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 4 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 1: ITC Tracker ── */}
      {activeTab === 1 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Input Tax Credit Tracker</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Expenses where GST was paid — claim to reduce liability</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <span className="chip chip-green" style={{ fontSize: 11 }}>{itcExpenses.filter(e => e.itcClaimed).length} Claimed</span>
              <span className="chip chip-gray" style={{ fontSize: 11 }}>{itcExpenses.filter(e => !e.itcClaimed && e.itcEligible).length} Pending</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Expense / Vendor', 'Site', 'HSN', 'Amount', 'GST%', 'ITC Amt', 'CGST', 'SGST', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {itcExpenses.length === 0 ? (
                  <tr><td colSpan={10} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>No expenses with GST found. Add GST rate when logging expenses.</td></tr>
                ) : itcExpenses.map(exp => (
                  <tr key={exp._id} className="table-row">
                    <td style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{exp.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{exp.vendor}</div>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: 12 }}>{exp.siteId?.code || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--ink-3)' }}>{exp.hsnCode || '—'}</td>
                    <td style={{ padding: '12px 14px' }}><span className="num" style={{ fontSize: 12, fontWeight: 700 }}>{fmtINR(exp.amount)}</span></td>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600 }}>{exp.gstRate}%</td>
                    <td style={{ padding: '12px 14px' }}><span className="num" style={{ fontSize: 12, fontWeight: 700, color: '#01B574' }}>{fmtINR(exp.gstAmount)}</span></td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--ink-3)' }}>{fmtINR(exp.cgst)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--ink-3)' }}>{fmtINR(exp.sgst)}</td>
                    <td style={{ padding: '12px 14px' }}>
                      {!exp.itcEligible ? (
                        <span className="chip chip-gray" style={{ fontSize: 10 }}>🔒 Blocked</span>
                      ) : exp.itcClaimed ? (
                        <span className="chip chip-green" style={{ fontSize: 10 }}>✅ Claimed</span>
                      ) : (
                        <span className="chip" style={{ fontSize: 10, background: 'rgba(255,181,71,0.15)', color: '#FFB547', border: '1px solid rgba(255,181,71,0.3)' }}>⏳ Pending</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      {exp.itcEligible && (
                        <button
                          className="btn-ghost"
                          style={{ fontSize: 11, padding: '5px 10px', color: exp.itcClaimed ? 'var(--ink-3)' : '#01B574' }}
                          onClick={() => handleClaim(exp._id, exp.itcClaimed)}
                        >
                          {exp.itcClaimed ? 'Unclaim' : '✓ Claim'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
            <span>Total ITC Available: <span className="num" style={{ fontWeight: 700, color: '#01B574' }}>{fmtINR(itcExpenses.filter(e => e.itcEligible).reduce((s, e) => s + (e.gstAmount || 0), 0))}</span></span>
            <span>Claimed: <span className="num" style={{ fontWeight: 700 }}>{fmtINR(itcExpenses.filter(e => e.itcClaimed).reduce((s, e) => s + (e.gstAmount || 0), 0))}</span></span>
          </div>
        </div>
      )}

      {/* ── Tab 2: Output GST ── */}
      {activeTab === 2 && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '18px 20px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Output GST — Client Payments</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>GST collected from clients on project payments</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)' }}>
                  {['Invoice', 'Client', 'Site', 'Base Amt', 'GST%', 'GST Amt', 'CGST', 'SGST', 'Date'].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {outputGST.length === 0 ? (
                  <tr><td colSpan={9} style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>No payments with GST found. Add GST rate when recording payments.</td></tr>
                ) : outputGST.map(pay => (
                  <tr key={pay._id} className="table-row">
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--accent-blue)', fontWeight: 600 }}>{pay.invoiceNo || '—'}</td>
                    <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600 }}>{pay.clientName}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12 }}>{pay.siteId?.code || '—'}</td>
                    <td style={{ padding: '12px 14px' }}><span className="num" style={{ fontSize: 12, fontWeight: 700 }}>{fmtINR(pay.amount)}</span></td>
                    <td style={{ padding: '12px 14px', fontSize: 12, fontWeight: 600 }}>{pay.gstRate}%</td>
                    <td style={{ padding: '12px 14px' }}><span className="num" style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)' }}>{fmtINR(pay.gstAmount)}</span></td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--ink-3)' }}>{fmtINR(pay.cgst)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 11, color: 'var(--ink-3)' }}>{fmtINR(pay.sgst)}</td>
                    <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--ink-2)' }}>{fmtDate(pay.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--line)', fontSize: 12, color: 'var(--ink-3)', textAlign: 'right' }}>
            Total Output GST: <span className="num" style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{fmtINR(outputGST.reduce((s, p) => s + (p.gstAmount || 0), 0))}</span>
          </div>
        </div>
      )}

      {/* ── Tab 3: Filing Calendar ── */}
      {activeTab === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>📅 Filing Calendar</div>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 16 }}>Upcoming & recent GST return due dates</div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px', color: 'var(--ink-3)', fontSize: 13 }}>
                All returns are filed ✅ or setup your GST profile first.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 12, background: alertBg(alert.status), border: `1px solid ${alertColor(alert.status)}30` }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: alertColor(alert.status) + '20', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: alertColor(alert.status), lineHeight: 1 }}>
                        {alert.dueDate ? new Date(alert.dueDate).getDate() : '—'}
                      </div>
                      <div style={{ fontSize: 9, color: alertColor(alert.status), fontWeight: 600 }}>
                        {alert.dueDate ? MONTHS[new Date(alert.dueDate).getMonth()] : ''}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{alert.returnType} — {formatPeriod(alert.period)}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                        {alert.daysLeft < 0 ? <span style={{ color: '#E31A1A', fontWeight: 600 }}>{Math.abs(alert.daysLeft)} days overdue</span> : <span>{alert.daysLeft} days remaining</span>}
                      </div>
                    </div>
                    <button className="btn-primary" style={{ fontSize: 12, padding: '7px 14px' }} onClick={() => setMarkReturnModal(alert)}>
                      ✅ Mark Filed
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Filed returns history */}
          {returns.filter(r => r.status !== 'pending').length > 0 && (
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Filing History</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {returns.filter(r => r.status !== 'pending').map((ret, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < returns.length - 1 ? '1px solid var(--line)' : 'none' }}>
                    <span className={`chip ${ret.status === 'filed' ? 'chip-green' : 'chip-gray'}`} style={{ fontSize: 10, minWidth: 44, textAlign: 'center' }}>{ret.returnType}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{formatPeriod(ret.period)}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Filed: {ret.filedDate ? fmtDate(ret.filedDate) : '—'}</div>
                    </div>
                    <span className={`chip ${ret.status === 'filed' ? 'chip-green' : 'chip-gray'}`} style={{ fontSize: 10 }}>{ret.status === 'filed' ? '✅ On Time' : '⚠️ Late'}</span>
                    {ret.netPayable > 0 && <span className="num" style={{ fontSize: 11, fontWeight: 700, color: '#E31A1A' }}>₹{ret.netPayable.toLocaleString('en-IN')}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab 4: GST Advisor ── */}
      {activeTab === 4 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>💡 GST Savings Opportunities</div>
          {savings.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--ink-3)' }}>
              No savings opportunities found right now. 🎉
            </div>
          ) : savings.map((tip, i) => {
            const typeColors = { success: '#01B574', danger: '#E31A1A', warning: '#FFB547', info: '#0075FF' };
            const typeBgs = { success: 'rgba(1,181,116,0.08)', danger: 'rgba(227,26,26,0.08)', warning: 'rgba(255,181,71,0.08)', info: 'rgba(0,117,255,0.08)' };
            const typeIcons = { success: '🟢', danger: '🔴', warning: '🟡', info: '🔵' };
            return (
              <div key={i} className="card" style={{ padding: '18px 20px', background: typeBgs[tip.type], border: `1px solid ${typeColors[tip.type]}30` }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{typeIcons[tip.type]}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: typeColors[tip.type], marginBottom: 4 }}>{tip.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.6 }}>{tip.message}</div>
                    {tip.amount && (
                      <div style={{ marginTop: 8 }}>
                        <span className="num" style={{ fontSize: 14, fontWeight: 700, color: typeColors[tip.type] }}>{fmtINR(tip.amount)}</span>
                        <span style={{ fontSize: 11, color: 'var(--ink-3)', marginLeft: 6 }}>{tip.type === 'success' ? 'recoverable' : 'at risk'}</span>
                      </div>
                    )}
                    {tip.action === 'claim_itc' && (
                      <button className="btn-ghost" style={{ marginTop: 10, fontSize: 11, color: '#01B574' }} onClick={() => setActiveTab(1)}>
                        → View ITC Tracker
                      </button>
                    )}
                    {tip.action === 'update_vendors' && (
                      <button className="btn-ghost" style={{ marginTop: 10, fontSize: 11, color: '#E31A1A' }} onClick={() => setActiveTab(5)}>
                        → Update GST Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Tab 5: Settings ── */}
      {activeTab === 5 && (
        <GSTSettings profile={profile} onSaved={() => {
          qc.invalidateQueries({ queryKey: ['gst-profile'] });
          qc.invalidateQueries({ queryKey: ['gst-alerts'] });
        }} />
      )}

      {/* Mark return modal */}
      {markReturnModal && (
        <MarkReturnModal
          alert={markReturnModal}
          onClose={() => setMarkReturnModal(null)}
          onSaved={invalidate}
        />
      )}
    </div>
  );
}
