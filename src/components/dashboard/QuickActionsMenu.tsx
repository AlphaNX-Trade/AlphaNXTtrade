import { useState } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  X,
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  Star,
  Compass,
  Briefcase,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function QuickActionsMenu() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  const handleDeposit = async () => {
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive amount.', variant: 'destructive' });
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const portRef = doc(db, 'portfolio', user.uid);

      await updateDoc(userRef, { virtualBalance: increment(num) });
      await updateDoc(portRef, { virtualBalance: increment(num) }).catch(() => {});

      toast({
        title: 'Funds Added! 💰',
        description: `Successfully added ₹${num.toLocaleString('en-IN')} to your virtual wallet.`,
      });
      setModalType(null);
      setAmountInput('');
    } catch (err: any) {
      toast({ title: 'Deposit Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWithdraw = async () => {
    const num = parseFloat(amountInput);
    if (isNaN(num) || num <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a positive amount.', variant: 'destructive' });
      return;
    }
    const currentBalance = profile?.virtualBalance ?? 0;
    if (num > currentBalance) {
      toast({ title: 'Insufficient Funds', description: 'You cannot withdraw more than your available balance.', variant: 'destructive' });
      return;
    }
    if (!user) return;

    setIsSubmitting(true);
    try {
      const userRef = doc(db, 'users', user.uid);
      const portRef = doc(db, 'portfolio', user.uid);

      await updateDoc(userRef, { virtualBalance: increment(-num) });
      await updateDoc(portRef, { virtualBalance: increment(-num) }).catch(() => {});

      toast({
        title: 'Withdrawal Processed 🏧',
        description: `Successfully withdrew ₹${num.toLocaleString('en-IN')} from your virtual balance.`,
      });
      setModalType(null);
      setAmountInput('');
    } catch (err: any) {
      toast({ title: 'Withdrawal Failed', description: err.message, variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuActions = [
    {
      id: 'buy',
      label: 'Buy Asset',
      icon: TrendingUp,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/trade');
      },
    },
    {
      id: 'sell',
      label: 'Sell Asset',
      icon: TrendingDown,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/portfolio');
      },
    },
    {
      id: 'deposit',
      label: 'Add Funds',
      icon: Wallet,
      color: 'bg-primary/20 text-primary border-primary/30',
      action: () => {
        setIsOpen(false);
        setModalType('deposit');
      },
    },
    {
      id: 'withdraw',
      label: 'Withdraw',
      icon: ArrowUpRight,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      action: () => {
        setIsOpen(false);
        setModalType('withdraw');
      },
    },
    {
      id: 'watchlist',
      label: 'Watchlist',
      icon: Star,
      color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/watchlist');
      },
    },
    {
      id: 'market_hub',
      label: 'Market Hub',
      icon: Compass,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/market-hub');
      },
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: Briefcase,
      color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/portfolio');
      },
    },
  ];

  return (
    <>
      {/* Floating Speed Dial Container */}
      <div className="fixed bottom-20 right-4 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-end gap-2.5 mb-3"
            >
              {menuActions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    onClick={item.action}
                    className="flex items-center gap-3 group cursor-pointer"
                  >
                    <span className="px-3 py-1 rounded-xl bg-card/90 backdrop-blur-md border border-border text-foreground text-xs font-semibold shadow-lg group-hover:scale-105 transition-transform">
                      {item.label}
                    </span>
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg backdrop-blur-xl group-hover:scale-110 transition-transform ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Primary Toggle FAB */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-primary-foreground shadow-[0_8px_30px_rgba(0,210,210,0.4)] transition-all cursor-pointer ${
            isOpen
              ? 'bg-rose-500 text-white rotate-45'
              : 'bg-primary hover:brightness-110'
          }`}
          aria-label="Quick Actions Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-7 h-7" />}
        </motion.button>
      </div>

      {/* Funds Modal (Deposit / Withdraw) */}
      <Dialog open={modalType !== null} onOpenChange={(open) => !open && setModalType(null)}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              {modalType === 'deposit' ? 'Add Virtual Funds' : 'Withdraw Funds'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {modalType === 'deposit'
                ? 'Top up your virtual trading balance instantly.'
                : 'Withdraw funds from your available virtual wallet.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="p-3 rounded-2xl bg-muted/50 border border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-mono">Current Balance</span>
              <span className="text-sm font-bold font-mono text-primary">
                ₹{(profile?.virtualBalance ?? 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Enter Amount (₹)
              </label>
              <input
                type="number"
                placeholder="e.g. 25000"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-foreground font-mono text-sm outline-none transition-colors"
              />
            </div>

            {/* Quick preset amounts */}
            <div className="flex items-center gap-2">
              {[10000, 25000, 50000, 100000].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmountInput(preset.toString())}
                  className="flex-1 py-1.5 bg-secondary hover:bg-secondary/80 rounded-lg text-[10px] font-mono font-medium text-foreground transition-colors cursor-pointer"
                >
                  +₹{(preset / 1000).toFixed(0)}k
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalType(null)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs hover:bg-secondary/80 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={modalType === 'deposit' ? handleDeposit : handleWithdraw}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-[0_0_15px_rgba(0,210,210,0.3)] hover:brightness-110 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Processing...' : modalType === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
