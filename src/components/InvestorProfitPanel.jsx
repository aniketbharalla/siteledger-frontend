import React from 'react';
import { fmtINR, initials } from '../utils/format';

const INVESTOR_COLORS = [
  '#0075FF', '#FF0080', '#01B574', '#FFB547', '#582CFF', '#01B5EC',
];

export default function InvestorProfitPanel({ investorProfits = [], netProfit = 0 }) {
  const hasData = investorProfits.length > 0;
  const isProfit = netProfit >= 0;

  return (
    <div className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>Investor Returns</div>
          <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Profit split by share %</div>
        </div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12,
          fontWeight: 700,
          color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)',
          background: isProfit ? 'rgba(1,181,116,0.12)' : 'rgba(227,26,26,0.12)',
          borderRadius: 8,
          padding: '4px 10px',
        }}>
          <span className="num">{isProfit ? '+' : ''}{fmtINR(netProfit)}</span>
          <span style={{ fontSize: 10, fontWeight: 500, opacity: 0.8 }}>net</span>
        </div>
      </div>

      {/* No data state */}
      {!hasData ? (
        <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--ink-3)', fontSize: 12 }}>
          No investors found
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {investorProfits.map((inv, i) => {
            const color = INVESTOR_COLORS[i % INVESTOR_COLORS.length];
            const profitPositive = inv.profitShare >= 0;
            const roiPositive = inv.roi >= 0;

            return (
              <div
                key={inv._id || i}
                style={{
                  padding: '11px 0',
                  borderBottom: i < investorProfits.length - 1 ? '1px solid var(--line)' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                }}
              >
                {/* Top row: avatar + name + profit amount */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, flexShrink: 0,
                  }}>
                    {initials(inv.name)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inv.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>
                      {(inv.share || 0).toFixed(1)}% share · invested {fmtINR(inv.amount)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div className="num" style={{
                      fontSize: 13, fontWeight: 700,
                      color: profitPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      {profitPositive ? '+' : ''}{fmtINR(inv.profitShare)}
                    </div>
                    <div style={{
                      fontSize: 11, fontWeight: 600,
                      color: roiPositive ? 'var(--accent-green)' : 'var(--accent-red)',
                    }}>
                      ROI {roiPositive ? '+' : ''}{inv.roi.toFixed(1)}%
                    </div>
                  </div>
                </div>

                {/* Progress bar showing share of total profit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div className="progress-bar" style={{ flex: 1 }}>
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min(100, Math.abs(inv.share || 0))}%`,
                        background: color,
                        opacity: 0.8,
                      }}
                    />
                  </div>
                  <span style={{ fontSize: 10, color: 'var(--ink-3)', minWidth: 32, textAlign: 'right' }}>
                    {(inv.share || 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer: total profit pool */}
      {hasData && (
        <div style={{
          borderTop: '1px solid var(--line)',
          paddingTop: 12,
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--ink-3)',
        }}>
          <span>{investorProfits.length} investors</span>
          <span>
            Total pool:{' '}
            <span className="num" style={{
              fontWeight: 700,
              color: isProfit ? 'var(--accent-green)' : 'var(--accent-red)',
            }}>
              {isProfit ? '+' : ''}{fmtINR(netProfit)}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}
