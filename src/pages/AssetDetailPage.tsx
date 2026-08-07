import { useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import {
  ChevronLeft,
  Share2,
  Loader2,
  Sparkles,
  Newspaper,
  FileBarChart,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';
import { getAssetBySymbol } from '@/data/marketData';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useMarketEngineStock } from '@/hooks/useMarketEngineStock';
import { ticksToCandles } from '@/lib/marketEngine/candleAggregation';
import type { ChartTimeframe } from '@/lib/marketDataService';
import { TradingChart } from '@/components/markets/TradingChart';
import { AssetTabs, type AssetTab } from '@/components/markets/AssetTabs';
import { OptionChainTable } from '@/components/options/OptionChainTable';
import { deriveTrendSummary } from '@/lib/technicalIndicators';

interface StatCellProps {
  label: string;
  value: string;
}

function StatCell({ label, value }: StatCellProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}

function AssetLogo({ symbol }: { symbol: string }) {
  const initials = symbol.slice(0, 2).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
      <span className="font-mono text-xs font-bold text-primary">{initials}</span>
    </div>
  );
}

function ComingSoonTab({ icon: Icon, label }: { icon: typeof Newspaper; label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <div className="w-12 h-12 rounded-full bg-secondary/40 flex items-center justify-center">
        <Icon className="w-5 h-5 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground">{label} — coming soon</p>
      <p className="text-xs text-muted-foreground max-w-[240px]">
        This section is updating.
      </p>
    </div>
  );
}

interface AssetDetailPageProps {
  symbol: string;
}

