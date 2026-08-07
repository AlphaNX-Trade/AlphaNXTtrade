import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Wallet,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  QrCode,
  Building2,
  Zap,
  Info,
  Check,
} from 'lucide-react';
import { VIRTUAL_FUND_PACKAGES, VirtualFundPackage } from '@/lib/virtualWalletService';
import { useVirtualWallet } from '@/hooks/useVirtualWallet';
import { formatINR } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPackageId?: string;
}

type Step = 'SELECT_PACKAGE' | 'SELECT_PAYMENT' | 'PROCESSING' | 'SUCCESS';

export function AddFundsModal({ isOpen, onClose, defaultPackageId }: AddFundsModalProps) {
  const { buyPackage, virtualBalance } = useVirtualWallet();

  const [selectedPkg, setSelectedPkg] = useState<VirtualFundPackage>(
    VIRTUAL_FUND_PACKAGES.find((p) => p.id === defaultPackageId) || VIRTUAL_FUND_PACKAGES[2] // Default to Pro Trader Pack
  );
  const [step, setStep] = useState<Step>('SELECT_PACKAGE');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');
  const [upiId, setUpiId] = useState('user@upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [txDetails, setTxDetails] = useState<{
    txRef: string;
    newBalance: number;
    creditedAmount: number;
  } | null>(null);

  const resetState = () => {
    setStep('SELECT_PACKAGE');
    setIsProcessing(false);
    setTxDetails(null);
  };

  const handleClose = () => {
    onClose();
    setTimeout(resetState, 300);
  };

  const handleProceedToPayment = () => {
    triggerHaptic('light');
    setStep('SELECT_PAYMENT');
  };

  const handleConfirmPayment = async () => {
    triggerHaptic('medium');
    setStep('PROCESSING');
    setIsProcessing(true);

    // Simulate realistic payment gateway processing delay (1.8s)
    setTimeout(async () => {
      try {
        const methodLabel =
          paymentMethod === 'UPI'
            ? `UPI (${upiId})`
            : paymentMethod === 'CARD'
            ? 'Credit/Debit Card'
            : 'Net Banking';

        const res = await buyPackage(selectedPkg, methodLabel);
        if (res && res.success) {
          triggerHaptic('success');
          setTxDetails({
            txRef: res.transactionRef,
            newBalance: res.newVirtualBalance,
            creditedAmount: selectedPkg.virtualAmountINR,
          });
          setStep('SUCCESS');
        } else {
          setStep('SELECT_PAYMENT');
        }
      } catch (err) {
        console.error(err);
        setStep('SELECT_PAYMENT');
      } finally {
        setIsProcessing(false);
      }
    }, 1800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg bg-card/95 border-primary/20 backdrop-blur-2xl text-foreground p-0 overflow-hidden rounded-3xl shadow-2xl">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-primary/20 via-emerald-500/20 to-primary/20 border-b border-primary/20 p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary shadow-inner">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                Add Virtual Trading Funds
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  PAPER TRADING
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Top up your Virtual Trading Balance to practice strategies risk-free.
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          <AnimatePresence mode="wait">
            {/* STEP 1: SELECT PACKAGE */}
            {step === 'SELECT_PACKAGE' && (
              <motion.div
                key="step-select"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {/* Current Virtual Balance Callout */}
                <div className="bg-muted/40 border border-border/80 rounded-2xl p-3.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Current Virtual Trading Balance
                    </span>
                    <span className="text-lg font-mono font-bold text-primary">
                      {formatINR(virtualBalance)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground block">
                      Mode
                    </span>
                    <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 justify-end">
                      <Zap className="w-3 h-3 fill-emerald-400" /> Simulator
                    </span>
                  </div>
                </div>

                {/* Notice */}
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-300">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <strong>Simulator Funds:</strong> These packages credit <i>virtual money</i> for practice trading. They do not represent real fiat currency or bank deposits.
                  </p>
                </div>

                {/* Packages Grid */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                    Select Virtual Fund Package
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {VIRTUAL_FUND_PACKAGES.map((pkg) => {
                      const isSelected = selectedPkg.id === pkg.id;
                      return (
                        <div
                          key={pkg.id}
                          onClick={() => {
                            triggerHaptic('light');
                            setSelectedPkg(pkg);
                          }}
                          className={`relative p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(0,210,210,0.15)] scale-[1.02]'
                              : 'bg-card/80 border-border/70 hover:border-border hover:bg-card'
                          }`}
                        >
                          {pkg.badge && (
                            <span className={`absolute -top-2.5 right-3 text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                              pkg.popular
                                ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                                : 'bg-primary/20 text-primary border-primary/40'
                            }`}>
                              {pkg.badge}
                            </span>
                          )}

                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-foreground">
                                {pkg.name}
                              </span>
                              {isSelected && (
                                <div className="w-4 h-4 rounded-full bg-primary text-black flex items-center justify-center">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </div>
                              )}
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight">
                              {pkg.description}
                            </p>
                          </div>

                          <div className="pt-3 mt-3 border-t border-border/50 flex items-baseline justify-between">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-mono block">
                                Receives
                              </span>
                              <span className="text-sm font-mono font-extrabold text-emerald-400">
                                {formatINR(pkg.virtualAmountINR)}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-[10px] text-muted-foreground uppercase font-mono block">
                                Cost
                              </span>
                              <span className="text-sm font-mono font-bold text-foreground">
                                ₹{pkg.priceINR}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Proceed Button */}
                <button
                  onClick={handleProceedToPayment}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-mono font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>Proceed to Simulated Gateway (₹{selectedPkg.priceINR})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2: PAYMENT METHOD */}
            {step === 'SELECT_PAYMENT' && (
              <motion.div
                key="step-payment"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-5"
              >
                {/* Selected Package Summary */}
                <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                      Selected Package
                    </span>
                    <span className="text-sm font-bold text-foreground">
                      {selectedPkg.name}
                    </span>
                    <span className="text-xs font-mono font-semibold text-emerald-400 block mt-0.5">
                      +{formatINR(selectedPkg.virtualAmountINR)} Virtual Balance
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-muted-foreground uppercase block">
                      Amount Payable
                    </span>
                    <span className="text-lg font-mono font-extrabold text-foreground">
                      ₹{selectedPkg.priceINR}
                    </span>
                  </div>
                </div>

                {/* Payment Options */}
                <div className="space-y-2.5">
                  <label className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                    Choose Payment Gateway Method
                  </label>

                  <div className="space-y-2">
                    {/* UPI Option */}
                    <div
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'UPI'
                          ? 'bg-primary/10 border-primary text-foreground'
                          : 'bg-card/60 border-border/70 hover:border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            UPI / GPay / PhonePe
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Instant virtual wallet credit
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="accent-primary w-4 h-4"
                      />
                    </div>

                    {paymentMethod === 'UPI' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="px-2 pt-1 pb-2 space-y-1.5"
                      >
                        <span className="text-[10px] text-muted-foreground font-mono uppercase block">
                          Enter VPA / UPI ID
                        </span>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@upi"
                          className="w-full px-3.5 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-mono focus:outline-none focus:border-primary"
                        />
                      </motion.div>
                    )}

                    {/* Card Option */}
                    <div
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'CARD'
                          ? 'bg-primary/10 border-primary text-foreground'
                          : 'bg-card/60 border-border/70 hover:border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Credit / Debit Card
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            Visa, Mastercard, RuPay
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                        className="accent-primary w-4 h-4"
                      />
                    </div>

                    {/* NetBanking Option */}
                    <div
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        paymentMethod === 'NETBANKING'
                          ? 'bg-primary/10 border-primary text-foreground'
                          : 'bg-card/60 border-border/70 hover:border-border text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-foreground block">
                            Net Banking
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            HDFC, SBI, ICICI, Axis & others
                          </span>
                        </div>
                      </div>
                      <input
                        type="radio"
                        checked={paymentMethod === 'NETBANKING'}
                        onChange={() => setPaymentMethod('NETBANKING')}
                        className="accent-primary w-4 h-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 justify-center text-[10px] text-muted-foreground font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Encrypted Simulator Transaction • Auto-Credit Virtual Balance</span>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('SELECT_PACKAGE')}
                    className="flex-1 py-3 rounded-2xl border border-border text-xs font-mono font-semibold hover:bg-muted transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="flex-[2] py-3 rounded-2xl bg-emerald-500 text-black font-mono font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Pay ₹{selectedPkg.priceINR} & Add Funds</span>
                    <Sparkles className="w-4 h-4 fill-black" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROCESSING */}
            {step === 'PROCESSING' && (
              <motion.div
                key="step-processing"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="py-12 flex flex-col items-center justify-center text-center space-y-5"
              >
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Zap className="w-8 h-8 text-primary animate-pulse" />
                  </div>
                </div>

                <div className="space-y-1.5 max-w-xs">
                  <h4 className="text-base font-bold text-foreground">
                    Processing Payment...
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono">
                    Connecting with simulated gateway & crediting your Virtual Trading Balance.
                  </p>
                </div>

                <div className="w-full max-w-xs bg-muted/60 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    className="bg-primary h-full rounded-full"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1.6, ease: 'easeInOut' }}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'SUCCESS' && txDetails && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-4 text-center space-y-5"
              >
                {/* Celebration Icon */}
                <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight">
                    Virtual Funds Added Successfully! 🎉
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono font-medium">
                    Your Virtual Trading Balance has been credited.
                  </p>
                </div>

                {/* Details Box */}
                <div className="bg-card border border-emerald-500/30 rounded-2xl p-4 text-left space-y-3 font-mono">
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-border/60">
                    <span className="text-muted-foreground">Transaction Ref</span>
                    <span className="font-bold text-foreground">{txDetails.txRef}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pb-2 border-b border-border/60">
                    <span className="text-muted-foreground">Credited Amount</span>
                    <span className="font-bold text-emerald-400">
                      +{formatINR(txDetails.creditedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">New Virtual Balance</span>
                    <span className="font-extrabold text-primary text-sm">
                      {formatINR(txDetails.newBalance)}
                    </span>
                  </div>
                </div>

                {/* Done Action */}
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 text-black font-mono font-extrabold text-sm hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
                >
                  Start Trading Now
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
