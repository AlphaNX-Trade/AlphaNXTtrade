import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Coins,
  Calendar,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  PieChart,
} from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { useAllAssets } from '@/hooks/useAllAssets';
import { formatCurrency } from '@/lib/formatters';

export default function DividendCenterPage() {
  const [, setLocation] = useLocation();
  const { holdings } = useHoldings();
  const assets = useAllAssets();

  // Estimate user dividend payout based on current holdings
  const holdingsWithDividends = holdings.map((h) => {
    const marketAsset = assets.find((a) => a.symbol === h.symbol);
    // Standard average dividend yields for major bluechips
    const estimatedYieldPercent = 1.8; // average dividend yield %
    const annualPayoutPerShare = ((marketAsset?.price || 1000) * estimatedYieldPercent) / 100;
    const totalAnnualDividend = annualPayoutPerShare * h.quantity;

    return {
      ...h,
      marketAsset,
      estimatedYieldPercent,
      annualPayoutPerShare,
      totalAnnualDividend,
    };
  });

  const totalEstimatedAnnualDividends = holdingsWithDividends.reduce((acc, h) => acc + h.totalAnnualDividend, 0);
  const monthlyAverageDividend = totalEstimatedAnnualDividends / 12;

  // Mock Dividend Credit History & Upcoming Payouts
  const upcomingDividends = [
    { symbol: 'RELIANCE', company: 'Reliance Industries Ltd', exDate: '2026-08-18', amountPerShare: 10.0, totalAmount: 250, status: 'Upcoming' },
    { symbol: 'TCS', company: 'Tata Consultancy Services', exDate: '2026-08-25', amountPerShare: 28.0, totalAmount: 420, status: 'Upcoming' },
    { symbol: 'INFY', company: 'Infosys Ltd', exDate: '2026-09-02', amountPerShare: 18.5, totalAmount: 370, status: 'Upcoming' },
  ];

  const historicalDividends = [
    { symbol: 'ITC', company: 'ITC Ltd', creditDate: '2026-07-15', totalCredited: 315.0, status: 'Credited' },
    { symbol: 'HDFCBANK', company: 'HDFC Bank Ltd', creditDate: '2026-06-20', totalCredited: 480.0, status: 'Credited' },
  ];

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
          <Coins className="w-4 h-4 text-amber-500" />
          Dividend Tracker & Earnings Hub
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Dividend Income Summary Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">Estimated Annual Dividend Income</span>
              <div className="text-3xl sm:text-4xl font-black mt-1 tracking-tight text-white">
                {formatCurrency(totalEstimatedAnnualDividends)}
              </div>
              <p className="text-xs text-slate-300 mt-2">
                Averages ~<strong className="text-amber-400">{formatCurrency(monthlyAverageDividend)}/month</strong> in passive portfolio income.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-right">
              <span className="text-xs text-slate-400 block font-medium">Portfolio Yield</span>
              <span className="text-2xl font-black text-amber-400">1.85% p.a.</span>
            </div>
          </div>
        </div>

        {/* Upcoming Dividend Calendar */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" /> Upcoming Payout Schedule
          </h2>

          <div className="space-y-3">
            {upcomingDividends.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 font-bold flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.symbol}</h3>
                    <p className="text-xs text-slate-500 font-medium">Ex-Date: {item.exDate} • ₹{item.amountPerShare}/share</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-amber-500">+{formatCurrency(item.totalAmount)}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Credited Dividend History */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h2 className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Received Dividend Credits
          </h2>

          <div className="space-y-3">
            {historicalDividends.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{item.symbol}</h3>
                    <p className="text-xs text-slate-500 font-medium">Credited on {item.creditDate}</p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-extrabold text-sm text-emerald-500">+{formatCurrency(item.totalCredited)}</div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
