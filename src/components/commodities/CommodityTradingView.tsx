import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { COMMODITIES, type Asset } from '@/data/marketData';
import { TradingChart } from '@/components/markets/TradingChart';
import { useMarketEngineStock } from '@/hooks/useMarketEngineStock';
import { ticksToCandles } from '@/lib/marketEngine/candleAggregation';
import type { ChartTimeframe } from '@/lib/marketDataService';
import { executeBuy, executeSell } from '@/lib/tradingRepository';
import { useAuth } from '@/contexts/AuthContext';
import {
  Flame,
  Zap,
  TrendingUp,
  TrendingDown,
  Layers,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Box,
} from 'lucide-react';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function CommodityTradingView() {
  const { user } = useAuth();
  const [selectedCommodity, setSelectedCommodity] = useState<Asset>(COMMODITIES[0]);
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('5min');
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL'>('BUY');
  const [lots, setLots] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const { history } = useMarketEngineStock(selectedCommodity.symbol);

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

  const lotSize = selectedCommodity.lotSize ?? 1;
  const totalQuantity = lots * lotSize;
  const totalMarginRequired = selectedCommodity.price * totalQuantity;

  const handleExecuteTrade = async () => {
    if (!user) return;
    setIsExecuting(true);
    setStatus(null);

    try {
      let res;
      if (tradeSide === 'BUY') {
        res = await executeBuy(
          user.uid,
          selectedCommodity.symbol,
          selectedCommodity.name,
          totalQuantity,
          selectedCommodity.price,
        );
      } else {
        res = await executeSell(
          user.uid,
          selectedCommodity.symbol,
          selectedCommodity.name,
          totalQuantity,
          selectedCommodity.price,
        );
      }

      if (res.success) {
        setStatus({
          type: 'success',
          msg: `${tradeSide} order for ${lots} lot(s) (${totalQuantity} ${selectedCommodity.unit ?? 'units'}) placed successfully!`,
        });
      } else {
        setStatus({
          type: 'error',
          msg: res.error?.message || 'Failed to place commodity futures trade.',
        });
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message || 'Trade execution error.' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-5 font-sans">
      {/* Commodity Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
        {COMMODITIES.map((com) => {
          const isSelected = selectedCommodity.symbol === com.symbol;
          const isPos = com.change >= 0;
          return (
            <button
              key={com.symbol}
              onClick={() => {
                setSelectedCommodity(com);
                setStatus(null);
              }}
              className={`px-3.5 py-2 rounded-xl text-left font-mono border transition-all cursor-pointer shrink-0 ${
                isSelected
                  ? 'bg-card border-primary shadow-md shadow-primary/10'
                  : 'bg-muted/60 border-border hover:bg-muted'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`font-bold text-xs ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {com.name.replace(' MCX Futures', '')}
                </span>
                <span
                  className={`text-[10px] font-semibold ${
                    isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPos ? '+' : ''}
                  {com.changePercent.toFixed(2)}%
                </span>
              </div>
              <div className="text-[11px] text-muted-foreground font-medium mt-0.5">
                {fmt(com.price)} / {com.unit}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Chart + Trade Ticket */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chart Column */}
        <div className="lg:col-span-2">
          <TradingChart
            symbol={selectedCommodity.symbol}
            assetName={selectedCommodity.name}
            candles={candles}
            loading={candles.length === 0}
            error={null}
            timeframe={timeframe}
            onTimeframeChange={setTimeframe}
            currentPrice={selectedCommodity.price}
            priceChange={selectedCommodity.changePercent}
          />
        </div>

        {/* Trade Order Panel */}
        <div className="bg-card border border-border text-card-foreground rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-base">{selectedCommodity.name}</h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                MCX Futures • Expiry: {selectedCommodity.expiry}
              </p>
            </div>

            {/* Contract Specifications */}
            <div className="grid grid-cols-2 gap-2 bg-muted/60 p-3 rounded-xl border border-border font-mono text-xs text-muted-foreground">
              <div>
                <span className="text-[10px] text-muted-foreground/80 uppercase block">Trading Unit</span>
                <span className="font-bold text-foreground">{selectedCommodity.unit}</span>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground/80 uppercase block">1 Lot Size</span>
                <span className="font-bold text-primary">{lotSize} Qty</span>
              </div>
            </div>

            {/* Buy / Sell Side Selector */}
            <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setTradeSide('BUY')}
                className={`py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
                  tradeSide === 'BUY'
                    ? 'bg-emerald-500 text-black shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTradeSide('SELL')}
                className={`py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
                  tradeSide === 'SELL'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                SELL
              </button>
            </div>

            {/* Lots Counter */}
            <div className="space-y-2 bg-muted/60 p-4 rounded-xl border border-border">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-muted-foreground">Order Lots:</span>
                <span className="text-foreground font-bold">
                  {lots} Lot(s) = {totalQuantity} {selectedCommodity.unit}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setLots((prev) => Math.max(1, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-lg hover:bg-muted/80 transition-colors border border-border cursor-pointer"
                >
                  -
                </button>
                <input
                  type="number"
                  min={1}
                  value={lots}
                  onChange={(e) => setLots(Math.max(1, parseInt(e.target.value) || 1))}
                  className="flex-1 bg-background border border-border rounded-xl text-center py-2 text-base font-mono font-bold text-foreground focus:outline-none focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => setLots((prev) => prev + 1)}
                  className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-lg hover:bg-muted/80 transition-colors border border-border cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>

            {/* Order Margin Summary */}
            <div className="space-y-2 font-mono text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Futures Price:</span>
                <span className="font-bold text-foreground">{fmt(selectedCommodity.price)}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 text-sm">
                <span className="text-muted-foreground">Total Contract Value:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(totalMarginRequired)}</span>
              </div>
            </div>

            {/* Status Feedback */}
            {status && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  status.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <span>{status.msg}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleExecuteTrade}
            disabled={isExecuting}
            className={`w-full py-3.5 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 mt-4 ${
              tradeSide === 'BUY'
                ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Placing Futures Order...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Execute {tradeSide} ({lots} Lots)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
