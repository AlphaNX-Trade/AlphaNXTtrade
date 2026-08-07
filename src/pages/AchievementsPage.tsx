import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Trophy,
  Lock,
  Zap,
  Award,
  TrendingUp,
  ShieldCheck,
  PieChart,
  GraduationCap,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Compass,
} from 'lucide-react';
import { useAchievementsV5 } from '@/hooks/useAchievementsV5';
import { useUserProfile } from '@/hooks/useUserProfile';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';

const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Zap,
  Award,
  ShieldCheck,
  PieChart,
  GraduationCap,
  Trophy,
};

const MILESTONES = [
  { title: 'Registered Trader', desc: 'Account verified & setup completed', achieved: true, xp: 50 },
  { title: 'First Trade Executed', desc: 'Placed first buy order on AlphaNXT', achieved: true, xp: 100 },
  { title: '10 Trades Milestone', desc: 'Executed 10 successful market trades', achieved: true, xp: 250 },
  { title: 'Portfolio ₹1,00,000+', desc: 'Reached ₹1 Lakh portfolio valuation', achieved: true, xp: 500 },
  { title: 'Sector Explorer', desc: 'Invested across 3 distinct industries', achieved: true, xp: 300 },
  { title: 'Alpha Master Tier', desc: 'Reach 5,000 XP & maintain 7-day streak', achieved: false, xp: 1000 },
];

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const { levelInfo, badges } = useAchievementsV5();
  const { profile } = useUserProfile();

  const userXp = profile?.xp || levelInfo.currentXp || 350;
  const userLevelName = profile?.level || levelInfo.name || 'Pro Analyst';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/profile')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          Trading Levels & Achievements
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* User Level Card */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-950 text-white border border-amber-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border-2 border-amber-500/50 text-amber-400 flex items-center justify-center text-3xl shadow-lg shrink-0">
                🏆
              </div>
              <div>
                <span className="text-xs text-amber-400 uppercase font-mono font-bold tracking-widest block">
                  Trading Tier Rank
                </span>
                <h2 className="text-2xl font-black">{userLevelName}</h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-300 font-semibold">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Flame className="w-4 h-4" /> 7-Day Investment Streak
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center shrink-0">
              <span className="text-xs text-slate-300 block font-medium">Total Experience</span>
              <span className="text-2xl font-black text-amber-400">{userXp} XP</span>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2 pt-6">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Level {levelInfo.level} Progress</span>
              <span className="text-amber-400">{levelInfo.progressPercent.toFixed(0)}%</span>
            </div>

            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/20">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progressPercent}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full"
              />
            </div>

            <div className="flex justify-between text-[11px] font-mono text-slate-400">
              <span>{userXp} XP Current</span>
              <span>Next Level: {levelInfo.nextLevelXp} XP</span>
            </div>
          </div>
        </div>

        {/* Milestones & Badges Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Milestone Timeline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MILESTONES.map((ms, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                  ms.achieved
                    ? 'bg-white dark:bg-slate-900 border-amber-500/30 shadow-xs'
                    : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    ms.achieved ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}>
                    {ms.achieved ? <CheckCircle2 className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ms.title}</h4>
                    <p className="text-xs text-slate-500">{ms.desc}</p>
                  </div>
                </div>

                <span className="text-xs font-extrabold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-xl">
                  +{ms.xp} XP
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Achievement Badges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {badges.map((badge) => {
              const IconComp = ICON_MAP[badge.icon] || Award;
              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    badge.unlocked
                      ? 'bg-white dark:bg-slate-900 border-emerald-500/30 shadow-xs'
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      badge.unlocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        {badge.title}
                        {badge.unlocked && <Sparkles className="w-3.5 h-3.5 text-emerald-500" />}
                      </h4>
                      <p className="text-xs text-slate-500">{badge.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <BottomNav />
      <QuickActionsMenu />
    </div>
  );
}
