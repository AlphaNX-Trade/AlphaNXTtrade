import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Gift,
  PartyPopper,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

// Indian Market Holidays (NSE / BSE official calendar)
const MARKET_HOLIDAYS = [
  { date: '2026-01-26', name: 'Republic Day', type: 'Holiday' },
  { date: '2026-03-08', name: 'Mahashivratri', type: 'Holiday' },
  { date: '2026-03-25', name: 'Holi', type: 'Holiday' },
  { date: '2026-04-03', name: 'Good Friday', type: 'Holiday' },
  { date: '2026-04-14', name: 'Dr. Baba Saheb Ambedkar Jayanti', type: 'Holiday' },
  { date: '2026-05-01', name: 'Maharashtra Day', type: 'Holiday' },
  { date: '2026-08-15', name: 'Independence Day', type: 'Holiday' },
  { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', type: 'Holiday' },
  { date: '2026-11-01', name: 'Diwali Laxmi Pujan', type: 'Special Trading' },
  { date: '2026-12-25', name: 'Christmas', type: 'Holiday' },
];

export interface PersonalReminder {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

const STORAGE_KEY_REMINDERS = 'alphanxt_calendar_reminders_v5';

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { transactions } = useTransactionHistory(100);

  const [reminders, setReminders] = useState<PersonalReminder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REMINDERS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isAddReminderOpen, setIsAddReminderOpen] = useState(false);
  const [reminderTitle, setReminderTitle] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);

  // Map real trade dates
  const tradeEvents = useMemo(() => {
    if (!transactions) return [];
    return transactions.map((t) => {
      const dateStr = t.timestamp?.toDate
        ? t.timestamp.toDate().toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      return {
        id: t.id,
        date: dateStr,
        title: `${t.side === 'BUY' ? 'Bought' : 'Sold'} ${t.quantity} ${t.symbol}`,
        subtitle: `₹${t.price} per share (Total: ₹${t.totalAmount.toLocaleString('en-IN')})`,
        type: t.side,
      };
    });
  }, [transactions]);

  const handleAddReminder = () => {
    if (!reminderTitle.trim()) {
      toast({ title: 'Error', description: 'Reminder title cannot be empty', variant: 'destructive' });
      return;
    }

    const newItem: PersonalReminder = {
      id: `rem_${Date.now()}`,
      title: reminderTitle,
      date: reminderDate,
      completed: false,
    };

    const updated = [newItem, ...reminders];
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));

    setIsAddReminderOpen(false);
    setReminderTitle('');
    toast({ title: 'Reminder Set', description: `Saved reminder for ${reminderDate}` });
  };

  const toggleReminder = (id: string) => {
    const updated = reminders.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r));
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));
  };

  const deleteReminder = (id: string) => {
    const updated = reminders.filter((r) => r.id !== id);
    setReminders(updated);
    localStorage.setItem(STORAGE_KEY_REMINDERS, JSON.stringify(updated));
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-28">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/90 backdrop-blur-2xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/dashboard')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/80 cursor-pointer"
          aria-label="Back to dashboard"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <CalendarIcon className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Portfolio Calendar</span>
        </div>

        <button
          onClick={() => setIsAddReminderOpen(true)}
          className="p-1.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Reminder
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-18 pb-6 space-y-6">
        {/* Personal Reminders Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Personal Investment Reminders
            </h3>
          </div>

          {reminders.length === 0 ? (
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-center text-xs text-muted-foreground">
              No upcoming reminders set. Tap "+ Reminder" above to add SIP dates or review notes.
            </div>
          ) : (
            <div className="space-y-2">
              {reminders.map((rem) => (
                <div
                  key={rem.id}
                  className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleReminder(rem.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                        rem.completed
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>

                    <div>
                      <p
                        className={`text-xs font-semibold ${
                          rem.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                        }`}
                      >
                        {rem.title}
                      </p>
                      <p className="text-[10px] font-mono text-muted-foreground">{rem.date}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteReminder(rem.id)}
                    className="p-1 text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Real User Trade History Timeline */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Recent Trade Execution Dates
            </h3>
          </div>

          {tradeEvents.length === 0 ? (
            <div className="p-4 rounded-2xl bg-card/60 border border-border/60 text-center text-xs text-muted-foreground">
              No executed trades yet. Trades executed on Paper Trade will automatically populate here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tradeEvents.slice(0, 10).map((evt) => (
                <div
                  key={evt.id}
                  className="bg-card/80 backdrop-blur-xl border border-border/80 rounded-2xl p-3.5 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        evt.type === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {evt.type === 'BUY' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>

                    <div>
                      <p className="font-mono text-xs font-bold text-foreground">{evt.title}</p>
                      <p className="text-[11px] text-muted-foreground">{evt.subtitle}</p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono text-muted-foreground shrink-0">{evt.date}</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Market Holidays List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <PartyPopper className="w-3.5 h-3.5 text-amber-400" />
              Indian Market Holidays (NSE / BSE)
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-2">
            {MARKET_HOLIDAYS.map((hol, idx) => (
              <div
                key={idx}
                className="bg-card/70 backdrop-blur-md border border-border/80 rounded-2xl p-3 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono text-xs font-bold text-foreground">{hol.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{hol.date}</p>
                </div>

                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                    hol.type === 'Special Trading'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {hol.type}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Add Reminder Dialog */}
      <Dialog open={isAddReminderOpen} onOpenChange={setIsAddReminderOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card/95 backdrop-blur-2xl border-primary/20 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Add Personal Reminder
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Set dates for monthly SIPs, quarterly earnings checks, or rebalancing.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Reminder Title</label>
              <input
                type="text"
                placeholder="e.g. Monthly Nifty SIP Deposit"
                value={reminderTitle}
                onChange={(e) => setReminderTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Date</label>
              <input
                type="date"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-background border border-border focus:border-primary text-xs font-mono text-foreground outline-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddReminderOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddReminder}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md"
              >
                Save Reminder
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
