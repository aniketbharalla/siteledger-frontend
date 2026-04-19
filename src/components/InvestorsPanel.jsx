import React from 'react';
import { fmtINR, fmtDate, initials } from '../utils/format';

const INVESTOR_COLORS = [
  '#0075FF', '#FF0080', '#01B574', '#FFB547', '#582CFF', '#01B5EC',
];

export default function InvestorsPanel({ investors = [] }) {
  const total = investors.reduce((s, i) => s + (i.amount || 0), 0);

  // Build stacked bar segments
  const segments = investors.map((inv, idx) => ({
    ...inv,
    frac: total > 0 ? inv.amount / total : 0,
    color: INVESTOR_COLORS[idx % INVESTOR_COLORS.length],
    initials: initials(inv.name),
  }));

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Capital Stack</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{investors.length} investors</div>
        </div>
        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-blue)' }}>
          {fmtINR(total)}
        </span>
      </div>

      {/* Stacked bar */}
      {investors.length > 0 && (
        <div
          style={{
            height: 10,
            borderRadius: 999,
            overflow: 'hidden',
            display: 'flex',
            gap: 2,
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {segments.map((s, i) => (
            <div
              key={s._id || i}
              title={`${s.name}: ${(s.frac * 100).toFixed(1)}%`}
              style={{
                height: '100%',
                width: `${s.frac * 100}%`,
                background: s.color,
                borderRadius: i === 0 ? '999px 0 0 999px' : i === segments.length - 1 ? '0 999px 999px 0' : 0,
                minWidth: 2,
                transition: 'width 0.4s',
              }}
            />
          ))}
        </div>
      )}

      {/* Investor list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {investors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-3)', fontSize: 12 }}>
            No investors found
          </div>
        ) : investors.map((inv, i) => (
          <div
            key={inv._id || i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 0',
              borderBottom: i < investors.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: INVESTOR_COLORS[i % INVESTOR_COLORS.length],
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              {initials(inv.name)}
            </div>

            {/* Name + date */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {inv.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{fmtDate(inv.date)}</div>
            </div>

            {/* Share + amount */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="num" style={{ fontSize: 12, fontWeight: 700 }}>{fmtINR(inv.amount)}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{(inv.share || 0).toFixed(1)}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
