import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface JournalEntry {
  id: string;
  symbol: string;
  assetName: string;
  tradeType: 'BUY' | 'SELL' | 'WATCH';
  whyBought: string;
  strategy: 'Long Term Growth' | 'SIP' | 'Swing Trade' | 'Value Investing' | 'Breakout' | 'Dividend Yield';
  targetPrice: number;
  stopLoss?: number;
  observations: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'alphanxt_investment_journal_v8';

export function useInvestmentJournal() {
  const { user } = useAuth();
  const userId = user?.uid || 'guest';
  const userKey = `${STORAGE_KEY}_${userId}`;

  const [entries, setEntries] = useState<JournalEntry[]>([]);

  // Load entries from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(userKey);
      if (saved) {
        setEntries(JSON.parse(saved));
      } else {
        // Initial default sample journal entry if new user
        const defaultEntries: JournalEntry[] = [
          {
            id: 'j_sample_1',
            symbol: 'RELIANCE',
            assetName: 'Reliance Industries Ltd',
            tradeType: 'BUY',
            whyBought: 'Strong energy market dominance, green energy transition plans, and retail expansion.',
            strategy: 'Long Term Growth',
            targetPrice: 3200,
            stopLoss: 2600,
            observations: 'Accumulate on dips below ₹2,800 level. Expecting strong Q3 earnings.',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        setEntries(defaultEntries);
      }
    } catch {
      setEntries([]);
    }
  }, [userKey]);

  // Persist entries
  const saveEntries = useCallback(
    (updated: JournalEntry[]) => {
      setEntries(updated);
      try {
        localStorage.setItem(userKey, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save journal entry', err);
      }
    },
    [userKey]
  );

  const addEntry = useCallback(
    (entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        ...entryData,
        id: `journal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };
      saveEntries([newEntry, ...entries]);
      return newEntry;
    },
    [entries, saveEntries]
  );

  const updateEntry = useCallback(
    (id: string, updatedFields: Partial<Omit<JournalEntry, 'id' | 'createdAt'>>) => {
      const updated = entries.map((e) =>
        e.id === id ? { ...e, ...updatedFields, updatedAt: new Date().toISOString() } : e
      );
      saveEntries(updated);
    },
    [entries, saveEntries]
  );

  const deleteEntry = useCallback(
    (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      saveEntries(updated);
    },
    [entries, saveEntries]
  );

  const getEntriesForSymbol = useCallback(
    (symbol: string) => {
      return entries.filter((e) => e.symbol.toUpperCase() === symbol.toUpperCase());
    },
    [entries]
  );

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForSymbol,
  };
}
