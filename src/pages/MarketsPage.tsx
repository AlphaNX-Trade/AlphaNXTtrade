import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { ChevronLeft, Layers, TrendingUp, Box, Landmark } from 'lucide-react';
import { STOCKS, INDICES, COMMODITIES, ALL_ASSETS } from '@/data/marketData';
import type { Asset } from '@/data/marketData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketEngineList } from '@/hooks/useMarketEngineList';
import { AssetCard } from '@/components/markets/AssetCard';
import { SearchBar } from '@/components/markets/SearchBar';
import { MarketSkeleton } from '@/components/markets/MarketSkeleton';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { OptionChainTable } from '@/components/options/OptionChainTable';
import { CommodityTradingView } from '@/components/commodities/CommodityTradingView';

type CategoryMode = 'delivery' | 'options' | 'commodities' | 'indices';

type TabId =
  | 'all'
  | 'watchlist'
  | 'banking'
  | 'it'
  | 'auto'
  | 'pharma'
  | 'fmcg'
  | 'energy'
  | 'metals'
  | 'telecom'
  | 'finance'
  | 'gainers'
  | 'losers'
  | 'active';

const TABS: { id: TabId; label: string }[] = [
  { id: 'all', label: 'All Stocks' },
  { id: 'watchlist', label: 'Watchlist' },
  { id: 'banking', label: 'Banking' },
  { id: 'it', label: 'IT' },
  { id: 'auto', label: 'Auto' },
  { id: 'pharma', label: 'Pharma' },
  { id: 'fmcg', label: 'FMCG' },
  { id: 'energy', label: 'Energy' },
  { id: 'metals', label: 'Metals' },
  { id: 'telecom', label: 'Telecom' },
  { id: 'finance', label: 'Finance' },
  { id: 'gainers', label: 'Top Gainers' },
  { id: 'losers', label: 'Top Losers' },
  { id: 'active', label: 'Most Active' },
];

const SECTOR_BY_TAB: Partial<Record<TabId, string>> = {
  banking: 'Banking',
  it: 'Information Technology',
  auto: 'Automobile',
  pharma: 'Pharma',
  fmcg: 'FMCG',
  energy: 'Energy',
  metals: 'Metals',
  telecom: 'Telecom',
  finance: 'Financial Services',
};

function parseVolume(volume: string): number {
  const match = volume.match(/^([\d.]+)([MBK]?)$/i);
  if (!match) return 0;
  const num = parseFloat(match[1]);
  const suffix = match[2].toUpperCase();
  if (suffix === 'B') return num * 1_000_000_000;
  if (suffix === 'M') return num * 1_000_000;
  if (suffix === 'K') return num * 1_000;
  return num;
}

function exchangeLabel(asset: Asset): string {
  if (asset.type === 'index') return 'INDEX';
  if (asset.type === 'commodity') return 'MCX';
  return 'NSE';
}

function filterBySearch(assets: Asset[], query: string): Asset[] {
  if (!query.trim()) return assets;
  const q = query.toLowerCase();
  return assets.filter(
    (a) =>
      a.symbol.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.sector.toLowerCase().includes(q) ||
      exchangeLabel(a).toLowerCase().includes(q),
  );
}

