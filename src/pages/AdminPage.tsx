import { useEffect, useMemo, useState, useCallback, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Search,
  Users,
  Wallet,
  Activity,
  Cpu,
  RefreshCw,
  LogOut,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Terminal,
  Server,
  Zap,
  BarChart3,
  Bell,
  MessageSquare,
  FileText,
  Settings,
  ShieldAlert,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail, ADMIN_EMAIL } from '@/lib/adminConfig';
import { listAllUsers, type AdminUserRow } from '@/lib/adminService';
import { AdminUserDetailModal } from '@/components/admin/AdminUserDetailModal';
import { AdminDashboardOverview } from '@/components/admin/AdminDashboardOverview';
import { AdminNotificationCenter } from '@/components/admin/AdminNotificationCenter';
import { AdminSupportManager } from '@/components/admin/AdminSupportManager';
import { AdminReportsManager } from '@/components/admin/AdminReportsManager';
import { AdminSystemSettings } from '@/components/admin/AdminSystemSettings';
import { AdminSecurityManager } from '@/components/admin/AdminSecurityManager';

type EnterpriseTab =
  | 'dashboard'
  | 'users'
  | 'notifications'
  | 'support'
  | 'reports'
  | 'settings'
  | 'security';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/** Futuristic grid backdrop */
function CyberGridBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-[0.06] z-0">
      <svg width="100%" height="100%">
        <defs>
          <pattern id="admin-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00E0FF" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#admin-grid)" />
      </svg>
    </div>
  );
}

