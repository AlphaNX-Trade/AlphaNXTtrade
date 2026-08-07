import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShieldAlert,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import {
  generateReportData,
  downloadCsvReport,
  printPdfReport,
  ReportType,
  ReportSummaryData,
} from '@/lib/reportsAdminService';
import type { AdminUserRow } from '@/lib/adminService';

interface AdminReportsManagerProps {
  users: AdminUserRow[];
}

export function AdminReportsManager({ users }: AdminReportsManagerProps) {
  const [selectedReport, setSelectedReport] = useState<ReportType>('USER_REPORT');
  const [generatedData, setGeneratedData] = useState<ReportSummaryData>(() =>
    generateReportData('USER_REPORT', users),
  );

  const reportTypes: { id: ReportType; title: string; desc: string; icon: any }[] = [
    { id: 'USER_REPORT', title: 'User Registrations & Accounts', desc: 'Complete trader directory, balances, and P/L status.', icon: Users },
    { id: 'WALLET_REPORT', title: 'Wallet Balances & Adjustments', desc: 'Audit log of manual credits, debits, and bonus additions.', icon: Wallet },
    { id: 'TRADING_REPORT', title: 'Trading Orders & Activity', desc: 'All executed paper trades across equities, futures & options.', icon: TrendingUp },
    { id: 'DEPOSIT_REPORT', title: 'Deposits Summary', desc: 'Virtual deposit requests and payment logs.', icon: ArrowUpRight },
    { id: 'WITHDRAWAL_REPORT', title: 'Withdrawals Summary', desc: 'Virtual withdrawal requests and processing logs.', icon: ArrowDownRight },
    { id: 'REVENUE_REPORT', title: 'Simulated Platform Revenue', desc: 'Brokerage analytics and system turnover metrics.', icon: DollarSign },
    { id: 'PROFIT_LOSS_REPORT', title: 'Trader Profit/Loss Leaderboard', desc: 'Ranked list of top performers and loss metrics.', icon: TrendingUp },
    { id: 'ADMIN_ACTIVITY_REPORT', title: 'Admin Audit & Security Log', desc: 'Immutable log of administrative actions.', icon: ShieldAlert },
  ];

  const handleSelect = (type: ReportType) => {
    setSelectedReport(type);
    setGeneratedData(generateReportData(type, users));
  };

  const handleExportCsv = () => {
    downloadCsvReport(generatedData, `AlphaNXT_${selectedReport}_${Date.now()}`);
  };

  const handleExportExcel = () => {
    // Excel-compatible CSV export
    downloadCsvReport(generatedData, `AlphaNXT_${selectedReport}_Excel_${Date.now()}`);
  };

  const handleExportPdf = () => {
    printPdfReport(generatedData);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {reportTypes.map((rep) => {
          const Icon = rep.icon;
          const isSelected = selectedReport === rep.id;
          return (
            <button
              key={rep.id}
              onClick={() => handleSelect(rep.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer space-y-1.5 ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-400' : 'text-slate-400'}`} />
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <p className="font-bold text-xs text-white">{rep.title}</p>
              <p className="text-[10px] text-slate-400 leading-normal">{rep.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Generated Report View */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
          <div>
            <span className="font-mono text-[9px] uppercase tracking-wider text-cyan-400">
              Report Generator Engine
            </span>
            <h3 className="text-base font-bold text-white">{generatedData.title}</h3>
            <p className="text-xs text-slate-400 font-mono">
              Generated: {generatedData.generatedAt} • Total Records: {generatedData.totalRecords}
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={handleExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>CSV</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Excel</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-3 py-2 rounded-xl bg-cyan-500 text-black font-bold uppercase hover:bg-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/60 text-slate-400 text-[10px] uppercase">
                {generatedData.headers.map((h, i) => (
                  <th key={i} className="p-3 font-bold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {generatedData.rows.length === 0 ? (
                <tr>
                  <td colSpan={generatedData.headers.length} className="p-8 text-center text-slate-500">
                    No matching record entries found for this report.
                  </td>
                </tr>
              ) : (
                generatedData.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/40">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-3 text-slate-200">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
