import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { Asset } from '@/data/marketData';

interface AssetCardProps {
  key?: string | number;
  asset: Asset;
  onPress: () => void;
  isInWatchlist: boolean;
  onWatchlistToggle: () => void;
  /** Live simulated price/change from the market engine, overriding the static values when present. */
  livePrice?: number;
  liveChangePercent?: number;
}

export function AssetCard({
  asset,
  onPress,
  isInWatchlist,
  onWatchlistToggle,
  livePrice,
  liveChangePercent,
}: AssetCardProps) {
  const price = livePrice ?? asset.price;
  const changePercent = liveChangePercent ?? asset.changePercent;
  const isPositive = changePercent >= 0;
  const changeColor = isPositive ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' : 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  const changeSign = isPositive ? '+' : '';

  const formattedPrice = `₹${price.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const initials = asset.symbol.slice(0, 3);

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onPress}
      className="group relative bg-card/70 backdrop-blur-md border border-border/60 hover:border-primary/40 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer transition-all duration-300 shadow-sm hover:shadow-[0_8px_24px_rgba(0,210,210,0.1)]"
    >
      {/* Left: Avatar badge + symbol + name */}
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs border ${
          isPositive 
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
            : 'bg-primary/10 text-primary border-primary/30'
        }`}>
          {initials}
        </div>
        
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-bold text-foreground group-hover:text-primary transition-colors tracking-wide">
              {asset.symbol}
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-muted/60 text-muted-foreground uppercase">
              {asset.type}
            </span>
          </div>
          <span className="text-xs text-muted-foreground truncate max-w-[140px]">
            {asset.name}
          </span>
        </div>
      </div>

      {/* Right: price + change badge + watchlist button */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex flex-col items-end gap-1">
          <span className="font-mono font-bold text-sm text-foreground tracking-tight">
            {formattedPrice}
          </span>
          <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border ${changeColor}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {changeSign}{changePercent.toFixed(2)}%
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onWatchlistToggle();
          }}
          className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
          aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
        >
          <Star
            className={`w-4 h-4 transition-colors ${
              isInWatchlist
                ? 'text-amber-400 fill-amber-400'
                : 'text-muted-foreground/60 hover:text-foreground fill-transparent'
            }`}
          />
        </button>
      </div>
    </motion.div>
  );
}

