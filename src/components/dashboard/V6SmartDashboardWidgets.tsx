import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  Target,
  Sparkles,
  Info,
  ChevronRight,
  PieChart,
  Lightbulb,
  Edit2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { usePersonalStats } from '@/hooks/usePersonalStats';
import { useAllAssets } from '@/hooks/useAllAssets';
import { usePersonalization, FinancialGoal } from '@/hooks/usePersonalization';
import { formatCurrency } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';
import { useLocation } from 'wouter';

export function V6SmartDashboardWidgets() {
  const { holdings, totalInvested, totalCurrentValue } = useHoldings();
  const { stats } = usePersonalStats();
  const assets = useAllAssets();
  const { settings, setFinancialGoal } = usePersonalization();
  const [, setLocation] = useLocation();

  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTitle, setGoalTitle] = useState(settings.goal?.title || 'Wealth Building 2026');
  const [targetAmount, setTargetAmount] = useState(settings.goal?.targetAmount || 1000000);
  const [targetDate, setTargetDate] = useState(settings.goal?.targetDate || '2026-12-31');

  // Compute Portfolio Health Score (0 - 100)
  const totalValue = totalCurrentValue || 0;
  const totalInv = totalInvested || 0;
  const plPercent = totalInv > 0 ? ((totalValue - totalInv) / totalInv) * 100 : 0;
  const holdingsCount = holdings.length;

  // Diversification score component (0-30)
  const uniqueSectors = new Set(
    holdings.map((h) => assets.find((a) => a.symbol === h.symbol)?.sector).filter(Boolean)
  ).size;
  const divScore = Math.min(30, uniqueSectors * 10);

  // Profitability score component (0-30)
  const profitScore = Math.min(30, Math.max(0, 15 + plPercent * 1.5));

  // Risk & Concentration score (0-20)
  const maxStockWeight = holdingsCount > 0
    ? Math.max(...holdings.map((h) => ((h.quantity * (assets.find((a) => a.symbol === h.symbol)?.price || h.avgBuyPrice)) / (totalValue || 1)) * 100))
    : 0;
  const riskScore = maxStockWeight > 50 ? 5 : maxStockWeight > 30 ? 12 : 20;

  // Cash Liquidity buffer score (0-20)
  const cashScore = 20; // Simulated healthy cash buffer

  const healthScore = Math.round(divScore + profitScore + riskScore + cashScore);

  // Health Score Label & Color
  const getHealthBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    if (score >= 60) return { label: 'Good', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    if (score >= 40) return { label: 'Moderate', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Needs Attention', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' };
  };

  const badge = getHealthBadge(healthScore);

  // Daily Market Summary generator
  const advancingAssets = assets.filter((a) => a.changePercent > 0).length;
  const decliningAssets = assets.filter((a) => a.changePercent < 0).length;
  const marketSentiment = advancingAssets > decliningAssets ? 'Bullish' : decliningAssets > advancingAssets ? 'Bearish' : 'Neutral';

  // Smart Investment Suggestions
  const getPersonalizedTips = () => {
    const tips = [];
    if (holdingsCount === 0) {
      tips.push({
        title: 'Start Your Portfolio',
        description: 'Explore Blue-Chip Titans or SIP Starter Baskets to make your first trade.',
        action: 'Explore Baskets',
        link: '/explore',
      });
    } else {
      if (uniqueSectors < 3) {
        tips.push({
          title: 'Sector Concentration Alert',
          description: `Your investments are clustered in ${uniqueSectors} sector(s). Explore Tech or Energy to improve risk balance.`,
          action: 'Discover Sectors',
          link: '/explore',
        });
      }
      if (maxStockWeight > 40) {
        tips.push({
          title: 'High Single-Stock Exposure',
          description: 'One asset represents over 40% of your portfolio value. Rebalancing can reduce drawdown risks.',
          action: 'View Portfolio',
          link: '/portfolio',
        });
      }
      tips.push({
        title: 'Set Up Price Alerts',
        description: 'Never miss key market movements for your holdings with automated smart price triggers.',
        action: 'Manage Alerts',
        link: '/alerts',
      });
    }
    return tips;
  };

  const tips = getPersonalizedTips();

  // Goal Progress calculation
  const goal = settings.goal;
  const currentGoalProgress = goal ? Math.min(100, Math.round((totalValue / goal.targetAmount) * 100)) : 0;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic('success');
    const updated: FinancialGoal = {
      id: goal?.id || 'g1',
      title: goalTitle,
      targetAmount: Number(targetAmount),
      currentAmount: totalValue,
      targetDate,
      category: goal?.category || 'Wealth',
    };
    setFinancialGoal(updated);
    setShowGoalModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Health Score & Daily Market Digest Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score Gauge (lg:col-span-1) */}
        {settings.dashboardWidgets.healthScore && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Portfolio Health Score
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>

            <div className="flex items-center gap-6 py-2">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100 dark:text-slate-800"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500 transition-all duration-1000 ease-out"
                    strokeDasharray={`${healthScore}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">
                    {healthScore}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">/ 100</span>
                </div>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Diversification</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{divScore}/30</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Return Rate</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(profitScore)}/30</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Risk Concentration</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{riskScore}/20</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                setLocation('/statistics');
              }}
              className="w-full py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              View Full Portfolio Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Daily Market Digest (lg:col-span-2) */}
        {settings.dashboardWidgets.dailySummary && (
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between space-y-4 lg:col-span-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  Daily Market Pulse
                </h3>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  marketSentiment === 'Bullish'
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                }`}
              >
                {marketSentiment} Momentum
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Markets are reflecting <strong className="text-slate-900 dark:text-white">{marketSentiment.toLowerCase()}</strong> activity across Indian equities today. Currently, <strong className="text-emerald-500">{advancingAssets} assets</strong> are trading higher while <strong className="text-rose-500">{decliningAssets} assets</strong> are experiencing pullbacks. Volume remains active across Banking and Technology blue chips.
            </p>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Advancers</div>
                <div className="text-base font-extrabold text-emerald-500 mt-0.5">{advancingAssets} Stocks</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Decliners</div>
                <div className="text-base font-extrabold text-rose-500 mt-0.5">{decliningAssets} Stocks</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Top Sector</div>
                <div className="text-base font-extrabold text-indigo-500 mt-0.5">Technology</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Financial Goal Progress Widget */}
      {settings.dashboardWidgets.goalProgress && goal && (
        <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-base text-white">{goal.title}</h4>
                <p className="text-xs text-indigo-200">Target Date: {goal.targetDate}</p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHaptic('light');
                setShowGoalModal(true);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit Goal
            </button>
          </div>

          <div className="space-y-2 py-2">
            <div className="flex items-center justify-between text-xs sm:text-sm font-semibold">
              <span className="text-indigo-200">
                Current: <strong className="text-white">{formatCurrency(totalValue)}</strong>
              </span>
              <span className="text-emerald-400 font-bold">
                Target: {formatCurrency(goal.targetAmount)} ({currentGoalProgress}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-indigo-500/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentGoalProgress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full shadow-lg shadow-emerald-500/50"
              />
            </div>
          </div>
        </div>
      )}

      {/* Goal Edit Modal */}
      {showGoalModal && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-500" /> Financial Goal Settings
              </h3>
              <button onClick={() => setShowGoalModal(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveGoal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Goal Title
                </label>
                <input
                  type="text"
                  value={goalTitle}
                  onChange={(e) => setGoalTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Target Amount (₹)
                </label>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">
                  Target Completion Date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-semibold focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGoalModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 3. Smart Investment Suggestions Cards */}
      {settings.dashboardWidgets.investmentIdeas && tips.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-500" /> Personalized AI Investment Insights
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tips.map((tip, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm">{tip.title}</h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{tip.description}</p>
                </div>
                <button
                  onClick={() => {
                    triggerHaptic('light');
                    setLocation(tip.link);
                  }}
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs transition-colors"
                >
                  {tip.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
