import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  ChevronDown,
  Info,
  ShoppingCart,
  X,
  Loader2,
  Zap,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';
import {
  generateOptionChain,
  OPTION_INDEX_CONFIGS,
  type OptionContract,
  type OptionType,
  type StrikeRow,
} from '@/lib/optionsEngine';
import { INDICES } from '@/data/marketData';
import { executeBuy, executeSell } from '@/lib/tradingRepository';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketEngineList } from '@/hooks/useMarketEngineList';

interface OptionChainTableProps {
  initialSymbol?: string;
  onTradeExecuted?: () => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function OptionChainTable({ initialSymbol = 'NIFTY50', onTradeExecuted }: OptionChainTableProps) {
  const { user } = useAuth();
  const engineSnapshots = useMarketEngineList();

  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    ['NIFTY50', 'BANKNIFTY', 'FINNIFTY'].includes(initialSymbol) ? initialSymbol : 'NIFTY50',
  );

  const config = OPTION_INDEX_CONFIGS[selectedSymbol] || OPTION_INDEX_CONFIGS['NIFTY50'];
  const [selectedExpiry, setSelectedExpiry] = useState<string>(config.expiries[0]);
  const [tradeModalContract, setTradeModalContract] = useState<{
    contract: OptionContract;
    side: 'BUY' | 'SELL';
  } | null>(null);

