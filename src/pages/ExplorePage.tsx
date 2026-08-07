import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Compass,
  Bookmark,
  Star,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Filter,
  Eye,
  Plus,
  Check,
  Building2,
  PieChart,
  Layers,
  Activity,
  Award,
  Clock,
  X,
  Bell,
  SlidersHorizontal,
  Mic,
} from 'lucide-react';
import { useAllAssets } from '@/hooks/useAllAssets';
import { useWatchlist } from '@/hooks/useWatchlist';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { getAssetBySymbol, type Asset } from '@/data/marketData';
import { AdvancedSearchModal } from '@/components/search/AdvancedSearchModal';
import { V6DiscoverSection } from '@/components/discover/V6DiscoverSection';

const RECENTLY_VIEWED_KEY = 'alphanxt_recently_viewed_symbols';

export default function ExplorePage() {
  const [, setLocation] = useLocation();
  const assets = useAllAssets();
  const { isInWatchlist, addStock, removeStock, watchlistLoading } = useWatchlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'stock' | 'index' | 'commodity' | 'watchlist'>('ALL');
  const [activeWatchlistTab, setActiveWatchlistTab] = useState<'Core' | 'Growth' | 'Dividends'>('Core');
  const [customWatchlists, setCustomWatchlists] = useState<Record<string, string[]>>({
    Core: ['RELIANCE', 'HDFCBANK', 'TATAMOTORS'],
    Growth: ['INFY', 'TCS', 'BAJFINANCE'],
    Dividends: ['ITC', 'ONGC', 'NTPC'],
  });

  const [recentlyViewedSymbols, setRecentlyViewedSymbols] = useState<string[]>([]);
  const [togglingSymbol, setTogglingSymbol] = useState<string | null>(null);

  // Load recently viewed symbols on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (stored) {
        setRecentlyViewedSymbols(JSON.parse(stored));
      } else {
        // Default fallback
        setRecentlyViewedSymbols(['RELIANCE', 'NIFTY50', 'TATAMOTORS']);
      }
    } catch (e) {
      console.error('Failed to parse recently viewed stocks', e);
    }
  }, []);

  const handleSelectAsset = (symbol: string) => {
    try {
      const updated = [symbol, ...recentlyViewedSymbols.filter((s) => s !== symbol)].slice(0, 8);
      setRecentlyViewedSymbols(updated);
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recently viewed', e);
    }
    setLocation(`/markets/${symbol}`);
  };

  const handleWatchlistToggle = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (togglingSymbol) return;
    setTogglingSymbol(symbol);
    try {
      if (isInWatchlist(symbol)) {
        await removeStock(symbol);
      } else {
        await addStock(symbol);
      }
    } finally {
      setTogglingSymbol(null);
    }
  };

  const dynamicAssets = assets;

  // Categorized Collections
  const stocks = dynamicAssets.filter((a) => a.type === 'stock');
  const indices = dynamicAssets.filter((a) => a.type === 'index');

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 6);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 6);
  const trendingStocks = [...stocks].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent)).slice(0, 6);
  const mostBought = stocks.filter((s) => ['RELIANCE', 'HDFCBANK', 'TATAMOTORS', 'INFY', 'TCS', 'ICICIBANK'].includes(s.symbol));
  const popularBluechips = stocks.filter((s) => ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'BHARTIARTL', 'ITC'].includes(s.symbol));

  const recentlyViewedAssets = recentlyViewedSymbols
    .map((sym) => dynamicAssets.find((a) => a.symbol === sym))
    .filter((a): a is Asset => Boolean(a));

  // Search Filtering
  const searchResults = dynamicAssets.filter((asset) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      asset.sector.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col max-w-4xl mx-auto pb-24">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-background/90 backdrop-blur-xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <Compass className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h1 className="font-bold text-base text-foreground leading-tight tracking-tight">Explore</h1>
            <p className="text-[10px] text-muted-foreground">Discover Stocks & Market Ideas</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setLocation('/notifications')}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-colors relative"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-primary" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-4 pt-[68px] space-y-5">
        {/* Search System Bar */}
        <div className="relative flex items-center gap-2">
          <div
            onClick={() => setIsSearchModalOpen(true)}
            className="relative flex-1 cursor-pointer"
          >
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              readOnly
              value={searchQuery}
              placeholder="Search stocks, companies, sectors (e.g. Reliance, IT)..."
              className="w-full pl-10 pr-10 py-3 bg-card/90 border border-border/80 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/40 shadow-xs transition-all cursor-pointer"
            />
          </div>

          <button
            onClick={() => setIsSearchModalOpen(true)}
            className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1 text-xs font-bold shrink-0"
            title="Voice & Advanced Search"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Search</span>
          </button>
        </div>

        {/* Universal Advanced Search Modal */}
        <AdvancedSearchModal
          isOpen={isSearchModalOpen}
          onClose={() => setIsSearchModalOpen(false)}
        />

        {/* Search Results Mode */}
        {searchQuery ? (
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
              <span>Search Results ({searchResults.length})</span>
              <span className="text-[10px] text-primary">Instant Match</span>
            </div>

            {searchResults.length === 0 ? (
              <div className="p-8 text-center bg-card/40 rounded-2xl border border-dashed border-border text-xs text-muted-foreground">
                No matching stocks found for "{searchQuery}". Try searching for 'IT', 'Banking', or 'NIFTY'.
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((asset) => (
                  <StockCardRow
                    key={asset.symbol}
                    asset={asset}
                    isInWatchlist={isInWatchlist(asset.symbol)}
                    onSelect={() => handleSelectAsset(asset.symbol)}
                    onWatchlistToggle={(e) => handleWatchlistToggle(e, asset.symbol)}
                    onTrade={(e) => {
                      e.stopPropagation();
                      setLocation(`/trade/${asset.symbol}`);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Normal Discovery Dashboard */
          <>
            {/* V6 Discover Collections, Baskets & Stocks */}
            <V6DiscoverSection />

            {/* Live Indices Ticker Carousel */}
            <div className="space-y-2 pt-4">
              <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span>Market Benchmarks</span>
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
                </span>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {indices.map((idx) => {
                  const isUp = idx.changePercent >= 0;
                  return (
                    <div
                      key={idx.symbol}
                      onClick={() => handleSelectAsset(idx.symbol)}
                      className="min-w-[140px] p-3 rounded-2xl bg-card/80 border border-border/80 hover:border-primary/40 transition-all cursor-pointer shadow-xs shrink-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{idx.symbol}</span>
                        <span className={`text-[10px] font-bold font-mono px-1 rounded ${isUp ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {isUp ? '+' : ''}{idx.changePercent.toFixed(2)}%
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between">
                        <span className="font-mono text-sm font-bold text-foreground">
                          ₹{idx.price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </span>
                        {isUp ? <TrendingUp className="w-3 h-3 text-emerald-400" /> : <TrendingDown className="w-3 h-3 text-rose-400" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Market Insights Banner */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-card via-card/90 to-primary/10 border border-primary/20 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                  <Sparkles className="w-4 h-4" />
                  <span>Market Intelligence</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  GROWW INSIGHT
                </span>
              </div>

              <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                Banking & IT sectors are driving today's rally with institutional buying support in large-caps.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-xs">
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Top Sector</span>
                  <span className="font-bold text-emerald-400">IT & Tech (+2.4%)</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl">
                  <span className="text-[10px] text-muted-foreground uppercase font-mono block">Weakest Sector</span>
                  <span className="font-bold text-rose-400">Metals (-0.8%)</span>
                </div>
              </div>
            </div>

            {/* Watchlist Upgrade Section */}
            <div className="space-y-3 bg-card/60 p-4 rounded-2xl border border-border/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-primary" />
                  <h2 className="font-bold text-sm text-foreground">Smart Watchlists</h2>
                </div>
                <button
                  onClick={() => setLocation('/markets')}
                  className="text-xs text-primary font-semibold hover:underline flex items-center gap-0.5"
                >
                  Manage <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Watchlist Tabs */}
              <div className="flex items-center gap-1.5 bg-secondary/50 p-1 rounded-xl">
                {(['Core', 'Growth', 'Dividends'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveWatchlistTab(tab)}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeWatchlistTab === tab
                        ? 'bg-primary text-background shadow-xs'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab} ({customWatchlists[tab]?.length || 0})
                  </button>
                ))}
              </div>

              {/* Watchlist Stock Horizontal Strip */}
              <div className="grid grid-cols-3 gap-2">
                {customWatchlists[activeWatchlistTab].map((sym) => {
                  const asset = getAssetBySymbol(sym);
                  if (!asset) return null;
                  const isUp = asset.changePercent >= 0;
                  return (
                    <div
                      key={sym}
                      onClick={() => handleSelectAsset(sym)}
                      className="p-2.5 rounded-xl bg-card border border-border/60 hover:border-primary/50 transition-all cursor-pointer text-left"
                    >
                      <span className="font-bold text-xs text-foreground block truncate">{asset.symbol}</span>
                      <span className="font-mono text-xs font-bold text-foreground block mt-1">
                        ₹{asset.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                      </span>
                      <span className={`text-[10px] font-mono font-semibold block ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isUp ? '+' : ''}{asset.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Trending Stocks */}
            <SectionHeader title="Trending Stocks" subtitle="Most active stocks in market today" icon={Flame} />
            <div className="grid grid-cols-2 gap-2.5">
              {trendingStocks.slice(0, 4).map((stock) => (
                <StockGridCard
                  key={stock.symbol}
                  asset={stock}
                  isInWatchlist={isInWatchlist(stock.symbol)}
                  onSelect={() => handleSelectAsset(stock.symbol)}
                  onWatchlistToggle={(e) => handleWatchlistToggle(e, stock.symbol)}
                />
              ))}
            </div>

            {/* Top Gainers & Losers Tab Switcher */}
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <div className="flex items-center gap-4">
                  <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span>Top Market Movers</span>
                  </h2>
                </div>
                <button onClick={() => setLocation('/markets')} className="text-xs text-primary font-semibold flex items-center gap-0.5">
                  See All <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Top Gainers</p>
                {topGainers.slice(0, 3).map((asset) => (
                  <StockCardRow
                    key={asset.symbol}
                    asset={asset}
                    isInWatchlist={isInWatchlist(asset.symbol)}
                    onSelect={() => handleSelectAsset(asset.symbol)}
                    onWatchlistToggle={(e) => handleWatchlistToggle(e, asset.symbol)}
                    onTrade={(e) => {
                      e.stopPropagation();
                      setLocation(`/trade/${asset.symbol}`);
                    }}
                  />
                ))}
              </div>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Top Losers</p>
                {topLosers.slice(0, 3).map((asset) => (
                  <StockCardRow
                    key={asset.symbol}
                    asset={asset}
                    isInWatchlist={isInWatchlist(asset.symbol)}
                    onSelect={() => handleSelectAsset(asset.symbol)}
                    onWatchlistToggle={(e) => handleWatchlistToggle(e, asset.symbol)}
                    onTrade={(e) => {
                      e.stopPropagation();
                      setLocation(`/trade/${asset.symbol}`);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Most Bought Stocks */}
            <SectionHeader title="Most Bought Stocks" subtitle="High investor interest bluechips" icon={Award} />
            <div className="space-y-2">
              {mostBought.slice(0, 4).map((asset) => (
                <StockCardRow
                  key={asset.symbol}
                  asset={asset}
                  isInWatchlist={isInWatchlist(asset.symbol)}
                  onSelect={() => handleSelectAsset(asset.symbol)}
                  onWatchlistToggle={(e) => handleWatchlistToggle(e, asset.symbol)}
                  onTrade={(e) => {
                    e.stopPropagation();
                    setLocation(`/trade/${asset.symbol}`);
                  }}
                />
              ))}
            </div>

            {/* Recently Viewed Stocks */}
            {recentlyViewedAssets.length > 0 && (
              <div className="space-y-3">
                <SectionHeader title="Recently Viewed" subtitle="Stocks you inspected earlier" icon={Eye} />
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {recentlyViewedAssets.map((asset) => {
                    const isUp = asset.changePercent >= 0;
                    return (
                      <div
                        key={asset.symbol}
                        onClick={() => handleSelectAsset(asset.symbol)}
                        className="min-w-[130px] p-3 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all cursor-pointer shrink-0"
                      >
                        <span className="font-bold text-xs text-foreground block">{asset.symbol}</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{asset.name}</span>
                        <div className="mt-2 flex items-baseline justify-between">
                          <span className="font-mono text-xs font-bold text-foreground">
                            ₹{asset.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                          </span>
                          <span className={`text-[10px] font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}{asset.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Popular Bluechips */}
            <SectionHeader title="Popular Stocks" subtitle="Top market capitalization companies" icon={Building2} />
            <div className="space-y-2">
              {popularBluechips.map((asset) => (
                <StockCardRow
                  key={asset.symbol}
                  asset={asset}
                  isInWatchlist={isInWatchlist(asset.symbol)}
                  onSelect={() => handleSelectAsset(asset.symbol)}
                  onWatchlistToggle={(e) => handleWatchlistToggle(e, asset.symbol)}
                  onTrade={(e) => {
                    e.stopPropagation();
                    setLocation(`/trade/${asset.symbol}`);
                  }}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

// Subcomponents
function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: any }) {
  return (
    <div className="flex items-center justify-between pt-2">
      <div>
        <h2 className="font-bold text-sm text-foreground flex items-center gap-1.5">
          <Icon className="w-4 h-4 text-primary" />
          <span>{title}</span>
        </h2>
        <p className="text-[10px] text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function StockCardRow({
  asset,
  isInWatchlist,
  onSelect,
  onWatchlistToggle,
  onTrade,
}: {
  key?: string;
  asset: Asset;
  isInWatchlist: boolean;
  onSelect: () => void;
  onWatchlistToggle: (e: React.MouseEvent) => void | Promise<void>;
  onTrade: (e: React.MouseEvent) => void;
}) {
  const isUp = asset.changePercent >= 0;

  return (
    <div
      onClick={onSelect}
      className="group flex items-center justify-between p-3.5 rounded-2xl bg-card/80 border border-border/70 hover:border-primary/50 transition-all cursor-pointer hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <span className="font-mono text-xs font-bold text-primary">{asset.symbol.substring(0, 2)}</span>
        </div>

        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
              {asset.symbol}
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-secondary text-muted-foreground uppercase">
              {asset.sector}
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">{asset.name}</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 text-right">
        <div>
          <p className="text-xs font-bold font-mono text-foreground">
            ₹{asset.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className={`text-[10px] font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isUp ? '+' : ''}{asset.changePercent.toFixed(2)}%
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onWatchlistToggle}
            className={`p-2 rounded-xl transition-colors ${
              isInWatchlist ? 'bg-primary/20 text-primary' : 'bg-secondary/60 text-muted-foreground hover:text-foreground'
            }`}
            title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          >
            <Star className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-primary' : ''}`} />
          </button>

          <button
            onClick={onTrade}
            className="px-2.5 py-1.5 rounded-xl bg-primary text-background font-mono text-[10px] font-bold hover:opacity-90 transition-opacity"
          >
            Buy
          </button>
        </div>
      </div>
    </div>
  );
}

function StockGridCard({
  asset,
  isInWatchlist,
  onSelect,
  onWatchlistToggle,
}: {
  key?: string;
  asset: Asset;
  isInWatchlist: boolean;
  onSelect: () => void;
  onWatchlistToggle: (e: React.MouseEvent) => void | Promise<void>;
}) {
  const isUp = asset.changePercent >= 0;

  return (
    <div
      onClick={onSelect}
      className="p-3.5 rounded-2xl bg-card border border-border/80 hover:border-primary/50 transition-all cursor-pointer relative shadow-xs flex flex-col justify-between"
    >
      <div className="flex items-start justify-between">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center font-bold font-mono text-xs text-primary">
          {asset.symbol.substring(0, 2)}
        </div>
        <button
          onClick={onWatchlistToggle}
          className={`p-1.5 rounded-lg transition-colors ${
            isInWatchlist ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Star className={`w-3.5 h-3.5 ${isInWatchlist ? 'fill-primary' : ''}`} />
        </button>
      </div>

      <div className="mt-3">
        <span className="font-bold text-xs text-foreground block truncate">{asset.symbol}</span>
        <span className="text-[10px] text-muted-foreground block truncate">{asset.name}</span>
      </div>

      <div className="mt-3 pt-2 border-t border-border/40 flex items-baseline justify-between">
        <span className="font-mono text-xs font-bold text-foreground">
          ₹{asset.price.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
        </span>
        <span className={`text-[10px] font-bold font-mono ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isUp ? '+' : ''}{asset.changePercent.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
