import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const PERSONALIZATION_KEY = 'alphanxt_v7_personalization';

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category: string;
}

export interface PersonalizationSettings {
  favoriteSectors: string[];
  preferredWatchlistId: string;
  defaultLandingPage: string;
  quickActions: string[];
  widgetOrder: string[];
  pinnedWidgets: string[];
  dashboardWidgets: {
    portfolio: boolean;
    quickActions: boolean;
    marketOverview: boolean;
    healthScore: boolean;
    dailySummary: boolean;
    topGainers: boolean;
    topLosers: boolean;
    news: boolean;
    investments: boolean;
    watchlist: boolean;
    goalProgress: boolean;
    investmentIdeas: boolean;
    recentTransactions: boolean;
    portfolioChart: boolean;
  };
  goals: FinancialGoal[];
}

const DEFAULT_GOALS: FinancialGoal[] = [
  {
    id: 'g1',
    title: 'Buy a House',
    targetAmount: 5000000,
    currentAmount: 1250000,
    targetDate: '2028-12-31',
    category: 'house',
  },
  {
    id: 'g2',
    title: 'Emergency Fund',
    targetAmount: 300000,
    currentAmount: 180000,
    targetDate: '2026-12-31',
    category: 'emergency',
  },
];

const DEFAULT_SETTINGS: PersonalizationSettings = {
  favoriteSectors: ['Technology', 'Banking', 'Energy'],
  preferredWatchlistId: 'default',
  defaultLandingPage: '/dashboard',
  quickActions: ['buy', 'watchlist', 'analytics', 'alerts', 'compare', 'journal'],
  widgetOrder: [
    'portfolio',
    'quickActions',
    'healthScore',
    'marketOverview',
    'topGainers',
    'topLosers',
    'investments',
    'watchlist',
    'news',
  ],
  pinnedWidgets: ['portfolio', 'quickActions'],
  dashboardWidgets: {
    portfolio: true,
    quickActions: true,
    marketOverview: true,
    healthScore: true,
    dailySummary: true,
    topGainers: true,
    topLosers: true,
    news: true,
    investments: true,
    watchlist: true,
    goalProgress: true,
    investmentIdeas: true,
    recentTransactions: true,
    portfolioChart: true,
  },
  goals: DEFAULT_GOALS,
};

export function usePersonalization() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';
  const storageKey = `${PERSONALIZATION_KEY}_${userId}`;

  const [settings, setSettings] = useState<PersonalizationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...parsed,
          goals: parsed.goals && parsed.goals.length > 0 ? parsed.goals : DEFAULT_GOALS,
        });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }
    } catch {
      setSettings(DEFAULT_SETTINGS);
    }
  }, [storageKey]);

  const updateSettings = useCallback(
    (newSettings: Partial<PersonalizationSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (e) {
          console.error('Failed to save personalization', e);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const addGoal = useCallback(
    (newGoal: FinancialGoal) => {
      setSettings((prev) => {
        const updatedGoals = [newGoal, ...(prev.goals || [])];
        const updated = { ...prev, goals: updatedGoals };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const updateGoalProgress = useCallback(
    (goalId: string, currentAmount: number) => {
      setSettings((prev) => {
        const updatedGoals = (prev.goals || []).map((g) =>
          g.id === goalId ? { ...g, currentAmount } : g
        );
        const updated = { ...prev, goals: updatedGoals };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const removeGoal = useCallback(
    (goalId: string) => {
      setSettings((prev) => {
        const updatedGoals = (prev.goals || []).filter((g) => g.id !== goalId);
        const updated = { ...prev, goals: updatedGoals };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const toggleSector = useCallback(
    (sector: string) => {
      setSettings((prev) => {
        const exists = prev.favoriteSectors.includes(sector);
        const favoriteSectors = exists
          ? prev.favoriteSectors.filter((s) => s !== sector)
          : [...prev.favoriteSectors, sector];
        const updated = { ...prev, favoriteSectors };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const toggleWidget = useCallback(
    (widgetKey: keyof PersonalizationSettings['dashboardWidgets']) => {
      setSettings((prev) => {
        const dashboardWidgets = {
          ...prev.dashboardWidgets,
          [widgetKey]: !prev.dashboardWidgets[widgetKey],
        };
        const updated = { ...prev, dashboardWidgets };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const setFinancialGoal = useCallback(
    (goal: FinancialGoal | null) => {
      if (goal) {
        addGoal(goal);
      }
    },
    [addGoal]
  );

  const reorderWidgets = useCallback(
    (newOrder: string[]) => {
      setSettings((prev) => {
        const updated = { ...prev, widgetOrder: newOrder };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const togglePinWidget = useCallback(
    (widgetId: string) => {
      setSettings((prev) => {
        const isPinned = prev.pinnedWidgets.includes(widgetId);
        const pinnedWidgets = isPinned
          ? prev.pinnedWidgets.filter((w) => w !== widgetId)
          : [...prev.pinnedWidgets, widgetId];
        const updated = { ...prev, pinnedWidgets };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  const setDefaultLandingPage = useCallback(
    (page: string) => {
      setSettings((prev) => {
        const updated = { ...prev, defaultLandingPage: page };
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch {}
        return updated;
      });
    },
    [storageKey]
  );

  return {
    settings,
    updateSettings,
    addGoal,
    updateGoalProgress,
    removeGoal,
    toggleSector,
    toggleWidget,
    setFinancialGoal,
    reorderWidgets,
    togglePinWidget,
    setDefaultLandingPage,
  };
}