  const [lots, setLots] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [tradeStatus, setTradeStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(
    null,
  );

  // Spot price lookup from live engine or static index list
  const spotPrice = useMemo(() => {
    const snap = engineSnapshots.find((s) => s.symbol === selectedSymbol);
    if (snap && snap.price > 0) return snap.price;
    const staticIdx = INDICES.find((i) => i.symbol === selectedSymbol);
    return staticIdx?.price ?? 24856.5;
  }, [selectedSymbol, engineSnapshots]);

  // Generate chain rows
  const chainData = useMemo(() => {
    return generateOptionChain(selectedSymbol, spotPrice, selectedExpiry, 8);
  }, [selectedSymbol, spotPrice, selectedExpiry]);

  const handleOpenTrade = (contract: OptionContract, side: 'BUY' | 'SELL') => {
    setTradeModalContract({ contract, side });
    setLots(1);
    setTradeStatus(null);
  };

  const handleConfirmTrade = async () => {
    if (!user || !tradeModalContract) return;
    const { contract, side } = tradeModalContract;

    const totalQuantity = lots * contract.lotSize;
    const totalCost = contract.premium * totalQuantity;

    setIsExecuting(true);
    setTradeStatus(null);

    try {
      const companyName = `${contract.underlyingSymbol} ${contract.strikePrice} ${contract.optionType} (${contract.expiryDate})`;

      let res;
      if (side === 'BUY') {
        res = await executeBuy(user.uid, contract.symbol, companyName, totalQuantity, contract.premium);
      } else {
        res = await executeSell(user.uid, contract.symbol, companyName, totalQuantity, contract.premium);
      }

      if (res.success) {
        setTradeStatus({
          type: 'success',
          msg: `${side} order for ${lots} lot(s) (${totalQuantity} Qty) of ${contract.symbol} executed successfully!`,
        });
        if (onTradeExecuted) onTradeExecuted();
        setTimeout(() => {
          setTradeModalContract(null);
        }, 1600);
      } else {
        setTradeStatus({
          type: 'error',
          msg: res.error?.message || 'Failed to execute option trade.',
        });
      }
    } catch (err: any) {
      setTradeStatus({ type: 'error', msg: err.message || 'Trade execution error.' });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-3 md:p-5 space-y-4 font-sans text-card-foreground shadow-xl">
      {/* Index Selector & Expiry Navigation Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border pb-4">
        {/* Index Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
          {Object.values(OPTION_INDEX_CONFIGS).map((idx) => (
            <button
              key={idx.symbol}
              onClick={() => {
                setSelectedSymbol(idx.symbol);
                setSelectedExpiry(idx.expiries[0]);
              }}
              className={`px-3.5 py-2 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                selectedSymbol === idx.symbol
                  ? 'bg-primary text-primary-foreground font-bold shadow-md'
                  : 'bg-muted/80 text-muted-foreground hover:text-foreground border border-border'
              }`}
            >
              <span>{idx.name}</span>
              <span className="bg-background/40 px-1.5 py-0.5 rounded text-[10px] opacity-80">
                Lot {idx.lotSize}
              </span>
            </button>
          ))}
        </div>

        {/* Expiry Selector & Spot Display */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-muted/90 border border-border rounded-xl px-3 py-1.5 font-mono text-xs text-foreground">
            <span className="text-muted-foreground uppercase text-[10px]">Expiry:</span>
            <select
              value={selectedExpiry}
              onChange={(e) => setSelectedExpiry(e.target.value)}
              className="bg-transparent text-foreground font-bold focus:outline-none cursor-pointer"
            >
              {config.expiries.map((exp) => (
                <option key={exp} value={exp} className="bg-popover text-popover-foreground">
                  {exp}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl font-mono text-xs flex items-center gap-2">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase text-[10px]">SPOT:</span>
            <span className="font-bold text-foreground text-sm">{fmt(spotPrice)}</span>
          </div>
        </div>
      </div>

      {/* Option Chain Legend */}
      <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground px-1 gap-2">
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-amber-500/20 border border-amber-500/60" />
            <span className="text-amber-700 dark:text-amber-300 font-medium">ATM Strike</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500/15 border border-emerald-500/40" />
            <span className="text-emerald-700 dark:text-emerald-300">In The Money (ITM)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-muted border border-border" />
            <span className="text-muted-foreground">Out Of The Money (OTM)</span>
          </span>
        </div>

        <span className="font-mono text-[10px] text-muted-foreground/80">
          *Premiums auto-update in real-time with simulated market feed
        </span>
      </div>

      {/* Main Option Chain Table */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-left font-mono text-xs border-collapse min-w-[760px]">
          <thead>
            {/* Group Header */}
            <tr className="border-b border-border text-[11px] uppercase tracking-wider text-muted-foreground bg-muted/80">
              <th colSpan={5} className="py-2 px-3 text-center text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 font-bold border-r border-border">
                CALLS (CE)
              </th>
              <th className="py-2 px-3 text-center text-amber-700 dark:text-amber-300 bg-amber-500/15 font-bold">STRIKE</th>
              <th colSpan={5} className="py-2 px-3 text-center text-red-600 dark:text-red-400 bg-red-500/10 font-bold border-l border-border">
                PUTS (PE)
              </th>
            </tr>

            {/* Column Header */}
            <tr className="border-b border-border text-[10px] uppercase text-muted-foreground bg-muted/60">
              <th className="py-2 px-2.5 text-right">OI</th>
              <th className="py-2 px-2.5 text-right">OI Chg</th>
              <th className="py-2 px-2.5 text-right">Volume</th>
              <th className="py-2 px-2.5 text-right">Bid/Ask</th>
              <th className="py-2 px-3 text-right text-emerald-600 dark:text-emerald-400">Call Premium</th>

              <th className="py-2 px-3 text-center bg-muted font-bold text-foreground border-x border-border">
                Price
              </th>

              <th className="py-2 px-3 text-left text-red-600 dark:text-red-400">Put Premium</th>
              <th className="py-2 px-2.5 text-left">Bid/Ask</th>
              <th className="py-2 px-2.5 text-left">Volume</th>
              <th className="py-2 px-2.5 text-left">OI Chg</th>
              <th className="py-2 px-2.5 text-left">OI</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border">
            {chainData.rows.map((row) => {
              const { call, put, strikePrice, isAtm } = row;

              // Row ITM backdrops
              const callItmBg = call.moneyness === 'ITM' ? 'bg-emerald-500/10 dark:bg-emerald-950/25' : '';
              const putItmBg = put.moneyness === 'ITM' ? 'bg-emerald-500/10 dark:bg-emerald-950/25' : '';

              return (
                <tr
                  key={strikePrice}
                  className={`hover:bg-muted/50 transition-colors ${
                    isAtm ? 'bg-amber-500/10 dark:bg-amber-950/20' : ''
                  }`}
                >
                  {/* CALL side columns */}
                  <td className={`py-2 px-2.5 text-right text-muted-foreground ${callItmBg}`}>
                    {call.oi.toLocaleString()}
                  </td>
                  <td
                    className={`py-2 px-2.5 text-right font-medium ${callItmBg} ${
                      call.oiChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {call.oiChange >= 0 ? '+' : ''}
                    {call.oiChange.toLocaleString()}
                  </td>
                  <td className={`py-2 px-2.5 text-right text-muted-foreground ${callItmBg}`}>
                    {call.volume.toLocaleString()}
                  </td>
                  <td className={`py-2 px-2.5 text-right text-[10px] text-muted-foreground ${callItmBg}`}>
                    {call.bidPrice.toFixed(2)} / {call.askPrice.toFixed(2)}
                  </td>
                  <td className={`py-2 px-3 text-right ${callItmBg}`}>
                    <button
                      onClick={() => handleOpenTrade(call, 'BUY')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30 transition-all cursor-pointer"
                    >
                      <span>₹{call.premium.toFixed(2)}</span>
                      <ShoppingCart className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    </button>
                  </td>

                  {/* STRIKE Center column */}
                  <td
                    className={`py-2 px-3 text-center font-bold border-x border-border ${
                      isAtm
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/50 shadow-inner'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <span>{strikePrice}</span>
                      {isAtm && (
                        <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 tracking-wider">
                          ATM
                        </span>
                      )}
                    </div>
                  </td>

                  {/* PUT side columns */}
                  <td className={`py-2 px-3 text-left ${putItmBg}`}>
                    <button
                      onClick={() => handleOpenTrade(put, 'BUY')}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/15 hover:bg-red-500/30 text-red-700 dark:text-red-300 font-bold border border-red-500/30 transition-all cursor-pointer"
                    >
                      <ShoppingCart className="w-3 h-3 text-red-600 dark:text-red-400" />
                      <span>₹{put.premium.toFixed(2)}</span>
                    </button>
                  </td>
                  <td className={`py-2 px-2.5 text-left text-[10px] text-muted-foreground ${putItmBg}`}>
                    {put.bidPrice.toFixed(2)} / {put.askPrice.toFixed(2)}
                  </td>
                  <td className={`py-2 px-2.5 text-left text-muted-foreground ${putItmBg}`}>
                    {put.volume.toLocaleString()}
                  </td>
                  <td
                    className={`py-2 px-2.5 text-left font-medium ${putItmBg} ${
                      put.oiChange >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {put.oiChange >= 0 ? '+' : ''}
                    {put.oiChange.toLocaleString()}
                  </td>
                  <td className={`py-2 px-2.5 text-left text-muted-foreground ${putItmBg}`}>
                    {put.oi.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Option Trade Modal */}
      <AnimatePresence>
        {tradeModalContract && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-card border border-border text-card-foreground rounded-2xl p-6 shadow-2xl relative space-y-4"
            >
              <button
                onClick={() => setTradeModalContract(null)}
                className="absolute right-4 top-4 text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                    tradeModalContract.contract.optionType === 'CE'
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/40'
                  }`}
                >
                  {tradeModalContract.contract.optionType}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-base">
                    {tradeModalContract.contract.underlyingSymbol} {tradeModalContract.contract.strikePrice}{' '}
                    {tradeModalContract.contract.optionType}
                  </h3>
                  <p className="text-xs text-muted-foreground font-mono">
                    Expiry: {tradeModalContract.contract.expiryDate} • Lot Size:{' '}
                    {tradeModalContract.contract.lotSize} Qty
                  </p>
                </div>
              </div>

              {/* Buy/Sell Selector */}
              <div className="grid grid-cols-2 gap-2 bg-muted p-1 rounded-xl border border-border">
                <button
                  type="button"
                  onClick={() =>
                    setTradeModalContract({ ...tradeModalContract, side: 'BUY' })
                  }
                  className={`py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
                    tradeModalContract.side === 'BUY'
                      ? 'bg-emerald-500 text-black shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  BUY
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTradeModalContract({ ...tradeModalContract, side: 'SELL' })
                  }
                  className={`py-2 rounded-lg font-mono text-xs uppercase font-bold transition-all cursor-pointer ${
                    tradeModalContract.side === 'SELL'
                      ? 'bg-red-500 text-white shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  SELL
                </button>
              </div>

              {/* Lot Quantity Selector */}
              <div className="space-y-2 bg-muted/60 p-4 rounded-xl border border-border">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-muted-foreground">Order Quantity:</span>
                  <span className="text-foreground font-bold">
                    {lots} Lot(s) = {lots * tradeModalContract.contract.lotSize} Qty
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setLots((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-lg hover:bg-muted/80 transition-colors cursor-pointer border border-border"
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
                    className="w-10 h-10 rounded-xl bg-muted text-foreground font-bold text-lg hover:bg-muted/80 transition-colors cursor-pointer border border-border"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Summary Metrics */}
              <div className="space-y-1.5 font-mono text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Option Premium:</span>
                  <span className="font-bold text-foreground">₹{tradeModalContract.contract.premium.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Implied Volatility (IV):</span>
                  <span>{tradeModalContract.contract.iv}%</span>
                </div>
                <div className="flex justify-between border-t border-border pt-2 text-sm">
                  <span className="text-muted-foreground">Total Premium Required:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {fmt(tradeModalContract.contract.premium * lots * tradeModalContract.contract.lotSize)}
                  </span>
                </div>
              </div>

              {/* Status Message */}
              {tradeStatus && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    tradeStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                      : 'bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300'
                  }`}
                >
                  {tradeStatus.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400" />
                  )}
                  <span>{tradeStatus.msg}</span>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleConfirmTrade}
                disabled={isExecuting}
                className={`w-full py-3 rounded-xl font-mono text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50 ${
                  tradeModalContract.side === 'BUY'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                    : 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/20'
                }`}
              >
                {isExecuting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Executing Order...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Confirm {tradeModalContract.side} Order ({lots} Lots)
                  </>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
