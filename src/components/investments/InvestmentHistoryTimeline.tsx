import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  History,
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  MinusCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { useLocation } from 'wouter';
import type { InvestmentTimelineItem } from '@/data/mockInvestments';

interface InvestmentHistoryTimelineProps {
  timeline: InvestmentTimelineItem[];
}

export function InvestmentHistoryTimeline({ timeline }: InvestmentHistoryTimelineProps) {
  const [, setLocation] = useLocation();
  const [filter, setFilter] = useState<'ALL' | 'TRADES' | 'FUNDS'>('ALL');

  const filteredTimeline = timeline.filter((item) => {
    if (filter === 'TRADES') return item.type === 'BUY' || item.type === 'SELL';
    if (filter === 'FUNDS') return item.type === 'DEPOSIT' || item.type === 'WITHDRAWAL';
    return true;
  });

  const getItemIcon = (type: InvestmentTimelineItem['type']) => {
    switch (type) {
      case 'BUY':
        return <ArrowDownLeft className="w-4 h-4 text-emerald-400" />;
      case 'SELL':
        return <ArrowUpRight className="w-4 h-4 text-rose-400" />;
      case 'DEPOSIT':
        return <PlusCircle className="w-4 h-4 text-primary" />;
      case 'WITHDRAWAL':
        return <MinusCircle className="w-4 h-4 text-amber-400" />;
    }
  };

  const getItemBg = (type: InvestmentTimelineItem['type']) => {
    switch (type) {
      case 'BUY':
        return 'bg-emerald-500/10 border-emerald-500/20';
      case 'SELL':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'DEPOSIT':
        return 'bg-primary/10 border-primary/20';
      case 'WITHDRAWAL':
        return 'bg-amber-500/10 border-amber-500/20';
    }
  };

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
            <History className="w-4 h-4 text-primary" />
            Investment Activity Timeline
          </h3>
          <p className="text-[11px] text-muted-foreground">Recent transactions & fund movements</p>
        </div>

        <button
          onClick={() => setLocation('/history')}
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
        >
          <span>View All</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-secondary/40 p-1 rounded-xl border border-border/40">
        {(['ALL', 'TRADES', 'FUNDS'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1 text-[11px] font-semibold rounded-lg transition-all ${
              filter === f
                ? 'bg-card text-primary shadow-xs border border-primary/20'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'ALL' ? 'All Activity' : f === 'TRADES' ? 'Trades' : 'Deposits / Cash'}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="relative pl-3 space-y-3 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
        {filteredTimeline.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
            className="relative flex items-start gap-3 group"
          >
            {/* Timeline node icon */}
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 z-10 backdrop-blur-md ${getItemBg(
                item.type
              )}`}
            >
              {getItemIcon(item.type)}
            </div>

            {/* Content card */}
            <div className="flex-1 rounded-xl bg-card/80 border border-border/60 hover:border-primary/30 p-3 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{item.subtitle}</p>
                </div>

                <div className="text-right">
                  <span
                    className={`font-mono font-bold text-xs block ${
                      item.type === 'BUY' || item.type === 'WITHDRAWAL'
                        ? 'text-foreground'
                        : 'text-emerald-400'
                    }`}
                  >
                    {item.type === 'BUY' || item.type === 'WITHDRAWAL' ? '-' : '+'}₹
                    {item.amount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>

                  <span className="inline-flex items-center gap-1 text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Timestamp */}
              <div className="mt-2 pt-1.5 border-t border-border/30 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground/70" />
                  {item.date}
                </span>
                <span className="text-muted-foreground/60">ID: {item.id}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
