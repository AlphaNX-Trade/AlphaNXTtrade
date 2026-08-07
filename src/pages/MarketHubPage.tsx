import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Compass,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar as CalendarIcon,
  PieChart,
  BarChart2,
  Clock,
  Sparkles,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAllAssets } from '@/hooks/useAllAssets';
import { AssetCard } from '@/components/markets/AssetCard';
import { useWatchlist } from '@/hooks/useWatchlist';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';

// Sample Indian Market Indices Data
const INDICES_DATA = [
  { symbol: 'NIFTY 50', name: 'NSE Nifty 50 Index', price: 24320.45, change: 185.3, changePct: 0.77 },
  { symbol: 'SENSEX', name: 'BSE Sensex Index', price: 79820.1, change: 540.2, changePct: 0.68 },
  { symbol: 'BANK NIFTY', name: 'Nifty Bank Index', price: 52140.8, change: -110.5, changePct: -0.21 },
  { symbol: 'NIFTY IT', name: 'Nifty IT Tech Index', price: 38910.6, change: 420.8, changePct: 1.09 },
  { symbol: 'GOLD', name: 'Gold 24K (per 10g)', price: 72450.0, change: 310.0, changePct: 0.43 },
  { symbol: 'CRUDE OIL', name: 'Brent Crude ($/bbl)', price: 78.45, change: -0.85, changePct: -1.07 },
];

// Sample Sector Performance
const SECTOR_DATA = [
  { name: 'Information Technology', code: 'IT', changePct: 1.85, status: 'bullish' },
  { name: 'Banking & Financials', code: 'BANK', changePct: 0.62, status: 'bullish' },
  { name: 'Energy & Utilities', code: 'ENERGY', changePct: -0.45, status: 'bearish' },
  { name: 'Pharmaceuticals', code: 'PHARMA', changePct: 1.12, status: 'bullish' },
  { name: 'Automobiles', code: 'AUTO', changePct: -0.82, status: 'bearish' },
  { name: 'FMCG & Consumer', code: 'FMCG', changePct: 0.35, status: 'neutral' },
];

// Economic Calendar Events
const ECONOMIC_EVENTS = [
  {
    title: 'RBI Monetary Policy Decision',
    date: 'Aug 08, 2026',
    time: '10:00 AM',
    impact: 'HIGH',
    category: 'Central Bank',
    status: 'Upcoming',
  },
  {
    title: 'India CPI Inflation Data',
    date: 'Aug 12, 2026',
    time: '05:30 PM',
    impact: 'HIGH',
    category: 'Economic Data',
    status: 'Upcoming',
  },
  {
    title: 'US Fed Interest Rate Decision',
    date: 'Aug 18, 2026',
    time: '11:30 PM',
    impact: 'HIGH',
    category: 'Global Catalyst',
    status: 'Upcoming',
  },
  {
    title: 'Q2 Corporate Earnings Season',
    date: 'Ongoing',
    time: 'All Day',
    impact: 'MEDIUM',
    category: 'Earnings',
    status: 'Active',
  },
];

function parseVolume(vol: string | undefined): number {
  if (!vol) return 0;
  const num = parseFloat(vol);
  if (isNaN(num)) return 0;
  if (vol.endsWith('M') || vol.endsWith('m')) return num * 1_000_000;
  if (vol.endsWith('K') || vol.endsWith('k')) return num * 1_000;
  if (vol.endsWith('B') || vol.endsWith('b')) return num * 1_000_000_000;
  return num;
}

