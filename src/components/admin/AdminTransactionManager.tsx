import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Download,
  Loader2,
  AlertCircle,
  Search,
  DollarSign,
} from 'lucide-react';
import {
  fetchAllTransactions,
  adminApproveDeposit,
  adminRejectDeposit,
  adminApproveWithdrawal,
  adminRejectWithdrawal,
  adminReverseTransaction,
  TransactionRecord,
} from '@/lib/transactionAdminService';
import { downloadCsvReport } from '@/lib/reportsAdminService';
import { useAuth } from '@/contexts/AuthContext';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminTransactionManager() {
  const { user: currentAdmin } = useAuth();

  const [txs, setTxs] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');
  const [search, setSearch] = useState('');

  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadTxs = async () => {
    setLoading(true);
    try {
      const list = await fetchAllTransactions();
      setTxs(list);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTxs();
  }, []);

  const handleApprove = async (tx: TransactionRecord) => {
    setBusyId(tx.id);
    setFeedback(null);
    try {
      if (tx.type === 'DEPOSIT') {
        await adminApproveDeposit(currentAdmin?.email || 'Admin', currentAdmin?.uid || 'admin', tx.id);
      } else {
        await adminApproveWithdrawal(currentAdmin?.email || 'Admin', currentAdmin?.uid || 'admin', tx.id);
      }
      setFeedback({ type: 'success', msg: `Approved ${tx.type} of ${fmt(tx.amount)} for ${tx.userEmail}.` });
      loadTxs();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Approval failed.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (tx: TransactionRecord) => {
    const reason = prompt(`Reason for rejecting ${tx.type} of ${fmt(tx.amount)}:`);
    if (!reason) return;

    setBusyId(tx.id);
    setFeedback(null);
    try {
      if (tx.type === 'DEPOSIT') {
        await adminRejectDeposit(currentAdmin?.email || 'Admin', currentAdmin?.uid || 'admin', tx.id, reason);
      } else {
        await adminRejectWithdrawal(currentAdmin?.email || 'Admin', currentAdmin?.uid || 'admin', tx.id, reason);
      }
      setFeedback({ type: 'success', msg: `Rejected ${tx.type} of ${fmt(tx.amount)}.` });
      loadTxs();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Rejection failed.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleReverse = async (tx: TransactionRecord) => {
    const reason = prompt(`Reason for REVERSING transaction #${tx.id}:`);
    if (!reason) return;

    setBusyId(tx.id);
    setFeedback(null);
    try {
      await adminReverseTransaction(currentAdmin?.email || 'Admin', currentAdmin?.uid || 'admin', tx.id, reason);
      setFeedback({ type: 'success', msg: `Reversed transaction #${tx.id}. Funds re-adjusted.` });
      loadTxs();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Reversal failed.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleExport = () => {
    downloadCsvReport(
      {
        title: 'Transactions Export',
        generatedAt: new Date().toLocaleString('en-IN'),
        totalRecords: filteredTxs.length,
        headers: ['Tx ID', 'User Email', 'Type', 'Amount (₹)', 'Status', 'Method', 'Ref ID', 'Timestamp'],
        rows: filteredTxs.map((t) => [
          t.id,
          t.userEmail,
          t.type,
          t.amount,
          t.status,
          t.paymentMethod || '—',
          t.referenceId || '—',
          t.timestamp,
        ]),
      },
      `AlphaNXT_Transactions_${Date.now()}`,
    );
  };

  const filteredTxs = txs.filter((t) => {
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesSearch =
      !search ||
      t.userEmail.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      (t.referenceId && t.referenceId.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Deposit & Withdrawal Manager</h3>
          <p className="text-xs text-slate-400">
            Review user deposit/withdrawal requests, process approvals, or perform transaction reversals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Type Filters */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            {['ALL', 'DEPOSIT', 'WITHDRAWAL'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterType(st as any)}
                className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase font-bold transition-all cursor-pointer ${
                  filterType === st
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
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

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Tx ID, user email, or payment reference ID..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
        />
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="flex justify-center py-12 text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredTxs.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No deposit or withdrawal requests found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/80">
                <th className="py-2.5 px-3">Tx ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Reference ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredTxs.map((t) => (
                <tr key={t.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-bold text-slate-200">#{t.id}</td>
                  <td className="py-2.5 px-3 text-slate-300">{t.userEmail}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        t.type === 'DEPOSIT'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">{fmt(t.amount)}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.paymentMethod || '—'}</td>
                  <td className="py-2.5 px-3 text-slate-400">{t.referenceId || '—'}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        t.status === 'APPROVED'
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                          : t.status === 'PENDING'
                          ? 'text-amber-400 bg-amber-950/60 border border-amber-800'
                          : 'text-red-400 bg-red-950/60 border border-red-800'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleApprove(t)}
                            disabled={busyId === t.id}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 text-[10px] uppercase font-bold border border-emerald-500/40 cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(t)}
                            disabled={busyId === t.id}
                            className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 text-[10px] uppercase font-bold border border-red-500/40 cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {t.status === 'APPROVED' && (
                        <button
                          onClick={() => handleReverse(t)}
                          disabled={busyId === t.id}
                          className="px-2 py-1 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-[10px] uppercase font-bold border border-slate-700 flex items-center gap-1 cursor-pointer"
                          title="Reverse Transaction"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reverse</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
