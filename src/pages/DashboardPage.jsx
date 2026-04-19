import React from 'react';
import KPIStrip from '../components/KPIStrip';
import Donut from '../components/Donut';
import ExpenseTable from '../components/ExpenseTable';
import InvestorsPanel from '../components/InvestorsPanel';
import PaymentsPanel from '../components/PaymentsPanel';
import SiteHealth from '../components/SiteHealth';

export default function DashboardPage({
  stats,
  donutView,
  setDonutView,
  selectedIds,
  setSelectedIds,
  isMobile,
}) {
  const {
    totalInvestment, totalExpenses, totalPayments, netProfit,
    profitPct, byCategory, siteMetrics,
    recentExpenses, filteredInvestors, filteredPayments,
  } = stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* KPIs */}
      <KPIStrip
        totalInvestment={totalInvestment}
        totalExpenses={totalExpenses}
        totalPayments={totalPayments}
        netProfit={netProfit}
        profitPct={profitPct}
      />

      {/* Middle row: Donut + Investors + Payments */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 16 }}>
        <Donut
          byCategory={byCategory}
          totalInvestment={totalInvestment}
          totalExpenses={totalExpenses}
          totalPayments={totalPayments}
          netProfit={netProfit}
          view={donutView}
          setView={setDonutView}
        />
        <InvestorsPanel investors={filteredInvestors.slice(0, 5)} />
        <PaymentsPanel payments={filteredPayments} />
      </div>

      {/* Expense table */}
      <ExpenseTable expenses={recentExpenses} compact={true} />

      {/* Site health */}
      <SiteHealth
        siteMetrics={siteMetrics}
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
    </div>
  );
}
