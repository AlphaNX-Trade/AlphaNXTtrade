import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Sparkles,
  PieChart,
  History,
  TrendingUp,
  Layers,
  LineChart as LineChartIcon,
  Bot,
  RefreshCw,
  Bell,
  ArrowUpRight,
  Plus,
  Compass,
} from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { getAssetBySymbol } from '@/data/marketData';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { InvestmentOverview } from '@/components/investments/InvestmentOverview';
import { InvestmentHoldingsList } from '@/components/investments/InvestmentHoldingsList';
import { InvestmentAnalytics } from '@/components/investments/InvestmentAnalytics';
import { InvestmentHistoryTimeline } from '@/components/investments/InvestmentHistoryTimeline';
import { AIPortfolioInsight } from '@/components/investments/AIPortfolioInsight';
import type { InvestmentHolding, InvestmentTimelineItem } from '@/data/mockInvestments';

export default function InvestmentsPage() {
  const [, setLocation] = useLocation();
  const { profileLoading } = useUserProfile();
  const {
    holdings: realHoldings,
    holdingsLoading,
    totalInvested,
    totalCurrentValue,
    totalUnrealizedPL: totalProfitLoss,
  } = useHoldings();
  const { transactions: realTransactions } = useTransactionHistory(50);

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'HOLDINGS' | 'ANALYTICS' | 'TIMELINE' | 'AI_INSIGHT'>('OVERVIEW');

  // Format user's actual real holdings strictly without mock data fallback
  const formattedHoldings: InvestmentHolding[] = (realHoldings || []).map((h) => {
    const asset = getAssetBySymbol(h.symbol);
    const name = asset?.name || h.symbol;
    const sector = asset?.sector || 'Equity';
    const todayGainLossPercent = asset?.changePercent ?? 0;
    const todayGainLoss = (h.currentValue * todayGainLossPercent) / 100;

    let logoBg = 'from-blue-600 to-indigo-700';
    if (asset?.type === 'index') logoBg = 'from-amber-500 to-orange-600';
    else if (asset?.type === 'commodity') logoBg = 'from-emerald-600 to-teal-700';

    return {
      id: h.symbol,
      symbol: h.symbol,
      name,
      sector,
      quantity: h.quantity,
      avgBuyPrice: h.avgBuyPrice,
      currentPrice: h.currentPrice,
      investedAmount: h.totalInvested,
      currentValue: h.currentValue,
      profitLoss: h.unrealizedPL,
      profitLossPercent: h.unrealizedPLPercent,
      todayGainLoss,
      todayGainLossPercent,
      logoBg,
      logoText: h.symbol.substring(0, 3).toUpperCase(),
    };
  });

  const hasInvestments = formattedHoldings.length > 0;
  const returnPercentage = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0;

  // Format real transactions into timeline format
  const timelineItems: InvestmentTimelineItem[] = (realTransactions || []).map((tx) => {
    const tsMs = typeof (tx.timestamp as any)?.toMillis === 'function'
      ? (tx.timestamp as any).toMillis()
      : typeof (tx.timestamp as any)?.seconds === 'number'
        ? (tx.timestamp as any).seconds * 1000
        : typeof tx.timestamp === 'number'
          ? tx.timestamp
          : Date.now();

    return {
      id: tx.id,
      type: tx.side === 'BUY' ? ('BUY' as const) : ('SELL' as const),
      title: `${tx.side === 'BUY' ? 'Purchased' : 'Sold'} ${tx.symbol}`,
      subtitle: `${tx.quantity} shares @ ₹${tx.price.toLocaleString('en-IN')}`,
      amount: tx.totalAmount,
      quantity: tx.quantity,
      symbol: tx.symbol,
      date: new Date(tsMs).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      timestamp: tsMs,
      status: 'COMPLETED' as const,
    };
  });

  const isLoading = profileLoading || holdingsLoading;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col max-w-[480px] mx-auto pb-20">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-background/90 backdrop-blur-xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg hover:bg-secondary/50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-base text-foreground tracking-tight">Investments</span>
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
              GROWW STYLE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLocation('/notifications')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-4 pt-[68px] space-y-4">
        {/* Navigation Quick Filter Tabs */}
        {hasInvestments && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/40">
            {[
              { id: 'OVERVIEW', label: 'Overview', icon: TrendingUp },
              { id: 'HOLDINGS', label: 'Holdings', icon: Layers },
              { id: 'ANALYTICS', label: 'Analytics', icon: LineChartIcon },
              { id: 'TIMELINE', label: 'History', icon: History },
              { id: 'AI_INSIGHT', label: 'Alpha AI', icon: Bot },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-primary text-background shadow-[0_0_12px_rgba(0,210,210,0.3)]'
                      : 'bg-card/60 text-muted-foreground hover:bg-card hover:text-foreground border border-border/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="space-y-4 animate-pulse pt-2">
            <div className="h-44 bg-card/60 rounded-2xl border border-border/50" />
            <div className="h-28 bg-card/60 rounded-2xl border border-border/50" />
            <div className="h-64 bg-card/60 rounded-2xl border border-border/50" />
          </div>
        ) : !hasInvestments ? (
          /* Clean Empty State for Users with No Investments */
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-12 px-6 text-center rounded-2xl bg-card/60 border border-border/80 my-4 space-y-5 shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-[0_0_25px_rgba(0,210,210,0.2)]">
              <LineChartIcon className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-foreground">No Investments Yet</h3>
              <p className="text-xs text-muted-foreground max-w-[280px] mx-auto leading-relaxed">
                Start investing to see your portfolio performance, profit/loss tracking, and AI insights here.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2 w-full max-w-[260px]">
              <button
                onClick={() => setLocation('/trade')}
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-primary text-background font-mono font-bold text-xs hover:opacity-90 transition-all shadow-[0_0_15px_rgba(0,210,210,0.3)]"
              >
                <Plus className="w-4 h-4" />
                <span>Explore Investments</span>
              </button>

              <button
                onClick={() => setLocation('/markets')}
                className="flex items-center justify-center gap-2 w-full py-3 px-5 rounded-xl bg-secondary/80 hover:bg-secondary text-foreground font-semibold text-xs border border-border transition-colors"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>Browse Markets</span>
              </button>
            </div>
          </motion.div>
        ) : (
          /* Render Active User Portfolio */
          <div className="space-y-5 pb-4">
            {/* Overview Dashboard */}
            {(activeTab === 'OVERVIEW' || activeTab === 'HOLDINGS') && (
              <InvestmentOverview
                totalInvested={totalInvested}
                totalCurrentValue={totalCurrentValue}
                totalProfitLoss={totalProfitLoss}
                returnPercentage={returnPercentage}
              />
            )}

            {/* AI Portfolio Insight */}
            {(activeTab === 'OVERVIEW' || activeTab === 'AI_INSIGHT') && (
              <AIPortfolioInsight
                holdings={formattedHoldings}
                totalReturnsPercent={returnPercentage}
              />
            )}

            {/* Holdings List */}
            {(activeTab === 'OVERVIEW' || activeTab === 'HOLDINGS') && (
              <InvestmentHoldingsList holdings={formattedHoldings} />
            )}

            {/* Analytics Section */}
            {(activeTab === 'OVERVIEW' || activeTab === 'ANALYTICS') && (
              <InvestmentAnalytics holdings={formattedHoldings} />
            )}

            {/* History Timeline */}
            {(activeTab === 'OVERVIEW' || activeTab === 'TIMELINE') && timelineItems.length > 0 && (
              <InvestmentHistoryTimeline timeline={timelineItems} />
            )}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav />
    </div>
  );
}

