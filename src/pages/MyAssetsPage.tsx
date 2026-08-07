import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Layers,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Plus,
  Compass,
} from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAllAssets } from '@/hooks/useAllAssets';
import { formatCurrency } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';

export default function MyAssetsPage() {
  const [, setLocation] = useLocation();
  const { holdings, totalInvested, totalCurrentValue, totalUnrealizedPL } = useHoldings();
  const { profile } = useUserProfile();
  const assets = useAllAssets();

  const [activeTab, setActiveTab] = useState<'ALL' | 'stock' | 'index' | 'commodity' | 'option' | 'cash'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const cashBalance = profile?.virtualBalance || 0;
  const grandTotalValue = (totalCurrentValue || 0) + cashBalance;
  const overallReturnPercent = totalInvested > 0 ? ((totalCurrentValue - totalInvested) / totalInvested) * 100 : 0;
  const realizedPL = (profile?.totalProfitLoss || 0) - (totalUnrealizedPL || 0);

  // Classify holdings into categories
  const enrichedHoldings = holdings.map((h) => {
    const marketAsset = assets.find((a) => a.symbol === h.symbol);
    const category = marketAsset?.type || 'stock';
    const currentPrice = h.currentPrice;
    const currentVal = h.currentValue;
    const investedVal = h.totalInvested;
    const pnl = h.unrealizedPL;
    const pnlPercent = h.unrealizedPLPercent;

    return {
      ...h,
      marketAsset,
      category,
      currentPrice,
      currentVal,
      investedVal,
      pnl,
      pnlPercent,
    };
  });

  // Calculate totals per asset class
  const stocksTotal = enrichedHoldings.filter((h) => h.category === 'stock').reduce((acc, item) => acc + item.currentVal, 0);
  const indexTotal = enrichedHoldings.filter((h) => h.category === 'index').reduce((acc, item) => acc + item.currentVal, 0);
  const goldTotal = enrichedHoldings.filter((h) => h.category === 'commodity' && (h.symbol.includes('GOLD') || h.symbol.includes('GOLDBEES'))).reduce((acc, item) => acc + item.currentVal, 0);
  const commoditiesTotal = enrichedHoldings.filter((h) => h.category === 'commodity' && !h.symbol.includes('GOLD')).reduce((acc, item) => acc + item.currentVal, 0);
  const foTotal = enrichedHoldings.filter((h) => h.category === 'option').reduce((acc, item) => acc + item.currentVal, 0);

  const filteredHoldings = enrichedHoldings.filter((item) => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || (item.marketAsset?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeTab === 'ALL') return true;
    if (activeTab === 'stock') return item.category === 'stock';
    if (activeTab === 'index') return item.category === 'index';
    if (activeTab === 'commodity') return item.category === 'commodity';
    if (activeTab === 'option') return item.category === 'option';
    if (activeTab === 'cash') return false;
    return true;
  });

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
          <Layers className="w-4 h-4 text-emerald-500" />
          My Assets Breakdown
        </h1>
        <button
          onClick={() => setLocation('/trade')}
          className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Invest
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Net Asset Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-semibold">Total Net Asset Value</span>
              <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
                {formatCurrency(grandTotalValue)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs font-medium text-slate-300">
                <span>Invested: <strong className="text-white">{formatCurrency(totalInvested)}</strong></span>
                <span>•</span>
                <span className={`flex items-center font-bold ${overallReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {overallReturnPercent >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                  {overallReturnPercent >= 0 ? '+' : ''}{overallReturnPercent.toFixed(2)}% Overall
                </span>
              </div>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Unrealized P&L</span>
                <span className={`text-sm font-bold ${totalUnrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalUnrealizedPL >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPL)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Realized P&L</span>
                <span className={`text-sm font-bold ${realizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {realizedPL >= 0 ? '+' : ''}{formatCurrency(realizedPL)}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Cash Balance</span>
                <span className="text-sm font-bold text-amber-400">{formatCurrency(cashBalance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Class Chips & Summary Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Asset Classes Allocation</h2>
            <span className="text-xs text-slate-500">{holdings.length} Positions</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {[
              { id: 'stock', label: 'Stocks', amount: stocksTotal },
              { id: 'index', label: 'Indices / ETFs', amount: indexTotal },
              { id: 'gold', label: 'Gold', amount: goldTotal },
              { id: 'commodity', label: 'Commodities', amount: commoditiesTotal },
              { id: 'option', label: 'F&O Options', amount: foTotal },
              { id: 'cash', label: 'Cash Balance', amount: cashBalance },
            ].map((ac) => {
              const weight = grandTotalValue > 0 ? (ac.amount / grandTotalValue) * 100 : 0;
              return (
                <button
                  key={ac.id}
                  onClick={() => {
                    triggerHaptic('light');
                    setActiveTab(ac.id as any);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    activeTab === ac.id
                      ? 'bg-white dark:bg-slate-900 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md'
                      : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{ac.label}</span>
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {formatCurrency(ac.amount)}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium mt-1">
                    {weight.toFixed(1)}% of Net Assets
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Assets' },
              { id: 'stock', label: 'Stocks' },
              { id: 'index', label: 'Indices' },
              { id: 'commodity', label: 'Commodities' },
              { id: 'option', label: 'F&O Options' },
              { id: 'cash', label: 'Cash' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveTab(tab.id as any);
                }}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all border ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white border-emerald-500 font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Holdings Asset List */}
        {activeTab === 'cash' ? (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Unallocated Cash Balance</h3>
                  <p className="text-xs text-slate-500">Available instantly for trades and withdrawals</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-extrabold">{formatCurrency(cashBalance)}</div>
                <div className="text-xs text-emerald-500 font-bold">100% Liquid</div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setLocation('/trade')}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all text-center"
              >
                Deposit / Add Funds
              </button>
              <button
                onClick={() => setLocation('/history')}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-center"
              >
                Cash Statement
              </button>
            </div>
          </div>
        ) : filteredHoldings.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No holdings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You do not have active holdings in this category. Explore market opportunities to build your portfolio.
            </p>
            <button
              onClick={() => setLocation('/markets')}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all inline-flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" /> Explore Markets
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredHoldings.map((item) => (
              <div
                key={item.symbol}
                onClick={() => setLocation(`/markets/${item.symbol}`)}
                className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer shadow-xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs flex items-center justify-center text-slate-700 dark:text-slate-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                      {item.symbol.substring(0, 3)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {item.symbol}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Qty: {item.quantity} • Avg: {formatCurrency(item.avgBuyPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                      {formatCurrency(item.currentVal)}
                    </div>
                    <div className={`text-xs font-bold flex items-center justify-end ${item.pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {item.pnl >= 0 ? '+' : ''}{formatCurrency(item.pnl)} ({item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
