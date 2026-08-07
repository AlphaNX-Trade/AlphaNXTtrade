import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Wallet,
  TrendingUp,
  History,
  ShieldAlert,
  Globe,
  Award,
  Lock,
  Mail,
  Phone,
  FileCheck2,
  FileText,
  Building2,
  CheckCircle2,
  AlertCircle,
  Zap,
  KeyRound,
  LogOut,
  MinusCircle,
  PlusCircle,
  Shield,
  Clock,
} from 'lucide-react';
import type { AdminUserRow } from '@/lib/adminService';
import { adminAddMoney, adminSubtractMoney, adminAdjustProfitLoss, setUserTitle } from '@/lib/adminService';
import {
  adminSetAccountStatus,
  adminForceLogoutUser,
  adminVerifyContact,
  adminSetKycStatus,
  getLocalLoginHistory,
  AccountStatus,
  KycStatus,
} from '@/lib/userManagementService';
import { AdminConfirmationModal } from '@/components/admin/AdminConfirmationModal';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUserDetailModalProps {
  user: AdminUserRow;
  onClose: () => void;
  onUpdated: () => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function AdminUserDetailModal({ user, onClose, onUpdated }: AdminUserDetailModalProps) {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'wallet' | 'titles' | 'holdings' | 'history' | 'security'>('profile');

  // Input states
  const [titleText, setTitleText] = useState(user.title || 'Silver Trader');
  const [titleBadge, setTitleBadge] = useState('Shield');
  const [titleColor, setTitleColor] = useState('#00E0FF');
  const [accountManager, setAccountManager] = useState('Staff_Alpha_01');
  const [internalNotes, setInternalNotes] = useState('Verified active paper trading account.');

  const [moneyAmount, setMoneyAmount] = useState('');
  const [moneyMode, setMoneyMode] = useState<'credit' | 'debit' | 'bonus'>('credit');
  const [plAmount, setPlAmount] = useState('');

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel?: string;
    variant?: 'danger' | 'warning' | 'info';
    targetUser?: string;
    previousValue?: string;
    newValue?: string;
    onConfirm: (reason: string) => Promise<void> | void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Trigger Confirmation Modal for Balance Mod
  const triggerBalanceChange = () => {
    const amount = parseFloat(moneyAmount);
    if (isNaN(amount) || amount <= 0) return;

    const actionText = moneyMode === 'credit' ? 'Credit Balance' : moneyMode === 'debit' ? 'Deduct Balance' : 'Credit Bonus';
    setConfirmModal({
      isOpen: true,
      title: `${actionText} for ${user.fullName}`,
      description: `Are you sure you want to ${moneyMode === 'debit' ? 'deduct' : 'add'} ${fmt(amount)} ${moneyMode === 'debit' ? 'from' : 'to'} this user's account balance?`,
      actionLabel: actionText,
      variant: moneyMode === 'debit' ? 'danger' : 'warning',
      targetUser: user.email,
      previousValue: fmt(user.virtualBalance),
      newValue: fmt(moneyMode === 'debit' ? Math.max(0, user.virtualBalance - amount) : user.virtualBalance + amount),
      onConfirm: async (reason) => {
        if (moneyMode === 'credit' || moneyMode === 'bonus') {
          await adminAddMoney(user.uid, amount);
        } else {
          await adminSubtractMoney(user.uid, amount);
        }
        setFeedback({ type: 'success', message: `Successfully applied ${actionText} of ${fmt(amount)}.` });
        setMoneyAmount('');
        onUpdated();
      },
    });
  };

  // Trigger Account Status Change
  const triggerStatusChange = (nextStatus: AccountStatus) => {
    setConfirmModal({
      isOpen: true,
      title: `Change Account Status to ${nextStatus}`,
      description: `This will update ${user.fullName}'s access permissions across all trading terminals.`,
      actionLabel: `Set Status to ${nextStatus}`,
      variant: nextStatus === 'BANNED' || nextStatus === 'SUSPENDED' ? 'danger' : 'info',
      targetUser: user.email,
      previousValue: (user as any).accountStatus || 'ACTIVE',
      newValue: nextStatus,
      onConfirm: async (reason) => {
        await adminSetAccountStatus(
          currentAdmin?.email || 'Admin',
          currentAdmin?.uid || 'admin',
          user.uid,
          user.email,
          nextStatus,
          reason,
        );
        setFeedback({ type: 'success', message: `Account status updated to ${nextStatus}.` });
        onUpdated();
      },
    });
  };

  // Trigger Force Logout
  const triggerForceLogout = () => {
    setConfirmModal({
      isOpen: true,
      title: `Force Logout ${user.fullName}`,
      description: 'Terminates all active login sessions for this account immediately.',
      actionLabel: 'Force Logout All Devices',
      variant: 'danger',
      targetUser: user.email,
      onConfirm: async (reason) => {
        await adminForceLogoutUser(
          currentAdmin?.email || 'Admin',
          currentAdmin?.uid || 'admin',
          user.uid,
          user.email,
          reason,
        );
        setFeedback({ type: 'success', message: `Forced session termination applied to ${user.email}.` });
      },
    });
  };

  // Assign Title
  const handleSaveTitle = async () => {
    try {
      await setUserTitle(user.uid, titleText.trim());
      setFeedback({ type: 'success', message: `Title badge updated to "${titleText.trim()}".` });
      onUpdated();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to set title.' });
    }
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 font-sans text-slate-100"
        >
          <motion.div
            initial={{ scale: 0.95, y: 15 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-[#070a13] border border-cyan-500/30 rounded-2xl shadow-2xl relative flex flex-col overflow-hidden"
            style={{ boxShadow: '0 0 60px rgba(0, 224, 255, 0.12)' }}
          >
            {/* Header bar */}
            <div className="bg-[#0b0f1d] border-b border-cyan-500/20 px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-mono font-bold">
                  {user.fullName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white">{user.fullName}</h2>
                    {user.title && (
                      <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
                        {user.title}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono">UID: {user.uid} • {user.email}</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sub-navigation tabs */}
            <div className="bg-slate-950/90 border-b border-slate-800/80 px-6 py-2.5 flex items-center gap-2 overflow-x-auto shrink-0 font-mono text-xs">
              {[
                { id: 'profile', label: 'User Profile & Notes', icon: User },
                { id: 'wallet', label: 'Wallet & Adjustments', icon: Wallet },
                { id: 'titles', label: 'Title Badges', icon: Award },
                { id: 'holdings', label: 'Holdings & Orders', icon: TrendingUp },
                { id: 'history', label: 'Device & Logins', icon: Globe },
                { id: 'security', label: 'Account Security', icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Main scrollable body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
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
                  <span>{feedback.message}</span>
                </div>
              )}

              {/* Tab 1: Profile & Notes */}
              {activeTab === 'profile' && (
                <div className="space-y-5">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase">Virtual Balance</span>
                      <p className="text-sm font-bold text-cyan-400">{fmt(user.virtualBalance)}</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase">Portfolio Value</span>
                      <p className="text-sm font-bold text-white">{fmt(user.portfolioValue)}</p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase">Net Realized P/L</span>
                      <p className={`text-sm font-bold ${user.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {user.totalProfitLoss >= 0 ? '+' : ''}{fmt(user.totalProfitLoss)}
                      </p>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
                      <span className="text-[9px] text-slate-400 uppercase">Win Rate</span>
                      <p className="text-sm font-bold text-white">{user.winRate.toFixed(1)}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl space-y-3 font-mono text-xs">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-cyan-400" /> Account Identity & Staff Assignment
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <label className="text-slate-400 text-[10px] uppercase">Assigned Account Manager</label>
                          <input
                            value={accountManager}
                            onChange={(e) => setAccountManager(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                          />
                        </div>
                        <div>
                          <label className="text-slate-400 text-[10px] uppercase">KYC Compliance Status</label>
                          <div className="flex items-center gap-2 pt-1">
                            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">APPROVED</span>
                            <span className="text-slate-400 text-[10px]">Verified on Aug 2026</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl space-y-3 font-mono text-xs">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <FileCheck2 className="w-4 h-4 text-cyan-400" /> Internal Staff Notes
                      </h4>
                      <textarea
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-cyan-500 resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Wallet & Balance Adjustments */}
              {activeTab === 'wallet' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-slate-900/60 border border-cyan-500/20 p-4 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-white flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-cyan-400" /> Add, Deduct or Credit Bonus
                      </h4>
                      <div className="flex bg-black/40 rounded-lg p-0.5 gap-1">
                        {(['credit', 'debit', 'bonus'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => setMoneyMode(m)}
                            className={`px-3 py-1 rounded text-[10px] uppercase font-bold cursor-pointer ${
                              moneyMode === m ? 'bg-cyan-500 text-black' : 'text-slate-400'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={moneyAmount}
                        onChange={(e) => setMoneyAmount(e.target.value)}
                        placeholder="Amount in ₹"
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={triggerBalanceChange}
                        disabled={!moneyAmount}
                        className="px-5 rounded-xl bg-cyan-500 text-black font-bold uppercase hover:bg-cyan-400 disabled:opacity-40 cursor-pointer"
                      >
                        Execute
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: Titles & Badges */}
              {activeTab === 'titles' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-cyan-400" /> Assign Trader Title & VIP Badge
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        'Beginner Trader',
                        'Silver Trader',
                        'Gold Trader',
                        'Platinum Trader',
                        'Diamond Trader',
                        'Elite Trader',
                        'VIP Investor',
                        'Legend Trader',
                      ].map((preset) => (
                        <button
                          key={preset}
                          onClick={() => setTitleText(preset)}
                          className={`p-2 rounded-xl border text-[10px] font-bold text-left transition-all cursor-pointer ${
                            titleText === preset
                              ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {preset}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        value={titleText}
                        onChange={(e) => setTitleText(e.target.value)}
                        placeholder="Or enter custom title..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={handleSaveTitle}
                        className="px-5 rounded-xl bg-cyan-500 text-black font-bold uppercase hover:bg-cyan-400 cursor-pointer"
                      >
                        Save Badge
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Holdings & Orders */}
              {activeTab === 'holdings' && (
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-white">Active Simulated Holdings</h4>
                  <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-3 text-slate-400 text-center">
                    User holds 100 Qty RELIANCE @ ₹2,890.00 and 50 Qty TATASTEEL @ ₹165.20.
                  </div>
                </div>
              )}

              {/* Tab 5: Device & Logins */}
              {activeTab === 'history' && (
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-bold text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-400" /> Recent Device & IP History
                  </h4>
                  {getLocalLoginHistory(user.uid).map((log, idx) => (
                    <div key={idx} className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex justify-between">
                      <div>
                        <p className="font-bold text-white">{log.device}</p>
                        <p className="text-[10px] text-slate-400">IP: {log.ipAddress} • {log.location}</p>
                      </div>
                      <span className="text-[10px] text-slate-500">{new Date(log.timestamp).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab 6: Security */}
              {activeTab === 'security' && (
                <div className="space-y-4 font-mono text-xs">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-3">
                    <h4 className="font-bold text-white flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-400" /> Account Access Controls
                    </h4>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => triggerStatusChange('SUSPENDED')}
                        className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold uppercase hover:bg-amber-500/30 cursor-pointer"
                      >
                        Suspend Account
                      </button>
                      <button
                        onClick={() => triggerStatusChange('BANNED')}
                        className="px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-400 font-bold uppercase hover:bg-red-500/30 cursor-pointer"
                      >
                        Ban Account
                      </button>
                      <button
                        onClick={triggerForceLogout}
                        className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 font-bold uppercase hover:bg-slate-700 cursor-pointer"
                      >
                        Force Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        actionLabel={confirmModal.actionLabel}
        variant={confirmModal.variant}
        targetUser={confirmModal.targetUser}
        previousValue={confirmModal.previousValue}
        newValue={confirmModal.newValue}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </>
  );
}
