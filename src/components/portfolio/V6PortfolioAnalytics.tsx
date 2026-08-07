import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Layers,
  Award,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { usePersonalStats } from '@/hooks/usePersonalStats';
import { useHoldings } from '@/hooks/useHoldings';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useAllAssets } from '@/hooks/useAllAssets';
import { formatCurrency } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';

export function V6PortfolioAnalytics() {
  const { stats } = usePersonalStats();
  const { holdings, totalInvested, totalCurrentValue } = useHoldings();
  const { transactions } = useTransactionHistory();
  const assets = useAllAssets();

  const [activeTab, setActiveTab] = useState<'allocation' | 'performance' | 'timeline'>('allocation');

  const totalValue = totalCurrentValue || 0;
  const totalInv = totalInvested || 0;
  const netProfit = totalValue - totalInv;
  const profitPercentage = totalInv > 0 ? (netProfit / totalInv) * 100 : 0;

  // Sector Breakdown
  const sectorMap: Record<string, number> = {};
  holdings.forEach((h) => {
    const asset = assets.find((a) => a.symbol === h.symbol);
    const sector = asset?.sector || asset?.type || 'Equities';
    const val = h.quantity * (asset?.price || h.avgBuyPrice);
    sectorMap[sector] = (sectorMap[sector] || 0) + val;
  });

  const sectorList = Object.entries(sectorMap)
    .map(([sector, amount]) => ({
      sector,
      amount,
      percentage: totalValue > 0 ? Math.round((amount / totalValue) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Asset Class Allocation
  const assetClasses = [
    { name: 'Equities & Stocks', percentage: 85, color: 'bg-emerald-500' },
    { name: 'Cash & Wallet Buffer', percentage: 15, color: 'bg-indigo-500' },
  ];

  // Diversification Score (0 - 100)
  const sectorCount = sectorList.length;
  const maxConcentration = sectorList.length > 0 ? sectorList[0].percentage : 0;
  let diversificationScore = Math.min(100, sectorCount * 20 + (100 - maxConcentration));
  if (holdings.length === 0) diversificationScore = 0;

  // Timeline events from transactions
  const timelineEvents = transactions.slice(0, 10).map((tx) => ({
    id: tx.id,
    type: tx.side,
    title: `${tx.side} ${tx.quantity} qty of ${tx.symbol}`,
    amount: tx.totalAmount,
    price: tx.price,
    date: new Date(tx.timestamp?.seconds ? tx.timestamp.seconds * 1000 : Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
  }));

  return (
    <div className="space-y-6">
      {/* Overview Metric Header */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Portfolio Value</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">Invested: {formatCurrency(totalInvested)}</div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Unrealized P&L</span>
          <div
            className={`text-2xl font-black mt-1 flex items-center gap-1 ${
              netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
            }`}
          >
            {netProfit >= 0 ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
            {netProfit >= 0 ? '+' : ''}
            {formatCurrency(netProfit)}
          </div>
          <div className={`text-xs font-bold ${netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
            ({profitPercentage >= 0 ? '+' : ''}
            {profitPercentage.toFixed(2)}%)
          </div>
        </div>

        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Diversification Index</span>
          <div className="text-2xl font-black text-indigo-500 mt-1 flex items-center gap-2">
            <Award className="w-6 h-6" /> {Math.round(diversificationScore)} / 100
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{sectorCount} active sectors</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-bold">
        {[
          { id: 'allocation', label: 'Asset & Sector Allocation', icon: PieIcon },
          { id: 'performance', label: 'Monthly Performance', icon: BarChart3 },
          { id: 'timeline', label: 'Investment Timeline', icon: Clock },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.id as any);
              }}
              className={`pb-3 flex items-center gap-2 border-b-2 transition-all ${
                isActive
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Allocation */}
      {activeTab === 'allocation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sector Allocation Breakdown */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-500" /> Sector Allocation
            </h4>

            {sectorList.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">No active holdings to display sector breakdown.</div>
            ) : (
              <div className="space-y-3">
                {sectorList.map((sec) => (
                  <div key={sec.sector} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700 dark:text-slate-300">{sec.sector}</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {formatCurrency(sec.amount)} ({sec.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${sec.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Asset Class Breakdown */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-500" /> Asset Class Distribution
            </h4>

            <div className="space-y-4 pt-2">
              {assetClasses.map((ac) => (
                <div key={ac.name} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{ac.name}</span>
                    <span className="text-indigo-500">{ac.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div className={`h-full ${ac.color} rounded-full`} style={{ width: `${ac.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Performance */}
      {activeTab === 'performance' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" /> Performance Progression
            </h4>
            <span className="text-xs text-slate-400 font-medium">Estimated Monthly Yields</span>
          </div>

          {/* Performance Bar Chart Simulation */}
          <div className="h-48 flex items-end justify-between gap-3 pt-6 border-b border-slate-100 dark:border-slate-800 px-4">
            {[
              { month: 'Jan', gain: 4.2 },
              { month: 'Feb', gain: 6.5 },
              { month: 'Mar', gain: -1.8 },
              { month: 'Apr', gain: 8.1 },
              { month: 'May', gain: 3.4 },
              { month: 'Jun', gain: 5.9 },
              { month: 'Jul', gain: 7.2 },
            ].map((m) => {
              const isPositive = m.gain >= 0;
              const heightPct = Math.min(100, Math.abs(m.gain) * 10 + 20);
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className={`text-[10px] font-bold ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isPositive ? '+' : ''}
                    {m.gain}%
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      isPositive ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs text-slate-400 font-semibold">{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Investment Timeline */}
      {activeTab === 'timeline' && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h4 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-500" /> Chronological Activity Log
          </h4>

          {timelineEvents.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions recorded yet. Execute trades to build your investment timeline.
            </div>
          ) : (
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
              {timelineEvents.map((evt) => (
                <div key={evt.id} className="relative">
                  <div
                    className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                      evt.type === 'BUY' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{evt.title}</div>
                      <div className="text-xs text-slate-400">{evt.date}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(evt.amount)}
                      </div>
                      <div className="text-xs text-slate-400">@ {formatCurrency(evt.price)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
