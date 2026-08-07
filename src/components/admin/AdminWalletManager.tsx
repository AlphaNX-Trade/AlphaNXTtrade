import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet,
  Zap,
  MinusCircle,
  Lock,
  Unlock,
  ShieldAlert,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
  Award,
  AlertTriangle,
} from 'lucide-react';
import type { AdminUserRow } from '@/lib/adminService';
import {
  adminAdjustWallet,
  adminFreezeWallet,
  adminLockWalletTransactions,
  fetchUserWalletHistory,
  WalletTransactionRecord,
} from '@/lib/walletAdminService';
import { useAuth } from '@/contexts/AuthContext';

interface AdminWalletManagerProps {
  user: AdminUserRow;
  onUpdated: () => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminWalletManager({ user, onUpdated }: AdminWalletManagerProps) {
  const { user: currentAdmin } = useAuth();
  const [actionType, setActionType] = useState<
    'CREDIT' | 'DEBIT' | 'BONUS' | 'PENALTY' | 'MANUAL_EDIT'
  >('CREDIT');
  const [amountInput, setAmountInput] = useState('');
  const [reasonInput, setReasonInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [history, setHistory] = useState<WalletTransactionRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [isFrozen, setIsFrozen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const records = await fetchUserWalletHistory(user.uid);
      setHistory(records);
    } catch (err) {
      console.error('Failed to load wallet history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [user.uid]);

  const handleWalletSubmit = async () => {
    const amount = parseFloat(amountInput);
    if (isNaN(amount) || amount <= 0) {
      setFeedback({ type: 'error', msg: 'Please enter a valid positive amount.' });
      return;
    }
    if (!reasonInput.trim()) {
      setFeedback({ type: 'error', msg: 'A reason or note is required for audit logs.' });
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      let delta = amount;
      if (actionType === 'DEBIT' || actionType === 'PENALTY') {
        delta = -amount;
      } else if (actionType === 'MANUAL_EDIT') {
        delta = amount - user.virtualBalance;
      }

      await adminAdjustWallet(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        delta,
        actionType,
        reasonInput,
      );

      setFeedback({
        type: 'success',
        msg: `Successfully applied ${actionType} to ${user.fullName}'s wallet. Audit log created.`,
      });
      setAmountInput('');
      setReasonInput('');
      onUpdated();
      loadHistory();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to adjust wallet balance.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFreeze = async () => {
    const nextState = !isFrozen;
    const reason = prompt(`Enter reason for ${nextState ? 'freezing' : 'unfreezing'} wallet:`);
    if (!reason) return;

    setBusy(true);
    try {
      await adminFreezeWallet(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        nextState,
        reason,
      );
      setIsFrozen(nextState);
      setFeedback({
        type: 'success',
        msg: `Wallet ${nextState ? 'frozen' : 'unfrozen'}. Logged in audit trial.`,
      });
      onUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to toggle wallet freeze state.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLock = async () => {
    const nextState = !isLocked;
    const reason = prompt(`Enter reason for ${nextState ? 'locking' : 'unlocking'} wallet transactions:`);
    if (!reason) return;

    setBusy(true);
    try {
      await adminLockWalletTransactions(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        nextState,
        reason,
      );
      setIsLocked(nextState);
      setFeedback({
        type: 'success',
        msg: `Wallet transactions ${nextState ? 'locked' : 'unlocked'}.`,
      });
      onUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to toggle lock.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      {/* Overview Balance Banner */}
      <div className="bg-slate-900/90 border border-primary/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-primary/80 block">
            Current Available Balance
          </span>
          <span className="font-mono text-2xl font-bold text-white">{fmt(user.virtualBalance)}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleToggleFreeze}
            disabled={busy}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFrozen
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>{isFrozen ? 'Wallet Frozen' : 'Freeze Wallet'}</span>
          </button>

          <button
            onClick={handleToggleLock}
            disabled={busy}
            className={`px-3 py-1.5 rounded-xl font-mono text-xs uppercase font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLocked
                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
          >
            {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
            <span>{isLocked ? 'Tx Locked' : 'Lock Transactions'}</span>
          </button>
        </div>
      </div>

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

      {/* Adjustment Form */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Wallet className="w-4 h-4 text-primary" />
          <span>Wallet Balance Adjustment</span>
        </h4>

        {/* Action Type Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'CREDIT', label: 'Add Money' },
            { id: 'DEBIT', label: 'Deduct Money' },
            { id: 'BONUS', label: 'Credit Bonus' },
            { id: 'PENALTY', label: 'Debit Penalty' },
            { id: 'MANUAL_EDIT', label: 'Edit Balance' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActionType(t.id as any)}
              className={`py-1.5 px-2 rounded-lg font-mono text-[11px] uppercase font-bold transition-all cursor-pointer text-center ${
                actionType === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase text-slate-400">
              {actionType === 'MANUAL_EDIT' ? 'New Total Balance (₹)' : 'Amount (₹)'}
            </label>
            <input
              type="number"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="e.g. 25000"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase text-slate-400">
              Reason / Note (Required for Audit)
            </label>
            <input
              type="text"
              value={reasonInput}
              onChange={(e) => setReasonInput(e.target.value)}
              placeholder="e.g. Promotional Bonus, Verified Bank Deposit"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={handleWalletSubmit}
          disabled={busy || !amountInput || !reasonInput}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-40 cursor-pointer"
        >
          {busy ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>Execute {actionType} & Create Audit Record</span>
        </button>
      </div>

      {/* Wallet Transaction History Table */}
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-primary" />
          <span>Wallet Adjustment & Audit History</span>
        </h4>

        {loadingHistory ? (
          <div className="flex justify-center py-6 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono text-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
            No previous wallet adjustment logs found for this account.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/80">
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-right">Amount</th>
                  <th className="py-2 px-3 text-right">New Balance</th>
                  <th className="py-2 px-3">Reason</th>
                  <th className="py-2 px-3">Admin</th>
                  <th className="py-2 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((h, i) => (
                  <tr key={i} className="hover:bg-slate-900/50">
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.type === 'CREDIT' || h.type === 'BONUS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {h.type}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-white">
                      ₹{h.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-300">
                      ₹{h.newBalance.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 text-slate-300 max-w-[160px] truncate">{h.reason}</td>
                    <td className="py-2 px-3 text-slate-400">{h.adminEmail}</td>
                    <td className="py-2 px-3 text-slate-500 text-[10px]">
                      {new Date(h.timestamp).toLocaleString('en-IN', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
