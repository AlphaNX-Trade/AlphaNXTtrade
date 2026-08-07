import { useLocation } from 'wouter';
import { ChevronLeft, PieChart, History, BarChart2, Layers, Sparkles, Target, Coins, FileText, Calendar, Wallet } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHoldings } from '@/hooks/useHoldings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { HoldingCard } from '@/components/portfolio/HoldingCard';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';
import { EmptyState } from '@/components/ui/EmptyState';
import { V6PortfolioAnalytics } from '@/components/portfolio/V6PortfolioAnalytics';

function SummaryStatCell({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <p className={`font-mono text-sm font-semibold ${color ?? 'text-foreground'}`}>{value}</p>
    </div>
  );
}

export default function PortfolioPage() {
  const [, setLocation] = useLocation();
  const { profile, profileLoading } = useUserProfile();
  const { holdings, holdingsLoading, totalInvested, totalCurrentValue, totalUnrealizedPL } =
    useHoldings();

  const virtualBalance = profile?.virtualBalance ?? 0;
  const realizedPL = profile?.totalProfitLoss ?? 0;
  const portfolioValue = virtualBalance + totalCurrentValue;

  const fmt = (n: number, showSign = false) => {
    const sign = showSign ? (n >= 0 ? '+' : '') : '';
    const abs = `₹${Math.abs(n).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
    return n < 0 ? `${sign}-${abs}` : `${sign}${abs}`;
  };

  const unrealizedColor =
    totalUnrealizedPL > 0
      ? 'text-emerald-400'
      : totalUnrealizedPL < 0
        ? 'text-red-400'
        : 'text-muted-foreground';

  const realizedColor =
    realizedPL > 0
      ? 'text-emerald-400'
      : realizedPL < 0
        ? 'text-red-400'
        : 'text-muted-foreground';

  const isLoading = profileLoading || holdingsLoading;

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-4xl mx-auto pb-24">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground">V8 Portfolio Ecosystem</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation('/wallet')}
            className="text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
            aria-label="Virtual Wallet"
            title="Virtual Funds Wallet"
          >
            <Wallet className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLocation('/statistics')}
            className="text-muted-foreground hover:text-primary transition-colors p-1 cursor-pointer"
            aria-label="Personal Statistics"
            title="Personal Analytics"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-4 space-y-4">
        {/* Summary card */}
        {isLoading ? (
          <div className="bg-card border border-primary/20 rounded-xl p-4 animate-pulse space-y-3">
            <div className="h-3 w-32 bg-secondary/50 rounded" />
            <div className="h-8 w-48 bg-secondary/50 rounded" />
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-1">
                  <div className="h-2 w-20 bg-secondary/50 rounded" />
                  <div className="h-4 w-28 bg-secondary/50 rounded" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-primary/20 rounded-2xl p-5 shadow-[0_0_30px_rgba(0,210,210,0.06)] relative space-y-4"
          >
            <div className="absolute -top-px left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">
                Portfolio Value
              </p>
              <p className="font-mono font-bold text-2xl text-primary">
                {fmt(portfolioValue)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-y-4 gap-x-3 pt-2 border-t border-border/50">
              <div className="flex flex-col gap-0.5">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Virtual Cash Balance
                </p>
                <p className="font-mono text-sm font-semibold text-emerald-400">{fmt(virtualBalance)}</p>
              </div>
              <SummaryStatCell
                label="Invested"
                value={fmt(totalInvested)}
              />
              <SummaryStatCell
                label="Unrealized P/L"
                value={fmt(totalUnrealizedPL, true)}
                color={unrealizedColor}
              />
              <SummaryStatCell
                label="Realized P/L"
                value={fmt(realizedPL, true)}
                color={realizedColor}
              />
            </div>
          </motion.div>
        )}

        {/* V8 Premium Financial Ecosystem Quick Hub */}
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            V8 Financial Ecosystem Modules
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { label: 'Virtual Wallet', path: '/wallet', icon: Wallet, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'My Assets', path: '/my-assets', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
              { label: 'Smart Insights', path: '/insights', icon: Sparkles, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
              { label: 'Financial Goals', path: '/goals', icon: Target, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
              { label: 'Dividend Center', path: '/dividends', icon: Coins, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
              { label: 'Transaction Center', path: '/transaction-center', icon: FileText, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
            ].map((mod) => (
              <button
                key={mod.path}
                onClick={() => setLocation(mod.path)}
                className="p-3.5 rounded-xl border bg-card/60 hover:bg-card border-border/80 hover:border-primary/40 flex items-center gap-2.5 transition-all text-left group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${mod.color}`}>
                  <mod.icon className="w-4 h-4" />
                </div>
                <span className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                  {mod.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* V6 Advanced Portfolio Analytics */}
        <V6PortfolioAnalytics />

        {/* Holdings section */}
        <div className="space-y-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Holdings ({holdingsLoading ? '—' : holdings.length})
          </p>

          {holdingsLoading ? (
            <MarketSkeleton count={3} />
          ) : holdings.length === 0 ? (
            <EmptyState
              icon={PieChart}
              title="No active holdings"
              description="You haven't bought any assets yet. Execute paper trades from the Markets or Market Hub to build your portfolio."
              actionLabel="Browse Markets"
              onAction={() => setLocation('/markets')}
              secondaryActionLabel="Daily Market Hub"
              onSecondaryAction={() => setLocation('/market-hub')}
              className="mt-4"
            />
          ) : (
            <div className="space-y-2">
              {holdings.map((h) => (
                <HoldingCard key={h.symbol} holding={h} />
              ))}
            </div>
          )}
        </div>
      </main>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
