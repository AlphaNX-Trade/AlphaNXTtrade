import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Star,
  Plus,
  Search,
  Pin,
  FileText,
  Bell,
  Trash2,
  TrendingUp,
  TrendingDown,
  Edit3,
  X,
  Sparkles,
  ArrowUpDown,
  Clock,
  Flame,
  Tag,
} from 'lucide-react';
import { useAdvancedWatchlist } from '@/hooks/useAdvancedWatchlist';
import { useAllAssets } from '@/hooks/useAllAssets';
import { usePriceAlerts } from '@/hooks/usePriceAlerts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export default function WatchlistPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const assets = useAllAssets();
  const { alerts } = usePriceAlerts();
  const { recentlyViewed } = useRecentlyViewed();
  const {
    customLists,
    createList,
    deleteList,
    addStockToList,
    removeStockFromList,
    togglePinStock,
    saveNote,
    getNote,
  } = useAdvancedWatchlist();

  const [activeListId, setActiveListId] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'PINNED' | 'PRICE_HIGH' | 'PRICE_LOW' | 'GAIN' | 'LOSS' | 'VOLUME' | 'NAME'>('PINNED');
  const [activeTab, setActiveTab] = useState<'WATCHLIST' | 'RECENT' | 'MOST_WATCHED'>('WATCHLIST');

  // Modals state
  const [isNewListOpen, setIsNewListOpen] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const [newListDesc, setNewListDesc] = useState('');

  const [activeNoteSymbol, setActiveNoteSymbol] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');

  const [isAddStockOpen, setIsAddStockOpen] = useState(false);
  const [stockSearchQuery, setStockSearchQuery] = useState('');

  // Current active list object
  const activeList = useMemo(() => {
    return customLists.find((l) => l.id === activeListId) || customLists[0];
  }, [customLists, activeListId]);

  // Assets in current list
  const listAssets = useMemo(() => {
    if (!assets) return [];
    if (activeTab === 'RECENT') {
      return recentlyViewed
        .map((sym) => assets.find((a) => a.symbol === sym))
        .filter((a): a is NonNullable<typeof a> => a !== undefined);
    }
    if (activeTab === 'MOST_WATCHED') {
      // Top bluechips as most watched
      return ['RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'TATAMOTORS', 'ICICIBANK', 'SBIN', 'BHARTIARTL']
        .map((sym) => assets.find((a) => a.symbol === sym))
        .filter((a): a is NonNullable<typeof a> => a !== undefined);
    }
    if (!activeList) return [];
    return activeList.symbols
      .map((sym) => assets.find((a) => a.symbol === sym))
      .filter((a): a is NonNullable<typeof a> => a !== undefined);
  }, [assets, activeList, activeTab, recentlyViewed]);

  // Filtered & Sorted
  const filteredAssets = useMemo(() => {
    let result = [...listAssets];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) => a.symbol.toLowerCase().includes(q) || a.name.toLowerCase().includes(q),
      );
    }

    // Apply Sorting
    return result.sort((a, b) => {
      if (sortBy === 'PRICE_HIGH') return b.price - a.price;
      if (sortBy === 'PRICE_LOW') return a.price - b.price;
      if (sortBy === 'GAIN') return b.changePercent - a.changePercent;
      if (sortBy === 'LOSS') return a.changePercent - b.changePercent;
      if (sortBy === 'VOLUME') return (b.volume || 0) - (a.volume || 0);
      if (sortBy === 'NAME') return a.symbol.localeCompare(b.symbol);

      // Default PINNED
      const aPinned = activeList?.pinnedSymbols.includes(a.symbol) ? 1 : 0;
      const bPinned = activeList?.pinnedSymbols.includes(b.symbol) ? 1 : 0;
      return bPinned - aPinned;
    });
  }, [listAssets, searchQuery, activeList, sortBy]);

  const handleCreateList = () => {
    if (!newListTitle.trim()) {
      toast({ title: 'Error', description: 'List name cannot be empty', variant: 'destructive' });
      return;
    }
    const newId = createList(newListTitle, newListDesc);
    setActiveListId(newId);
    setIsNewListOpen(false);
    setNewListTitle('');
    setNewListDesc('');
    toast({ title: 'Watchlist Created', description: `Created watchlist "${newListTitle}"` });
  };

  const handleOpenNote = (symbol: string) => {
    setActiveNoteSymbol(symbol);
    setNoteInput(getNote(symbol));
  };

  const handleSaveNote = () => {
    if (!activeNoteSymbol) return;
    saveNote(activeNoteSymbol, noteInput);
    setActiveNoteSymbol(null);
    toast({ title: 'Note Saved', description: `Saved personal note for ${activeNoteSymbol}` });
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-28">
      {/* Top Navigation Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/90 backdrop-blur-2xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/80 cursor-pointer"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Star className="w-4 h-4 fill-amber-400" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Advanced Watchlist</span>
        </div>

        <button
          onClick={() => setIsNewListOpen(true)}
          className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <Plus className="w-4 h-4" />
          List
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-y-auto px-4 pt-18 pb-6 space-y-5">
        {/* Navigation Tabs: Custom Lists / Recently Viewed / Most Watched */}
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-card border border-border/80">
          <button
            onClick={() => setActiveTab('WATCHLIST')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'WATCHLIST'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Star className="w-3.5 h-3.5" /> Watchlists
          </button>
          <button
            onClick={() => setActiveTab('RECENT')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'RECENT'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> Recent ({recentlyViewed.length})
          </button>
          <button
            onClick={() => setActiveTab('MOST_WATCHED')}
            className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 ${
              activeTab === 'MOST_WATCHED'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Popular
          </button>
        </div>

        {/* Horizontal Custom Watchlists Tabs (Only when WATCHLIST tab active) */}
        {activeTab === 'WATCHLIST' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {customLists.map((list) => {
              const isActive = list.id === activeListId;
              return (
                <button
                  key={list.id}
                  onClick={() => setActiveListId(list.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-mono font-bold transition-all cursor-pointer whitespace-nowrap border ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary shadow-sm'
                      : 'bg-card/70 border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/30'
                  }`}
                >
                  <span>{list.name}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {list.symbols.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Watchlist Action Bar: Search + Sort Dropdown + Add Stock Button */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search symbols...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-card/80 border border-border/80 focus:border-primary text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none transition-colors"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 px-2.5 rounded-xl bg-card border border-border/80 text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="PINNED">Sort: Pinned</option>
            <option value="PRICE_HIGH">Price: High → Low</option>
            <option value="PRICE_LOW">Price: Low → High</option>
            <option value="GAIN">Top Gainers (%)</option>
            <option value="LOSS">Top Decliners (%)</option>
            <option value="VOLUME">Highest Volume</option>
            <option value="NAME">Name (A-Z)</option>
          </select>

          {activeTab === 'WATCHLIST' && (
            <button
              onClick={() => setIsAddStockOpen(true)}
              className="h-10 px-3 bg-primary text-primary-foreground rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}
        </div>

        {/* Watchlist Stock Cards */}
        {filteredAssets.length === 0 ? (
          <EmptyState
            icon={Star}
            title={searchQuery ? 'No matching assets found' : 'No assets in this view'}
            description={
              searchQuery
                ? 'Try searching for a different symbol or company name.'
                : 'Add assets to your watchlist to track live prices and set price triggers.'
            }
            actionLabel="Add Assets to Watchlist"
            onAction={() => setIsAddStockOpen(true)}
            className="mt-6"
          />
        ) : (
          <div className="space-y-3">
            {filteredAssets.map((asset) => {
              const isPinned = activeList?.pinnedSymbols.includes(asset.symbol);
              const isPositive = asset.changePercent >= 0;
              const hasNote = Boolean(getNote(asset.symbol));
              const hasAlert = alerts.some((a) => a.symbol === asset.symbol && a.active);

              return (
                <motion.div
                  key={asset.symbol}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setLocation(`/markets/${asset.symbol}`)}
                  className={`group relative bg-card/80 backdrop-blur-xl border rounded-2xl p-4 flex flex-col gap-3 cursor-pointer transition-all shadow-sm ${
                    isPinned ? 'border-amber-500/40 bg-amber-500/5' : 'border-border/80 hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* Symbol & Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs border ${
                          isPositive
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {asset.symbol.slice(0, 3)}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-foreground tracking-wide">
                            {asset.symbol}
                          </span>
                          {isPinned && (
                            <span className="p-0.5 rounded bg-amber-500/20 text-amber-400" title="Pinned Stock">
                              <Pin className="w-3 h-3 fill-amber-400" />
                            </span>
                          )}
                          {hasNote && (
                            <span className="p-0.5 rounded bg-primary/20 text-primary" title="Research note saved">
                              <FileText className="w-3 h-3" />
                            </span>
                          )}
                          {hasAlert && (
                            <span className="px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center gap-0.5 border border-amber-500/30">
                              <Bell className="w-2.5 h-2.5 fill-amber-400 animate-pulse" /> Alert Active
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                          {asset.name}
                        </span>
                      </div>
                    </div>

                    {/* Price & Change */}
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="font-mono font-bold text-sm text-foreground">
                        ₹{asset.price.toLocaleString('en-IN')}
                      </span>
                      <span
                        className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium px-2 py-0.5 rounded-md border ${
                          isPositive
                            ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                            : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Actions Toolbar on Card */}
                  <div className="flex items-center justify-between pt-2 border-t border-border/40 text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinStock(activeListId, asset.symbol);
                        }}
                        className={`flex items-center gap-1 hover:text-amber-400 transition-colors cursor-pointer ${
                          isPinned ? 'text-amber-400 font-semibold' : ''
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenNote(asset.symbol);
                        }}
                        className={`flex items-center gap-1 hover:text-primary transition-colors cursor-pointer ${
                          hasNote ? 'text-primary font-semibold' : ''
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>{hasNote ? 'Edit Note' : 'Add Note'}</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/alerts`);
                        }}
                        className="flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        <span>Alert</span>
                      </button>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeStockFromList(activeListId, asset.symbol);
                      }}
                      className="text-muted-foreground hover:text-rose-400 transition-colors p-1 cursor-pointer"
                      title="Remove from watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* New Watchlist Modal */}
      <Dialog open={isNewListOpen} onOpenChange={setIsNewListOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" />
              Create Custom Watchlist
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Group stocks into custom watchlists like "Tech Giants" or "High Dividend".
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">List Name</label>
              <input
                type="text"
                placeholder="e.g. Intraday Momentum"
                value={newListTitle}
                onChange={(e) => setNewListTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Description (Optional)</label>
              <input
                type="text"
                placeholder="Short description of this list"
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsNewListOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateList}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md"
              >
                Create List
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Stock Note Modal */}
      <Dialog open={activeNoteSymbol !== null} onOpenChange={(open) => !open && setActiveNoteSymbol(null)}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Research Note: {activeNoteSymbol}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add personal trading thesis, stop loss levels, or price targets.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <textarea
              rows={4}
              placeholder="e.g. Strong support at ₹2,400. Breakout expected above ₹2,650."
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none resize-none"
            />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActiveNoteSymbol(null)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md"
              >
                Save Note
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Stock to Watchlist Modal */}
      <Dialog open={isAddStockOpen} onOpenChange={setIsAddStockOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-6 max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="w-4 h-4 text-primary" />
              Add Assets to {activeList?.name}
            </DialogTitle>
          </DialogHeader>

          <div className="relative my-2">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search stocks, commodities, crypto..."
              value={stockSearchQuery}
              onChange={(e) => setStockSearchQuery(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 my-2">
            {assets
              ?.filter((a) => {
                if (activeList?.symbols.includes(a.symbol)) return false;
                if (!stockSearchQuery) return true;
                return (
                  a.symbol.toLowerCase().includes(stockSearchQuery.toLowerCase()) ||
                  a.name.toLowerCase().includes(stockSearchQuery.toLowerCase())
                );
              })
              .slice(0, 15)
              .map((asset) => (
                <div
                  key={asset.symbol}
                  className="flex items-center justify-between p-3 rounded-xl bg-background/60 border border-border/60 hover:border-primary/40 transition-colors"
                >
                  <div>
                    <p className="font-mono text-xs font-bold text-foreground">{asset.symbol}</p>
                    <p className="text-[11px] text-muted-foreground truncate max-w-[180px]">{asset.name}</p>
                  </div>

                  <button
                    onClick={() => {
                      addStockToList(activeListId, asset.symbol);
                      toast({ title: 'Stock Added', description: `${asset.symbol} added to ${activeList?.name}` });
                    }}
                    className="px-3 py-1 bg-primary text-primary-foreground font-mono text-xs font-semibold rounded-lg hover:brightness-110 cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              ))}
          </div>
        </DialogContent>
      </Dialog>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
