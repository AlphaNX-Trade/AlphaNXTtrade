import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Send,
  Lock,
  User,
  ShieldCheck,
  Plus,
  Loader2,
  Tag,
} from 'lucide-react';
import {
  fetchSupportTickets,
  updateTicketStatus,
  addTicketReply,
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from '@/lib/supportAdminService';
import { useAuth } from '@/contexts/AuthContext';
import { AdminConfirmationModal } from '@/components/admin/AdminConfirmationModal';

export function AdminSupportManager() {
  const { user: currentAdmin } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  const [replyText, setReplyText] = useState('');
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [busy, setBusy] = useState(false);

  // Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionLabel?: string;
    onConfirm: (reason: string) => Promise<void> | void;
  }>({ isOpen: false, title: '', description: '', onConfirm: () => {} });

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await fetchSupportTickets();
      setTickets(data);
      if (data.length > 0 && !selectedTicket) {
        setSelectedTicket(data[0]);
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      t.userName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setBusy(true);
    try {
      await addTicketReply(
        currentAdmin?.email || 'Admin',
        currentAdmin?.uid || 'admin',
        selectedTicket.id,
        replyText,
        isInternalNote,
      );
      setReplyText('');
      await loadTickets();
      // Keep selected ticket refreshed
      const updated = (await fetchSupportTickets()).find((t) => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    } catch (err) {
      console.error('Failed to send reply:', err);
    } finally {
      setBusy(false);
    }
  };

  const handleStatusChange = (nextStatus: TicketStatus) => {
    if (!selectedTicket) return;

    setConfirmModal({
      isOpen: true,
      title: `Update Ticket Status to ${nextStatus}`,
      description: `Change status of ${selectedTicket.id} (${selectedTicket.subject}) to ${nextStatus}.`,
      actionLabel: `Set ${nextStatus}`,
      onConfirm: async (reason) => {
        await updateTicketStatus(
          currentAdmin?.email || 'Admin',
          currentAdmin?.uid || 'admin',
          selectedTicket.id,
          nextStatus,
          reason,
        );
        await loadTickets();
        const updated = (await fetchSupportTickets()).find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      },
    });
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets by ID, subject, or user..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12 text-cyan-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Ticket List */}
          <div className="space-y-2 lg:col-span-1 max-h-[600px] overflow-y-auto pr-1">
            {filteredTickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  selectedTicket?.id === ticket.id
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-cyan-400 font-bold">{ticket.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded font-bold uppercase ${
                      ticket.priority === 'URGENT'
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : ticket.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </div>

                <p className="font-bold text-xs text-white line-clamp-1">{ticket.subject}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>{ticket.userName}</span>
                  <span className="text-emerald-400 font-bold uppercase">{ticket.status}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Detail & Thread */}
          {selectedTicket ? (
            <div className="lg:col-span-2 bg-slate-950/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono text-xs text-slate-400 mb-1">
                      <span className="text-cyan-400 font-bold">{selectedTicket.id}</span>
                      <span>•</span>
                      <span>{selectedTicket.category}</span>
                    </div>
                    <h3 className="text-base font-bold text-white">{selectedTicket.subject}</h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      User: {selectedTicket.userName} ({selectedTicket.userEmail})
                    </p>
                  </div>

                  <div className="flex items-center gap-1 font-mono text-xs">
                    {(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleStatusChange(st)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold cursor-pointer transition-colors ${
                          selectedTicket.status === st
                            ? 'bg-cyan-500 text-black font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message Thread */}
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {selectedTicket.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-xl text-xs space-y-1 ${
                        msg.isInternalNote
                          ? 'bg-amber-950/40 border border-amber-800/50 text-amber-200'
                          : msg.sender === 'ADMIN'
                          ? 'bg-cyan-950/30 border border-cyan-800/40 text-cyan-200 ml-6'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 mr-6'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                        <span className="font-bold">
                          {msg.isInternalNote ? '🔒 INTERNAL STAFF NOTE' : msg.senderName}
                        </span>
                        <span>{new Date(msg.timestamp).toLocaleTimeString('en-IN')}</span>
                      </div>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <label className="text-slate-400 uppercase">Write Response</label>
                  <label className="flex items-center gap-1.5 text-amber-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternalNote}
                      onChange={(e) => setIsInternalNote(e.target.checked)}
                      className="rounded border-slate-800"
                    />
                    <span>Internal Staff Note</span>
                  </label>
                </div>

                <div className="flex gap-2 font-mono text-xs">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={isInternalNote ? 'Write internal note visible only to admins...' : 'Reply to user...'}
                    rows={2}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={busy || !replyText.trim()}
                    className="px-4 rounded-xl bg-cyan-500 text-black font-bold uppercase hover:bg-cyan-400 disabled:opacity-40 transition-all flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 bg-slate-950/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 font-mono text-xs">
              Select a support ticket to review messages and reply.
            </div>
          )}
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
