import React from 'react';
import { fmtINR } from '../utils/format';
import { IconTrend, IconSites, IconReceipt } from '../components/icons';

function KPICard({ icon: Icon, grad, label, value, sub, color }) {
  return (
    <div
      className="card"
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
      style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14, transition: 'transform 0.15s', cursor: 'default' }}
    >
      <div className="icon-tile" style={{ background: grad, width: 44, height: 44, borderRadius: 12 }}>
        <Icon size={20} />
      </div>
      <div>
        <div className="num" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: color || 'var(--ink)', marginBottom: 4 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

const CAT_COLORS = {
  material: { bar: '#FF0080', bg: 'rgba(255,0,128,0.15)' },
  labor:    { bar: '#0075FF', bg: 'rgba(0,117,255,0.15)' },
  misc:     { bar: '#FFB547', bg: 'rgba(255,181,71,0.15)' },
};

export default function ReportsPage({ stats }) {
  const {
    totalInvestment, totalExpenses, totalPayments, netProfit,
    profitPct, byCategory, siteMetrics, largestCat,
  } = stats;

  const avgCostPerSite = siteMetrics.length > 0 ? totalExpenses / siteMetrics.length : 0;
  const catTotal = Object.values(byCategory).reduce((s, v) => s + v, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        <KPICard
          icon={IconTrend}
          grad="var(--grad-amber)"
          label="Profit Margin"
          value={`${profitPct.toFixed(1)}%`}
          color={profitPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'}
        />
        <KPICard
          icon={IconSites}
          grad="var(--grad-primary)"
          label="Avg Cost per Site"
          value={fmtINR(avgCostPerSite)}
          sub={`across ${siteMetrics.length} sites`}
        />
        <KPICard
          icon={IconReceipt}
          grad="var(--grad-pink)"
          label="Largest Category"
          value={largestCat ? largestCat.charAt(0).toUpperCase() + largestCat.slice(1) : '—'}
          sub={fmtINR(byCategory[largestCat] || 0)}
          color={CAT_COLORS[largestCat]?.bar || 'var(--ink)'}
        />
      </div>

      {/* Category breakdown */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Category Breakdown</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Total expenses by category</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {Object.entries(byCategory).map(([cat, val]) => {
            const pct = catTotal > 0 ? (val / catTotal) * 100 : 0;
            const cc = CAT_COLORS[cat] || { bar: '#01B5EC', bg: 'rgba(1,181,116,0.1)' };
            return (
              <div key={cat}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: cc.bar }} />
                    <span style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize' }}>{cat}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <span className="num" style={{ fontSize: 12, fontWeight: 700 }}>{fmtINR(val)}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-3)', minWidth: 36, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div className="progress-fill" style={{ width: `${pct}%`, background: cc.bar }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Site comparison */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Site Comparison</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Budget vs Spent vs Received</div>
        </div>

        {siteMetrics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px', color: 'var(--ink-3)', fontSize: 13 }}>
            No site data available
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {siteMetrics.map((site, idx) => {
              const maxVal = Math.max(site.totalBudget, site.spent, site.received, 1);
              return (
                <div key={site._id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 7,
                          background: ['var(--grad-primary)','var(--grad-pink)','var(--grad-green)','var(--grad-amber)'][idx % 4],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        {site.code?.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{site.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{site.location}</div>
                      </div>
                    </div>
                    <span
                      className="num"
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: site.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                      }}
                    >
                      {site.profit >= 0 ? '+' : ''}{fmtINR(site.profit)} profit
                    </span>
                  </div>

                  {/* Multi-row bars */}
                  {[
                    { label: 'Budget',   val: site.totalBudget, color: '#0075FF' },
                    { label: 'Spent',    val: site.spent,       color: '#FF0080' },
                    { label: 'Received', val: site.received,    color: '#01B574' },
                  ].map(bar => (
                    <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                      <div style={{ width: 56, fontSize: 10, color: 'var(--ink-3)', textAlign: 'right', flexShrink: 0 }}>{bar.label}</div>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{ width: `${(bar.val / maxVal) * 100}%`, background: bar.color }}
                        />
                      </div>
                      <span className="num" style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-2)', width: 60, textAlign: 'right', flexShrink: 0 }}>
                        {fmtINR(bar.val)}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* P&L summary */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>P&amp;L Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { label: 'Total Investment', value: fmtINR(totalInvestment), color: '#0075FF' },
            { label: 'Total Expenses',   value: fmtINR(totalExpenses),   color: '#FF0080' },
            { label: 'Client Receipts',  value: fmtINR(totalPayments),   color: '#01B574' },
            { label: 'Net Profit',       value: fmtINR(netProfit),       color: netProfit >= 0 ? '#01B574' : '#E31A1A' },
          ].map(item => (
            <div key={item.label} className="card-inner" style={{ padding: '14px' }}>
              <div className="num" style={{ fontSize: 16, fontWeight: 700, color: item.color, marginBottom: 4 }}>
                {item.value}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
