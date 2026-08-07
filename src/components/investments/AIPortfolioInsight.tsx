import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Bot, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, ChevronRight } from 'lucide-react';
import type { InvestmentHolding } from '@/data/mockInvestments';

interface AIPortfolioInsightProps {
  holdings: InvestmentHolding[];
  totalReturnsPercent: number;
}

export function AIPortfolioInsight({ holdings, totalReturnsPercent }: AIPortfolioInsightProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);

  // Derive dynamic details from holdings
  const sortedHoldings = [...holdings].sort((a, b) => b.profitLoss - a.profitLoss);
  const topGainer = sortedHoldings[0];
  const topLoser = sortedHoldings[sortedHoldings.length - 1];

  const handleRefresh = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setInsightIndex((prev) => (prev + 1) % 3);
    }, 800);
  };

  const insightsList = [
    {
      title: 'Monthly Performance Summary',
      mainText: `Your investment portfolio has gained ${totalReturnsPercent >= 0 ? '+' : ''}${totalReturnsPercent.toFixed(
        1
      )}% overall. ${topGainer ? `${topGainer.sector} sector (${topGainer.symbol})` : 'Energy sector'} contributed the highest growth this period.`,
      highlights: [
        {
          type: 'PROFIT',
          text: topGainer
            ? `${topGainer.symbol} is your top performer (+${topGainer.profitLossPercent.toFixed(1)}%).`
            : 'Energy stocks are outperforming benchmark indices.',
        },
        {
          type: 'WARNING',
          text: topLoser && topLoser.profitLoss < 0
            ? `${topLoser.symbol} dipped by ${Math.abs(topLoser.profitLossPercent).toFixed(1)}%. Consider checking sector news.`
            : 'Maintain balanced asset allocation to minimize unexpected volatility.',
        },
        {
          type: 'TIP',
          text: 'Diversification score is 88/100. Adding a small SIP in Banking or FMCG will improve long-term stability.',
        },
      ],
    },
    {
      title: 'Risk & Rebalancing Audit',
      mainText: `Your portfolio allocation is heavily concentrated in ${topGainer?.sector || 'IT & Energy'}. Overall market sentiment remains bullish with moderate momentum.`,
      highlights: [
        {
          type: 'PROFIT',
          text: 'Tech & Infrastructure holdings show robust quarterly order execution.',
        },
        {
          type: 'WARNING',
          text: 'Automobile sector yields are slightly below 30-day moving average.',
        },
        {
          type: 'TIP',
          text: 'Consider locking in partial profits on high-flyers to reinvest during market dips.',
        },
      ],
    },
    {
      title: 'Smart Growth Strategy',
      mainText: 'Alpha AI projected 12-month return: +14.8% based on historic fundamentals, low debt ratios, and strong industry cash flows.',
      highlights: [
        {
          type: 'PROFIT',
          text: 'Blue-chip equities in your holdings provide high dividend yield stability.',
        },
        {
          type: 'WARNING',
          text: 'Macro inflation indicators may affect short-term automotive demand.',
        },
        {
          type: 'TIP',
          text: 'Set stop-loss alerts on high beta holdings for maximum capital protection.',
        },
      ],
    },
  ];

  const currentInsight = insightsList[insightIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-background border border-primary/30 p-4.5 shadow-[0_8px_30px_rgba(0,210,210,0.08)]"
    >
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-primary/20 border border-primary/40 text-primary shadow-[0_0_12px_rgba(0,210,210,0.3)]">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-xs text-foreground">Alpha AI Portfolio Insight</span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                AI Powered
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground">Smart automated portfolio audit</p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isGenerating}
          className="p-1.5 rounded-lg bg-secondary/60 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          title="Generate fresh AI insights"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin text-primary' : ''}`} />
        </button>
      </div>

      {/* Main AI Speech / Analysis Text */}
      <div className="pt-3 pb-2 space-y-3">
        <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 relative">
          <p className="text-xs text-foreground/90 leading-relaxed font-medium">
            "{currentInsight.mainText}"
          </p>
        </div>

        {/* Highlighted Bullets */}
        <div className="space-y-2">
          {currentInsight.highlights.map((h, i) => {
            const isProfit = h.type === 'PROFIT';
            const isWarning = h.type === 'WARNING';

            return (
              <div
                key={i}
                className="flex items-start gap-2 text-xs p-2.5 rounded-xl bg-secondary/40 border border-border/40"
              >
                {isProfit && <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                {isWarning && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
                {!isProfit && !isWarning && <Lightbulb className="w-4 h-4 text-primary shrink-0 mt-0.5" />}

                <span className="text-muted-foreground text-[11px] leading-normal font-medium">
                  {h.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
