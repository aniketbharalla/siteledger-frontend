import React from 'react';
import { fmtINR } from '../utils/format';
import { IconPeople, IconReceipt, IconCash, IconTrend, IconArrowUp, IconArrowDown } from './icons';

const KPI_CONFIG = [
  {
    key: 'investment',
    label: 'Total Investment',
    Icon: IconPeople,
    grad: 'var(--grad-primary)',
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    Icon: IconReceipt,
    grad: 'var(--grad-pink)',
  },
  {
    key: 'receipts',
    label: 'Client Receipts',
    Icon: IconCash,
    grad: 'var(--grad-green)',
  },
  {
    key: 'profit',
    label: 'Net Profit',
    Icon: IconTrend,
    grad: 'var(--grad-amber)',
  },
];

function KPICard({ config, value, profitPct, totalPayments }) {
  const { label, Icon, grad, key } = config;

  // Only show profit % badge when there are actual payments
  const showDelta = key === 'profit' && totalPayments > 0;
  const delta = showDelta ? Math.abs(profitPct).toFixed(1) + '%' : null;
  const up = (profitPct || 0) >= 0;

  return (
    <div
      className="card"
      style={{
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        minWidth: 0,
        transition: 'transform 0.15s',
        cursor: 'default',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          className="icon-tile"
          style={{ background: grad, width: 40, height: 40, borderRadius: 11, flexShrink: 0 }}
        >
          <Icon size={18} />
        </div>
        {delta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 11,
              fontWeight: 700,
              color: up ? 'var(--accent-green)' : 'var(--accent-red)',
              background: up ? 'rgba(1,181,116,0.12)' : 'rgba(227,26,26,0.12)',
              borderRadius: 8,
              padding: '3px 7px',
              whiteSpace: 'nowrap',
            }}
          >
            {up ? <IconArrowUp size={10} /> : <IconArrowDown size={10} />}
            {delta}
          </div>
        )}
      </div>

      <div>
        <div className="num" style={{ fontSize: 18, fontWeight: 700, lineHeight: 1, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {fmtINR(value)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  );
}

export default function KPIStrip({ totalInvestment, totalExpenses, totalPayments, netProfit, profitPct }) {
  const values = {
    investment: totalInvestment,
    expenses: totalExpenses,
    receipts: totalPayments,
    profit: netProfit,
  };

  return (
    <>
      <style>{`
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        @media (max-width: 700px) {
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
        }
      `}</style>
      <div className="kpi-grid">
        {KPI_CONFIG.map(cfg => (
          <KPICard key={cfg.key} config={cfg} value={values[cfg.key]} profitPct={profitPct} totalPayments={totalPayments} />
        ))}
      </div>
    </>
  );
}
