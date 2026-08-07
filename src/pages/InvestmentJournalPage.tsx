import { useState, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  BookOpen,
  Plus,
  Search,
  Trash2,
  Edit2,
  Lock,
  Target,
  ShieldCheck,
  TrendingUp,
  Tag,
  X,
  Sparkles,
} from 'lucide-react';
import { useInvestmentJournal, JournalEntry } from '@/hooks/useInvestmentJournal';
import { useAllAssets } from '@/hooks/useAllAssets';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';

export default function InvestmentJournalPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { entries, addEntry, updateEntry, deleteEntry } = useInvestmentJournal();
  const assets = useAllAssets();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('ALL');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formSymbol, setFormSymbol] = useState('RELIANCE');
  const [formTradeType, setFormTradeType] = useState<'BUY' | 'SELL' | 'WATCH'>('BUY');
  const [formStrategy, setFormStrategy] = useState<JournalEntry['strategy']>('Long Term Growth');
  const [formWhyBought, setFormWhyBought] = useState('');
  const [formTargetPrice, setFormTargetPrice] = useState<number>(3000);
  const [formStopLoss, setFormStopLoss] = useState<number>(2500);
  const [formObservations, setFormObservations] = useState('');

  const strategiesList = [
    'Long Term Growth',
    'SIP',
    'Swing Trade',
    'Value Investing',
    'Breakout',
    'Dividend Yield',
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormSymbol('RELIANCE');
    setFormTradeType('BUY');
    setFormStrategy('Long Term Growth');
    setFormWhyBought('');
    setFormTargetPrice(3000);
    setFormStopLoss(2500);
    setFormObservations('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (e: JournalEntry) => {
    setEditingId(e.id);
    setFormSymbol(e.symbol);
    setFormTradeType(e.tradeType);
    setFormStrategy(e.strategy);
    setFormWhyBought(e.whyBought);
    setFormTargetPrice(e.targetPrice);
    setFormStopLoss(e.stopLoss || 0);
    setFormObservations(e.observations);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formWhyBought.trim()) {
      toast({ title: 'Input required', description: 'Please fill in why you made this trade.', variant: 'destructive' });
      return;
    }

    const matchedAsset = assets.find((a) => a.symbol === formSymbol);
    const assetName = matchedAsset?.name || formSymbol;

    if (editingId) {
      updateEntry(editingId, {
        symbol: formSymbol,
        assetName,
        tradeType: formTradeType,
        strategy: formStrategy,
        whyBought: formWhyBought,
        targetPrice: Number(formTargetPrice),
        stopLoss: Number(formStopLoss),
        observations: formObservations,
      });
      toast({ title: 'Journal Updated', description: `Saved changes to ${formSymbol} thesis.` });
    } else {
      addEntry({
        symbol: formSymbol,
        assetName,
        tradeType: formTradeType,
        strategy: formStrategy,
        whyBought: formWhyBought,
        targetPrice: Number(formTargetPrice),
        stopLoss: Number(formStopLoss),
        observations: formObservations,
      });
      toast({ title: 'Journal Entry Created', description: `Logged investment thesis for ${formSymbol}.` });
    }

    setIsModalOpen(false);
  };

  const filteredEntries = entries.filter((e) => {
    const matchesSearch =
      e.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.whyBought.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.observations.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStrategy = selectedStrategy === 'ALL' || e.strategy === selectedStrategy;
    return matchesSearch && matchesStrategy;
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/dashboard')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          Private Investment Journal
        </h1>
        <button
          onClick={handleOpenAdd}
          className="p-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Log Entry
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Privacy Info Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-800/50 text-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-emerald-300">100% Private Investment Log</h3>
              <p className="text-xs text-slate-300">
                Your investment theses, target levels, and strategies are confidential and synchronized with your user account.
              </p>
            </div>
          </div>
        </div>

        {/* Search & Strategy Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by stock, thesis keywords, or strategy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-9 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedStrategy('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedStrategy === 'ALL'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
              }`}
            >
              All Strategies
            </button>
            {strategiesList.map((s) => (
              <button
                key={s}
                onClick={() => setSelectedStrategy(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedStrategy === s
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-white dark:bg-slate-900 text-slate-500 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Journal Entries List */}
        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <h3 className="font-bold text-sm text-slate-700 dark:text-slate-300">No Journal Entries Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Start documenting your trading strategy, entry price targets, and rationale to sharpen your investing discipline.
            </p>
            <button
              onClick={handleOpenAdd}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              + Create First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-xl text-xs font-black uppercase ${
                        item.tradeType === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : item.tradeType === 'SELL'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {item.tradeType}
                    </span>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white">{item.symbol}</h3>
                      <p className="text-[11px] text-slate-400">{item.assetName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-emerald-500" /> {item.strategy}
                    </span>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        deleteEntry(item.id);
                        toast({ title: 'Entry Removed', description: 'Deleted journal entry.' });
                      }}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Rationale & Observations */}
                <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Investment Rationale (Why I Bought)
                    </span>
                    <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                      {item.whyBought}
                    </p>
                  </div>

                  {item.observations && (
                    <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                        Personal Observations & Risk Notes
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {item.observations}
                      </p>
                    </div>
                  )}
                </div>

                {/* Targets Footer */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">
                      Target: <strong className="text-emerald-500 font-extrabold">{formatCurrency(item.targetPrice)}</strong>
                    </span>
                    {item.stopLoss ? (
                      <span className="text-slate-500">
                        Stop Loss: <strong className="text-rose-500 font-extrabold">{formatCurrency(item.stopLoss)}</strong>
                      </span>
                    ) : null}
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Logged: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-500" />
                {editingId ? 'Edit Investment Note' : 'Log Investment Rationale'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Asset Symbol</label>
                  <select
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    {assets.map((a) => (
                      <option key={a.symbol} value={a.symbol}>
                        {a.symbol} - {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Action Type</label>
                  <select
                    value={formTradeType}
                    onChange={(e) => setFormTradeType(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  >
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                    <option value="WATCH">WATCHLIST</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Investment Strategy</label>
                <select
                  value={formStrategy}
                  onChange={(e) => setFormStrategy(e.target.value as any)}
                  className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                >
                  {strategiesList.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Why I Bought / Rationale</label>
                <textarea
                  rows={3}
                  value={formWhyBought}
                  onChange={(e) => setFormWhyBought(e.target.value)}
                  placeholder="e.g. Strong revenue growth, EV market expansion, oversold RSI indicator..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Future Target Price (₹)</label>
                  <input
                    type="number"
                    value={formTargetPrice}
                    onChange={(e) => setFormTargetPrice(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Stop Loss (₹)</label>
                  <input
                    type="number"
                    value={formStopLoss}
                    onChange={(e) => setFormStopLoss(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Personal Observations</label>
                <textarea
                  rows={2}
                  value={formObservations}
                  onChange={(e) => setFormObservations(e.target.value)}
                  placeholder="Additional risk notes, earnings dates, macro factors..."
                  className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Save Entry
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
