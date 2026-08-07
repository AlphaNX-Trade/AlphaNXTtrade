import { useState, useEffect } from 'react';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/contexts/AuthContext';

export interface CustomWatchlist {
  id: string;
  name: string;
  description?: string;
  symbols: string[];
  pinnedSymbols: string[];
  createdAt: string;
}

export interface StockNote {
  symbol: string;
  content: string;
  updatedAt: string;
}

const STORAGE_KEY_CUSTOM_WL = 'alphanxt_custom_watchlists_v5';
const STORAGE_KEY_STOCK_NOTES = 'alphanxt_stock_notes_v5';

export function useAdvancedWatchlist() {
  const { user } = useAuth();
  const { watchlist: defaultSymbols, addStock, removeStock, isInWatchlist } = useWatchlist();

  const getDefaultLists = (symbols: string[]) => [
    {
      id: 'default',
      name: 'Main Watchlist',
      description: 'Primary tracked market assets',
      symbols: symbols.length > 0 ? symbols : ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS'],
      pinnedSymbols: ['RELIANCE', 'TCS'],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'tech_giants',
      name: 'Tech & Innovation',
      description: 'Leading IT and tech leaders',
      symbols: ['TCS', 'INFY', 'WIPRO', 'HCLTECH', 'TECHM'],
      pinnedSymbols: ['TCS'],
      createdAt: new Date().toISOString(),
    },
  ];

  const [customLists, setCustomLists] = useState<CustomWatchlist[]>([]);
  const [notes, setNotes] = useState<Record<string, StockNote>>({});

  // Load from localStorage when user uid changes
  useEffect(() => {
    try {
      const savedLists = localStorage.getItem(`${STORAGE_KEY_CUSTOM_WL}_${user?.uid || 'guest'}`);
      setCustomLists(savedLists ? JSON.parse(savedLists) : getDefaultLists(defaultSymbols));

      const savedNotes = localStorage.getItem(`${STORAGE_KEY_STOCK_NOTES}_${user?.uid || 'guest'}`);
      setNotes(savedNotes ? JSON.parse(savedNotes) : {});
    } catch {
      setCustomLists(getDefaultLists(defaultSymbols));
      setNotes({});
    }
  }, [user?.uid]);

  // Sync default symbols when default watchlist changes
  useEffect(() => {
    if (defaultSymbols.length > 0) {
      setCustomLists((prev) =>
        prev.map((list) => {
          if (list.id === 'default') {
            const merged = Array.from(new Set([...list.symbols, ...defaultSymbols]));
            return { ...list, symbols: merged };
          }
          return list;
        }),
      );
    }
  }, [defaultSymbols]);

  // Persist custom watchlists
  useEffect(() => {
    if (customLists.length === 0) return;
    try {
      localStorage.setItem(`${STORAGE_KEY_CUSTOM_WL}_${user?.uid || 'guest'}`, JSON.stringify(customLists));
    } catch (e) {
      console.error('Failed to save watchlists', e);
    }
  }, [customLists, user?.uid]);

  // Persist stock notes
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY_STOCK_NOTES}_${user?.uid || 'guest'}`, JSON.stringify(notes));
    } catch (e) {
      console.error('Failed to save notes', e);
    }
  }, [notes, user?.uid]);

  const createList = (name: string, description?: string) => {
    const newList: CustomWatchlist = {
      id: `list_${Date.now()}`,
      name,
      description,
      symbols: [],
      pinnedSymbols: [],
      createdAt: new Date().toISOString(),
    };
    setCustomLists((prev) => [...prev, newList]);
    return newList.id;
  };

  const deleteList = (listId: string) => {
    if (listId === 'default') return; // Cannot delete main default list
    setCustomLists((prev) => prev.filter((l) => l.id !== listId));
  };

  const addStockToList = (listId: string, symbol: string) => {
    setCustomLists((prev) =>
      prev.map((l) => {
        if (l.id === listId && !l.symbols.includes(symbol)) {
          return { ...l, symbols: [...l.symbols, symbol] };
        }
        return l;
      }),
    );
    if (listId === 'default') {
      addStock(symbol);
    }
  };

  const removeStockFromList = (listId: string, symbol: string) => {
    setCustomLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          return {
            ...l,
            symbols: l.symbols.filter((s) => s !== symbol),
            pinnedSymbols: l.pinnedSymbols.filter((s) => s !== symbol),
          };
        }
        return l;
      }),
    );
    if (listId === 'default') {
      removeStock(symbol);
    }
  };

  const togglePinStock = (listId: string, symbol: string) => {
    setCustomLists((prev) =>
      prev.map((l) => {
        if (l.id === listId) {
          const isPinned = l.pinnedSymbols.includes(symbol);
          const newPinned = isPinned
            ? l.pinnedSymbols.filter((s) => s !== symbol)
            : [...l.pinnedSymbols, symbol];
          return { ...l, pinnedSymbols: newPinned };
        }
        return l;
      }),
    );
  };

  const saveNote = (symbol: string, content: string) => {
    setNotes((prev) => ({
      ...prev,
      [symbol]: {
        symbol,
        content,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  const getNote = (symbol: string): string => {
    return notes[symbol]?.content || '';
  };

  return {
    customLists,
    createList,
    deleteList,
    addStockToList,
    removeStockFromList,
    togglePinStock,
    saveNote,
    getNote,
    isInWatchlist,
  };
}
