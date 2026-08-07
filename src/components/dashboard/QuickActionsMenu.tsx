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
  Layers,
  Sparkles,
  Target,
  Coins,
  FileText,
  Briefcase,
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { triggerHaptic } from '@/lib/haptics';

export function QuickActionsMenu() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [isOpen, setIsOpen] = useState(false);
  const [modalType, setModalType] = useState<'deposit' | 'withdraw' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMenu = () => {
    triggerHaptic('light');
    setIsOpen((prev) => !prev);
  };

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
      label: 'Buy',
      icon: TrendingUp,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/trade');
      },
    },
    {
      id: 'sell',
      label: 'Sell',
      icon: TrendingDown,
      color: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/trade');
      },
    },
    {
      id: 'deposit',
      label: 'Add Funds',
      icon: Wallet,
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
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
      id: 'portfolio',
      label: 'Portfolio',
      icon: Briefcase,
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/portfolio');
      },
    },
    {
      id: 'my_assets',
      label: 'My Assets',
      icon: Layers,
      color: 'bg-teal-500/20 text-teal-400 border-teal-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/my-assets');
      },
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: Sparkles,
      color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/insights');
      },
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      action: () => {
        setIsOpen(false);
        setLocation('/goals');
      },
    },
  ];

  return (
    <>
      {/* Floating Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Floating Speed Dial Container */}
      <div className="fixed bottom-20 right-4 sm:right-8 z-50 flex flex-col items-end">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="mb-3 p-3 rounded-3xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl grid grid-cols-3 gap-2 w-72"
            >
              {menuActions.map((act) => (
                <button
                  key={act.id}
                  onClick={() => {
                    triggerHaptic('light');
                    act.action();
                  }}
                  className="flex flex-col items-center justify-center p-2.5 rounded-2xl hover:bg-slate-800/80 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${act.color} mb-1 group-hover:scale-105 transition-transform`}>
                    <act.icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-200">{act.label}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl transition-all border ${
            isOpen
              ? 'bg-rose-500 text-white border-rose-400 rotate-45'
              : 'bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/25 hover:bg-emerald-600'
          }`}
        >
          <Plus className="w-7 h-7" />
        </motion.button>
      </div>

      {/* Deposit / Withdraw Modal */}
      <Dialog open={modalType !== null} onOpenChange={() => setModalType(null)}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-800 text-white p-6 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              {modalType === 'deposit' ? 'Add Funds to Virtual Balance' : 'Withdraw Funds'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400">
              {modalType === 'deposit'
                ? 'Add funds to practice paper trading risk-free.'
                : 'Withdraw practice funds back into reserve.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder="50000"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-800/50 text-white text-sm font-bold focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              disabled={isSubmitting}
              onClick={modalType === 'deposit' ? handleDeposit : handleWithdraw}
              className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : modalType === 'deposit' ? 'Confirm Deposit' : 'Confirm Withdrawal'}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