export default function MarketsPage() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<CategoryMode>('delivery');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const { watchlistLoading, addStock, removeStock, isInWatchlist } = useWatchlist();
  const engineSnapshots = useMarketEngineList();

  const engineBySymbol = useMemo(
    () => new Map(engineSnapshots.map((s) => [s.symbol, s])),
    [engineSnapshots],
  );

  const liveChangePercent = (symbol: string, fallback: number): number => {
    const snap = engineBySymbol.get(symbol);
    if (!snap || snap.prevClose === 0) return fallback;
    return ((snap.price - snap.prevClose) / snap.prevClose) * 100;
  };

  const isSearching = search.trim().length > 0;

  const tabFiltered = useMemo(() => {
    switch (activeTab) {
      case 'all':
        return STOCKS;
      case 'watchlist':
        return STOCKS.filter((a) => isInWatchlist(a.symbol));
      case 'gainers':
        return [...STOCKS].sort(
          (a, b) =>
            liveChangePercent(b.symbol, b.changePercent) -
            liveChangePercent(a.symbol, a.changePercent),
        );
      case 'losers':
        return [...STOCKS].sort(
          (a, b) =>
            liveChangePercent(a.symbol, a.changePercent) -
            liveChangePercent(b.symbol, b.changePercent),
        );
      case 'active':
        return [...STOCKS].sort((a, b) => parseVolume(b.volume) - parseVolume(a.volume));
      default: {
        const sector = SECTOR_BY_TAB[activeTab];
        return sector ? STOCKS.filter((a) => a.sector === sector) : STOCKS;
      }
    }
  }, [activeTab, isInWatchlist, engineBySymbol]);

  const filtered = filterBySearch(tabFiltered, search);

  const renderCard = (asset: Asset) => {
    const snap = engineBySymbol.get(asset.symbol);
    return (
      <AssetCard
        key={asset.symbol}
        asset={asset}
        onPress={() => setLocation(`/markets/${asset.symbol}`)}
        isInWatchlist={isInWatchlist(asset.symbol)}
        onWatchlistToggle={() =>
          isInWatchlist(asset.symbol) ? removeStock(asset.symbol) : addStock(asset.symbol)
        }
        livePrice={snap?.price}
        liveChangePercent={
          snap ? liveChangePercent(asset.symbol, asset.changePercent) : undefined
        }
      />
    );
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-5xl mx-auto pb-16">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 cursor-pointer"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-semibold text-base text-foreground font-mono">
          AlphaNXT Markets
        </span>
        <div className="w-6" aria-hidden />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-3 sm:px-4 pt-[72px] pb-6 space-y-4">
        {/* Search Bar */}
        <SearchBar value={search} onChange={setSearch} />

        {/* Top Segment Mode Switcher */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-muted/80 p-1.5 rounded-2xl border border-border">
          <button
            onClick={() => setMode('delivery')}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'delivery'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Delivery ({STOCKS.length})</span>
          </button>

          <button
            onClick={() => setMode('options')}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'options'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Option Chain</span>
          </button>

          <button
            onClick={() => setMode('commodities')}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'commodities'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            <span>Commodities</span>
          </button>

          <button
            onClick={() => setMode('indices')}
            className={`py-2 px-3 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'indices'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Indices</span>
          </button>
        </div>

        {/* View Mode 1: Options Chain */}
        {mode === 'options' && (
          <div className="pt-1">
            <OptionChainTable />
          </div>
        )}

        {/* View Mode 2: Commodities */}
        {mode === 'commodities' && (
          <div className="pt-1">
            <CommodityTradingView />
          </div>
        )}

        {/* View Mode 3: Indices */}
        {mode === 'indices' && (
          <div className="space-y-2 pt-1">
            <p className="font-mono text-xs text-muted-foreground mb-2">
              Major Indian Market Benchmarks
            </p>
            {INDICES.map(renderCard)}
          </div>
        )}

        {/* View Mode 4: Delivery Stocks */}
        {mode === 'delivery' && (
          <>
            {/* Sector/Category Filters */}
            <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`shrink-0 font-mono text-xs px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                      : 'bg-muted/90 text-muted-foreground border border-border hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Delivery Stocks List */}
            {watchlistLoading ? (
              <MarketSkeleton count={6} />
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground text-center px-6">
                {isSearching ? (
                  <>
                    <p className="text-sm">No stocks found matching</p>
                    <p className="font-mono text-xs text-primary">"{search}"</p>
                  </>
                ) : activeTab === 'watchlist' ? (
                  <p className="text-sm">Your watchlist is empty — tap the star icon on any stock to save it.</p>
                ) : (
                  <p className="text-sm">No stocks in this category.</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filtered.map(renderCard)}
              </div>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
