import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  MicOff,
  X,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Bookmark,
  TrendingDown,
  Building2,
  Tag,
  Volume2,
} from 'lucide-react';
import { useAllAssets, Asset } from '@/hooks/useAllAssets';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { useLocation } from 'wouter';
import { triggerHaptic } from '@/lib/haptics';
import { formatCurrency } from '@/lib/formatters';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = 'alphanxt_v6_recent_searches';

const TRENDING_SEARCHES = ['RELIANCE', 'TCS', 'HDFCBANK', 'TATAMOTORS', 'INFY', 'GOLD', 'CRUDEOIL'];

export function AdvancedSearchModal({ isOpen, onClose }: AdvancedSearchModalProps) {
  const assets = useAllAssets();
  const [, setLocation] = useLocation();
  const { addRecentlyViewed } = useRecentlyViewed();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const clean = term.trim().toUpperCase();
    const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 8);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {}
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Voice Search setup
  const startVoiceSearch = () => {
    triggerHaptic('medium');
    setSpeechError(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Voice search is not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setQuery(transcript);
      };

      recognition.onerror = (e: any) => {
        console.error('Speech recognition error', e);
        setIsListening(false);
        setSpeechError('Could not recognize voice input. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
        triggerHaptic('success');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
      setSpeechError('Voice search failed to start.');
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSelectAsset = (asset: Asset) => {
    triggerHaptic('light');
    saveRecentSearch(asset.symbol);
    addRecentlyViewed(asset.symbol);
    onClose();
    setLocation(`/asset/${asset.symbol}`);
  };

  // Filter assets
  const filteredAssets = assets.filter((asset) => {
    const q = query.trim().toLowerCase();
    const matchesSearch =
      !q ||
      asset.symbol.toLowerCase().includes(q) ||
      asset.name.toLowerCase().includes(q) ||
      (asset.sector && asset.sector.toLowerCase().includes(q)) ||
      (asset.type && asset.type.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'equities') return asset.type === 'stock';
    if (selectedCategory === 'commodities') return asset.type === 'commodity';
    if (selectedCategory === 'indices') return asset.type === 'index';
    return true;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-md flex items-start justify-center p-3 sm:p-6 overflow-y-auto pt-10 sm:pt-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header Search Input */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search companies, symbols (e.g. RELIANCE), or sectors..."
              autoFocus
              className="flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-base sm:text-lg focus:outline-none"
            />

            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Voice Search Button */}
            <button
              onClick={isListening ? stopVoiceSearch : startVoiceSearch}
              className={`p-2 rounded-xl transition-all flex items-center gap-1.5 text-xs font-semibold ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              }`}
              title="Voice Search"
            >
              {isListening ? (
                <>
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  Listening...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">Voice</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Search Pulse Overlay Banner */}
          {isListening && (
            <div className="bg-gradient-to-r from-emerald-500/20 via-indigo-500/20 to-purple-500/20 p-3 border-b border-emerald-500/30 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Speak company or symbol name now (e.g. "Tata Motors" or "Reliance")...
              </div>
              <button onClick={stopVoiceSearch} className="underline text-slate-400 hover:text-white">
                Cancel
              </button>
            </div>
          )}

          {speechError && (
            <div className="p-3 bg-rose-500/10 text-rose-500 text-xs font-medium border-b border-rose-500/20 flex items-center justify-between">
              {speechError}
              <button onClick={() => setSpeechError(null)} className="underline">
                Dismiss
              </button>
            </div>
          )}

          {/* Category Filter Chips */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar bg-slate-50/30 dark:bg-slate-900/30">
            {[
              { id: 'all', label: 'All Assets' },
              { id: 'equities', label: 'Stocks' },
              { id: 'commodities', label: 'Commodities' },
              { id: 'crypto', label: 'Crypto' },
              { id: 'indices', label: 'Indices' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  triggerHaptic('light');
                  setSelectedCategory(cat.id);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white dark:bg-emerald-500 dark:text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {!query ? (
              <>
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Searches
                      </h4>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => {
                            triggerHaptic('light');
                            setQuery(term);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Trending Searches */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Trending Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {TRENDING_SEARCHES.map((term) => (
                      <button
                        key={term}
                        onClick={() => {
                          triggerHaptic('light');
                          setQuery(term);
                        }}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all hover:bg-emerald-500/5"
                      >
                        <TrendingUp className="w-3 h-3 text-emerald-500" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Sector Badges */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Building2 className="w-3.5 h-3.5" /> Popular Sectors
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {['Technology', 'Banking', 'Energy', 'Automobile', 'Pharmaceuticals', 'Metals'].map(
                      (sec) => (
                        <button
                          key={sec}
                          onClick={() => {
                            triggerHaptic('light');
                            setQuery(sec);
                          }}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all group"
                        >
                          <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                            {sec}
                          </div>
                          <div className="text-[10px] text-slate-400">Explore Collection</div>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Search Results List */
              <div>
                <div className="text-xs font-semibold text-slate-400 mb-3">
                  Found {filteredAssets.length} results
                </div>

                {filteredAssets.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 space-y-2">
                    <p className="font-semibold text-base">No matches found for "{query}"</p>
                    <p className="text-xs">Try searching for symbols like RELIANCE, TCS, or sector names.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                    {filteredAssets.map((asset) => {
                      const isGain = asset.changePercent >= 0;
                      return (
                        <div
                          key={asset.symbol}
                          onClick={() => handleSelectAsset(asset)}
                          className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl cursor-pointer transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 font-black text-xs text-slate-800 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                              {asset.symbol.slice(0, 3)}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-500 transition-colors">
                                  {asset.symbol}
                                </span>
                                {asset.sector && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500">
                                    {asset.sector}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] sm:max-w-xs">
                                {asset.name}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="font-bold text-sm text-slate-900 dark:text-white">
                              {formatCurrency(asset.price)}
                            </div>
                            <div
                              className={`text-xs font-semibold flex items-center justify-end gap-1 ${
                                isGain ? 'text-emerald-500' : 'text-rose-500'
                              }`}
                            >
                              {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {isGain ? '+' : ''}
                              {asset.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
