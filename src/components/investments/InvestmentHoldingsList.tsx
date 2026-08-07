import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, ChevronRight, Layers, ArrowUpDown, Plus } from 'lucide-react';
import { useLocation } from 'wouter';
import type { InvestmentHolding } from '@/data/mockInvestments';

interface InvestmentHoldingsListProps {
  holdings: InvestmentHolding[];
}

export function InvestmentHoldingsList({ holdings }: InvestmentHoldingsListProps) {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'GAINERS' | 'LOSERS'>('ALL');
  const [sortBy, setSortBy] = useState<'VALUE' | 'RETURNS' | 'NAME'>('VALUE');

  // Filtering
  const filteredHoldings = holdings.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'GAINERS') return item.profitLoss >= 0;
    if (activeFilter === 'LOSERS') return item.profitLoss < 0;
    return true;
  });

  // Sorting
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    if (sortBy === 'VALUE') return b.currentValue - a.currentValue;
    if (sortBy === 'RETURNS') return b.profitLossPercent - a.profitLossPercent;
    if (sortBy === 'NAME') return a.symbol.localeCompare(b.symbol);
    return 0;
  });

  const fmt = (val: number, showSign = false) => {
    const sign = showSign ? (val >= 0 ? '+' : '') : '';
    return `${sign}₹${Math.abs(val).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-primary" />
            Your Holdings ({holdings.length})
          </h3>
          <p className="text-[11px] text-muted-foreground">Active positions & equity portfolio</p>
        </div>

        <button
          onClick={() => setLocation('/markets')}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium text-xs border border-primary/20 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Invest More</span>
        </button>
      </div>

      {/* Controls: Search and Filter Pills */}
      <div className="space-y-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search holding by name or symbol..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-card/70 border border-border/60 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground/70 font-medium"
          />
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {(['ALL', 'GAINERS', 'LOSERS'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  activeFilter === filter
                    ? 'bg-primary text-background shadow-[0_0_10px_rgba(0,210,210,0.3)]'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'GAINERS' ? 'Gainers 🟢' : 'Losers 🔴'}
              </button>
            ))}
          </div>

          {/* Sort Dropdown / Button */}
          <button
            onClick={() => {
              if (sortBy === 'VALUE') setSortBy('RETURNS');
              else if (sortBy === 'RETURNS') setSortBy('NAME');
              else setSortBy('VALUE');
            }}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 hover:bg-secondary text-[11px] font-medium text-muted-foreground hover:text-foreground whitespace-nowrap"
          >
            <ArrowUpDown className="w-3 h-3 text-primary" />
            <span>Sort: {sortBy}</span>
          </button>
        </div>
      </div>

      {/* Holdings Cards List */}
      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {sortedHoldings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-8 text-center rounded-2xl bg-card/50 border border-dashed border-border"
            >
              <p className="text-xs text-muted-foreground font-medium">No holdings match your search.</p>
            </motion.div>
          ) : (
            sortedHoldings.map((item, idx) => {
              const isProfit = item.profitLoss >= 0;

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, delay: idx * 0.04 }}
                  onClick={() => setLocation(`/markets/${item.symbol}`)}
                  className="group relative overflow-hidden rounded-xl bg-card/80 border border-border/70 hover:border-primary/40 p-3.5 transition-all cursor-pointer shadow-sm hover:shadow-[0_4px_20px_rgba(0,0,0,0.25)]"
                >
                  {/* Left accent border */}
                  <div
                    className={`absolute top-0 left-0 bottom-0 w-1 ${
                      isProfit ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />

                  {/* Main row */}
                  <div className="flex items-center justify-between pl-1.5">
                    {/* Symbol & Logo */}
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.logoBg} flex items-center justify-center font-bold text-xs text-white shadow-md font-mono shrink-0`}
                      >
                        {item.logoText}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                            {item.symbol}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-secondary/80 text-muted-foreground">
                            Qty: {item.quantity}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{item.name}</p>
                      </div>
                    </div>

                    {/* Current Value & Returns */}
                    <div className="text-right">
                      <p className="text-sm font-bold font-mono text-foreground">
                        {fmt(item.currentValue)}
                      </p>

                      <div
                        className={`flex items-center justify-end gap-1 text-xs font-semibold font-mono ${
                          isProfit ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isProfit ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>
                          {fmt(item.profitLoss, true)} ({isProfit ? '+' : ''}
                          {item.profitLossPercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Details Grid */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-2.5 border-t border-border/40 text-[11px] font-mono pl-1.5">
                    <div>
                      <span className="text-muted-foreground block text-[9px] font-sans uppercase tracking-wider">
                        Avg Buy Price
                      </span>
                      <span className="text-foreground font-medium">{fmt(item.avgBuyPrice)}</span>
                    </div>

                    <div className="text-center">
                      <span className="text-muted-foreground block text-[9px] font-sans uppercase tracking-wider">
                        Current Price
                      </span>
                      <span className="text-foreground font-medium">{fmt(item.currentPrice)}</span>
                    </div>

                    <div className="text-right flex items-center justify-end gap-1">
                      <div>
                        <span className="text-muted-foreground block text-[9px] font-sans uppercase tracking-wider">
                          Invested
                        </span>
                        <span className="text-foreground font-medium">{fmt(item.investedAmount)}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all ml-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
