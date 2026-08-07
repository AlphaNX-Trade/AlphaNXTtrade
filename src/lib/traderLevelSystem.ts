export interface TraderLevelTier {
  level: number;
  title: string;
  badge: string;
  minProfit: number; // Required cumulative Profit / Loss in INR
  minNetWorth: number; // Required Total Net Worth (Portfolio Value + Virtual Cash)
  color: string;
  borderClass: string;
  bgGradient: string;
  unlockedFrameId: string;
  perks: string[];
}

export const TRADER_LEVEL_TIERS: TraderLevelTier[] = [
  {
    level: 1,
    title: 'Rookie Trader',
    badge: 'L1 Rookie',
    minProfit: 0,
    minNetWorth: 0,
    color: 'text-slate-400',
    borderClass: 'border-slate-500/30',
    bgGradient: 'from-slate-500/20 to-slate-700/20',
    unlockedFrameId: 'none',
    perks: [
      'Basic Paper Trading Engine',
      'Community Discussions & Posts',
      'Standard Avatar & Classic Frame',
    ],
  },
  {
    level: 2,
    title: 'Bronze Trader',
    badge: 'L2 Bronze',
    minProfit: 10000,
    minNetWorth: 1050000,
    color: 'text-amber-600 dark:text-amber-500',
    borderClass: 'border-amber-500/40',
    bgGradient: 'from-amber-600/20 to-amber-800/20',
    unlockedFrameId: 'none',
    perks: [
      'Access to Market Hot-Sectors Analytics',
      'Custom Watchlists & Price Alerts',
      'Bronze Level Badge on Community Posts',
    ],
  },
  {
    level: 3,
    title: 'Silver Trader',
    badge: 'L3 Silver',
    minProfit: 50000,
    minNetWorth: 1200000,
    color: 'text-slate-200 dark:text-slate-300',
    borderClass: 'border-slate-300/50',
    bgGradient: 'from-slate-400/20 to-slate-600/20',
    unlockedFrameId: 'silver',
    perks: [
      'Unlocked Silver Sheen Avatar Frame',
      'Advanced Options Chain Volatility Metrics',
      'Priority Post Pinning in Community',
    ],
  },
  {
    level: 4,
    title: 'Gold Trader',
    badge: 'L4 Gold',
    minProfit: 200000,
    minNetWorth: 1500000,
    color: 'text-amber-400 dark:text-amber-300',
    borderClass: 'border-amber-400/50',
    bgGradient: 'from-amber-400/20 to-amber-600/20',
    unlockedFrameId: 'gold',
    perks: [
      'Unlocked Radiant Gold Animated Frame',
      'AI Daily Tip & Portfolio Risk Diagnostics',
      'Gold Trader Verified Badge',
    ],
  },
  {
    level: 5,
    title: 'Platinum Master',
    badge: 'L5 Platinum',
    minProfit: 500000,
    minNetWorth: 2000000,
    color: 'text-cyan-400 dark:text-cyan-300',
    borderClass: 'border-cyan-400/50',
    bgGradient: 'from-cyan-400/20 to-blue-600/20',
    unlockedFrameId: 'platinum',
    perks: [
      'Unlocked Platinum Shimmer Frame',
      'Access to High-Frequency Signal Feed',
      'Highlighted Ranking on Global Leaderboards',
    ],
  },
  {
    level: 6,
    title: 'Diamond Elite',
    badge: 'L6 Diamond',
    minProfit: 1500000,
    minNetWorth: 3500000,
    color: 'text-purple-400 dark:text-purple-300',
    borderClass: 'border-purple-400/50',
    bgGradient: 'from-purple-500/20 to-indigo-700/20',
    unlockedFrameId: 'diamond',
    perks: [
      'Unlocked Diamond Prism Multi-Aura Frame',
      'Elite Cyber Matrix Styling Access',
      'Exclusive VIP Founder Lounge Access',
    ],
  },
  {
    level: 7,
    title: 'Alpha Legend',
    badge: 'L7 Legend',
    minProfit: 5000000,
    minNetWorth: 7500000,
    color: 'text-amber-300 dark:text-yellow-200',
    borderClass: 'border-amber-300/80 shadow-[0_0_15px_rgba(252,211,77,0.5)]',
    bgGradient: 'from-amber-500/30 via-orange-500/20 to-purple-600/30',
    unlockedFrameId: 'alpha_founder',
    perks: [
      'Unlocked Alpha Founder & VIP Glow Halos',
      'Custom Title Assignment & Verified Legend Badge',
      'Full Unlimited Platform Access & High-Leverage Perks',
    ],
  },
];

