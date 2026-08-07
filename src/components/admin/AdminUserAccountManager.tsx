import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  Shield,
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Globe,
  Smartphone,
  Mail,
  PhoneCall,
  FileCheck2,
  FileX2,
} from 'lucide-react';
import type { AdminUserRow } from '@/lib/adminService';
import {
  adminUpdateUserProfile,
  adminSetAccountStatus,
  adminForceLogoutUser,
  adminVerifyContact,
  adminSetKycStatus,
  getLocalLoginHistory,
  AccountStatus,
  KycStatus,
  UserLoginHistoryRecord,
} from '@/lib/userManagementService';
import { useAuth } from '@/contexts/AuthContext';

interface AdminUserAccountManagerProps {
  user: AdminUserRow;
  onUpdated: () => void;
}

export function AdminUserAccountManager({ user, onUpdated }: AdminUserAccountManagerProps) {
  const { user: currentAdmin } = useAuth();

  const [fullName, setFullName] = useState(user.fullName);
  const [title, setTitle] = useState(user.title || '');
  const [level, setLevel] = useState(user.level || 'Beginner');
  const [xp, setXp] = useState(user.xp || 0);

  const [accountStatus, setAccountStatus] = useState<AccountStatus>('ACTIVE');
  const [kycStatus, setKycStatus] = useState<KycStatus>('PENDING');

  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const [loginHistory, setLoginHistory] = useState<UserLoginHistoryRecord[]>([]);

  useEffect(() => {
    setLoginHistory(getLocalLoginHistory(user.uid));
  }, [user.uid]);

  const handleUpdateProfile = async () => {
    setBusy(true);
    setFeedback(null);
    try {
      await adminUpdateUserProfile(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        { fullName, title, level, xp: Number(xp) },
        'Admin updated user account credentials',
      );
      setFeedback({ type: 'success', msg: 'User profile updated & audit logged.' });
      onUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to update profile.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleSetStatus = async (newStatus: AccountStatus) => {
    const reason = prompt(`Enter reason for setting account status to ${newStatus}:`);
    if (!reason) return;

    setBusy(true);
    setFeedback(null);
    try {
      await adminSetAccountStatus(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        newStatus,
        reason,
      );
      setAccountStatus(newStatus);
      setFeedback({ type: 'success', msg: `Account status updated to ${newStatus}.` });
      onUpdated();
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to set account status.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleForceLogout = async () => {
    if (!confirm(`Force logout user ${user.fullName} across all active sessions?`)) return;

    setBusy(true);
    try {
      await adminForceLogoutUser(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        'Admin initiated force logout',
      );
      setFeedback({ type: 'success', msg: `Forced logout applied to ${user.fullName}.` });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to force logout.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleVerification = async (type: 'EMAIL' | 'PHONE') => {
    const currentState = type === 'EMAIL' ? isEmailVerified : isPhoneVerified;
    const nextState = !currentState;

    setBusy(true);
    try {
      await adminVerifyContact(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        type,
        nextState,
      );
      if (type === 'EMAIL') setIsEmailVerified(nextState);
      else setIsPhoneVerified(nextState);

      setFeedback({
        type: 'success',
        msg: `${type} verification set to ${nextState ? 'VERIFIED' : 'UNVERIFIED'}.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to toggle verification.',
      });
    } finally {
      setBusy(false);
    }
  };

  const handleKycReview = async (nextStatus: KycStatus) => {
    const reason = prompt(`Reason for setting KYC status to ${nextStatus}:`);
    if (!reason) return;

    setBusy(true);
    try {
      await adminSetKycStatus(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        user.uid,
        user.email,
        nextStatus,
        reason,
      );
      setKycStatus(nextStatus);
      setFeedback({ type: 'success', msg: `KYC set to ${nextStatus}.` });
    } catch (err) {
      setFeedback({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Failed to set KYC.',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5 text-slate-100 font-sans">
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

      {/* Account Action Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-slate-400 uppercase">Status:</span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase ${
              accountStatus === 'ACTIVE'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : accountStatus === 'SUSPENDED'
                ? 'bg-amber-950 text-amber-400 border border-amber-800'
                : 'bg-red-950 text-red-400 border border-red-800'
            }`}
          >
            {accountStatus}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {accountStatus !== 'ACTIVE' && (
            <button
              onClick={() => handleSetStatus('ACTIVE')}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono uppercase font-bold hover:bg-emerald-500/30 transition-all cursor-pointer"
            >
              Activate
            </button>
          )}
          {accountStatus !== 'SUSPENDED' && (
            <button
              onClick={() => handleSetStatus('SUSPENDED')}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono uppercase font-bold hover:bg-amber-500/30 transition-all cursor-pointer"
            >
              Suspend
            </button>
          )}
          {accountStatus !== 'BANNED' && (
            <button
              onClick={() => handleSetStatus('BANNED')}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono uppercase font-bold hover:bg-red-500/30 transition-all cursor-pointer"
            >
              Ban User
            </button>
          )}
          <button
            onClick={handleForceLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400" />
            <span>Force Logout</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <span>Edit Profile & Credentials</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Title Badge</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VIP Trader, Pro Analyst"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">Trader Level</label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="Pro Master">Pro Master</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-400 text-[10px] uppercase">XP Points</label>
            <input
              type="number"
              value={xp}
              onChange={(e) => setXp(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        <button
          onClick={handleUpdateProfile}
          disabled={busy}
          className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-40 cursor-pointer"
        >
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          <span>Save Profile Changes</span>
        </button>
      </div>

      {/* Verification & KYC Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Verification Statuses */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Mail className="w-3.5 h-3.5 text-primary" />
            <span>Contact Verifications</span>
          </h4>

          <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-xs font-mono text-slate-300">Email Verification</span>
            <button
              onClick={() => handleToggleVerification('EMAIL')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                isEmailVerified
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isEmailVerified ? 'Verified' : 'Unverified (Click to Verify)'}
            </button>
          </div>

          <div className="flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/80">
            <span className="text-xs font-mono text-slate-300">Phone Verification</span>
            <button
              onClick={() => handleToggleVerification('PHONE')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                isPhoneVerified
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {isPhoneVerified ? 'Verified' : 'Unverified (Click to Verify)'}
            </button>
          </div>
        </div>

        {/* KYC Controls */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
          <h4 className="font-mono text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <FileCheck2 className="w-3.5 h-3.5 text-primary" />
            <span>KYC Compliance</span>
          </h4>

          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-slate-400">Status:</span>
            <span className="font-bold text-primary uppercase">{kycStatus}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleKycReview('APPROVED')}
              className="py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold uppercase hover:bg-emerald-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Approve KYC</span>
            </button>
            <button
              onClick={() => handleKycReview('REJECTED')}
              className="py-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-xs font-mono font-bold uppercase hover:bg-red-500/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileX2 className="w-3.5 h-3.5" />
              <span>Reject KYC</span>
            </button>
          </div>
        </div>
      </div>

      {/* Login & Device Audit History */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 space-y-3">
        <h4 className="font-mono text-xs uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-primary" />
          <span>Login, IP & Device History</span>
        </h4>

        <div className="space-y-2">
          {loginHistory.map((log, i) => (
            <div
              key={i}
              className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs font-mono gap-2"
            >
              <div>
                <div className="flex items-center gap-2 text-white font-bold">
                  <Smartphone className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span>{log.device}</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  IP: <span className="text-primary">{log.ipAddress}</span> • {log.location}
                </div>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">
                {new Date(log.timestamp).toLocaleString('en-IN')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
