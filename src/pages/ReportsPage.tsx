import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  PieChart,
  History,
  TrendingUp,
  Coins,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useHoldings } from '@/hooks/useHoldings';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { formatCurrency } from '@/lib/formatters';
import { exportToCSV, exportToExcel, printOrExportPDF } from '@/lib/exportReports';
import { useToast } from '@/hooks/use-toast';

export default function ReportsPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { holdings, totalInvested, totalCurrentValue, totalUnrealizedPL } = useHoldings();
  const { transactions } = useTransactionHistory();

  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'Excel' | 'CSV'>('PDF');

  // Handle Export Portfolio Summary Report
  const handleExportPortfolio = () => {
    const headers = ['Symbol', 'Company Name', 'Quantity', 'Avg Buy Price (₹)', 'Current Price (₹)', 'Total Invested (₹)', 'Current Value (₹)', 'Unrealized P&L (₹)', 'Return (%)'];
    const rows = holdings.map((h) => [
      h.symbol,
      h.companyName || h.symbol,
      h.quantity,
      h.avgBuyPrice.toFixed(2),
      h.currentPrice.toFixed(2),
      h.totalInvested.toFixed(2),
      h.currentValue.toFixed(2),
      h.unrealizedPL.toFixed(2),
      `${h.unrealizedPLPercent >= 0 ? '+' : ''}${h.unrealizedPLPercent.toFixed(2)}%`,
    ]);

    const title = 'Portfolio Summary';
    if (selectedFormat === 'CSV') {
      exportToCSV('AlphaNXT_Portfolio_Summary', headers, rows);
    } else if (selectedFormat === 'Excel') {
      exportToExcel('AlphaNXT_Portfolio_Summary', title, headers, rows);
    } else {
      printOrExportPDF(
        title,
        [
          { label: 'Total Invested', value: formatCurrency(totalInvested) },
          { label: 'Current Valuation', value: formatCurrency(totalCurrentValue) },
          { label: 'Unrealized P&L', value: `${totalUnrealizedPL >= 0 ? '+' : ''}${formatCurrency(totalUnrealizedPL)}` },
        ],
        headers,
        rows
      );
    }

    toast({ title: 'Report Downloaded', description: `Exported Portfolio Summary in ${selectedFormat} format.` });
  };

  // Handle Export Transaction History Report
  const handleExportTransactions = () => {
    const headers = ['Date & Time', 'Symbol', 'Company Name', 'Side', 'Quantity', 'Price (₹)', 'Total Amount (₹)'];
    const rows = transactions.map((t) => {
      const dateStr = t.timestamp && typeof (t.timestamp as any).toDate === 'function'
        ? (t.timestamp as any).toDate().toLocaleString()
        : new Date(t.timestamp as any).toLocaleString();
      return [
        dateStr,
        t.symbol,
        t.companyName || t.symbol,
        t.side,
        t.quantity,
        t.price.toFixed(2),
        (t.price * t.quantity).toFixed(2),
      ];
    });

    const title = 'Transaction History Report';
    if (selectedFormat === 'CSV') {
      exportToCSV('AlphaNXT_Transaction_History', headers, rows);
    } else if (selectedFormat === 'Excel') {
      exportToExcel('AlphaNXT_Transaction_History', title, headers, rows);
    } else {
      printOrExportPDF(
        title,
        [
          { label: 'Total Executed Orders', value: String(transactions.length) },
          { label: 'Buy Orders', value: String(transactions.filter((t) => t.side === 'BUY').length) },
          { label: 'Sell Orders', value: String(transactions.filter((t) => t.side === 'SELL').length) },
        ],
        headers,
        rows
      );
    }

    toast({ title: 'Report Downloaded', description: `Exported Transaction History in ${selectedFormat} format.` });
  };

  // Handle Export Profit & Loss Summary Report
  const handleExportProfitLoss = () => {
    const headers = ['Symbol', 'Asset Class', 'Invested Capital (₹)', 'Current Worth (₹)', 'Net Gain/Loss (₹)', 'P&L %'];
    const rows = holdings.map((h) => [
      h.symbol,
      'EQUITY',
      h.totalInvested.toFixed(2),
      h.currentValue.toFixed(2),
      h.unrealizedPL.toFixed(2),
      `${h.unrealizedPLPercent.toFixed(2)}%`,
    ]);

    const title = 'Profit & Loss Statement';
    if (selectedFormat === 'CSV') {
      exportToCSV('AlphaNXT_Profit_Loss_Summary', headers, rows);
    } else if (selectedFormat === 'Excel') {
      exportToExcel('AlphaNXT_Profit_Loss_Summary', title, headers, rows);
    } else {
      printOrExportPDF(
        title,
        [
          { label: 'Total Capital Invested', value: formatCurrency(totalInvested) },
          { label: 'Net Portfolio Gain', value: `${totalUnrealizedPL >= 0 ? '+' : ''}${formatCurrency(totalUnrealizedPL)}` },
          { label: 'Overall ROI %', value: `${totalInvested > 0 ? ((totalUnrealizedPL / totalInvested) * 100).toFixed(2) : 0}%` },
        ],
        headers,
        rows
      );
    }

    toast({ title: 'Report Downloaded', description: `Exported Profit & Loss Statement in ${selectedFormat} format.` });
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
          <Download className="w-4 h-4 text-emerald-500" />
          Financial Reports Hub
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Export Format Selector */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <h2 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            Choose Preferred Export Format
          </h2>

          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'PDF', label: 'PDF Document', icon: FileText, desc: 'Printable formatted report' },
              { id: 'Excel', label: 'Excel (.xls)', icon: FileSpreadsheet, desc: 'Structured XML worksheet' },
              { id: 'CSV', label: 'CSV Spreadsheet', icon: Download, desc: 'Raw tabular data' },
            ].map((f) => {
              const Icon = f.icon;
              const isSelected = selectedFormat === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setSelectedFormat(f.id as any)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-xs text-slate-900 dark:text-white">{f.label}</h3>
                    <p className="text-[10px] text-slate-400 mt-0.5">{f.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Report 1: Portfolio Summary */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                <PieChart className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Portfolio Holdings Summary</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Includes all active stock holdings, unit balances, purchase averages, live valuation, and return percentages.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{holdings.length} Assets Tracked</span>
              <button
                onClick={handleExportPortfolio}
                className="px-4 py-2 rounded-xl bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-sky-500/20 hover:brightness-110"
              >
                <Download className="w-3.5 h-3.5" /> Export Portfolio
              </button>
            </div>
          </div>

          {/* Report 2: Transaction History */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Full Transaction Audit Log</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Complete chronological log of buy/sell orders, order prices, timestamps, and order values.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">{transactions.length} Transactions</span>
              <button
                onClick={handleExportTransactions}
                className="px-4 py-2 rounded-xl bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 hover:brightness-110"
              >
                <Download className="w-3.5 h-3.5" /> Export Transactions
              </button>
            </div>
          </div>

          {/* Report 3: Profit & Loss Statement */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between md:col-span-2">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Profit & Loss (P&L) Statement</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Detailed unrealized capital gains and losses breakdown for tax preparation and annual financial review.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Net P&L: <strong className="text-emerald-500">{formatCurrency(totalUnrealizedPL)}</strong></span>
              <button
                onClick={handleExportProfitLoss}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:brightness-110"
              >
                <Download className="w-3.5 h-3.5" /> Export P&L Statement
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
