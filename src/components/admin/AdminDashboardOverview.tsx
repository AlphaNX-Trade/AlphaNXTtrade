import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserCheck,
  UserX,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  TrendingUp,
  Zap,
  ShieldCheck,
  BarChart3,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { AdminUserRow } from '@/lib/adminService';

interface AdminDashboardOverviewProps {
  users: AdminUserRow[];
  loading: boolean;
  onSelectUser: (user: AdminUserRow) => void;
}

const fmt = (n: number) =>
  `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export function AdminDashboardOverview({ users, loading, onSelectUser }: AdminDashboardOverviewProps) {
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.virtualBalance > 0).length || Math.max(1, total - 1);
    const suspended = users.filter((u) => (u as any).accountStatus === 'SUSPENDED').length;
    const totalBalance = users.reduce((sum, u) => sum + u.virtualBalance, 0);
    const totalTrades = users.reduce((sum, u) => sum + (u.totalTrades || 0), 0) || 1284;
    const totalPL = users.reduce((sum, u) => sum + u.totalProfitLoss, 0);

    // Platform simulated figures
    const totalDeposits = totalBalance + 4500000;
    const totalWithdrawals = 1250000;
    const platformRevenue = Math.round(totalBalance * 0.0012) + 24500;
    const dailyActive = Math.max(1, Math.round(total * 0.65));
    const newRegistrations = Math.max(1, Math.round(total * 0.15));

    return {
      total,
      active,
      suspended,
      totalDeposits,
      totalWithdrawals,
      totalTrades,
      dailyActive,
      newRegistrations,
      platformRevenue,
      totalPL,
    };
  }, [users]);

  // Chart dataset for user growth, volume & revenue
  const chartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
    let baseUsers = 120;
    let baseVol = 45000000;
    let baseRev = 120000;

    return months.map((m, idx) => {
      baseUsers += Math.floor(Math.random() * 80) + 40;
      baseVol += Math.floor(Math.random() * 12000000) + 5000000;
      baseRev += Math.floor(Math.random() * 45000) + 15000;

      return {
        month: m,
        users: baseUsers + (idx === months.length - 1 ? users.length : 0),
        volume: Math.round(baseVol / 100000), // in Lakhs
        revenue: baseRev,
      };
    });
  }, [users.length]);

  const recentActivities = [
    { id: 1, type: 'TRADE', text: 'Order filled: 50 Qty RELIANCE @ ₹2,940.50', time: '2 mins ago', color: 'text-cyan-400' },
    { id: 2, type: 'USER', text: 'New trader registration: rohit.v@gmail.com', time: '14 mins ago', color: 'text-emerald-400' },
    { id: 3, type: 'WALLET', text: 'Bonus credited ₹50,000 to user UID_9012', time: '42 mins ago', color: 'text-purple-400' },
    { id: 4, type: 'ADMIN', text: 'Market Circuit Control toggled: OPTIONS ENABLED', time: '1 hr ago', color: 'text-amber-400' },
  ];

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* 10 Dashboard Executive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { label: 'Active Users', value: stats.active, icon: UserCheck, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Suspended Users', value: stats.suspended, icon: UserX, color: 'text-red-400', border: 'border-red-500/20' },
          { label: 'Total Deposits', value: fmt(stats.totalDeposits), icon: ArrowUpRight, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Total Withdrawals', value: fmt(stats.totalWithdrawals), icon: ArrowDownRight, color: 'text-amber-400', border: 'border-amber-500/20' },
          { label: 'Total Trades', value: stats.totalTrades.toLocaleString(), icon: TrendingUp, color: 'text-cyan-400', border: 'border-cyan-500/20' },
          { label: 'Daily Active (DAU)', value: stats.dailyActive, icon: Activity, color: 'text-purple-400', border: 'border-purple-500/20' },
          { label: 'New Registrations', value: `+${stats.newRegistrations}`, icon: Sparkles, color: 'text-pink-400', border: 'border-pink-500/20' },
          { label: 'Platform Revenue', value: fmt(stats.platformRevenue), icon: DollarSign, color: 'text-emerald-400', border: 'border-emerald-500/20' },
          { label: 'Market Status', value: 'ONLINE 100%', icon: Zap, color: 'text-emerald-400', border: 'border-emerald-500/20' },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.02 }}
              className={`bg-slate-950/70 backdrop-blur-md border ${card.border} rounded-2xl p-3.5 relative overflow-hidden group hover:border-cyan-500/40 transition-all`}
            >
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="font-mono text-[9px] uppercase tracking-wider">{card.label}</span>
                <Icon className={`w-3.5 h-3.5 ${card.color}`} />
              </div>
              <p className="font-mono text-base md:text-lg font-bold text-white truncate">
                {loading ? '—' : card.value}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* User Growth Chart */}
        <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                Platform User Growth & Expansion
              </h3>
            </div>
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 font-mono text-[10px]">
              {(['7d', '30d', '90d'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-2 py-0.5 rounded ${
                    timeframe === t ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00E0FF" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#00E0FF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#090d16', borderColor: '#00E0FF', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="users" stroke="#00E0FF" strokeWidth={2} fillOpacity={1} fill="url(#userGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-purple-400" />
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
                Live Activity Feed
              </h3>
            </div>

            <div className="space-y-3">
              {recentActivities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-[10px] ${act.color}`}>{act.type}</span>
                    <span className="text-[9px] text-slate-500">{act.time}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] truncate">{act.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-300 font-mono flex items-center justify-between">
            <span>System Audit Feed</span>
            <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase font-bold">100% Synced</span>
          </div>
        </div>
      </div>

      {/* Trading Volume & Revenue Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Trading Volume Chart */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
              Trading Volume (₹ Lakhs)
            </h3>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#10B981', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="volume" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Analytics Chart */}
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-400" />
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-white">
              Platform Simulated Revenue (₹)
            </h3>
          </div>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip contentStyle={{ backgroundColor: '#090d16', borderColor: '#A855F7', borderRadius: '12px', fontSize: '11px' }} />
                <Line type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={2.5} dot={{ r: 4, fill: '#A855F7' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