export interface TraderLevelCalculation {
  currentTier: TraderLevelTier;
  nextTier: TraderLevelTier | null;
  currentProfit: number;
  netWorth: number;
  profitProgressPercent: number;
  netWorthProgressPercent: number;
  overallProgressPercent: number;
  profitToNextLevel: number;
  netWorthToNextLevel: number;
  unlockedFrames: string[];
}

/**
 * Calculates current trader level based on net profit/loss and total portfolio net worth
 */
export function calculateTraderLevel(
  totalProfitLoss: number = 0,
  virtualBalance: number = 0,
  portfolioValue: number = 0,
): TraderLevelCalculation {
  const currentProfit = Math.max(0, totalProfitLoss);
  const netWorth = virtualBalance + portfolioValue;

  let currentTierIndex = 0;

  for (let i = TRADER_LEVEL_TIERS.length - 1; i >= 0; i--) {
    const tier = TRADER_LEVEL_TIERS[i];
    // A user qualifies for a tier if they meet either the profit requirement OR the net worth threshold
    if (currentProfit >= tier.minProfit || netWorth >= tier.minNetWorth) {
      currentTierIndex = i;
      break;
    }
  }

  const currentTier = TRADER_LEVEL_TIERS[currentTierIndex];
  const nextTier =
    currentTierIndex < TRADER_LEVEL_TIERS.length - 1
      ? TRADER_LEVEL_TIERS[currentTierIndex + 1]
      : null;

  let profitProgressPercent = 100;
  let netWorthProgressPercent = 100;
  let overallProgressPercent = 100;
  let profitToNextLevel = 0;
  let netWorthToNextLevel = 0;

  if (nextTier) {
    const profitSpan = nextTier.minProfit - currentTier.minProfit;
    const profitEarnedInTier = Math.max(0, currentProfit - currentTier.minProfit);
    profitProgressPercent = profitSpan > 0 ? Math.min(100, Math.round((profitEarnedInTier / profitSpan) * 100)) : 100;

    const netWorthSpan = nextTier.minNetWorth - currentTier.minNetWorth;
    const netWorthEarnedInTier = Math.max(0, netWorth - currentTier.minNetWorth);
    netWorthProgressPercent = netWorthSpan > 0 ? Math.min(100, Math.round((netWorthEarnedInTier / netWorthSpan) * 100)) : 100;

    overallProgressPercent = Math.max(profitProgressPercent, netWorthProgressPercent);

    profitToNextLevel = Math.max(0, nextTier.minProfit - currentProfit);
    netWorthToNextLevel = Math.max(0, nextTier.minNetWorth - netWorth);
  }

  // Get list of unlocked frame IDs up to current level
  const unlockedFrames = TRADER_LEVEL_TIERS.slice(0, currentTierIndex + 1)
    .map((t) => t.unlockedFrameId)
    .filter(Boolean);

  // Add default unlocked frames
  if (!unlockedFrames.includes('none')) unlockedFrames.push('none');
  if (!unlockedFrames.includes('silver')) unlockedFrames.push('silver');

  return {
    currentTier,
    nextTier,
    currentProfit,
    netWorth,
    profitProgressPercent,
    netWorthProgressPercent,
    overallProgressPercent,
    profitToNextLevel,
    netWorthToNextLevel,
    unlockedFrames,
  };
}

/**
 * Checks if a specific required level is reached
 */
export function hasLevelAccess(
  userLevel: number,
  requiredLevel: number,
): boolean {
  return userLevel >= requiredLevel;
}
