import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, ArrowUpRight, ShieldCheck, Wallet, Sparkles, RefreshCw } from 'lucide-react';

interface InvestmentOverviewProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  returnPercentage: number;
  todayGainLoss?: number;
  todayGainLossPercent?: number;
  onRefresh?: () => void;
}

export function InvestmentOverview({
  totalInvested,
  totalCurrentValue,
  totalProfitLoss,
  returnPercentage,
  todayGainLoss = 756.50,
  todayGainLossPercent = 0.65,
  onRefresh,
}: InvestmentOverviewProps) {
  const isOverallProfit = totalProfitLoss >= 0;
  const isTodayProfit = todayGainLoss >= 0;

  const fmtCurrency = (val: number, showSign = false) => {
    const sign = showSign ? (val >= 0 ? '+' : '') : '';
    const absVal = Math.abs(val);
    return `${sign}₹${absVal.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Primary Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card/90 via-card to-background border border-primary/20 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.37)] backdrop-blur-xl">
        {/* Futuristic background glow */}
        <div className="absolute -top-16 -right-16 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top bar in card */}
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 border border-primary/20">
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Investments Portfolio
              </p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-mono font-medium">LIVE TRACKING</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onRefresh}
              className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Refresh Quotes"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Current Portfolio Value Main Display */}
        <div className="pt-4 pb-2">
          <p className="text-xs font-medium text-muted-foreground">Current Portfolio Value</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h2 className="text-3xl font-bold font-mono tracking-tight text-foreground">
              {fmtCurrency(totalCurrentValue)}
            </h2>
            <div
              className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full font-mono ${
                isOverallProfit
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isOverallProfit ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{isOverallProfit ? '+' : ''}{returnPercentage.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 pt-3 mt-2 border-t border-border/40">
          {/* Total Invested */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
            <p className="text-[11px] font-medium text-muted-foreground">Total Invested</p>
            <p className="text-base font-bold font-mono text-foreground mt-0.5">
              {fmtCurrency(totalInvested)}
            </p>
          </div>

          {/* Total Profit / Loss */}
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/30">
            <p className="text-[11px] font-medium text-muted-foreground">Total Returns (P&L)</p>
            <p
              className={`text-base font-bold font-mono mt-0.5 ${
                isOverallProfit ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {fmtCurrency(totalProfitLoss, true)}
            </p>
          </div>
        </div>

        {/* Today's Gain / Loss Banner */}
        <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-background/50 border border-border/50 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-muted-foreground font-medium">1-Day Market Return:</span>
          </div>
          <div
            className={`font-mono font-semibold flex items-center gap-1 ${
              isTodayProfit ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            <span>{fmtCurrency(todayGainLoss, true)}</span>
            <span className="text-[11px]">({isTodayProfit ? '+' : ''}{todayGainLossPercent.toFixed(2)}%)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