export default function MarketHubPage() {
  const [, setLocation] = useLocation();
  const assets = useAllAssets();
  const { isInWatchlist, addStock, removeStock } = useWatchlist();

  const [activeTab, setActiveTab] = useState<'trending' | 'gainers' | 'losers' | 'active'>('trending');

  // Filter assets based on tab
  const filteredAssets = useMemo(() => {
    if (!assets) return [];
    const copy = [...assets];

    switch (activeTab) {
      case 'gainers':
        return copy.sort((a, b) => b.changePercent - a.changePercent);
      case 'losers':
        return copy.sort((a, b) => a.changePercent - b.changePercent);
      case 'active':
        return copy.sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
      case 'trending':
      default:
        return copy.filter((a) => Math.abs(a.changePercent) > 0.5);
    }
  }, [assets, activeTab]);

  // Compute sentiment score based on advance/decline
  const sentimentScore = useMemo(() => {
    if (!assets || assets.length === 0) return { pct: 68, text: 'Bullish' };
    const advances = assets.filter((a) => a.changePercent > 0).length;
    const total = assets.length;
    const pct = Math.round((advances / total) * 100);

    let text = 'Neutral';
    if (pct >= 60) text = 'Bullish';
    else if (pct <= 40) text = 'Bearish';

    return { pct, text };
  }, [assets]);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-28">
      {/* Top Fixed Navigation Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/90 backdrop-blur-2xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/80 cursor-pointer"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Compass className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Daily Market Hub</span>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          LIVE
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 overflow-y-auto px-4 pt-18 pb-6 space-y-6">
        {/* Market Sentiment Banner */}
        <section className="bg-gradient-to-br from-card/90 via-card/70 to-card/90 border border-primary/20 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
                Market Sentiment
              </span>
            </div>
            <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
              sentimentScore.text === 'Bullish'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : sentimentScore.text === 'Bearish'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              {sentimentScore.text} ({sentimentScore.pct}%)
            </span>
          </div>

          {/* Sentiment Gauge Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden relative p-0.5 border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sentimentScore.pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${
                  sentimentScore.pct >= 60
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : sentimentScore.pct <= 40
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500'
                    : 'bg-gradient-to-r from-amber-500 to-emerald-400'
                }`}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>0% Bearish</span>
              <span>50% Neutral</span>
              <span>100% Bullish</span>
            </div>
          </div>
        </section>

        {/* Major Indices Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary" />
              Major Indices & Commodities
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {INDICES_DATA.map((idx) => {
              const isPositive = idx.changePct >= 0;
              return (
                <div
                  key={idx.symbol}
                  className="bg-card/70 backdrop-blur-md border border-border/80 hover:border-primary/30 rounded-2xl p-3.5 space-y-1.5 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">
                      {idx.symbol}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-medium px-1.5 py-0.2 rounded ${
                        isPositive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {idx.changePct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="text-sm font-mono font-bold text-foreground tracking-tight">
                    ₹{idx.price.toLocaleString('en-IN')}
                  </div>

                  <div className="text-[10px] text-muted-foreground truncate">
                    {idx.name}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Market Movers Tabs */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Market Movers
            </h3>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-muted/40 rounded-2xl border border-border/60 overflow-x-auto">
            {[
              { id: 'trending', label: 'Trending', icon: Flame },
              { id: 'gainers', label: 'Top Gainers', icon: TrendingUp },
              { id: 'losers', label: 'Top Losers', icon: TrendingDown },
              { id: 'active', label: 'Most Active', icon: BarChart2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Assets List */}
          <div className="space-y-2.5">
            {filteredAssets.slice(0, 6).map((asset) => (
              <AssetCard
                key={asset.symbol}
                asset={asset}
                isInWatchlist={isInWatchlist(asset.symbol)}
                onWatchlistToggle={() =>
                  isInWatchlist(asset.symbol) ? removeStock(asset.symbol) : addStock(asset.symbol)
                }
                onPress={() => setLocation(`/markets/${asset.symbol}`)}
              />
            ))}
          </div>
        </section>

        {/* Sector Performance Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <PieChart className="w-3.5 h-3.5 text-primary" />
              Sector Performance
            </h3>
          </div>

          <div className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-4 space-y-3">
            {SECTOR_DATA.map((sec) => {
              const isPos = sec.changePct >= 0;
              return (
                <div key={sec.code} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-semibold text-foreground">{sec.name}</span>
                    <span className={isPos ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {isPos ? '+' : ''}{sec.changePct.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted/60 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isPos ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.abs(sec.changePct) * 40)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Economic Calendar Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-primary" />
              Economic Calendar
            </h3>
          </div>

          <div className="space-y-2.5">
            {ECONOMIC_EVENTS.map((evt, idx) => (
              <div
                key={idx}
                className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-3.5 flex items-center justify-between gap-3"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground truncate">{evt.title}</span>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                      {evt.impact}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3 text-muted-foreground" />
                      {evt.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {evt.time}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-xl bg-secondary text-secondary-foreground shrink-0">
                  {evt.category}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
