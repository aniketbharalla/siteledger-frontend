import React from 'react';
import { fmtINR } from '../utils/format';

const SITE_COLORS = [
  'var(--grad-primary)',
  'var(--grad-pink)',
  'var(--grad-green)',
  'var(--grad-amber)',
  'linear-gradient(135deg,#01B5EC 0%,#582CFF 100%)',
];

export default function SiteHealth({ siteMetrics = [], selectedIds, setSelectedIds }) {
  function toggle(id) {
    if (!setSelectedIds) return;
    setSelectedIds(prev => {
      if (!prev || prev.length === 0) {
        return [id];
      }
      if (prev.includes(id)) {
        const next = prev.filter(x => x !== id);
        return next.length === 0 ? [] : next;
      }
      return [...prev, id];
    });
  }

  const isSelected = (id) =>
    !selectedIds || selectedIds.length === 0 || selectedIds.includes(id);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span style={{ fontSize: 14, fontWeight: 700 }}>Site Roster</span>
          <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>({siteMetrics.length})</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--line)' }}>
              {['Site', 'Budget', 'Spent', 'Burn Rate', 'Profit', 'Status'].map(h => (
                <th key={h} style={{ padding: '9px 16px', textAlign: h === 'Profit' || h === 'Budget' || h === 'Spent' ? 'right' : 'left', fontSize: 10, fontWeight: 700, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {siteMetrics.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '28px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
                  No sites found
                </td>
              </tr>
            ) : siteMetrics.map((site, i) => {
              const active = isSelected(site._id);
              const burnColor = site.burnRate > 90 ? '#E31A1A' : site.burnRate > 70 ? '#FFB547' : '#01B574';
              return (
                <tr
                  key={site._id}
                  className="table-row"
                  onClick={() => toggle(site._id)}
                  style={{
                    cursor: 'pointer',
                    opacity: active ? 1 : 0.45,
                    background: active ? 'transparent' : undefined,
                  }}
                >
                  {/* Site name */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: 9,
                          background: SITE_COLORS[i % SITE_COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 9,
                          fontWeight: 800,
                          flexShrink: 0,
                        }}
                      >
                        {site.code?.slice(0, 2)}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap' }}>{site.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{site.location}</div>
                      </div>
                    </div>
                  </td>

                  {/* Budget */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>{fmtINR(site.totalBudget)}</span>
                  </td>

                  {/* Spent */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span className="num" style={{ fontSize: 12, fontWeight: 600 }}>{fmtINR(site.spent)}</span>
                  </td>

                  {/* Burn rate */}
                  <td style={{ padding: '12px 24px 12px 16px', minWidth: 130 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="progress-bar" style={{ flex: 1 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, site.burnRate)}%`,
                            background: burnColor,
                          }}
                        />
                      </div>
                      <span className="num" style={{ fontSize: 11, color: burnColor, fontWeight: 700, minWidth: 32 }}>
                        {site.burnRate.toFixed(0)}%
                      </span>
                    </div>
                  </td>

                  {/* Profit */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span
                      className="num"
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: site.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                      }}
                    >
                      {site.profit >= 0 ? '+' : ''}{fmtINR(site.profit)}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 16px' }}>
                    <span className={`chip ${site.status === 'active' ? 'chip-green' : 'chip-gray'}`}>
                      {site.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
