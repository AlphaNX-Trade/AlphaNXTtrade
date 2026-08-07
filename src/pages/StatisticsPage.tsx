import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  PieChart,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  Clock,
  ShieldCheck,
  BarChart2,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { usePersonalStats } from '@/hooks/usePersonalStats';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';

export default function StatisticsPage() {
  const [, setLocation] = useLocation();
  const { stats, loading } = usePersonalStats();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-28">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/90 backdrop-blur-2xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/portfolio')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/80 cursor-pointer"
          aria-label="Back to portfolio"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <BarChart2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Personal Trading Analytics</span>
        </div>

        <div className="w-6" aria-hidden />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-18 pb-6 space-y-6">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 bg-card border border-border rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 bg-card border border-border rounded-2xl" />
              <div className="h-24 bg-card border border-border rounded-2xl" />
            </div>
          </div>
        ) : (
          <>
            {/* Primary PnL Summary */}
            <section className="bg-gradient-to-br from-card/90 via-card/70 to-card/90 border border-primary/30 rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,210,210,0.1)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

              <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block mb-1">
                Total Realized P&L
              </span>
              <div className="text-3xl font-mono font-extrabold text-foreground mb-4 flex items-center gap-2">
                <span className={stats.totalRealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {stats.totalRealizedPL >= 0 ? '+' : ''}₹{stats.totalRealizedPL.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 text-xs font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Total Invested</span>
                  <span className="font-bold text-foreground">₹{stats.totalInvestedCurrent.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase block mb-0.5">Portfolio Value</span>
                  <span className="font-bold text-primary">₹{stats.portfolioValue.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

            {/* Core Stats Grid */}
            <section className="grid grid-cols-2 gap-3">
              <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase">Total Trades</span>
                  <Zap className="w-4 h-4 text-primary" />
                </div>
                <div className="text-xl font-mono font-bold text-foreground">{stats.totalTrades}</div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  {stats.buyCount} Buys • {stats.sellCount} Sells
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase">Win Rate</span>
                  <Award className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-xl font-mono font-bold text-emerald-400">{stats.winRate.toFixed(1)}%</div>
                <div className="text-[10px] font-mono text-muted-foreground">
                  {stats.winCount} Wins • {stats.lossCount} Losses
                </div>
              </div>

              <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase">Avg Return</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div
                  className={`text-xl font-mono font-bold ${
                    stats.avgReturnPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {stats.avgReturnPercent >= 0 ? '+' : ''}
                  {stats.avgReturnPercent.toFixed(2)}%
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">Per closed position</div>
              </div>

              <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 space-y-1">
                <div className="flex items-center justify-between text-muted-foreground">
                  <span className="text-[10px] font-mono uppercase">Avg Holding</span>
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-xl font-mono font-bold text-foreground">
                  {stats.avgHoldingHours > 24
                    ? `${(stats.avgHoldingHours / 24).toFixed(1)} days`
                    : `${stats.avgHoldingHours.toFixed(1)} hrs`}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground">Average hold duration</div>
              </div>
            </section>

            {/* Best & Worst Trades */}
            <section className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold px-1">
                Performance Extreme Records
              </h3>

              <div className="grid grid-cols-2 gap-3">
                {/* Best Investment */}
                <div className="bg-card/80 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-4 space-y-1 bg-emerald-500/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                    Best Trade
                  </div>
                  {stats.bestTrade ? (
                    <div>
                      <p className="font-mono text-sm font-bold text-foreground">{stats.bestTrade.symbol}</p>
                      <p className="font-mono text-xs text-emerald-400 font-bold">
                        +₹{stats.bestTrade.realizedPL.toLocaleString('en-IN')} ({stats.bestTrade.percent.toFixed(2)}%)
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">No completed trades yet</p>
                  )}
                </div>

                {/* Worst Investment */}
                <div className="bg-card/80 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-4 space-y-1 bg-rose-500/5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                    Worst Trade
                  </div>
                  {stats.worstTrade ? (
                    <div>
                      <p className="font-mono text-sm font-bold text-foreground">{stats.worstTrade.symbol}</p>
                      <p className="font-mono text-xs text-rose-400 font-bold">
                        ₹{stats.worstTrade.realizedPL.toLocaleString('en-IN')} ({stats.worstTrade.percent.toFixed(2)}%)
                      </p>
                    </div>
                  ) : (
                    <p className="text-[10px] text-muted-foreground">No completed trades yet</p>
                  )}
                </div>
              </div>
            </section>

            {/* Sector Diversification */}
            <section className="space-y-3">
              <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold px-1 flex items-center gap-1.5">
                <PieChart className="w-3.5 h-3.5 text-primary" />
                Portfolio Diversification
              </h3>

              <div className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-4 space-y-3">
                {stats.portfolioDiversification.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    No active holdings to display diversification breakdown.
                  </p>
                ) : (
                  stats.portfolioDiversification.map((item) => (
                    <div key={item.sector} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="font-bold text-foreground">{item.sector}</span>
                        <span className="text-primary font-bold">{item.percentage.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
