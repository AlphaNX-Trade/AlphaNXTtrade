import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle2, ShieldAlert, Loader2 } from 'lucide-react';

interface AdminConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  targetUser?: string;
  previousValue?: string;
  newValue?: string;
  requireReason?: boolean;
  onConfirm: (reason: string) => Promise<void> | void;
  onClose: () => void;
}

export function AdminConfirmationModal({
  isOpen,
  title,
  description,
  actionLabel = 'Confirm Action',
  variant = 'warning',
  targetUser,
  previousValue,
  newValue,
  requireReason = true,
  onConfirm,
  onClose,
}: AdminConfirmationModalProps) {
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Please provide a valid reason for this admin action.');
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Action failed to execute.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-lg bg-[#070b14] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-slate-100"
          style={{ boxShadow: '0 0 50px rgba(0, 224, 255, 0.15)' }}
        >
          {/* Top glowing line */}
          <div
            className={`absolute top-0 left-0 right-0 h-1 ${
              variant === 'danger'
                ? 'bg-red-500'
                : variant === 'warning'
                ? 'bg-amber-500'
                : 'bg-cyan-500'
            }`}
          />

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                  variant === 'danger'
                    ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : variant === 'warning'
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-400/80">
                  Security Confirmation
                </span>
                <h3 className="text-base font-bold text-white">{title}</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-4">{description}</p>

          {/* User or Value Change Details */}
          {(targetUser || previousValue || newValue) && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 mb-4 space-y-1.5 font-mono text-xs">
              {targetUser && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Target User:</span>
                  <span className="text-cyan-400 font-bold">{targetUser}</span>
                </div>
              )}
              {previousValue && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Previous Value:</span>
                  <span className="text-red-400 line-through">{previousValue}</span>
                </div>
              )}
              {newValue && (
                <div className="flex justify-between">
                  <span className="text-slate-400">New Value:</span>
                  <span className="text-emerald-400 font-bold">{newValue}</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mb-4 p-2.5 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs">
              {error}
            </div>
          )}

          {/* Reason Input */}
          {requireReason && (
            <div className="space-y-1.5 mb-5">
              <label className="font-mono text-[10px] uppercase tracking-wider text-slate-400 flex justify-between">
                <span>Reason for Action (Audit Required)</span>
                <span className="text-red-400">*required</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Specify the operational or administrative reason for this change..."
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500/60 rounded-xl p-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none resize-none"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              disabled={busy}
              className="px-4 py-2 rounded-xl text-xs font-mono uppercase text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={busy || (requireReason && !reason.trim())}
              className={`px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                variant === 'danger'
                  ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20'
                  : 'bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20'
              }`}
            >
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{actionLabel}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