export default function AssetDetailPage({ symbol }: AssetDetailPageProps) {
  const [, setLocation] = useLocation();
  const [isToggling, setIsToggling] = useState(false);
  const [activeTab, setActiveTab] = useState<AssetTab>('chart');
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('5min');
  const { isInWatchlist, addStock, removeStock, watchlistLoading } = useWatchlist();

  const asset = getAssetBySymbol(symbol);
  const inWatchlist = isInWatchlist(symbol);
  const { state: engineState, history } = useMarketEngineStock(symbol);

  const TIMEFRAME_TO_BUCKET_MS: Record<ChartTimeframe, number> = {
    '1min': 1_000,
    '5min': 5_000,
    '15min': 15_000,
    '1h': 60_000,
    '1day': 60_000,
    '1week': 60_000,
    '1month': 60_000,
  };

  const candles = useMemo(
    () => ticksToCandles(history, TIMEFRAME_TO_BUCKET_MS[timeframe]),
    [history, timeframe],
  );

  const trendSummary = useMemo(() => deriveTrendSummary(candles), [candles]);

  const handleWatchlistToggle = async () => {
    if (isToggling || !asset) return;
    setIsToggling(true);
    try {
      if (inWatchlist) {
        await removeStock(symbol);
      } else {
        await addStock(symbol);
      }
    } finally {
      setIsToggling(false);
    }
  };

  if (!asset) {
    return (
      <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center gap-4 px-6 max-w-4xl mx-auto">
        <p className="text-muted-foreground text-sm">Asset not found</p>
        <button
          onClick={() => setLocation('/markets')}
          className="font-mono text-xs bg-primary text-background px-5 py-2.5 rounded-xl font-semibold"
        >
          Back to Markets
        </button>
      </div>
    );
  }

  const displayPrice = engineState?.price ?? asset.price;
  const displayChange = engineState ? engineState.price - engineState.prevClose : asset.change;
  const displayChangePercent =
    engineState && engineState.prevClose !== 0
      ? (displayChange / engineState.prevClose) * 100
      : asset.changePercent;
  const isPositive = displayChange >= 0;
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400';
  const changeSign = isPositive ? '+' : '';

  const fmt = (n: number) =>
    `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const isOptionIndex = ['NIFTY50', 'BANKNIFTY', 'FINNIFTY', 'SENSEX'].includes(asset.symbol);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-5xl mx-auto">
      {/* Fixed header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-background/95 backdrop-blur border-b border-border z-40">
        <div className="h-14 flex items-center justify-between px-4">
          <button
            onClick={() => setLocation('/markets')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 cursor-pointer"
            aria-label="Back to markets"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <AssetLogo symbol={asset.symbol} />
            <div className="flex flex-col items-start">
              <span className="font-mono text-sm font-semibold text-foreground leading-tight">
                {asset.symbol}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight max-w-[180px] truncate">
                {asset.name} · {asset.type.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleWatchlistToggle}
              disabled={isToggling}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            >
              {isToggling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className={`text-lg leading-none ${inWatchlist ? 'text-primary' : ''}`}>
                  {inWatchlist ? '★' : '☆'}
                </span>
              )}
            </button>
            <button
              className="text-muted-foreground hover:text-foreground transition-colors p-1 cursor-pointer"
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <AssetTabs active={activeTab} onChange={setActiveTab} />
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[104px] pb-24 space-y-6">
        {/* Price Hero Header */}
        <section className="pt-2">
          <p className="font-mono font-bold text-3xl text-foreground tracking-tight">
            {fmt(displayPrice)}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`font-mono text-sm ${changeColor}`}>
              {changeSign}₹{Math.abs(displayChange).toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={`font-mono text-sm ${changeColor}`}>
              ({changeSign}{displayChangePercent.toFixed(2)}%)
            </span>
          </div>
        </section>

        {/* ── Chart tab ──────────────────────────────────────────────── */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            <TradingChart
              symbol={asset.symbol}
              assetName={asset.name}
              candles={candles}
              loading={candles.length === 0}
              error={null}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              currentPrice={displayPrice}
              priceChange={displayChangePercent}
            />

            {/* If index, show Option Chain directly beside/below */}
            {isOptionIndex && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 font-mono text-sm font-bold text-white">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>{asset.symbol} Option Chain</span>
                </div>
                <OptionChainTable initialSymbol={asset.symbol} />
              </div>
            )}
          </div>
        )}

        {/* ── Overview tab ───────────────────────────────────────────── */}
        {activeTab === 'overview' && (
          <section className="space-y-5">
            {/* 52-Week Range Bar */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-foreground">
                <span>52-Week Range</span>
                <span className="font-mono text-muted-foreground">High/Low Metrics</span>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
                  <span>Low: ₹{(asset.dayLow * 0.85).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                  <span>High: ₹{(asset.dayHigh * 1.22).toLocaleString('en-IN', { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="relative w-full h-2 bg-secondary/80 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full"
                    style={{
                      left: '0%',
                      width: '62%',
                    }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-primary shadow-md"
                    style={{ left: '60%' }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  Current price is trading near 60% of its 52-week annual range.
                </p>
              </div>
            </div>

            {/* Market Fundamentals */}
            <div>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
                Key Fundamentals & Ratios
              </p>
              <div className="bg-card border border-border rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-y-4 gap-x-4">
                <StatCell label="Market Cap" value={asset.marketCap} />
                <StatCell label="P/E Ratio" value={asset.type === 'stock' ? '24.8' : 'N/A'} />
                <StatCell label="Volume" value={asset.volume} />
                <StatCell label="Day High" value={fmt(asset.dayHigh)} />
                <StatCell label="Day Low" value={fmt(asset.dayLow)} />
                <StatCell label="Open" value={fmt(asset.open)} />
                <StatCell label="Prev. Close" value={fmt(asset.prevClose)} />
                <StatCell label="Sector" value={asset.sector} />
                {asset.lotSize && <StatCell label="Lot Size" value={`${asset.lotSize} Qty`} />}
              </div>
            </div>

            {/* Company About */}
            <div className="bg-card border border-border rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-sm text-foreground">About {asset.name}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {asset.name} ({asset.symbol}) is a leading constituent in the {asset.sector} sector. Operating with strong market dominance, institutional coverage, and liquid paper trading volumes on the AlphaNXT platform.
              </p>
            </div>

            {/* Related Sector Peers */}
            <div className="space-y-2">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Related {asset.sector} Stocks
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['RELIANCE', 'TATAMOTORS', 'INFY', 'HDFCBANK']
                  .filter((s) => s !== asset.symbol)
                  .slice(0, 2)
                  .map((peerSym) => {
                    const peer = getAssetBySymbol(peerSym);
                    if (!peer) return null;
                    const isUp = peer.changePercent >= 0;
                    return (
                      <div
                        key={peerSym}
                        onClick={() => setLocation(`/markets/${peerSym}`)}
                        className="p-3 rounded-xl bg-card border border-border hover:border-primary/50 cursor-pointer transition-all"
                      >
                        <span className="font-bold text-xs text-foreground block">{peer.symbol}</span>
                        <span className="text-[10px] text-muted-foreground block truncate">{peer.name}</span>
                        <div className="flex items-baseline justify-between mt-2">
                          <span className="font-mono text-xs font-bold">₹{peer.price.toLocaleString('en-IN')}</span>
                          <span className={`text-[10px] font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isUp ? '+' : ''}{peer.changePercent.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {watchlistLoading ? (
              <div className="w-full h-12 bg-card border border-border rounded-xl flex items-center justify-center animate-pulse">
                <div className="w-24 h-3 rounded bg-secondary/50" />
              </div>
            ) : (
              <button
                onClick={handleWatchlistToggle}
                disabled={isToggling}
                className={`w-full h-12 rounded-xl font-mono text-sm font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  inWatchlist
                    ? 'border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/10'
                    : 'bg-primary text-background hover:opacity-90'
                } disabled:opacity-60 disabled:cursor-not-allowed`}
              >
                {isToggling && <Loader2 className="w-4 h-4 animate-spin" />}
                {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </button>
            )}
          </section>
        )}

        {/* ── News tab ───────────────────────────────────────────────── */}
        {activeTab === 'news' && (
          <div className="space-y-3">
            {[
              {
                title: `${asset.symbol} reports strong quarterly revenue expansion with robust volume growth`,
                source: 'Economic Times',
                time: '2 hours ago',
                summary: 'Analysts maintain bullish ratings following positive guidance and healthy operational metrics across key business units.',
              },
              {
                title: `FII inflows surge in Indian ${asset.sector} space amid macroeconomic resilience`,
                source: 'Mint Markets',
                time: '5 hours ago',
                summary: 'Institutional buying accelerates as broad benchmarks approach all-time high territory.',
              },
              {
                title: `${asset.name} expands strategic technology partnerships`,
                source: 'Business Standard',
                time: '1 day ago',
                summary: 'Management highlights ongoing productivity enhancements and digital infrastructure investments.',
              },
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-card border border-border/80 space-y-2">
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                  <span className="text-primary font-semibold">{item.source}</span>
                  <span>{item.time}</span>
                </div>
                <h4 className="font-bold text-xs text-foreground leading-snug">{item.title}</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.summary}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Financials tab ─────────────────────────────────────────── */}
        {activeTab === 'financials' && <ComingSoonTab icon={FileBarChart} label="Financials" />}

        {/* ── AI Analysis tab ────────────────────────────────────────── */}
        {activeTab === 'ai' && (
          <div className="space-y-3">
            {candles.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-5 text-center">
                <p className="text-xs text-muted-foreground">
                  Gathering price history to analyze — check back shortly.
                </p>
              </div>
            ) : (
              <>
                <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm text-foreground leading-relaxed">
                      Based on technical indicators, {asset.symbol} is in a{' '}
                      <span className="font-semibold">{trendSummary.trend.toLowerCase()}</span> with
                      RSI at{' '}
                      <span className="font-semibold">
                        {trendSummary.latestRsi?.toFixed(1) ?? '—'}
                      </span>{' '}
                      (
                      <span className="font-semibold">{trendSummary.rsiLevel.toLowerCase()}</span>
                      ).
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Sticky Buy/Sell CTA (Hidden for indices/option underlyings like NIFTY) */}
      {!isOptionIndex && asset.type !== 'index' && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-5xl bg-background/98 backdrop-blur border-t border-border px-4 py-3 z-30 shadow-[0_-8px_30px_rgba(0,0,0,0.3)]">
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <button
              onClick={() => setLocation(`/trade/${symbol}`)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono font-bold text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition-colors cursor-pointer"
            >
              <TrendingUp className="w-4 h-4" /> BUY
            </button>
            <button
              onClick={() => setLocation(`/trade/${symbol}`)}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-mono font-bold text-sm bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer"
            >
              <TrendingDown className="w-4 h-4" /> SELL
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
