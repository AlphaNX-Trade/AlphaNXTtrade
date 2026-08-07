import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  TrendingUp,
  Flame,
  Zap,
  Building2,
  ShieldCheck,
  Award,
  Layers,
  ArrowRight,
  Clock,
  ShoppingBag,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { useAllAssets, Asset } from '@/hooks/useAllAssets';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { formatCurrency } from '@/lib/formatters';
import { useLocation } from 'wouter';
import { triggerHaptic } from '@/lib/haptics';

export interface InvestmentCollection {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  color: string;
  badge: string;
  symbols: string[];
}

const TRENDING_COLLECTIONS: InvestmentCollection[] = [
  {
    id: 'tech_giants',
    title: 'Tech & IT Titans',
    subtitle: 'Indian tech leaders driving cloud, AI, and IT services globally',
    icon: Zap,
    color: 'from-blue-500 to-indigo-600',
    badge: 'High Growth',
    symbols: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM'],
  },
  {
    id: 'dividends',
    title: 'High Yield Dividend Kings',
    subtitle: 'Consistent cash dividend payers for steady passive income',
    icon: Award,
    color: 'from-emerald-500 to-teal-600',
    badge: 'Cash Flow',
    symbols: ['RELIANCE', 'TCS', 'HDFCBANK', 'ITC', 'NTPC'],
  },
  {
    id: 'green_energy',
    title: 'Green Energy & Future Mobility',
    subtitle: 'Solar, EV manufacturers, and clean energy pioneers',
    icon: Flame,
    color: 'from-amber-500 to-emerald-600',
    badge: 'Future 2030',
    symbols: ['TATAMOTORS', 'RELIANCE', 'NTPC', 'POWERGRID'],
  },
  {
    id: 'banking_powerhouses',
    title: 'Banking & Financial Fortress',
    subtitle: 'Top Indian private and public sector banking heavyweights',
    icon: Building2,
    color: 'from-purple-500 to-pink-600',
    badge: 'Core Value',
    symbols: ['HDFCBANK', 'ICICIBANK', 'SBIN', 'KOTAKBANK', 'AXISBANK'],
  },
];

const BEGINNER_IDEAS = [
  {
    id: 'b1',
    title: 'SIP Starter Basket',
    risk: 'Low Risk',
    expectedReturn: '12-15% p.a.',
    description: 'A balanced basket of NIFTY 50 blue chips for long-term compounding.',
    symbols: ['RELIANCE', 'TCS', 'HDFCBANK'],
  },
  {
    id: 'b2',
    title: 'Low Volatility Staples',
    risk: 'Very Low Risk',
    expectedReturn: '10-12% p.a.',
    description: 'FMCG and essential consumer leaders with resilient cash flows.',
    symbols: ['ITC', 'HUL', 'NESTLEIND'],
  },
  {
    id: 'b3',
    title: 'Digital India Future',
    risk: 'Moderate Risk',
    expectedReturn: '15-18% p.a.',
    description: 'High-growth tech and digital infrastructure leaders.',
    symbols: ['INFY', 'TCS', 'BHARTIARTL'],
  },
];

