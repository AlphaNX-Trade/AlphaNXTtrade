import React from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  Lock,
  Unlock,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Zap,
} from 'lucide-react';
import { calculateTraderLevel } from '@/lib/traderLevelSystem';

interface TraderLevelCardProps {
  totalProfitLoss?: number;
  virtualBalance?: number;
  portfolioValue?: number;
  compact?: boolean;
}

export const TraderLevelCard: React.FC<TraderLevelCardProps> = ({
  totalProfitLoss = 0,
  virtualBalance = 1000000,
  portfolioValue = 0,
  compact = false,
}) => {
  const levelData = calculateTraderLevel(totalProfitLoss, virtualBalance, portfolioValue);
  const { currentTier, nextTier, currentProfit, overallProgressPercent, profitToNextLevel } = levelData;

  if (compact) {
    return (
      <div className={`p-3 rounded-2xl border ${currentTier.borderClass} bg-gradient-to-r ${currentTier.bgGradient} flex items-center justify-between gap-3`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-background/80 border border-border flex items-center justify-center font-mono font-bold text-xs text-primary shrink-0 shadow-sm">
            L{currentTier.level}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-bold text-xs ${currentTier.color}`}>{currentTier.title}</span>
              <span className="text-[10px] font-mono bg-card px-1.5 py-0.2 rounded border border-border/80">
                Level {currentTier.level}
              </span>
            </div>
            {nextTier ? (
              <p className="text-[10px] font-mono text-muted-foreground">
                Next: <span className="text-foreground font-semibold">₹{profitToNextLevel.toLocaleString('en-IN')} P&L</span> needed for {nextTier.title}
              </p>
            ) : (
              <p className="text-[10px] font-mono text-amber-400 font-bold">Max Trader Level Achieved!</p>
            )}
          </div>
        </div>

        {/* Level progress meter */}
        {nextTier && (
          <div className="w-20 text-right space-y-1">
            <div className="flex justify-end text-[10px] font-mono font-bold text-primary">
              {overallProgressPercent}%
            </div>
            <div className="w-full bg-background/80 rounded-full h-1.5 overflow-hidden border border-border/50">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`rounded-3xl border ${currentTier.borderClass} bg-card/90 backdrop-blur-xl p-5 sm:p-6 space-y-5 shadow-sm relative overflow-hidden`}>
      {/* Background glow accent */}
      <div className={`absolute -right-12 -top-12 w-36 h-36 rounded-full bg-gradient-to-br ${currentTier.bgGradient} blur-2xl opacity-60 pointer-events-none`} />

      {/* Level Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentTier.bgGradient} border ${currentTier.borderClass} flex items-center justify-center shrink-0 shadow-inner`}>
            <Trophy className={`w-6 h-6 ${currentTier.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base sm:text-lg text-foreground font-sans">
                {currentTier.title}
              </h3>
              <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border bg-card/80 ${currentTier.color} ${currentTier.borderClass}`}>
                {currentTier.badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              Tier unlocked via Cumulative P&L & Net Worth
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right space-y-0.5 font-mono">
          <p className="text-[10px] uppercase text-muted-foreground">Current Cumulative P&L</p>
          <p className="font-bold text-base text-emerald-400">
            +₹{currentProfit.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* Progress Bar to Next Level */}
      {nextTier ? (
        <div className="space-y-2 bg-secondary/30 border border-border/60 rounded-2xl p-4 relative z-10">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              Progress to <span className="text-foreground font-bold">{nextTier.title} (Level {nextTier.level})</span>
            </span>
            <span className="font-bold text-primary">{overallProgressPercent}%</span>
          </div>

          <div className="w-full bg-background rounded-full h-2.5 overflow-hidden border border-border/80 p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="bg-gradient-to-r from-primary to-cyan-400 h-full rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground pt-1">
            <span>
              Target Profit: <strong className="text-foreground">₹{nextTier.minProfit.toLocaleString('en-IN')}</strong>
            </span>
            <span>
              Needed: <strong className="text-amber-400">₹{profitToNextLevel.toLocaleString('en-IN')}</strong>
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center text-xs font-mono text-amber-300 font-bold flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Maximum Trader Level Achieved! You hold the highest status in AlphaNXT.</span>
        </div>
      )}

      {/* Unlocked Perks List */}
      <div className="space-y-2 relative z-10">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Level {currentTier.level} Unlocked Access Perks
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {currentTier.perks.map((perk, i) => (
            <div
              key={i}
              className="bg-secondary/40 border border-border/60 rounded-xl p-2.5 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-foreground/90 font-mono text-[11px]">{perk}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
