import { AdminUserRow } from '@/lib/adminService';
import { getAuditLogs, AuditLogEntry } from '@/lib/auditLogService';
import { getLocalTransactions, TransactionRecord } from '@/lib/transactionAdminService';
import { getLocalOrders, AdminOrderRecord } from '@/lib/orderAdminService';
import { getLocalWalletTransactions, WalletTransactionRecord } from '@/lib/walletAdminService';

export type ReportType =
  | 'USER_REPORT'
  | 'WALLET_REPORT'
  | 'TRADING_REPORT'
  | 'DEPOSIT_REPORT'
  | 'WITHDRAWAL_REPORT'
  | 'REVENUE_REPORT'
  | 'ADMIN_ACTIVITY_REPORT'
  | 'PROFIT_LOSS_REPORT';

export interface ReportSummaryData {
  title: string;
  generatedAt: string;
  totalRecords: number;
  headers: string[];
  rows: (string | number)[][];
}

export function generateReportData(
  reportType: ReportType,
  users: AdminUserRow[],
): ReportSummaryData {
  const generatedAt = new Date().toLocaleString('en-IN');

  switch (reportType) {
    case 'USER_REPORT': {
      return {
        title: 'User Account & Registration Report',
        generatedAt,
        totalRecords: users.length,
        headers: ['UID', 'Full Name', 'Email', 'Level', 'XP', 'Virtual Balance (₹)', 'Total P/L (₹)', 'Win Rate (%)'],
        rows: users.map((u) => [
          u.uid.slice(0, 8),
          u.fullName,
          u.email,
          u.level,
          u.xp,
          u.virtualBalance,
          u.totalProfitLoss,
          `${u.winRate.toFixed(1)}%`,
        ]),
      };
    }

    case 'WALLET_REPORT': {
      const walletTxs = getLocalWalletTransactions();
      return {
        title: 'Wallet Balances & Adjustments Report',
        generatedAt,
        totalRecords: walletTxs.length,
        headers: ['User ID', 'Type', 'Amount (₹)', 'Prev Balance (₹)', 'New Balance (₹)', 'Reason', 'Admin', 'Timestamp'],
        rows: walletTxs.map((w) => [
          w.uid.slice(0, 8),
          w.type,
          w.amount,
          w.previousBalance,
          w.newBalance,
          w.reason,
          w.adminEmail,
          w.timestamp,
        ]),
      };
    }

    case 'TRADING_REPORT': {
      const orders = getLocalOrders();
      return {
        title: 'Trading Orders & Activity Report',
        generatedAt,
        totalRecords: orders.length,
        headers: ['Order ID', 'User Email', 'Symbol', 'Side', 'Type', 'Qty', 'Price (₹)', 'Status', 'Segment', 'Timestamp'],
        rows: orders.map((o) => [
          o.id,
          o.userEmail || o.uid,
          o.symbol,
          o.side,
          o.orderType,
          o.quantity,
          o.price,
          o.status,
          o.segment || 'EQUITY',
          o.timestamp,
        ]),
      };
    }

    case 'DEPOSIT_REPORT': {
      const txs = getLocalTransactions().filter((t) => t.type === 'DEPOSIT');
      return {
        title: 'Deposits Summary Report',
        generatedAt,
        totalRecords: txs.length,
        headers: ['Tx ID', 'User Email', 'Amount (₹)', 'Status', 'Payment Method', 'Reference ID', 'Timestamp'],
        rows: txs.map((t) => [
          t.id,
          t.userEmail,
          t.amount,
          t.status,
          t.paymentMethod || '—',
          t.referenceId || '—',
          t.timestamp,
        ]),
      };
    }

    case 'WITHDRAWAL_REPORT': {
      const txs = getLocalTransactions().filter((t) => t.type === 'WITHDRAWAL');
      return {
        title: 'Withdrawals Summary Report',
        generatedAt,
        totalRecords: txs.length,
        headers: ['Tx ID', 'User Email', 'Amount (₹)', 'Status', 'Payment Method', 'Reference ID', 'Timestamp'],
        rows: txs.map((t) => [
          t.id,
          t.userEmail,
          t.amount,
          t.status,
          t.paymentMethod || '—',
          t.referenceId || '—',
          t.timestamp,
        ]),
      };
    }

    case 'REVENUE_REPORT': {
      const totalVolume = users.reduce((sum, u) => sum + u.portfolioValue, 0);
      const estCommission = Math.round(totalVolume * 0.0003); // 0.03% virtual brokerage
      return {
        title: 'System Revenue & Brokerage Analytics',
        generatedAt,
        totalRecords: 1,
        headers: ['Metric Name', 'Value (₹)', 'Description'],
        rows: [
          ['Total Paper Market Capital', users.reduce((sum, u) => sum + u.virtualBalance, 0), 'Sum of all active wallet balances'],
          ['Total Asset Portfolio Value', totalVolume, 'Total holdings valuation'],
          ['Simulated Brokerage Revenue', estCommission, '0.03% simulated fee earnings'],
        ],
      };
    }

    case 'ADMIN_ACTIVITY_REPORT': {
      // Async fetched on UI, fallback sample
      return {
        title: 'Admin Activity & Security Audit Report',
        generatedAt,
        totalRecords: 0,
        headers: ['Timestamp', 'Admin Email', 'Category', 'Action', 'Target', 'Amount', 'Reason'],
        rows: [],
      };
    }

    case 'PROFIT_LOSS_REPORT': {
      return {
        title: 'User Profit & Loss Leaderboard Report',
        generatedAt,
        totalRecords: users.length,
        headers: ['Rank', 'User Name', 'Email', 'Total Realized P/L (₹)', 'Win Rate (%)', 'Total Trades'],
        rows: [...users]
          .sort((a, b) => b.totalProfitLoss - a.totalProfitLoss)
          .map((u, i) => [
            `#${i + 1}`,
            u.fullName,
            u.email,
            u.totalProfitLoss,
            `${u.winRate.toFixed(1)}%`,
            u.totalTrades,
          ]),
      };
    }
  }
}

export function downloadCsvReport(data: ReportSummaryData, filename: string) {
  const headerLine = data.headers.map((h) => `"${h.replace(/"/g, '""')}"`).join(',');
  const rowLines = data.rows.map((row) =>
    row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','),
  );
  const csvContent = [headerLine, ...rowLines].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printPdfReport(data: ReportSummaryData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${data.title}</title>
        <style>
          body { font-family: monospace, sans-serif; padding: 24px; color: #111; }
          h1 { margin-bottom: 4px; font-size: 20px; }
          .meta { font-size: 11px; color: #666; margin-bottom: 20px; border-b: 1px solid #ccc; padding-bottom: 8px; }
          table { width: 100%; border-collapse: collapse; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; font-weight: bold; }
          tr:nth-child(even) { background-color: #f9f9f9; }
        </style>
      </head>
      <body>
        <h1>AlphaNXT Admin Terminal — ${data.title}</h1>
        <div class="meta">
          Generated At: ${data.generatedAt} | Total Records: ${data.totalRecords}
        </div>
        <table>
          <thead>
            <tr>
              ${data.headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${data.rows
              .map(
                (row) =>
                  `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`,
              )
              .join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
