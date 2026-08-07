import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const RECENTLY_VIEWED_KEY = 'alphanxt_recently_viewed';
const MAX_RECENT = 10;

export function useRecentlyViewed() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';
  const storageKey = `${RECENTLY_VIEWED_KEY}_${userId}`;

  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setRecentlyViewed(saved ? JSON.parse(saved) : []);
    } catch {
      setRecentlyViewed([]);
    }
  }, [storageKey]);

  const addRecentlyViewed = useCallback(
    (symbol: string) => {
      if (!symbol) return;
      setRecentlyViewed((prev) => {
        const filtered = prev.filter((s) => s.toUpperCase() !== symbol.toUpperCase());
        const updated = [symbol.toUpperCase(), ...filtered].slice(0, MAX_RECENT);
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to save recently viewed', err);
        }
        return updated;
      });
    },
    [storageKey]
  );

  const clearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // Ignore
    }
  }, [storageKey]);

  return {
    recentlyViewed,
    addRecentlyViewed,
    clearRecentlyViewed,
  };
}
