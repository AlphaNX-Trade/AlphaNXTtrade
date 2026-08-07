import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  FileText,
  Download,
  Filter,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { formatCurrency } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';

export default function TransactionCenterPage() {
  const [, setLocation] = useLocation();
  const { transactions, historyLoading: loading } = useTransactionHistory();

  const [activeType, setActiveType] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = transactions.filter((tx) => {
    const txType = tx.side || 'BUY';
    const matchesType = activeType === 'ALL' || txType === activeType;
    const matchesSearch =
      (tx.symbol || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const totalBuyVolume = transactions
    .filter((t) => t.side === 'BUY')
    .reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  const totalSellVolume = transactions
    .filter((t) => t.side === 'SELL')
    .reduce((acc, t) => acc + (t.totalAmount || 0), 0);

  const exportToCSV = () => {
    triggerHaptic('medium');
    const headers = ['Transaction ID', 'Symbol', 'Side', 'Quantity', 'Price (INR)', 'Total Amount (INR)', 'Timestamp'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.symbol,
      tx.side || 'BUY',
      tx.quantity,
      tx.price,
      tx.totalAmount,
      tx.timestamp ? tx.timestamp.toDate().toISOString() : 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AlphaNXT_Transaction_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/portfolio')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-teal-500" />
          Transaction Ledger & History
        </h1>
        <button
          onClick={exportToCSV}
          className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs flex items-center gap-1 border border-teal-500/20 hover:bg-teal-500/20 transition-all"
        >
          <Download className="w-3.5 h-3.5" /> CSV Export
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Ledger Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Total Transactions Recorded</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white mt-1 block">
              {transactions.length} Records
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Total Buy Inflow</span>
            <span className="text-2xl font-black text-emerald-500 mt-1 block">
              {formatCurrency(totalBuyVolume)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium block">Total Sell Outflow</span>
            <span className="text-2xl font-black text-rose-500 mt-1 block">
              {formatCurrency(totalSellVolume)}
            </span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All Operations' },
              { id: 'BUY', label: 'Buy Trades' },
              { id: 'SELL', label: 'Sell Trades' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  triggerHaptic('light');
                  setActiveType(tab.id as any);
                }}
                className={`px-3.5 py-2 rounded-xl whitespace-nowrap transition-all border ${
                  activeType === tab.id
                    ? 'bg-teal-500 text-white border-teal-500 font-bold shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search symbol or company..."
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>

        {/* Transactions Table / List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <FileText className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300">No transaction logs found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Execute buy/sell trades or deposit funds to populate your live transaction ledger.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTransactions.map((tx) => {
              const isBuy = tx.side === 'BUY';
              const formattedDate = tx.timestamp ? tx.timestamp.toDate().toLocaleString('en-IN') : 'Just now';

              return (
                <div
                  key={tx.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:border-teal-500/40 transition-all shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                      isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {isBuy ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {tx.symbol}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isBuy ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {tx.side || 'BUY'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 font-medium">
                        Qty: {tx.quantity} @ {formatCurrency(tx.price)} • {formattedDate}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-black text-sm ${isBuy ? 'text-slate-900 dark:text-white' : 'text-emerald-500'}`}>
                      {formatCurrency(tx.totalAmount)}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-500 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Executed
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
