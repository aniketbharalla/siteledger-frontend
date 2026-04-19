import React from 'react';
import { fmtINR } from '../utils/format';
import { IconPeople, IconReceipt, IconCash, IconTrend, IconArrowUp, IconArrowDown } from './icons';

const KPI_CONFIG = [
  {
    key: 'investment',
    label: 'Total Investment',
    Icon: IconPeople,
    grad: 'var(--grad-primary)',
    deltaMeta: '+12.5%',
    deltaUp: true,
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    Icon: IconReceipt,
    grad: 'var(--grad-pink)',
    deltaMeta: '+8.1%',
    deltaUp: false,
  },
  {
    key: 'receipts',
    label: 'Client Receipts',
    Icon: IconCash,
    grad: 'var(--grad-green)',
    deltaMeta: '+18.7%',
    deltaUp: true,
  },
  {
    key: 'profit',
    label: 'Net Profit',
    Icon: IconTrend,
    grad: 'var(--grad-amber)',
    deltaMeta: null,
    deltaUp: true,
  },
];

function KPICard({ config, value, profitPct }) {
  const { label, Icon, grad, deltaMeta, deltaUp, key } = config;

  let delta = deltaMeta;
  let up = deltaUp;
  if (key === 'profit') {
    delta = profitPct != null ? Math.abs(profitPct).toFixed(1) + '%' : null;
    up = (profitPct || 0) >= 0;
  }

  return (
    <div
      className="card"
      style={{
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        flex: 1,
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
          style={{ background: grad, width: 44, height: 44, borderRadius: 12 }}
        >
          <Icon size={20} />
        </div>
        {delta && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              fontWeight: 700,
              color: up ? 'var(--accent-green)' : 'var(--accent-red)',
              background: up ? 'rgba(1,181,116,0.12)' : 'rgba(227,26,26,0.12)',
              borderRadius: 8,
              padding: '3px 8px',
            }}
          >
            {up ? <IconArrowUp size={11} /> : <IconArrowDown size={11} />}
            {delta}
          </div>
        )}
      </div>

      <div>
        <div className="num" style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, marginBottom: 4 }}>
          {fmtINR(value)}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-3)', fontWeight: 500 }}>{label}</div>
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
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {KPI_CONFIG.map(cfg => (
        <KPICard key={cfg.key} config={cfg} value={values[cfg.key]} profitPct={profitPct} />
      ))}
    </div>
  );
}
