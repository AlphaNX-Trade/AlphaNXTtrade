import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ListFilter,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Zap,
  Loader2,
  AlertCircle,
  Search,
} from 'lucide-react';
import {
  fetchAllOrders,
  adminUpdateOrderStatus,
  AdminOrderRecord,
  OrderStatus,
} from '@/lib/orderAdminService';
import { useAuth } from '@/contexts/AuthContext';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminOrderManager() {
  const { user: currentAdmin } = useAuth();

  const [orders, setOrders] = useState<AdminOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const list = await fetchAllOrders();
      setOrders(list);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const reason = prompt(`Reason for changing order #${orderId} to ${newStatus}:`);
    if (!reason) return;

    setBusyId(orderId);
    setFeedback(null);
    try {
      await adminUpdateOrderStatus(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        orderId,
        newStatus,
        reason,
      );
      setFeedback({ type: 'success', msg: `Order #${orderId} updated to ${newStatus}.` });
      loadOrders();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to update order.',
      });
    } finally {
      setBusyId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      !search ||
      o.symbol.toLowerCase().includes(search.toLowerCase()) ||
      (o.userEmail && o.userEmail.toLowerCase().includes(search.toLowerCase())) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Order Management Console</h3>
          <p className="text-xs text-slate-400">
            Monitor, execute, cancel, or reject trader orders in real-time.
          </p>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 overflow-x-auto">
          {['ALL', 'PENDING', 'EXECUTED', 'CANCELLED', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-mono text-[11px] uppercase font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
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
          placeholder="Search order ID, symbol, or user email..."
          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary"
        />
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex justify-center py-12 text-primary">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-sm">
          No orders found matching the criteria.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/80">
          <table className="w-full text-left font-mono text-xs border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] uppercase text-slate-400 bg-slate-900/80">
                <th className="py-2.5 px-3">Order ID</th>
                <th className="py-2.5 px-3">User</th>
                <th className="py-2.5 px-3">Symbol</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3 text-right">Qty</th>
                <th className="py-2.5 px-3 text-right">Price</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 font-bold text-slate-200">#{o.id}</td>
                  <td className="py-2.5 px-3 text-slate-400">{o.userEmail || o.uid}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-white">{o.symbol}</span>
                    <span className="text-[9px] text-slate-500 ml-1">({o.segment})</span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        o.side === 'BUY'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-red-950 text-red-400 border border-red-800'
                      }`}
                    >
                      {o.side}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-300">{o.quantity}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-white">{fmt(o.price)}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        o.status === 'EXECUTED'
                          ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800'
                          : o.status === 'PENDING'
                          ? 'text-amber-400 bg-amber-950/60 border border-amber-800'
                          : 'text-red-400 bg-red-950/60 border border-red-800'
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.status === 'PENDING' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(o.id, 'EXECUTED')}
                            disabled={busyId === o.id}
                            className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/40 text-[10px] uppercase font-bold border border-emerald-500/40 cursor-pointer"
                            title="Force Execute Order"
                          >
                            Execute
                          </button>
                          <button
                            onClick={() => handleStatusChange(o.id, 'CANCELLED')}
                            disabled={busyId === o.id}
                            className="px-2 py-1 rounded bg-amber-500/20 text-amber-400 hover:bg-amber-500/40 text-[10px] uppercase font-bold border border-amber-500/40 cursor-pointer"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleStatusChange(o.id, 'REJECTED')}
                            disabled={busyId === o.id}
                            className="px-2 py-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40 text-[10px] uppercase font-bold border border-red-500/40 cursor-pointer"
                            title="Reject Order"
                          >
                            Reject
                          </button>
                        </>
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