export function V6DiscoverSection() {
  const assets = useAllAssets();
  const [, setLocation] = useLocation();
  const { recentlyViewed } = useRecentlyViewed();
  const { transactions } = useTransactionHistory();

  const [selectedCollection, setSelectedCollection] = useState<InvestmentCollection | null>(null);

  // Recently viewed assets map
  const recentlyViewedAssets = recentlyViewed
    .map((sym) => assets.find((a) => a.symbol === sym))
    .filter(Boolean) as Asset[];

  // Most bought stocks calculation from transactions
  const buyCounts: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.side === 'BUY') {
      buyCounts[tx.symbol] = (buyCounts[tx.symbol] || 0) + tx.quantity;
    }
  });

  // Sort assets by buy counts or default top volume
  const mostBoughtAssets = [...assets]
    .sort((a, b) => {
      const countA = buyCounts[a.symbol] || 0;
      const countB = buyCounts[b.symbol] || 0;
      if (countA !== countB) return countB - countA;
      return b.price - a.price;
    })
    .slice(0, 5);

  const handleAssetClick = (symbol: string) => {
    triggerHaptic('light');
    setLocation(`/asset/${symbol}`);
  };

  return (
    <div className="space-y-8">
      {/* 1. Trending Investment Collections */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Trending Investment Collections
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Curated themes based on sector trends and market tailwinds
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TRENDING_COLLECTIONS.map((col) => {
            const IconComponent = col.icon;
            const collectionAssets = col.symbols
              .map((sym) => assets.find((a) => a.symbol === sym))
              .filter(Boolean) as Asset[];

            return (
              <motion.div
                key={col.id}
                whileHover={{ y: -2 }}
                onClick={() => {
                  triggerHaptic('medium');
                  setSelectedCollection(col);
                }}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 shadow-sm transition-all cursor-pointer group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${col.color} opacity-10 rounded-bl-full pointer-events-none`} />

                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${col.color} text-white flex items-center justify-center shadow-md`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {col.badge}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {col.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {col.subtitle}
                </p>

                {/* Micro stock avatars */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center -space-x-2">
                    {col.symbols.slice(0, 4).map((sym) => (
                      <div
                        key={sym}
                        className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] font-extrabold flex items-center justify-center text-slate-700 dark:text-slate-300"
                      >
                        {sym.slice(0, 2)}
                      </div>
                    ))}
                    {col.symbols.length > 4 && (
                      <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 text-[10px] font-bold flex items-center justify-center text-slate-500">
                        +{col.symbols.length - 4}
                      </div>
                    )}
                  </div>

                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Basket <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Selected Collection Modal / Drawer */}
      {selectedCollection && (
        <div className="fixed inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedCollection.color} text-white flex items-center justify-center`}>
                  <selectedCollection.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    {selectedCollection.title}
                  </h3>
                  <p className="text-xs text-slate-500">{selectedCollection.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCollection(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800 pt-2">
              {selectedCollection.symbols.map((sym) => {
                const asset = assets.find((a) => a.symbol === sym);
                if (!asset) return null;
                const isGain = asset.changePercent >= 0;

                return (
                  <div
                    key={sym}
                    onClick={() => {
                      setSelectedCollection(null);
                      handleAssetClick(sym);
                    }}
                    className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">
                        {asset.symbol}
                      </div>
                      <div className="text-xs text-slate-500">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(asset.price)}
                      </div>
                      <div className={`text-xs font-semibold ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isGain ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* 2. Beginner Investment Ideas */}
      <section>
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Beginner Investment Baskets
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Low volatility, high-quality diversified starting baskets
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {BEGINNER_IDEAS.map((idea) => (
            <div
              key={idea.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-sm space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {idea.risk}
                  </span>
                  <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                    {idea.expectedReturn}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-2">
                  {idea.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {idea.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Includes: {idea.symbols.join(', ')}</span>
                <button
                  onClick={() => handleAssetClick(idea.symbols[0])}
                  className="text-xs font-bold text-emerald-500 hover:underline flex items-center gap-0.5"
                >
                  View <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Recently Viewed & Most Bought Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recently Viewed */}
        <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-500" />
            Recently Viewed Stocks
          </h3>

          {recentlyViewedAssets.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              No recently viewed stocks. Search or click any stock to view details.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentlyViewedAssets.slice(0, 4).map((asset) => {
                const isGain = asset.changePercent >= 0;
                return (
                  <div
                    key={asset.symbol}
                    onClick={() => handleAssetClick(asset.symbol)}
                    className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-[11px] text-slate-400">{asset.name}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {formatCurrency(asset.price)}
                      </div>
                      <div className={`text-xs font-semibold ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isGain ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Most Bought Stocks */}
        <section className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-500" />
            Top Traded Stocks
          </h3>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mostBoughtAssets.slice(0, 4).map((asset) => {
              const isGain = asset.changePercent >= 0;
              return (
                <div
                  key={asset.symbol}
                  onClick={() => handleAssetClick(asset.symbol)}
                  className="py-2.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-xl cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center justify-center">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{asset.symbol}</div>
                      <div className="text-[11px] text-slate-400">{asset.sector || 'Equities'}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">
                      {formatCurrency(asset.price)}
                    </div>
                    <div className={`text-xs font-semibold ${isGain ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isGain ? '+' : ''}
                      {asset.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
