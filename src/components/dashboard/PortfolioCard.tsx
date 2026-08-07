import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { formatINR, formatINRWithSign } from '@/lib/formatters';

function AnimatedNumber({ value, isHidden }: { value: number; isHidden: boolean }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => formatINR(Math.round(current)));
  
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  if (isHidden) return <span>••••••••</span>;
  return <motion.span>{display}</motion.span>;
}

export function PortfolioCard() {
  const { profile, profileLoading, profileError } = useUserProfile();
  const [hideBalance, setHideBalance] = useState(false);

  if (profileLoading) {
    return (
      <div className="bg-card/80 backdrop-blur-xl border border-primary/20 rounded-2xl p-6 relative overflow-hidden animate-pulse h-[200px]">
        <div className="h-3 w-28 bg-secondary/50 rounded mb-3"></div>
        <div className="h-10 w-52 bg-secondary/50 rounded mb-6"></div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="h-3 w-24 bg-secondary/50 rounded mb-2"></div>
            <div className="h-6 w-28 bg-secondary/50 rounded"></div>
          </div>
          <div>
            <div className="h-3 w-24 bg-secondary/50 rounded mb-2"></div>
            <div className="h-6 w-28 bg-secondary/50 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const vBalance = profile?.virtualBalance ?? 100000;
  const pValue = profile?.portfolioValue ?? 100000;
  const tPL = profile?.totalProfitLoss ?? 0;
  const todayPL = profile?.todayProfitLoss ?? 0;
  const baseValue = pValue - todayPL;
  const todayPercent = baseValue !== 0 ? (todayPL / baseValue) * 100 : 0;

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-card/90 via-card/70 to-card/90 backdrop-blur-2xl border border-primary/30 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,210,210,0.1)]">
      {/* Glow highlight effect */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header with badge and privacy toggle */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-widest">
            Portfolio Balance
          </span>
        </div>
        <button
          onClick={() => setHideBalance(!hideBalance)}
          className="p-1.5 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          title={hideBalance ? "Show balance" : "Hide balance"}
        >
          {hideBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {/* Primary balance */}
      <div className="mb-6">
        <div className="text-3xl sm:text-4xl font-mono font-extrabold text-foreground tracking-tight flex items-center gap-2">
          <AnimatedNumber value={vBalance} isHidden={hideBalance} />
        </div>
      </div>

      {/* Stats breakdown */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block mb-1">
            Portfolio Value
          </span>
          <div className="text-base font-mono font-bold text-foreground">
            {hideBalance ? '••••••' : formatINR(pValue)}
          </div>
        </div>

        <div>
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block mb-1">
            Total P/L
          </span>
          <div className={`text-base font-mono font-bold ${tPL > 0 ? 'text-emerald-400' : tPL < 0 ? 'text-rose-400' : 'text-muted-foreground'}`}>
            {hideBalance ? '••••••' : formatINRWithSign(tPL)}
          </div>
        </div>

        <div className="col-span-2">
          <span className="text-[10px] text-muted-foreground uppercase font-mono tracking-wider block mb-1">
            Today's Returns
          </span>
          <div className={`flex items-center gap-1.5 text-sm font-mono font-bold ${todayPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {todayPL >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{hideBalance ? '••••••' : formatINRWithSign(todayPL)}</span>
            <span className="text-xs font-normal opacity-80">
              ({todayPercent >= 0 ? '+' : ''}{todayPercent.toFixed(2)}%)
            </span>
          </div>
        </div>
      </div>

      {profileError && (
        <div className="mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-3 py-2 rounded-xl font-mono text-center">
          Error loading profile: {profileError}
        </div>
      )}
    </div>
  );
}

