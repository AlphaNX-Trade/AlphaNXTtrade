import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  PlusCircle,
  Trash2,
  Edit3,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from 'lucide-react';
import type { AdminUserRow } from '@/lib/adminService';
import {
  adminGetUserHoldings,
  adminAddOrEditHolding,
  adminRemoveHolding,
  adminForceBuy,
  adminForceSell,
  AdminHoldingRow,
} from '@/lib/portfolioAdminService';
import { adminAdjustProfitLoss } from '@/lib/adminService';
import { useAuth } from '@/contexts/AuthContext';

interface AdminPortfolioManagerProps {
  user: AdminUserRow;
  onUpdated: () => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminPortfolioManager({ user, onUpdated }: AdminPortfolioManagerProps) {
  const { user: currentAdmin } = useAuth();

  const [holdings, setHoldings] = useState<AdminHoldingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgPrice, setAvgPrice] = useState('');
  const [type, setType] = useState<'EQUITY' | 'FUTURES' | 'OPTIONS' | 'COMMODITY'>('EQUITY');

  const [plAmount, setPlAmount] = useState('');

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadHoldings = async () => {
    setLoading(true);
    try {
      const list = await adminGetUserHoldings(user.uid);
      setHoldings(list);
    } catch (err) {
      console.error('Failed to load user holdings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHoldings();
  }, [user.uid]);

  const handleSaveHolding = async () => {
    if (!symbol.trim() || !quantity || !avgPrice) {
      setFeedback({ type: 'error', msg: 'Please provide symbol, quantity, and average buy price.' });
      return;
    }

    setBusy(true);
    setFeedback(null);
    try {
      await adminAddOrEditHolding(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        symbol.trim().toUpperCase(),
        companyName.trim() || symbol.trim().toUpperCase(),
        parseFloat(quantity),
        parseFloat(avgPrice),
        type,
        'Admin added/modified portfolio holding',
      );

      setFeedback({ type: 'success', msg: `Holding ${symbol.toUpperCase()} saved & audit logged.` });
      setSymbol('');
      setCompanyName('');
      setQuantity('');
      setAvgPrice('');
      onUpdated();
      loadHoldings();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to save holding.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleRemoveHolding = async (sym: string) => {
    if (!confirm(`Remove holding ${sym} from ${user.fullName}'s portfolio?`)) return;

    setBusy(true);
    try {
      await adminRemoveHolding(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        sym,
        'Admin removed holding',
      );
      setFeedback({ type: 'success', msg: `Holding ${sym} removed.` });
      onUpdated();
      loadHoldings();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to remove holding.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleAdjustPL = async () => {
    const amt = parseFloat(plAmount);
    if (isNaN(amt) || amt === 0) {
      setFeedback({ type: 'error', msg: 'Enter a valid non-zero P/L adjustment amount.' });
      return;
    }

    setBusy(true);
    try {
      await adminAdjustProfitLoss(user.uid, amt);
      setFeedback({
        type: 'success',
        msg: `Adjusted user P/L by ${amt >= 0 ? '+' : ''}${fmt(amt)}.`,
      });
      setPlAmount('');
      onUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to adjust P/L.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      {feedback && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
              : 'bg-red-950/60 border-red-800 text-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Add / Modify Holding Form */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-primary" />
          <span>Add or Edit Portfolio Holding</span>
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. RELIANCE"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary uppercase"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Segment</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="EQUITY">Equity Stock</option>
              <option value="FUTURES">Futures</option>
              <option value="OPTIONS">Options</option>
              <option value="COMMODITY">Commodity</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Qty"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Avg Buy Price (₹)</label>
            <input
              type="number"
              value={avgPrice}
              onChange={(e) => setAvgPrice(e.target.value)}
              placeholder="Avg Price"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSaveHolding}
          disabled={busy || !symbol || !quantity || !avgPrice}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-40 cursor-pointer"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          <span>Save Holding Record</span>
        </button>
      </div>

      {/* Direct P/L Adjustment */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>Manual Realized Profit / Loss Adjustment</span>
        </h4>

        <div className="flex gap-2">
          <input
            type="number"
            value={plAmount}
            onChange={(e) => setPlAmount(e.target.value)}
            placeholder="Amount (± ₹)"
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-primary"
          />
          <button
            onClick={handleAdjustPL}
            disabled={busy || !plAmount}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs uppercase font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            Adjust P/L
          </button>
        </div>
      </div>

      {/* User's Holdings List */}
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-primary" />
          <span>Active Holdings ({holdings.length})</span>
        </h4>

        {loading ? (
          <div className="flex justify-center py-6 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : holdings.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono text-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
            User has no active stock or contract holdings.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {holdings.map((h) => (
              <div
                key={h.symbol}
                className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl flex items-center justify-between font-mono text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{h.symbol}</span>
                    <span className="bg-primary/20 text-primary text-[9px] px-1.5 rounded uppercase">
                      {h.type}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {h.quantity} Qty • Avg {fmt(h.avgBuyPrice)}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    Total Invested: {fmt(h.totalInvested)}
                  </div>
                </div>

                <button
                  onClick={() => handleRemoveHolding(h.symbol)}
                  className="p-2 rounded-lg bg-red-950/40 text-red-400 hover:bg-red-950/80 hover:text-red-300 transition-colors cursor-pointer"
                  title="Remove Holding"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
