import { useMemo } from 'react';
import { usePersonalStats } from '@/hooks/usePersonalStats';
import { useLearnProgress } from '@/hooks/useLearnProgress';
import { useHoldings } from '@/hooks/useHoldings';

export interface LevelInfo {
  level: number;
  name: string;
  badge: string;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export interface BadgeV5 {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'trading' | 'learning' | 'portfolio';
  unlocked: boolean;
  progress: number; // 0 to 100
  unlockedAt?: string;
}

export function useAchievementsV5() {
  const { stats, loading: statsLoading } = usePersonalStats();
  const { earnedBadgeIds, completedTopics } = useLearnProgress();
  const { holdings } = useHoldings();

  const achievementsData = useMemo(() => {
    const totalTrades = stats.totalTrades;
    const winRate = stats.winRate;
    const totalPL = stats.totalProfitLoss;
    const lessonsDone = completedTopics ? completedTopics.length : 0;
    const holdingsCount = holdings.length;
    const sectorsCount = stats.portfolioDiversification.length;

    // Calculate total XP
    // 100 XP per trade, 250 XP per lesson, 500 XP per win, 1000 XP per holding
    const xpFromTrades = totalTrades * 100;
    const xpFromWins = stats.winCount * 300;
    const xpFromLessons = lessonsDone * 250;
    const xpFromDiversification = sectorsCount * 400;

    const totalXp = xpFromTrades + xpFromWins + xpFromLessons + xpFromDiversification;

    // Levels definitions
    const levels = [
      { level: 1, name: 'Beginner', badge: '🌱', minXp: 0, maxXp: 500 },
      { level: 2, name: 'Bronze', badge: '🥉', minXp: 500, maxXp: 1500 },
      { level: 3, name: 'Silver', badge: '🥈', minXp: 1500, maxXp: 3500 },
      { level: 4, name: 'Gold', badge: '🥇', minXp: 3500, maxXp: 7000 },
      { level: 5, name: 'Platinum', badge: '💎', minXp: 7000, maxXp: 12000 },
      { level: 6, name: 'Diamond', badge: '👑', minXp: 12000, maxXp: 20000 },
      { level: 7, name: 'Elite', badge: '⚡', minXp: 20000, maxXp: 50000 },
    ];

    let currentLevelObj = levels[0];
    for (let i = levels.length - 1; i >= 0; i--) {
      if (totalXp >= levels[i].minXp) {
        currentLevelObj = levels[i];
        break;
      }
    }

    const range = currentLevelObj.maxXp - currentLevelObj.minXp;
    const xpInLevel = totalXp - currentLevelObj.minXp;
    const progressPercent = Math.min(100, Math.max(0, (xpInLevel / range) * 100));

    const levelInfo: LevelInfo = {
      level: currentLevelObj.level,
      name: currentLevelObj.name,
      badge: currentLevelObj.badge,
      currentXp: totalXp,
      nextLevelXp: currentLevelObj.maxXp,
      progressPercent,
    };

    // Badges definitions based on real criteria
    const badges: BadgeV5[] = [
      {
        id: 'first_trade',
        title: 'First Trade',
        description: 'Execute your very first trade in the market',
        icon: 'TrendingUp',
        category: 'trading',
        unlocked: totalTrades >= 1,
        progress: Math.min(100, (totalTrades / 1) * 100),
      },
      {
        id: 'ten_trades',
        title: '10 Trades Trader',
        description: 'Execute 10 market trades',
        icon: 'Zap',
        category: 'trading',
        unlocked: totalTrades >= 10,
        progress: Math.min(100, (totalTrades / 10) * 100),
      },
      {
        id: 'hundred_trades',
        title: '100 Trades Centurion',
        description: 'Execute 100 trades like a market pro',
        icon: 'Award',
        category: 'trading',
        unlocked: totalTrades >= 100,
        progress: Math.min(100, (totalTrades / 100) * 100),
      },
      {
        id: 'profitable_investor',
        title: 'Profitable Investor',
        description: 'Generate net positive profit in your portfolio',
        icon: 'DollarSign',
        category: 'portfolio',
        unlocked: totalPL > 0 || stats.winCount >= 1,
        progress: totalPL > 0 || stats.winCount >= 1 ? 100 : 0,
      },
      {
        id: 'long_term_investor',
        title: 'Long-Term Investor',
        description: 'Hold a stock position for over 7 days or maintain 3+ active holdings',
        icon: 'ShieldCheck',
        category: 'portfolio',
        unlocked: holdingsCount >= 3 || stats.avgHoldingHours >= 168,
        progress: Math.min(100, (holdingsCount / 3) * 100),
      },
      {
        id: 'diversified_master',
        title: 'Diversification Master',
        description: 'Spread investments across 3 or more different sectors',
        icon: 'PieChart',
        category: 'portfolio',
        unlocked: sectorsCount >= 3,
        progress: Math.min(100, (sectorsCount / 3) * 100),
      },
      {
        id: 'academy_scholar',
        title: 'Academy Scholar',
        description: 'Complete at least 3 lessons in Learn Academy',
        icon: 'GraduationCap',
        category: 'learning',
        unlocked: lessonsDone >= 3 || earnedBadgeIds.length >= 1,
        progress: Math.min(100, (lessonsDone / 3) * 100),
      },
    ];

    return {
      levelInfo,
      badges,
      totalXp,
    };
  }, [stats, earnedBadgeIds, completedTopics, holdings]);

  return {
    ...achievementsData,
    loading: statsLoading,
  };
}
