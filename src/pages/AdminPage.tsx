import { useEffect, useMemo, useState, type FormEvent } from 'react';
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
} from 'lucide-react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminEmail, ADMIN_EMAIL } from '@/lib/adminConfig';
import { listAllUsers, type AdminUserRow } from '@/lib/adminService';
import { AdminUserDetailSheet } from '@/components/admin/AdminUserDetailSheet';
import { AddStockForm } from '@/components/admin/AddStockForm';
import { useAllAssets } from '@/hooks/useAllAssets';

type Tab = 'users' | 'deploy' | 'system';

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

/** Subtle grid backdrop for the high-tech admin terminal aesthetic */
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

/** Standalone Admin Portal Sign-In Screen */
function AdminPortalLogin() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState(ADMIN_EMAIL);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide admin credentials.');
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
        setError('Invalid admin password or email.');
      } else {
        setError(err.message || 'Failed to authenticate admin session.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030509] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      <CyberGridBackdrop />

      {/* Glow effect */}
      <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl top-1/4 left-1/2 -translate-x-1/2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-slate-950/80 border border-primary/20 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-3 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5 mb-1">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                System Portal
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">AlphaNXT Admin Terminal</h1>
            <p className="text-xs text-slate-400 mt-1">
              Restricted management console for authorized system operators.
            </p>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 rounded-xl bg-red-950/60 border border-red-800/50 text-red-300 text-xs flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-400 flex justify-between">
              <span>Admin Email</span>
              <button
                type="button"
                onClick={() => setEmail(ADMIN_EMAIL)}
                className="text-primary hover:underline lowercase"
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
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              Passkey / Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-900/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/60 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50 cursor-pointer"
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
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1.5"
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
  const allAssets = useAllAssets();

  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);

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
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const totals = useMemo(
    () => ({
      userCount: users.length,
      totalBalance: users.reduce((sum, u) => sum + u.virtualBalance, 0),
      totalPL: users.reduce((sum, u) => sum + u.totalProfitLoss, 0),
    }),
    [users],
  );

  const handleAdminSignOut = async () => {
    await signOut(auth);
    setLocation('/login');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#030509] flex items-center justify-center text-primary">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // If user is not logged in or not authorized as an admin, render the separate Admin Login Portal
  if (!user || !isAdminEmail(user.email)) {
    return <AdminPortalLogin />;
  }

  return (
    <div className="min-h-screen bg-[#030509] text-slate-100 flex flex-col relative font-sans selection:bg-primary/30">
      <CyberGridBackdrop />

      {/* Top Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#050811]/90 backdrop-blur-md border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base text-white tracking-tight">
                  AlphaNXT Admin Terminal
                </span>
                <span className="bg-primary/20 text-primary font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-primary/30">
                  Control Console
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                System Administration & Paper Market Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 font-mono text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SYSTEM ONLINE</span>
            </div>

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300">
              <User className="w-3.5 h-3.5 text-primary" />
              <span className="font-mono text-[11px]">{user.email}</span>
            </div>

            <button
              onClick={() => setLocation('/dashboard')}
              className="text-xs text-slate-300 hover:text-white px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden sm:inline">User Terminal</span>
            </button>

            <button
              onClick={handleAdminSignOut}
              className="text-xs text-red-400 hover:text-red-300 px-3 py-2 rounded-lg bg-red-950/30 hover:bg-red-950/60 border border-red-900/40 transition-colors flex items-center gap-1.5"
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
        {/* Stat Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-primary/20 bg-slate-950/60 p-4 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider">Registered Users</span>
              <Users className="w-4 h-4 text-primary" />
            </div>
            <p className="font-mono text-xl md:text-2xl font-bold text-white">
              {loading ? '—' : totals.userCount.toString()}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Active trader accounts</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-2xl border border-primary/20 bg-slate-950/60 p-4 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider">Total Virtual Capital</span>
              <Wallet className="w-4 h-4 text-primary" />
            </div>
            <p className="font-mono text-xl md:text-2xl font-bold text-white">
              {loading ? '—' : fmt(totals.totalBalance)}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Circulating paper money</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-primary/20 bg-slate-950/60 p-4 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider">System Net P/L</span>
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <p
              className={`font-mono text-xl md:text-2xl font-bold ${
                totals.totalPL >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {loading ? '—' : `${totals.totalPL >= 0 ? '+' : ''}${fmt(totals.totalPL)}`}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Combined trader returns</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-primary/20 bg-slate-950/60 p-4 relative overflow-hidden backdrop-blur-sm"
          >
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="font-mono text-[10px] uppercase tracking-wider">Market Feeds</span>
              <Cpu className="w-4 h-4 text-primary" />
            </div>
            <p className="font-mono text-xl md:text-2xl font-bold text-white">
              {allAssets.length}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">Live market instruments</p>
          </motion.div>
        </div>

        {/* Console Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex gap-2">
            {[
              { id: 'users', label: 'User Registry', icon: Users },
              { id: 'deploy', label: 'Deploy Stocks', icon: Cpu },
              { id: 'system', label: 'Engine Health', icon: Server },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as Tab)}
                  className={`px-4 py-2.5 rounded-xl font-mono text-xs uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer ${
                    activeTab === t.id
                      ? 'bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => loadUsers(true)}
            className="text-slate-400 hover:text-white p-2 rounded-lg bg-slate-900 border border-slate-800 transition-colors flex items-center gap-1.5 text-xs font-mono"
            title="Refresh Registry Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Tab 1: User Registry */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search user by name or email…"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">
                Showing {filteredUsers.length} of {users.length} accounts
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-20 text-primary">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500 text-sm">
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
                    className="w-full flex items-center gap-3 bg-slate-950/70 border border-slate-800/90 hover:border-primary/50 rounded-2xl p-4 transition-all text-left group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary font-bold font-mono text-sm group-hover:scale-105 transition-transform">
                      {u.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-semibold text-white truncate">{u.fullName}</p>
                        {u.title && (
                          <span className="bg-primary/20 text-primary font-mono text-[9px] px-1.5 py-0.5 rounded border border-primary/30 shrink-0">
                            {u.title}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-xs font-bold text-white">{fmt(u.virtualBalance)}</p>
                      <p
                        className={`font-mono text-[10px] ${
                          u.totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {u.totalProfitLoss >= 0 ? '+' : ''}
                        {fmt(u.totalProfitLoss)}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-primary transition-colors shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Deploy Stocks */}
        {activeTab === 'deploy' && (
          <div className="max-w-2xl mx-auto">
            <AddStockForm />
          </div>
        )}

        {/* Tab 3: System Engine Health */}
        {activeTab === 'system' && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-primary" />
                <div>
                  <h2 className="text-base font-bold text-white">Real-Time Market Engine</h2>
                  <p className="text-xs text-slate-400">
                    Background simulation loop feed metrics
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-xs font-mono flex items-center gap-1.5">
                <Zap className="w-3 h-3 animate-pulse" /> Live Engine Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                <p className="font-mono text-[10px] text-slate-400 uppercase">Tick Interval</p>
                <p className="font-mono text-lg font-bold text-white">2,000 ms</p>
                <p className="text-[11px] text-slate-500">Sub-second price update frequency</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                <p className="font-mono text-[10px] text-slate-400 uppercase">Tracked Instruments</p>
                <p className="font-mono text-lg font-bold text-white">{allAssets.length} Assets</p>
                <p className="text-[11px] text-slate-500">Stocks, Indices, Commodities, Forex</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-xl space-y-1">
                <p className="font-mono text-[10px] text-slate-400 uppercase">Database Sync</p>
                <p className="font-mono text-lg font-bold text-emerald-400">Firestore Rules Ready</p>
                <p className="text-[11px] text-slate-500">Real-time snapshots enabled</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Active Market Instruments ({allAssets.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {allAssets.map((asset) => (
                  <div
                    key={asset.symbol}
                    className="bg-slate-900/90 border border-slate-800/80 p-2.5 rounded-xl text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{asset.symbol}</span>
                      <span
                        className={`font-mono text-[10px] ${
                          asset.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {asset.change >= 0 ? '+' : ''}
                        {asset.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <p className="font-mono text-slate-300">₹{asset.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Selected User Action Drawer */}
      {selectedUser && (
        <AdminUserDetailSheet
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onUpdated={() => loadUsers(true)}
        />
      )}
    </div>
  );
}
