import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Send,
  Radio,
  User,
  Megaphone,
  AlertOctagon,
  Flame,
  Wrench,
  CheckCircle2,
  AlertCircle,
  Loader2,
  History,
} from 'lucide-react';
import {
  adminSendNotification,
  fetchSentNotifications,
  AdminNotificationRecord,
  NotificationType,
} from '@/lib/notificationAdminService';
import type { AdminUserRow } from '@/lib/adminService';
import { useAuth } from '@/contexts/AuthContext';

interface AdminNotificationCenterProps {
  users?: AdminUserRow[];
}

export function AdminNotificationCenter({ users = [] }: AdminNotificationCenterProps) {
  const { user: currentAdmin } = useAuth();

  const [targetType, setTargetType] = useState<'ALL' | 'SINGLE'>('ALL');
  const [selectedUid, setSelectedUid] = useState<string>('');
  const [type, setType] = useState<NotificationType>('IN_APP');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [history, setHistory] = useState<AdminNotificationRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const records = await fetchSentNotifications();
      setHistory(records);
    } catch (err) {
      console.error('Failed to load sent notifications:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setFeedback({ type: 'error', msg: 'Please provide both title and notification content.' });
      return;
    }

    let targetEmail: string | undefined;
    if (targetType === 'SINGLE') {
      if (!selectedUid) {
        setFeedback({ type: 'error', msg: 'Please select a target user.' });
        return;
      }
      const u = users.find((x) => x.uid === selectedUid);
      targetEmail = u?.email;
    }

    setBusy(true);
    setFeedback(null);

    try {
      await adminSendNotification(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        targetType,
        targetType === 'SINGLE' ? selectedUid : undefined,
        targetEmail,
        type,
        title,
        message,
      );

      setFeedback({
        type: 'success',
        msg: `Notification sent successfully to ${
          targetType === 'ALL' ? 'all users (Broadcast)' : targetEmail
        }.`,
      });
      setTitle('');
      setMessage('');
      loadHistory();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to send notification.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-100 font-sans">
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <span>Notification & Announcement Dispatch Center</span>
        </h3>

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

        {/* Target Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="font-mono text-[10px] uppercase text-slate-400">Target Audience</label>
            <div className="grid grid-cols-2 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setTargetType('ALL')}
                className={`py-1.5 px-3 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  targetType === 'ALL'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Broadcast (All Users)
              </button>
              <button
                onClick={() => setTargetType('SINGLE')}
                className={`py-1.5 px-3 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer ${
                  targetType === 'SINGLE'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Single User
              </button>
            </div>
          </div>

          {targetType === 'SINGLE' && (
            <div className="space-y-1">
              <label className="font-mono text-[10px] uppercase text-slate-400">Select User</label>
              <select
                value={selectedUid}
                onChange={(e) => setSelectedUid(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-primary"
              >
                <option value="">-- Choose User --</option>
                {users.map((u) => (
                  <option key={u.uid} value={u.uid}>
                    {u.fullName} ({u.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Notification Type Selector */}
        <div className="space-y-1">
          <label className="font-mono text-[10px] uppercase text-slate-400">Notification Category</label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[
              { id: 'IN_APP', label: 'In-App' },
              { id: 'PUSH', label: 'Push' },
              { id: 'MARKET_ALERT', label: 'Market Alert' },
              { id: 'BREAKING_NEWS', label: 'Breaking News' },
              { id: 'PROMOTIONAL', label: 'Promotional' },
              { id: 'MAINTENANCE', label: 'Maintenance' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setType(t.id as NotificationType)}
                className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold uppercase transition-all cursor-pointer text-center ${
                  type === t.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Market Surge Alert: NIFTY crosses 24,500"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Message Content</label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type announcement details or market notification message here..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={handleSend}
          disabled={busy || !title || !message}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-40 cursor-pointer"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span>Dispatch Notification</span>
        </button>
      </div>

      {/* Sent Log */}
      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <History className="w-3.5 h-3.5 text-primary" />
          <span>Broadcast & Sent History</span>
        </h4>

        {loadingHistory ? (
          <div className="flex justify-center py-6 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono text-center py-4 bg-slate-950/40 rounded-xl border border-slate-800/60">
            No previously dispatched notifications found.
          </p>
        ) : (
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={i}
                className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl font-mono text-xs space-y-1"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{h.title}</span>
                    <span className="bg-primary/20 text-primary text-[9px] px-1.5 rounded uppercase">
                      {h.type}
                    </span>
                    <span className="bg-slate-800 text-slate-300 text-[9px] px-1.5 rounded uppercase">
                      {h.targetType === 'ALL' ? 'BROADCAST' : h.targetUid}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {new Date(h.timestamp).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px]">{h.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
