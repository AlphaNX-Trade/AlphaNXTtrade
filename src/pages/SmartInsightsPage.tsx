import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Sparkles,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAllAssets } from '@/hooks/useAllAssets';
import { formatCurrency } from '@/lib/formatters';

export default function SmartInsightsPage() {
  const [, setLocation] = useLocation();
  const { holdings, totalInvested, totalCurrentValue } = useHoldings();
  const { transactions } = useTransactionHistory();
  const { profile } = useUserProfile();
  const assets = useAllAssets();

  // Enriched holding calculations
  const enrichedHoldings = holdings.map((h) => {
    const marketAsset = assets.find((a) => a.symbol === h.symbol);
    const sector = marketAsset?.sector || 'General';
    const pnl = h.unrealizedPL;
    const pnlPercent = h.unrealizedPLPercent;

    return {
      ...h,
      sector,
      pnl,
      pnlPercent,
      currentVal: h.currentValue,
    };
  });

  // Best & Worst performing investments
  const sortedByPL = [...enrichedHoldings].sort((a, b) => b.pnlPercent - a.pnlPercent);
  const bestPerformer = sortedByPL[0] || null;
  const worstPerformer = sortedByPL.length > 1 ? sortedByPL[sortedByPL.length - 1] : null;

  // Largest Holding
  const sortedByValue = [...enrichedHoldings].sort((a, b) => b.currentVal - a.currentVal);
  const largestHolding = sortedByValue[0] || null;

  // Sector Profitability & Diversification Score
  const sectorMap: Record<string, { invested: number; current: number; pnl: number }> = {};
  enrichedHoldings.forEach((h) => {
    if (!sectorMap[h.sector]) {
      sectorMap[h.sector] = { invested: 0, current: 0, pnl: 0 };
    }
    sectorMap[h.sector].invested += h.totalInvested;
    sectorMap[h.sector].current += h.currentVal;
    sectorMap[h.sector].pnl += h.pnl;
  });

  const sectorList = Object.entries(sectorMap).map(([name, val]) => ({
    name,
    ...val,
    pnlPercent: val.invested > 0 ? (val.pnl / val.invested) * 100 : 0,
  }));

  const mostProfitableSector = [...sectorList].sort((a, b) => b.pnlPercent - a.pnlPercent)[0] || null;

  // Diversification score calculation (0 - 100)
  const uniqueSectors = sectorList.length;
  const totalHoldingsCount = holdings.length;
  const largestWeightPercent = totalCurrentValue > 0 && largestHolding ? (largestHolding.currentVal / totalCurrentValue) * 100 : 0;

  let diversificationScore = 50; // base score
  if (totalHoldingsCount >= 5) diversificationScore += 15;
  if (totalHoldingsCount >= 10) diversificationScore += 15;
  if (uniqueSectors >= 3) diversificationScore += 10;
  if (uniqueSectors >= 5) diversificationScore += 10;
  if (largestWeightPercent > 40) diversificationScore -= 20; // penalize over-concentration

  diversificationScore = Math.min(100, Math.max(10, diversificationScore));

  let scoreLabel = 'Moderate';
  let scoreColor = 'text-amber-500 bg-amber-500/10 border-amber-500/30';
  if (diversificationScore >= 80) {
    scoreLabel = 'Optimal';
    scoreColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30';
  } else if (diversificationScore < 40) {
    scoreLabel = 'High Concentration Risk';
    scoreColor = 'text-rose-500 bg-rose-500/10 border-rose-500/30';
  }

  // Monthly summary
  const currentMonthTrades = transactions.filter((tx) => {
    if (!tx.timestamp) return false;
    const date = tx.timestamp.toDate();
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  const monthlyBuyVolume = currentMonthTrades.filter((t) => t.side === 'BUY').reduce((acc, t) => acc + (t.totalAmount || 0), 0);
  const monthlySellVolume = currentMonthTrades.filter((t) => t.side === 'SELL').reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/portfolio')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" />
          Smart Insights & Analytics
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Diversification Score Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-purple-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-purple-400 font-mono font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Portfolio Health Index
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-white">{diversificationScore}</span>
                <span className="text-xs text-slate-400">/ 100 Health Score</span>
                <span className={`text-xs font-extrabold px-3 py-1 rounded-xl border ${scoreColor}`}>
                  {scoreLabel}
                </span>
              </div>
              <p className="text-xs text-slate-300 max-w-md">
                {diversificationScore >= 80
                  ? 'Your portfolio is well-balanced across multiple sectors with controlled concentration risk.'
                  : 'Consider spreading holdings across different asset classes and industries to lower volatility.'}
              </p>
            </div>

            {/* Visual Health Gauge */}
            <div className="w-full md:w-56 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-2">
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Sector Count</span>
                <strong className="text-white">{uniqueSectors} Industries</strong>
              </div>
              <div className="flex justify-between text-xs text-slate-300 font-medium">
                <span>Top Holding Weight</span>
                <strong className="text-white">{largestWeightPercent.toFixed(1)}%</strong>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-emerald-400 rounded-full"
                  style={{ width: `${diversificationScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top & Worst Performers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Best Performer */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-500 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Best Performing Asset
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                Top Gain
              </span>
            </div>

            {bestPerformer ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{bestPerformer.symbol}</h3>
                  <p className="text-xs text-slate-500 font-medium">{bestPerformer.sector}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-500">
                    +{bestPerformer.pnlPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    +{formatCurrency(bestPerformer.pnl)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">No holdings available yet.</p>
            )}
          </div>

          {/* Worst Performer */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1">
                <TrendingDown className="w-4 h-4" /> Lowest Performing Asset
              </span>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-500">
                Laggard
              </span>
            </div>

            {worstPerformer ? (
              <div className="flex items-center justify-between pt-1">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{worstPerformer.symbol}</h3>
                  <p className="text-xs text-slate-500 font-medium">{worstPerformer.sector}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-black ${worstPerformer.pnlPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {worstPerformer.pnlPercent >= 0 ? '+' : ''}{worstPerformer.pnlPercent.toFixed(2)}%
                  </div>
                  <div className="text-xs font-bold text-slate-500">
                    {formatCurrency(worstPerformer.pnl)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-3">No secondary holding available yet.</p>
            )}
          </div>
        </div>

        {/* Sector Profitability Breakdown */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <PieChart className="w-4 h-4 text-indigo-500" /> Sector Performance & Allocation
            </h2>
            {mostProfitableSector && (
              <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                Most Profitable: {mostProfitableSector.name}
              </span>
            )}
          </div>

          <div className="space-y-3 pt-2">
            {sectorList.map((sec) => {
              const allocationPercent = totalCurrentValue > 0 ? (sec.current / totalCurrentValue) * 100 : 0;
              return (
                <div key={sec.name} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">{sec.name}</span>
                    <span className={`font-extrabold ${sec.pnlPercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {sec.pnlPercent >= 0 ? '+' : ''}{sec.pnlPercent.toFixed(2)}% P&L ({formatCurrency(sec.pnl)})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span>Valuation: {formatCurrency(sec.current)}</span>
                    <span>{allocationPercent.toFixed(1)}% of Portfolio</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${Math.min(100, allocationPercent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Monthly Investment Summary */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" /> Monthly Trading & Investment Summary
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 block font-medium">Monthly Executed Trades</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
                {currentMonthTrades.length} Trades
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 block font-medium">Total Capital Deployed</span>
              <span className="text-2xl font-black text-emerald-500 mt-1 block">
                {formatCurrency(monthlyBuyVolume)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <span className="text-xs text-slate-500 block font-medium">Total Realized Inflows</span>
              <span className="text-2xl font-black text-amber-500 mt-1 block">
                {formatCurrency(monthlySellVolume)}
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