/** Standalone Enterprise Admin Login Portal */
function AdminPortalLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide valid administrative credentials.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!isAdminEmail(credential.user.email)) {
        await signOut(auth);
        setError(`Account ${credential.user.email} does not have administrative privileges.`);
      }
    } catch (err: any) {
      console.error('Admin portal auth error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setError('Invalid admin password or authorization key.');
      } else {
        setError(err.message || 'Failed to authenticate administrative session.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <CyberGridBackdrop />

      <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl top-1/4 left-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-950/90 border border-cyan-500/30 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10"
        style={{ boxShadow: '0 0 60px rgba(0, 224, 255, 0.12)' }}
      >
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                Enterprise Edition V3
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">AlphaNXT Admin Console</h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted management console for authorized system operators.
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-start gap-2 font-mono"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 font-mono text-xs">
          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-slate-400 flex justify-between">
              <span>Admin Email</span>
              <button
                type="button"
                onClick={() => setEmail(ADMIN_EMAIL)}
                className="text-cyan-400 hover:underline lowercase"
              >
                use default
              </button>
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@alphanxt.com"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] uppercase tracking-wider text-slate-400">
              Security Passkey
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
          >
            {busy ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                Authorize System Access
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-3">
          <button
            onClick={() => setLocation('/dashboard')}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Return to User Trading Terminal
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/** Standalone Admin Dashboard Console */
export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  const [activeTab, setActiveTab] = useState<EnterpriseTab>('dashboard');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);

  // Inactivity Auto-Logout Timer State
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);

  const resetActivity = useCallback(() => {
    setLastActivity(Date.now());
    if (showInactivityWarning) setShowInactivityWarning(false);
  }, [showInactivityWarning]);

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((evt) => window.addEventListener(evt, resetActivity));
    return () => events.forEach((evt) => window.removeEventListener(evt, resetActivity));
  }, [resetActivity]);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivity;
      // 14 mins warning (840,000 ms)
      if (elapsed > 840000 && elapsed < 900000) {
        setShowInactivityWarning(true);
      } else if (elapsed >= 900000) {
        // 15 mins auto-logout
        signOut(auth);
        setLocation('/login');
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [lastActivity, setLocation]);

  const loadUsers = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await listAllUsers();
      setUsers(rows);
    } catch (err) {
      console.error('Failed to load admin user list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user && isAdminEmail(user.email)) {
      loadUsers();
    }
  }, [user]);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.uid.toLowerCase().includes(q),
    );
  }, [users, search]);

  const handleAdminSignOut = async () => {
    await signOut(auth);
    setLocation('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030509] flex items-center justify-center text-cyan-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Block unauthorized users
  if (!user || !isAdminEmail(user.email)) {
    return <AdminPortalLogin />;
  }

  return (
    <div className="min-h-screen bg-[#030509] text-slate-100 flex flex-col relative font-sans selection:bg-cyan-500/30">
      <CyberGridBackdrop />

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050811]/90 backdrop-blur-md border-b border-cyan-500/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-md shadow-cyan-500/10">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">
                  AlphaNXT Admin Console
                </span>
                <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-cyan-500/30">
                  Enterprise V3
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Full-Control System Management & Financial Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM ONLINE 100%</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 font-mono">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px]">{user.email}</span>
            </div>

            <button
              onClick={() => setLocation('/dashboard')}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5 font-mono"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">User Terminal</span>
            </button>

            <button
              onClick={handleAdminSignOut}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 transition-colors flex items-center gap-1.5 font-mono"
              title="Sign Out Admin Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Console Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-6 py-6 space-y-6 relative z-10">
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 overflow-x-auto gap-2">
          <div className="flex gap-1.5 font-mono text-xs">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'User Registry', icon: Users },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'support', label: 'Support Tickets', icon: MessageSquare },
              { id: 'reports', label: 'Reports', icon: FileText },
              { id: 'settings', label: 'System Settings', icon: Settings },
              { id: 'security', label: 'Security & Audit', icon: ShieldAlert },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as EnterpriseTab)}
                  className={`px-3.5 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                    activeTab === t.id
                      ? 'bg-cyan-500 text-black font-bold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => loadUsers(true)}
            className="text-slate-400 hover:text-white p-2.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-mono shrink-0"
            title="Refresh System Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Tab 1: Executive Dashboard */}
        {activeTab === 'dashboard' && (
          <AdminDashboardOverview
            users={users}
            loading={loading}
            onSelectUser={(u) => setSelectedUser(u)}
          />
        )}

        {/* Tab 2: Searchable User Registry */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-96 font-mono text-xs">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user by name, email, or UID…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredUsers.length} of {users.length} trader accounts
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-cyan-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-sm font-mono">
                No user accounts found matching your search query.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredUsers.map((u, i) => (
                  <motion.button
                    key={u.uid}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    onClick={() => setSelectedUser(u)}
                    className="w-full flex items-center gap-3 bg-slate-950/70 border border-slate-800 hover:border-cyan-500/50 rounded-2xl p-4 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 text-cyan-400 font-bold font-mono text-sm group-hover:scale-105 transition-transform">
                      {u.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white truncate">{u.fullName}</p>
                        {u.title && (
                          <span className="bg-cyan-500/20 text-cyan-400 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-500/30 shrink-0">
                            {u.title}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate font-mono">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <p className="text-xs font-bold text-white">{fmt(u.virtualBalance)}</p>
                      <p
                        className={`text-[10px] ${
                          u.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {u.totalProfitLoss >= 0 ? '+' : ''}
                        {fmt(u.totalProfitLoss)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Notifications & Broadcasts */}
        {activeTab === 'notifications' && <AdminNotificationCenter users={users} />}

        {/* Tab 4: Support Ticket System */}
        {activeTab === 'support' && <AdminSupportManager />}

        {/* Tab 5: Reports & Exports */}
        {activeTab === 'reports' && <AdminReportsManager users={users} />}

        {/* Tab 6: System Settings & Engine */}
        {activeTab === 'settings' && <AdminSystemSettings />}

        {/* Tab 7: Security & Audit Logs */}
        {activeTab === 'security' && <AdminSecurityManager />}
      </main>

      {/* Selected User Full Profile Modal */}
      {selectedUser && (
        <AdminUserDetailModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => loadUsers(true)}
        />
      )}

      {/* Inactivity Warning Modal */}
      <AnimatePresence>
        {showInactivityWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 font-sans"
          >
            <div className="bg-[#070b14] border border-amber-500/40 rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Inactivity Session Warning</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Your administrative session has been idle. You will be automatically logged out in 60 seconds.
                </p>
              </div>
              <button
                onClick={resetActivity}
                className="w-full py-2.5 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs uppercase hover:bg-cyan-400 transition-all cursor-pointer"
              >
                Keep Me Logged In
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
