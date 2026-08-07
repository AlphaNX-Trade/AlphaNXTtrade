import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Wallet,
  ShieldCheck,
  History,
  CheckCircle2,
} from 'lucide-react';
import { useVirtualWallet } from '@/hooks/useVirtualWallet';
import { formatINR } from '@/lib/formatters';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';

export default function WalletPage() {
  const [, setLocation] = useLocation();
  const {
    virtualBalance,
    portfolioValue,
    usedMargin,
    availableMargin,
    investedAmount,
    transactions,
    historyLoading,
    profileLoading,
  } = useVirtualWallet();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-4xl mx-auto pb-24">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl bg-background/95 backdrop-blur border-b border-border h-14 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocation('/dashboard')}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="font-semibold text-base text-foreground flex items-center gap-2">
            Virtual Funds Wallet
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              SIMULATOR
            </span>
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-[72px] pb-6 space-y-6">
        {/* Simulator Disclaimer Callout */}
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3.5 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-mono font-bold text-emerald-300 uppercase tracking-wider">
              Virtual Trading Balance Simulator
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              All funds displayed here are <strong>Virtual Trading Balance</strong> for paper trading, backtesting, and mastering market strategies without financial risk.
            </p>
          </div>
        </div>

        {/* Hero Balance Summary Card */}
        {profileLoading ? (
          <div className="bg-card border border-primary/20 rounded-3xl p-6 animate-pulse h-[220px]" />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden bg-gradient-to-br from-card/95 via-card/80 to-card/95 border border-primary/30 rounded-3xl p-6 shadow-[0_12px_40px_rgba(0,210,210,0.1)] space-y-6"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-80" />
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-primary/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">
                    Available Margin / Cash
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400 uppercase">
                    Virtual Trading Balance
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Balance Number */}
            <div>
              <span className="text-3xl sm:text-4xl font-mono font-extrabold text-foreground tracking-tight block">
                {formatINR(virtualBalance)}
              </span>
            </div>

            {/* Metrics Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-border/60">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Available Margin
                </span>
                <span className="text-sm font-mono font-bold text-emerald-400">
                  {formatINR(availableMargin)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Used Margin
                </span>
                <span className="text-sm font-mono font-bold text-amber-400">
                  {formatINR(usedMargin)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Invested Amount
                </span>
                <span className="text-sm font-mono font-bold text-foreground">
                  {formatINR(investedAmount)}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">
                  Portfolio Value
                </span>
                <span className="text-sm font-mono font-bold text-primary">
                  {formatINR(portfolioValue)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Wallet Transaction History */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-primary" />
              Virtual Fund History
            </h3>
            <span className="text-[11px] font-mono text-muted-foreground">
              {transactions.length} Records
            </span>
          </div>

          {historyLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-card/60 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <div className="bg-card/60 border border-border/80 rounded-2xl p-6 text-center space-y-2">
              <Wallet className="w-8 h-8 text-muted-foreground mx-auto opacity-50" />
              <p className="text-xs font-mono text-muted-foreground">
                No transaction records.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx, idx) => (
                <div
                  key={tx.id || idx}
                  className="bg-card/80 border border-border/80 hover:border-border rounded-2xl p-3.5 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground block">
                        {tx.packageName}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground block">
                        {new Date(tx.timestamp).toLocaleString()} • {tx.paymentMethod}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-sm font-mono font-bold text-emerald-400 block">
                      +{formatINR(tx.virtualAmountCreditedINR)}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground block">
                      <span className="text-emerald-400 font-semibold">{tx.status}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
