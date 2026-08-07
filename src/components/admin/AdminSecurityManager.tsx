import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  Lock,
  Smartphone,
  Globe,
  Clock,
  LogOut,
  Search,
  Filter,
  User,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  KeyRound,
  Shield,
  Download,
} from 'lucide-react';
import { getAuditLogs, AuditLogEntry } from '@/lib/auditLogService';
import { useAuth } from '@/contexts/AuthContext';
import { AdminConfirmationModal } from '@/components/admin/AdminConfirmationModal';
import { downloadCsvReport } from '@/lib/reportsAdminService';

export function AdminSecurityManager() {
  const { user: currentAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'audit' | 'sessions' | 'rbac'>('audit');

  // Role-based state
  const [currentRole, setCurrentRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT'>('SUPER_ADMIN');

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Sessions State
  const [sessions, setSessions] = useState([
    {
      id: 'sess-1001',
      adminEmail: currentAdmin?.email || 'admin.alphanxt@gmail.com',
      ipAddress: '103.211.54.12',
      device: 'MacBook Pro (Chrome 128.0)',
      location: 'Mumbai, MH, India',
      loginTime: new Date().toLocaleTimeString('en-IN'),
      isCurrent: true,
    },
    {
      id: 'sess-1002',
      adminEmail: currentAdmin?.email || 'admin.alphanxt@gmail.com',
      ipAddress: '49.36.192.44',
      device: 'AlphaNXT Workstation (Firefox 126.0)',
      location: 'Bengaluru, KA, India',
      loginTime: '4 hours ago',
      isCurrent: false,
    },
  ]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: (reason: string) => Promise<void> | void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await getAuditLogs(200);
      setLogs(data);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.actionName.toLowerCase().includes(search.toLowerCase()) ||
      l.adminEmail.toLowerCase().includes(search.toLowerCase()) ||
      (l.targetEmail || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || l.actionCategory === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleKillSession = (sessionId: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Terminate Active Session (${sessionId})`,
      description: 'This will immediately revoke authentication tokens and terminate the session.',
      actionLabel: 'Kill Session',
      onConfirm: async (reason) => {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      },
    });
  };

  const handleExportLogsCsv = () => {
    const data = {
      title: 'Admin Audit Log Export',
      generatedAt: new Date().toLocaleString('en-IN'),
      totalRecords: filteredLogs.length,
      headers: ['Timestamp', 'Admin Email', 'Category', 'Action', 'Target', 'Reason', 'Details'],
      rows: filteredLogs.map((l) => [
        l.timestamp,
        l.adminEmail,
        l.actionCategory,
        l.actionName,
        l.targetEmail || l.targetUid || '—',
        l.reason || '—',
        l.details || '—',
      ]),
    };
    downloadCsvReport(data, `AuditLogs_${Date.now()}`);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Sub tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono text-xs">
        <div className="flex gap-2">
          {[
            { id: 'audit', label: 'Immutable Audit Logs', icon: ShieldCheck },
            { id: 'sessions', label: 'Active Admin Sessions', icon: Globe },
            { id: 'rbac', label: 'Role & Permissions (RBAC)', icon: Lock },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`px-3.5 py-2 rounded-xl font-bold uppercase transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === t.id
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-800/40">
          Role: <strong className="uppercase">{currentRole}</strong>
        </span>
      </div>

      {/* Tab 1: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
            <div className="relative flex-1 w-full font-mono text-xs">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search audit log by admin, action, or target email..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="ALL">All Categories</option>
                <option value="WALLET">Wallet</option>
                <option value="USER">User</option>
                <option value="MARKET">Market</option>
                <option value="NOTIFICATION">Notification</option>
                <option value="SECURITY">Security</option>
              </select>

              <button
                onClick={handleExportLogsCsv}
                className="px-3 py-2 rounded-xl bg-cyan-500 text-black font-bold uppercase hover:bg-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 font-mono text-xs overflow-x-auto">
            {loadingLogs ? (
              <div className="flex justify-center py-12 text-cyan-400">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase">
                    <th className="p-2.5">Time</th>
                    <th className="p-2.5">Admin</th>
                    <th className="p-2.5">Category</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Target</th>
                    <th className="p-2.5">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredLogs.map((log, idx) => (
                    <tr key={idx} className="hover:bg-slate-900/40">
                      <td className="p-2.5 text-slate-400 text-[10px]">
                        {new Date(log.timestamp).toLocaleString('en-IN')}
                      </td>
                      <td className="p-2.5 text-cyan-400 font-bold">{log.adminEmail}</td>
                      <td className="p-2.5">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-[9px] uppercase border border-slate-800">
                          {log.actionCategory}
                        </span>
                      </td>
                      <td className="p-2.5 text-white font-bold">{log.actionName}</td>
                      <td className="p-2.5 text-emerald-400">{log.targetEmail || log.targetUid || '—'}</td>
                      <td className="p-2.5 text-slate-300 text-[11px]">{log.reason || log.details || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Sessions */}
      {activeTab === 'sessions' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-3">
            <h3 className="font-bold text-white text-sm">Active Authorized Admin Sessions</h3>
            <div className="space-y-2">
              {sessions.map((sess) => (
                <div
                  key={sess.id}
                  className="bg-slate-900/60 border border-slate-800 p-3.5 rounded-xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{sess.device}</span>
                      {sess.isCurrent && (
                        <span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                          Current Device
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      IP: <span className="text-cyan-400">{sess.ipAddress}</span> • Location: {sess.location} • Admin: {sess.adminEmail}
                    </p>
                  </div>

                  {!sess.isCurrent && (
                    <button
                      onClick={() => handleKillSession(sess.id)}
                      className="px-3 py-1.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 text-[10px] font-bold uppercase hover:bg-red-500/30 cursor-pointer"
                    >
                      Kill Session
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: RBAC Roles */}
      {activeTab === 'rbac' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white text-sm">Role-Based Access Control Matrix (RBAC)</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { role: 'SUPER_ADMIN', desc: 'Unrestricted access to all admin operations, system settings, & role assignments.', permissions: ['All Operations', 'System Settings', 'Financial Debits', 'Role Control'] },
                { role: 'ADMIN', desc: 'Full user management, financial adjustments, & notifications.', permissions: ['User Controls', 'Wallet Mod', 'Support Tickets', 'Reports'] },
                { role: 'MODERATOR', desc: 'User moderation, account suspensions, & support tickets.', permissions: ['User Moderation', 'Support Tickets', 'View Reports'] },
                { role: 'SUPPORT', desc: 'Help desk response & basic account status inspection.', permissions: ['Support Tickets', 'User Detail View'] },
              ].map((r) => (
                <div
                  key={r.role}
                  onClick={() => setCurrentRole(r.role as any)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                    currentRole === r.role
                      ? 'bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <p className="font-bold text-white">{r.role}</p>
                  <p className="text-[10px] text-slate-400">{r.desc}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {r.permissions.map((p) => (
                      <span key={p} className="bg-slate-950 px-1.5 py-0.5 rounded text-[8px] text-cyan-400 border border-slate-800">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
