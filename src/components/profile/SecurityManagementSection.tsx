import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Smartphone,
  LogOut,
  Clock,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import { useSecurity } from '@/hooks/useSecurity';
import { triggerHaptic } from '@/lib/haptics';

export function SecurityManagementSection() {
  const {
    pinEnabled,
    biometricEnabled,
    activeSessions,
    loginHistory,
    setupPin,
    removePin,
    toggleBiometric,
    revokeSession,
  } = useSecurity();

  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState('');

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length !== 4 || !/^\d+$/.test(newPin)) {
      setPinError('PIN must be exactly 4 digits');
      return;
    }
    if (newPin !== confirmPin) {
      setPinError('PINs do not match');
      return;
    }

    triggerHaptic('success');
    setupPin(newPin);
    setPinModalOpen(false);
    setNewPin('');
    setConfirmPin('');
    setPinError('');
  };

  return (
    <div className="space-y-6">
      {/* 1. App Lock & Security Settings */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" /> App Security & Access
        </h3>

        <div className="space-y-4">
          {/* PIN Lock Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">4-Digit Security PIN</div>
                <div className="text-xs text-slate-500">
                  {pinEnabled ? 'PIN Lock is active' : 'Protect AlphaNXT session with a PIN passcode'}
                </div>
              </div>
            </div>

            {pinEnabled ? (
              <button
                onClick={() => {
                  triggerHaptic('medium');
                  removePin();
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs transition-colors"
              >
                Disable PIN
              </button>
            ) : (
              <button
                onClick={() => {
                  triggerHaptic('light');
                  setPinModalOpen(true);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs transition-colors shadow-sm"
              >
                Setup PIN
              </button>
            )}
          </div>

          {/* Biometric Toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">Biometric Unlock</div>
                <div className="text-xs text-slate-500">Use Fingerprint or Face ID for fast unlock</div>
              </div>
            </div>

            <button
              onClick={() => {
                triggerHaptic('light');
                toggleBiometric();
              }}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 ${
                biometricEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  biometricEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Setup PIN Modal */}
      {pinModalOpen && (
        <div className="fixed inset-0 z-[90] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 text-slate-900 dark:text-white"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-emerald-500" /> Set Security PIN
              </h3>
              <button onClick={() => setPinModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Enter 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-black text-xl tracking-widest focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-center font-black text-xl tracking-widest focus:outline-none"
                  required
                />
              </div>

              {pinError && <p className="text-xs text-rose-500 font-bold text-center">{pinError}</p>}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* 2. Device Management & Active Sessions */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-indigo-500" /> Active Device Sessions
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {activeSessions.map((session) => (
            <div key={session.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{session.device}</span>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500">
                      Current Device
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  IP: {session.ip} • {session.location} • {session.lastActive}
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => {
                    triggerHaptic('medium');
                    revokeSession(session.id);
                  }}
                  className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  title="Revoke Session"
                >
                  <Trash2 className="w-4 h-4" /> Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 3. Login History Log */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" /> Login Security History
        </h3>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          {loginHistory.map((log) => (
            <div key={log.id} className="py-2.5 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800 dark:text-slate-200">{log.device} ({log.browser})</div>
                <div className="text-slate-400">
                  {new Date(log.timestamp).toLocaleString()} • {log.ip} ({log.location})
                </div>
              </div>
              <span className="px-2 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-500 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
