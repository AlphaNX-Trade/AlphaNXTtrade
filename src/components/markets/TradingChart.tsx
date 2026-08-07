import { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  CrosshairMode,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts';
import {
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  TrendingUp,
  Activity,
  Layers,
  BarChart2,
} from 'lucide-react';
import type { CandlePoint } from '@/lib/marketDataService';
import type { ChartTimeframe } from '@/lib/marketDataService';
import { calculateEMA, calculateRSI } from '@/lib/technicalIndicators';
import { useTheme } from '@/contexts/ThemeContext';

interface TradingChartProps {
  symbol: string;
  assetName?: string;
  candles: CandlePoint[];
  loading: boolean;
  error: string | null;
  timeframe: ChartTimeframe;
  onTimeframeChange: (tf: ChartTimeframe) => void;
  currentPrice?: number;
  priceChange?: number;
}

const TIMEFRAMES: { value: ChartTimeframe; label: string }[] = [
  { value: '1min', label: '1m' },
  { value: '5min', label: '5m' },
  { value: '15min', label: '15m' },
  { value: '1h', label: '1H' },
  { value: '1day', label: '1D' },
];

export function TradingChart({
  symbol,
  assetName,
  candles,
  loading,
  error,
  timeframe,
  onTimeframeChange,
  currentPrice,
  priceChange,
}: TradingChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const rsiChartRef = useRef<IChartApi | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  const [containerWidth, setContainerWidth] = useState(0);

  // Indicator Toggles
  const [showEma20, setShowEma20] = useState(true);
  const [showEma50, setShowEma50] = useState(false);
  const [showRsi, setShowRsi] = useState(false);
  const [showVolume, setShowVolume] = useState(true);

  // Hovered candle data for legend
  const [hoverData, setHoverData] = useState<CandlePoint | null>(null);

  // Main price chart setup
  useEffect(() => {
    if (!containerRef.current) return;

    const bgColor = isDark ? '#090D16' : '#FFFFFF';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)';
    const scaleBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const crosshairColor = isDark ? '#38BDF8' : '#0284C7';

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
        fontFamily: 'ui-monospace, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: crosshairColor, width: 1, style: 3 },
        horzLine: { color: crosshairColor, width: 1, style: 3 },
      },
      rightPriceScale: {
        borderColor: scaleBorder,
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: scaleBorder,
        timeVisible: true,
        secondsVisible: false,
      },
      height: 340,
    });

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#10B981',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: '#3B82F6',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.75, bottom: 0 },
    });

    const ema20Series = chart.addSeries(LineSeries, {
      color: '#38BDF8',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'EMA 20',
    });

    const ema50Series = chart.addSeries(LineSeries, {
      color: '#F59E0B',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: true,
      title: 'EMA 50',
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;
    ema20SeriesRef.current = ema20Series;
    ema50SeriesRef.current = ema50Series;

    // Crosshair hover update for top legend
    chart.subscribeCrosshairMove((param) => {
      if (param.time && param.seriesData) {
        const data = param.seriesData.get(candleSeries) as any;
        if (data) {
          setHoverData({
            time: param.time as number,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: data.volume ?? 0,
          });
        }
      } else {
        setHoverData(null);
      }
    });

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries[0]) setContainerWidth(entries[0].contentRect.width);
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // Sync theme changes to chart layout
  useEffect(() => {
    if (!chartRef.current) return;
    const bgColor = isDark ? '#090D16' : '#FFFFFF';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)';
    const scaleBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    chartRef.current.applyOptions({
      layout: { background: { color: bgColor }, textColor },
      grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
      rightPriceScale: { borderColor: scaleBorder },
      timeScale: { borderColor: scaleBorder },
    });

    if (rsiChartRef.current) {
      rsiChartRef.current.applyOptions({
        layout: { background: { color: bgColor }, textColor },
        grid: { vertLines: { color: gridColor }, horzLines: { color: gridColor } },
        rightPriceScale: { borderColor: scaleBorder },
      });
    }
  }, [isDark]);

  // Separate RSI sub-chart setup
  useEffect(() => {
    if (!showRsi || !rsiContainerRef.current) return;

    const bgColor = isDark ? '#090D16' : '#FFFFFF';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.06)';
    const scaleBorder = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    const rsiChart = createChart(rsiContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: bgColor },
        textColor: textColor,
        fontSize: 10,
      },
      grid: {
        vertLines: { color: gridColor },
        horzLines: { color: gridColor },
      },
      rightPriceScale: {
        borderColor: scaleBorder,
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: { visible: false },
      height: 100,
    });

    const rsiSeries = rsiChart.addSeries(LineSeries, {
      color: '#A855F7',
      lineWidth: 1,
      priceLineVisible: false,
    });

    rsiChartRef.current = rsiChart;
    rsiSeriesRef.current = rsiSeries;

    if (candles.length > 15) {
      const rsiData = calculateRSI(candles, 14);
      rsiSeries.setData(rsiData.map((p) => ({ time: p.time as any, value: p.value })));
    }

    return () => {
      rsiChart.remove();
      rsiChartRef.current = null;
    };
  }, [showRsi, isDark]);

  // Width Resize Sync
  useEffect(() => {
    if (chartRef.current && containerWidth > 0) {
      chartRef.current.applyOptions({ width: containerWidth });
    }
    if (rsiChartRef.current && containerWidth > 0) {
      rsiChartRef.current.applyOptions({ width: containerWidth });
    }
  }, [containerWidth]);

  // Push Data Updates
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    // Candlesticks
    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as any,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      })),
    );

    // Volume
    if (volumeSeriesRef.current) {
      if (showVolume) {
        volumeSeriesRef.current.setData(
          candles.map((c) => ({
            time: c.time as any,
            value: c.volume ?? Math.round(c.close * 10),
            color: c.close >= c.open ? 'rgba(16, 185, 129, 0.35)' : 'rgba(239, 68, 68, 0.35)',
          })),
        );
      } else {
        volumeSeriesRef.current.setData([]);
      }
    }

    // EMA 20
    if (ema20SeriesRef.current) {
      if (showEma20) {
        const ema20 = calculateEMA(candles, 20);
        ema20SeriesRef.current.setData(ema20.map((p) => ({ time: p.time as any, value: p.value })));
      } else {
        ema20SeriesRef.current.setData([]);
      }
    }

    // EMA 50
    if (ema50SeriesRef.current) {
      if (showEma50) {
        const ema50 = calculateEMA(candles, 50);
        ema50SeriesRef.current.setData(ema50.map((p) => ({ time: p.time as any, value: p.value })));
      } else {
        ema50SeriesRef.current.setData([]);
      }
    }

    // RSI
    if (rsiSeriesRef.current && showRsi) {
      const rsiData = calculateRSI(candles, 14);
      rsiSeriesRef.current.setData(rsiData.map((p) => ({ time: p.time as any, value: p.value })));
    }

    chartRef.current?.timeScale().fitContent();
  }, [candles, showEma20, showEma50, showVolume, showRsi]);

  const activeCandle = hoverData || (candles.length > 0 ? candles[candles.length - 1] : null);

  const handleZoom = (dir: 'in' | 'out' | 'fit') => {
    if (!chartRef.current) return;
    const timeScale = chartRef.current.timeScale();
    if (dir === 'fit') {
      timeScale.fitContent();
    } else if (dir === 'in') {
      timeScale.zoomOut();
    } else {
      timeScale.zoomIn();
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-3 md:p-4 space-y-3 font-sans shadow-xl text-card-foreground">
      {/* Chart Top Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-foreground text-base tracking-tight">{symbol}</h2>
            {assetName && <span className="text-xs text-muted-foreground truncate max-w-[180px]">{assetName}</span>}
          </div>
          {currentPrice !== undefined && (
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-lg font-bold text-foreground">
                ₹{currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              {priceChange !== undefined && (
                <span
                  className={`font-mono text-xs font-semibold ${
                    priceChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {priceChange >= 0 ? '+' : ''}
                  {priceChange.toFixed(2)}%
                </span>
              )}
            </div>
          )}
        </div>

        {/* Timeframes & Zoom Tools */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center bg-muted/80 rounded-xl p-1 border border-border">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.value}
                onClick={() => onTimeframeChange(tf.value)}
                className={`px-2.5 py-1 rounded-lg font-mono text-xs transition-all cursor-pointer ${
                  timeframe === tf.value
                    ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-muted/80 rounded-xl p-1 border border-border text-muted-foreground">
            <button
              onClick={() => handleZoom('in')}
              className="p-1.5 hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-1.5 hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handleZoom('fit')}
              className="p-1.5 hover:text-foreground rounded-lg transition-colors cursor-pointer"
              title="Reset Zoom"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicator Toggle Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
          <Layers className="w-3 h-3 text-primary" /> Indicators:
        </span>

        <button
          onClick={() => setShowEma20(!showEma20)}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
            showEma20
              ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/40 font-medium'
              : 'bg-muted/60 text-muted-foreground border-border'
          }`}
        >
          EMA 20
        </button>

        <button
          onClick={() => setShowEma50(!showEma50)}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
            showEma50
              ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/40 font-medium'
              : 'bg-muted/60 text-muted-foreground border-border'
          }`}
        >
          EMA 50
        </button>

        <button
          onClick={() => setShowRsi(!showRsi)}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
            showRsi
              ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/40 font-medium'
              : 'bg-muted/60 text-muted-foreground border-border'
          }`}
        >
          RSI (14)
        </button>

        <button
          onClick={() => setShowVolume(!showVolume)}
          className={`px-2.5 py-1 rounded-lg font-mono text-[11px] border transition-all cursor-pointer ${
            showVolume
              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/40 font-medium'
              : 'bg-muted/60 text-muted-foreground border-border'
          }`}
        >
          Volume
        </button>
      </div>

      {/* Live O-H-L-C Legend Bar */}
      {activeCandle && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-muted/60 rounded-xl px-3 py-1.5 font-mono text-[11px] border border-border text-muted-foreground">
          <span>
            O: <strong className="text-foreground">₹{activeCandle.open.toFixed(2)}</strong>
          </span>
          <span>
            H: <strong className="text-emerald-600 dark:text-emerald-400">₹{activeCandle.high.toFixed(2)}</strong>
          </span>
          <span>
            L: <strong className="text-red-600 dark:text-red-400">₹{activeCandle.low.toFixed(2)}</strong>
          </span>
          <span>
            C: <strong className="text-foreground">₹{activeCandle.close.toFixed(2)}</strong>
          </span>
          {activeCandle.volume !== undefined && (
            <span>
              Vol: <strong className="text-sky-600 dark:text-sky-400">{activeCandle.volume.toLocaleString()}</strong>
            </span>
          )}
        </div>
      )}

      {/* Chart Canvas Area */}
      <div className="relative rounded-xl overflow-hidden bg-card">
        {loading && candles.length === 0 && (
          <div className="h-[340px] flex items-center justify-center text-primary">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {!loading && (error || candles.length === 0) && (
          <div className="h-[340px] flex flex-col items-center justify-center gap-2 p-4 text-center">
            <Activity className="w-8 h-8 text-muted-foreground/60" />
            <p className="text-xs text-muted-foreground max-w-xs">
              Live chart feeds for this instrument timeframe are refreshing.
            </p>
          </div>
        )}
        <div
          ref={containerRef}
          className={loading || error || candles.length === 0 ? 'hidden' : 'w-full'}
        />
      </div>

      {/* RSI Sub-Chart Panel */}
      {showRsi && (
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between mb-1 text-[11px] font-mono text-purple-600 dark:text-purple-400">
            <span>Relative Strength Index (RSI 14)</span>
            <span className="text-muted-foreground">Overbought &gt; 70 | Oversold &lt; 30</span>
          </div>
          <div ref={rsiContainerRef} className="w-full rounded-xl overflow-hidden bg-card" />
        </div>
      )}
    </div>
  );
}
