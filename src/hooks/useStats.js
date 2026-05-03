import { useMemo } from 'react';

/**
 * Aggregate stats from raw data arrays.
 * All aggregation is done client-side.
 */
export function useStats({ sites = [], expenses = [], investors = [], payments = [], selectedIds = null }) {
  return useMemo(() => {
    // Filter to selected site IDs if provided
    const siteIds = selectedIds && selectedIds.length > 0
      ? new Set(selectedIds)
      : null;

    const filteredSites     = siteIds ? sites.filter(s => siteIds.has(s._id)) : sites;
    const filteredExpenses  = siteIds ? expenses.filter(e => siteIds.has(e.siteId?._id || e.siteId)) : expenses;
    const filteredInvestors = siteIds ? investors.filter(i => siteIds.has(i.siteId?._id || i.siteId)) : investors;
    const filteredPayments  = siteIds ? payments.filter(p => siteIds.has(p.siteId?._id || p.siteId)) : payments;

    // KPI totals
    const totalInvestment = filteredInvestors.reduce((s, i) => s + (i.amount || 0), 0);
    const totalExpenses   = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalPayments   = filteredPayments.reduce((s, p) => s + (p.amount || 0), 0);
    const netProfit       = totalPayments - totalExpenses;

    // Delta calculations (mock — backend can provide this if desired)
    const expDelta   = totalInvestment > 0 ? ((totalExpenses / totalInvestment) * 100 - 100) : 0;
    const profitPct  = totalPayments > 0 ? (netProfit / totalPayments) * 100 : 0;

    // Category breakdown
    const byCategory = { material: 0, labor: 0, misc: 0 };
    filteredExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    // Per-site metrics
    const siteMetrics = filteredSites.map(site => {
      const id = site._id;
      const sExpenses  = filteredExpenses.filter(e => (e.siteId?._id || e.siteId) === id);
      const sPayments  = filteredPayments.filter(p => (p.siteId?._id || p.siteId) === id);
      const sInvestors = filteredInvestors.filter(i => (i.siteId?._id || i.siteId) === id);

      const spent    = sExpenses.reduce((s, e) => s + e.amount, 0);
      const received = sPayments.reduce((s, p) => s + p.amount, 0);
      const invested = sInvestors.reduce((s, i) => s + i.amount, 0);
      const budget   = site.totalBudget || 0;
      const profit   = received - spent;
      const burnRate = budget > 0 ? (spent / budget) * 100 : 0;

      return { ...site, spent, received, invested, profit, burnRate };
    });

    // Recent items (last 5)
    const recentPayments = [...filteredPayments]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    const recentExpenses = [...filteredExpenses]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);

    // Largest category
    const largestCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || 'material';

    // Per-investor profit breakdown (share % of net profit)
    const investorProfits = filteredInvestors.map(inv => ({
      ...inv,
      profitShare: netProfit * ((inv.share || 0) / 100),
      roi: inv.amount > 0 ? (netProfit * ((inv.share || 0) / 100) / inv.amount) * 100 : 0,
    }));

    return {
      totalInvestment,
      totalExpenses,
      totalPayments,
      netProfit,
      profitPct,
      expDelta,
      byCategory,
      siteMetrics,
      recentPayments,
      recentExpenses,
      filteredSites,
      filteredExpenses,
      filteredInvestors,
      filteredPayments,
      investorProfits,
      largestCat,
    };
  }, [sites, expenses, investors, payments, selectedIds]);
}
