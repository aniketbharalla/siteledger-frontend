import React from 'react';
import { fmtINR, fmtDate } from '../utils/format';
import { IconCash } from './icons';

export default function PaymentsPanel({ payments = [] }) {
  const total = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const recent = [...payments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Recent Payments</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{payments.length} receipts</div>
        </div>
        <span className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>
          {fmtINR(total)}
        </span>
      </div>

      {/* Payment list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--ink-3)', fontSize: 12 }}>
            No payments yet
          </div>
        ) : recent.map((p, i) => (
          <div
            key={p._id || i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '9px 0',
              borderBottom: i < recent.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            {/* Icon tile */}
            <div
              className="icon-tile"
              style={{
                background: 'var(--grad-green)',
                width: 34,
                height: 34,
                borderRadius: 10,
                flexShrink: 0,
              }}
            >
              <IconCash size={16} />
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.clientName}
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                {p.milestone} · {fmtDate(p.date)}
              </div>
            </div>

            {/* Amount */}
            <div className="num" style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)', flexShrink: 0 }}>
              +{fmtINR(p.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
