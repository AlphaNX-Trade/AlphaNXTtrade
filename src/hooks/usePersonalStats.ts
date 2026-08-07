import { useMemo } from 'react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useHoldings } from '@/hooks/useHoldings';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAllAssets } from '@/hooks/useAllAssets';

export interface SectorDiversification {
  sector: string;
  amount: number;
  percentage: number;
}

export function usePersonalStats() {
  const { transactions, historyLoading } = useTransactionHistory(200);
  const { holdings, holdingsLoading } = useHoldings();
  const { profile } = useUserProfile();
  const assets = useAllAssets();

  const stats = useMemo(() => {
    if (!transactions) {
      return {
        totalTrades: 0,
        buyCount: 0,
        sellCount: 0,
        winRate: 0,
        winCount: 0,
        lossCount: 0,
        avgReturnPercent: 0,
        totalRealizedPL: 0,
        bestTrade: null,
        worstTrade: null,
        avgHoldingHours: 0,
        totalInvestedCurrent: 0,
        portfolioDiversification: [] as SectorDiversification[],
      };
    }

    const totalTrades = transactions.length;
    const buys = transactions.filter((t) => t.side === 'BUY');
    const sells = transactions.filter((t) => t.side === 'SELL');

    let totalRealizedPL = 0;
    let winCount = 0;
    let lossCount = 0;
    let bestTrade: { symbol: string; realizedPL: number; percent: number } | null = null;
    let worstTrade: { symbol: string; realizedPL: number; percent: number } | null = null;
    let totalHoldingMs = 0;
    let holdingCount = 0;
    let sumReturnPercent = 0;

    sells.forEach((sell) => {
      const pl = sell.realizedPL ?? 0;
      totalRealizedPL += pl;

      const entry = sell.entryPrice ?? sell.price;
      const returnPct = entry > 0 ? ((sell.price - entry) / entry) * 100 : 0;
      sumReturnPercent += returnPct;

      if (pl > 0) {
        winCount++;
      } else if (pl < 0) {
        lossCount++;
      }

      if (!bestTrade || pl > bestTrade.realizedPL) {
        bestTrade = { symbol: sell.symbol, realizedPL: pl, percent: returnPct };
      }

      if (!worstTrade || pl < worstTrade.realizedPL) {
        worstTrade = { symbol: sell.symbol, realizedPL: pl, percent: returnPct };
      }

      if (sell.holdingDurationMs) {
        totalHoldingMs += sell.holdingDurationMs;
        holdingCount++;
      }
    });

    const closedTradesCount = sells.length;
    const winRate = closedTradesCount > 0 ? (winCount / closedTradesCount) * 100 : 0;
    const avgReturnPercent = closedTradesCount > 0 ? sumReturnPercent / closedTradesCount : 0;
    const avgHoldingHours = holdingCount > 0 ? totalHoldingMs / (1000 * 60 * 60) : 0;

    // Holdings & Diversification
    let totalInvestedCurrent = 0;
    const sectorMap: Record<string, number> = {};

    holdings.forEach((h) => {
      const invested = h.totalInvested ?? h.quantity * h.avgBuyPrice;
      totalInvestedCurrent += invested;

      const asset = assets?.find((a) => a.symbol === h.symbol);
      const sector = asset?.sector || asset?.type || 'Equities';

      sectorMap[sector] = (sectorMap[sector] || 0) + invested;
    });

    const portfolioDiversification: SectorDiversification[] = Object.entries(sectorMap).map(
      ([sector, amount]) => ({
        sector,
        amount,
        percentage: totalInvestedCurrent > 0 ? (amount / totalInvestedCurrent) * 100 : 0,
      }),
    );

    return {
      totalTrades,
      buyCount: buys.length,
      sellCount: sells.length,
      winRate,
      winCount,
      lossCount,
      avgReturnPercent,
      totalRealizedPL,
      bestTrade,
      worstTrade,
      avgHoldingHours,
      totalInvestedCurrent,
      portfolioDiversification,
      portfolioValue: profile?.portfolioValue ?? 100000,
      totalProfitLoss: profile?.totalProfitLoss ?? 0,
    };
  }, [transactions, holdings, profile, assets]);

  return {
    stats,
    loading: historyLoading || holdingsLoading,
  };
}
