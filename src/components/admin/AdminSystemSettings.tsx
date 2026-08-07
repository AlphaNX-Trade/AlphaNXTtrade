import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Power,
  ShieldAlert,
  Clock,
  DollarSign,
  Gift,
  Megaphone,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Cpu,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminConfirmationModal } from '@/components/admin/AdminConfirmationModal';
import { AddStockForm } from '@/components/admin/AddStockForm';
import { AdminMarketControls } from '@/components/admin/AdminMarketControls';

export function AdminSystemSettings() {
  const { user: currentAdmin } = useAuth();

  // Settings State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [tradingHours, setTradingHours] = useState('09:15 AM - 03:30 PM IST');
  const [spreadPercent, setSpreadPercent] = useState('0.02');
  const [brokerageFee, setBrokerageFee] = useState('0.03');
  const [signupBonus, setSignupBonus] = useState('10000000');
  const [dailyStreakXp, setDailyStreakXp] = useState('100');
  const [announcementBannerEnabled, setAnnouncementBannerEnabled] = useState(true);
  const [announcementText, setAnnouncementText] = useState('🚀 Market Trading Volatility High: Practice Risk Management in Paper Trading Mode.');

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (reason: string) => Promise<void> | void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  const handleSaveSettings = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Update System Settings & Platform Defaults',
      description: 'Are you sure you want to save these global system configurations and fee structures?',
      actionLabel: 'Save System Settings',
      onConfirm: async (reason) => {
        setBusy(true);
        try {
          // Save locally & persist to system_settings
          localStorage.setItem(
            'alphanxt_system_settings',
            JSON.stringify({
              maintenanceMode,
              tradingHours,
              spreadPercent,
              brokerageFee,
              signupBonus,
              dailyStreakXp,
              announcementBannerEnabled,
              announcementText,
            }),
          );
          setFeedback({ type: 'success', msg: 'System settings updated & saved.' });
        } catch (err: any) {
          setFeedback({ type: 'error', msg: err.message || 'Failed to save settings.' });
        } finally {
          setBusy(false);
        }
      },
    });
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
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

      {/* Market Circuit Controls Component */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
        <AdminMarketControls />
      </div>

      {/* Global Banners & Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Maintenance Mode & Hours */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <Power className="w-4 h-4 text-cyan-400" /> Platform Maintenance & Hours
          </h3>

          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <p className="font-bold text-white">App Maintenance Mode</p>
              <p className="text-[10px] text-slate-400">Blocks normal users from placing trades during system upgrades.</p>
            </div>
            <button
              onClick={() => setMaintenanceMode(!maintenanceMode)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                maintenanceMode
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
              }`}
            >
              {maintenanceMode ? 'ACTIVE' : 'OFF'}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Market Operational Window</label>
            <input
              value={tradingHours}
              onChange={(e) => setTradingHours(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Announcement Banner */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <Megaphone className="w-4 h-4 text-cyan-400" /> Top Announcement Banner
          </h3>

          <div className="flex items-center justify-between bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <div>
              <p className="font-bold text-white">Banner Visibility</p>
              <p className="text-[10px] text-slate-400">Display global ticker alert at top of trading dashboard.</p>
            </div>
            <button
              onClick={() => setAnnouncementBannerEnabled(!announcementBannerEnabled)}
              className={`px-3 py-1.5 rounded-xl font-bold uppercase transition-all cursor-pointer ${
                announcementBannerEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {announcementBannerEnabled ? 'SHOW' : 'HIDDEN'}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Announcement Message</label>
            <input
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Fees & Rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fees & Spreads */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Fees, Spreads & Slippage
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase">Simulated Spread (%)</label>
              <input
                value={spreadPercent}
                onChange={(e) => setSpreadPercent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase">Virtual Brokerage Fee (%)</label>
              <input
                value={brokerageFee}
                onChange={(e) => setBrokerageFee(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Rewards & Signup Bonus */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4 font-mono text-xs">
          <h3 className="font-bold text-white flex items-center gap-2 text-sm">
            <Gift className="w-4 h-4 text-purple-400" /> Reward & Bonus Defaults
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase">Initial Signup Capital (₹)</label>
              <input
                value={signupBonus}
                onChange={(e) => setSignupBonus(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-400 text-[10px] uppercase">Daily Streak XP</label>
              <input
                value={dailyStreakXp}
                onChange={(e) => setDailyStreakXp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={handleSaveSettings}
        className="w-full py-3 rounded-2xl bg-cyan-500 text-black font-mono font-bold text-xs uppercase tracking-wider hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
      >
        <Save className="w-4 h-4" />
        <span>Save Global System Settings</span>
      </button>

      {/* Deploy Stock Form */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5">
        <AddStockForm />
      </div>

      <AdminConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        description={confirmModal.description}
        actionLabel={confirmModal.actionLabel}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
