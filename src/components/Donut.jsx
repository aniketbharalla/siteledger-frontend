import React, { useState } from 'react';
import { fmtINR } from '../utils/format';

const PL_SEGMENTS = [
  { key: 'investment', label: 'Investment', color: '#0075FF' },
  { key: 'expenses',   label: 'Expenses',   color: '#FF0080' },
  { key: 'profit',     label: 'Profit',     color: '#01B574' },
];

const CAT_SEGMENTS = [
  { key: 'material', label: 'Material', color: '#FF0080' },
  { key: 'labor',    label: 'Labor',    color: '#0075FF' },
  { key: 'misc',     label: 'Misc',     color: '#FFB547' },
];

function buildArcs(segments, total, cx, cy, r1, r2) {
  if (total === 0) return [];
  let angle = -Math.PI / 2;
  return segments.map(seg => {
    const frac = seg.value / total;
    const sweep = frac * 2 * Math.PI;
    const startAngle = angle;
    const endAngle = angle + sweep;
    angle = endAngle;

    const gap = 0.025; // radians gap between segments
    const a1 = startAngle + gap;
    const a2 = endAngle - gap;

    if (a2 <= a1) return { ...seg, path: '', frac };

    const x1 = cx + r1 * Math.cos(a1);
    const y1 = cy + r1 * Math.sin(a1);
    const x2 = cx + r1 * Math.cos(a2);
    const y2 = cy + r1 * Math.sin(a2);
    const x3 = cx + r2 * Math.cos(a2);
    const y3 = cy + r2 * Math.sin(a2);
    const x4 = cx + r2 * Math.cos(a1);
    const y4 = cy + r2 * Math.sin(a1);
    const large = sweep > Math.PI ? 1 : 0;

    const path = [
      `M ${x1} ${y1}`,
      `A ${r1} ${r1} 0 ${large} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${r2} ${r2} 0 ${large} 0 ${x4} ${y4}`,
      'Z',
    ].join(' ');

    return { ...seg, path, frac };
  });
}

export default function Donut({ byCategory, totalInvestment, totalExpenses, totalPayments, netProfit, view, setView }) {
  const [hovered, setHovered] = useState(null);

  const plData = [
    { key: 'investment', label: 'Investment', color: '#0075FF', value: totalInvestment },
    { key: 'expenses',   label: 'Expenses',   color: '#FF0080', value: totalExpenses },
    { key: 'profit',     label: 'Profit',     color: '#01B574', value: Math.max(0, netProfit) },
  ];
  const catData = [
    { key: 'material', label: 'Material', color: '#FF0080', value: byCategory.material || 0 },
    { key: 'labor',    label: 'Labor',    color: '#0075FF', value: byCategory.labor    || 0 },
    { key: 'misc',     label: 'Misc',     color: '#FFB547', value: byCategory.misc     || 0 },
  ];

  const segments = view === 'pl' ? plData : catData;
  const total = segments.reduce((s, x) => s + x.value, 0);

  const cx = 80, cy = 80, r1 = 72, r2 = 50;
  const arcs = buildArcs(segments, total, cx, cy, r1, r2);

  const activeKey = hovered || segments[0]?.key;
  const activeSeg = segments.find(s => s.key === activeKey) || segments[0];
  const centerValue = activeSeg?.value || total;
  const centerLabel = activeSeg?.label || 'Total';

  // Profit margin
  const profitPct = totalPayments > 0 ? (netProfit / totalPayments) * 100 : 0;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Overview</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Financial breakdown</div>
        </div>
        <div className="pill-toggle">
          <button className={view === 'pl' ? 'active' : ''} onClick={() => setView('pl')}>P&amp;L</button>
          <button className={view === 'cat' ? 'active' : ''} onClick={() => setView('cat')}>Category</button>
        </div>
      </div>

      {/* Chart + legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        {/* SVG donut */}
        <div style={{ position: 'relative', flexShrink: 0, margin: '0 auto' }}>
          <svg width={160} height={160} viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx={cx} cy={cy}
              r={(r1 + r2) / 2}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={r1 - r2}
            />
            {arcs.map(arc => (
              arc.path ? (
                <path
                  key={arc.key}
                  d={arc.path}
                  fill={arc.color}
                  opacity={hovered && hovered !== arc.key ? 0.3 : 1}
                  style={{ transition: 'opacity 0.2s', cursor: 'pointer' }}
                  onMouseEnter={() => setHovered(arc.key)}
                  onMouseLeave={() => setHovered(null)}
                />
              ) : null
            ))}
            {/* Center text */}
            <text
              x={cx} y={cy - 8}
              textAnchor="middle"
              fill="#fff"
              fontSize="13"
              fontFamily="'JetBrains Mono', monospace"
              fontWeight="700"
            >
              {fmtINR(centerValue)}
            </text>
            <text
              x={cx} y={cy + 10}
              textAnchor="middle"
              fill="rgba(160,174,192,0.8)"
              fontSize="10"
              fontFamily="'Plus Jakarta Sans', sans-serif"
            >
              {centerLabel}
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {segments.map(s => (
            <div
              key={s.key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                opacity: hovered && hovered !== s.key ? 0.45 : 1,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={() => setHovered(s.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 500 }}>{s.label}</div>
                <div className="num" style={{ fontSize: 12, fontWeight: 700 }}>{fmtINR(s.value)}</div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600 }}>
                {total > 0 ? ((s.value / total) * 100).toFixed(1) : '0.0'}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Profit margin bar */}
      <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Profit Margin</span>
          <span className="num" style={{ fontSize: 12, fontWeight: 700, color: profitPct >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
            {profitPct.toFixed(1)}%
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${Math.min(100, Math.max(0, profitPct))}%`,
              background: profitPct >= 0 ? 'var(--grad-green)' : 'var(--grad-pink)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
