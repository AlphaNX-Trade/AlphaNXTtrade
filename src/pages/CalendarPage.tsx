import { useState, useMemo } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  Building2,
  Rocket,
  Globe2,
  Bell,
  X,
} from 'lucide-react';
import { useTransactionHistory } from '@/hooks/useTransactionHistory';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';
import { formatCurrency } from '@/lib/formatters';
import { triggerHaptic } from '@/lib/haptics';

// Indian Market Holidays (NSE / BSE official calendar)
const MARKET_HOLIDAYS = [
  { date: '2026-01-26', name: 'Republic Day', day: 'Monday', type: 'Holiday' },
  { date: '2026-03-08', name: 'Mahashivratri', day: 'Sunday', type: 'Holiday' },
  { date: '2026-03-25', name: 'Holi', day: 'Wednesday', type: 'Holiday' },
  { date: '2026-04-03', name: 'Good Friday', day: 'Friday', type: 'Holiday' },
  { date: '2026-04-14', name: 'Dr. Baba Saheb Ambedkar Jayanti', day: 'Tuesday', type: 'Holiday' },
  { date: '2026-05-01', name: 'Maharashtra Day', day: 'Friday', type: 'Holiday' },
  { date: '2026-08-15', name: 'Independence Day', day: 'Saturday', type: 'Holiday' },
  { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', day: 'Friday', type: 'Holiday' },
  { date: '2026-11-01', name: 'Diwali Laxmi Pujan (Muhurat Trading)', day: 'Sunday', type: 'Special Trading' },
  { date: '2026-12-25', name: 'Christmas', day: 'Friday', type: 'Holiday' },
];

const MARKET_TIMINGS = [
  { session: 'Pre-Open Session', time: '09:00 AM – 09:15 AM', desc: 'Order entry, modification & price discovery' },
  { session: 'Normal Trading Hours', time: '09:15 AM – 03:30 PM', desc: 'Continuous trading for Equities, F&O & Commodities' },
  { session: 'Block Window Session', time: '08:45 AM & 02:05 PM', desc: 'Large institutional transactions' },
  { session: 'Post-Closing Session', time: '03:40 PM – 04:00 PM', desc: 'Closing price trades & position settlements' },
];

const UPCOMING_EARNINGS = [
  { symbol: 'RELIANCE', company: 'Reliance Industries Ltd.', date: '14 Aug 2026', period: 'Q1 FY27', estimate: '₹22,400 Cr EPS' },
  { symbol: 'TCS', company: 'Tata Consultancy Services', date: '18 Aug 2026', period: 'Q1 FY27', estimate: '₹12,800 Cr EPS' },
  { symbol: 'HDFCBANK', company: 'HDFC Bank Ltd.', date: '22 Aug 2026', period: 'Q1 FY27', estimate: '₹17,500 Cr EPS' },
  { symbol: 'INFY', company: 'Infosys Ltd.', date: '28 Aug 2026', period: 'Q1 FY27', estimate: '₹6,900 Cr EPS' },
  { symbol: 'TATAMOTORS', company: 'Tata Motors Ltd.', date: '04 Sep 2026', period: 'Q1 FY27', estimate: '₹4,100 Cr EPS' },
];

const UPCOMING_IPOS = [
  { name: 'Swiggy FoodTech Ltd.', priceBand: '₹371 – ₹390', openDate: '12 Aug 2026', closeDate: '14 Aug 2026', lotSize: '38 Shares', status: 'Bidding Open' },
  { name: 'NSE India Ltd. (Mainboard)', priceBand: '₹1,250 – ₹1,300', openDate: '24 Aug 2026', closeDate: '27 Aug 2026', lotSize: '12 Shares', status: 'Upcoming' },
  { name: 'Hyundai Motor India', priceBand: '₹1,860 – ₹1,960', openDate: '08 Sep 2026', closeDate: '10 Sep 2026', lotSize: '7 Shares', status: 'Announced' },
];

const ECONOMIC_EVENTS = [
  { event: 'RBI Monetary Policy Decision', date: '12 Aug 2026', impact: 'High', details: 'Repo Rate Decision (Expected: Pause 6.50%)' },
  { event: 'US Federal Reserve Interest Rate', date: '20 Aug 2026', impact: 'High', details: 'FOMC Rate Stance' },
  { event: 'India CPI Inflation Data', date: '12 Aug 2026', impact: 'Medium', details: 'July Consumer Price Index' },
  { event: 'India Industrial Production (IIP)', date: '14 Aug 2026', impact: 'Medium', details: 'Factory output index' },
];

export default function CalendarPage() {
  const [, setLocation] = useLocation();
  const { transactions } = useTransactionHistory(100);

  const [activeTab, setActiveTab] = useState<'HOLIDAYS' | 'TIMINGS' | 'EARNINGS' | 'IPOS' | 'EVENTS'>('HOLIDAYS');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 h-14 flex items-center justify-between px-4 max-w-5xl mx-auto">
        <button
          onClick={() => setLocation('/dashboard')}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-base flex items-center gap-2">
          <CalendarIcon className="w-4 h-4 text-emerald-500" />
          Market Calendar & Events
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Calendar Hero Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white border border-emerald-800/50 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Live Market Schedule
              </span>
              <h2 className="text-2xl font-black mt-1">
                NSE / BSE Trading Calendar
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-md">
                Stay updated with trading holidays, quarterly result announcements, initial public offerings (IPOs), and central bank monetary policy dates.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shrink-0 text-center">
              <span className="text-xs text-slate-300 block font-medium">Market Status</span>
              <span className="text-sm font-extrabold text-emerald-400 flex items-center justify-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Open (09:15 - 15:30 IST)
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs font-bold border-b border-slate-200 dark:border-slate-800">
          {[
            { id: 'HOLIDAYS', label: 'Trading Holidays' },
            { id: 'TIMINGS', label: 'Market Timings' },
            { id: 'EARNINGS', label: 'Earnings Calendar' },
            { id: 'IPOS', label: 'IPO Calendar' },
            { id: 'EVENTS', label: 'Economic Events' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                triggerHaptic('light');
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-xl whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white font-extrabold shadow-xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Trading Holidays */}
        {activeTab === 'HOLIDAYS' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official NSE / BSE Holidays</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MARKET_HOLIDAYS.map((hol, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-emerald-500 font-extrabold text-xs">
                      {hol.date.substring(8, 10)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{hol.name}</h4>
                      <p className="text-xs text-slate-500">{hol.day} • {hol.date}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    hol.type === 'Special Trading'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {hol.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Market Timings */}
        {activeTab === 'TIMINGS' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indian Stock Market Trading Hours (IST)</h3>
            <div className="space-y-3">
              {MARKET_TIMINGS.map((tm, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{tm.session}</h4>
                    <p className="text-xs text-slate-500">{tm.desc}</p>
                  </div>
                  <span className="font-extrabold text-sm text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                    {tm.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Earnings Calendar */}
        {activeTab === 'EARNINGS' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming Quarterly Results</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {UPCOMING_EARNINGS.map((earn, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 font-extrabold text-xs flex items-center justify-center">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{earn.symbol}</h4>
                      <p className="text-xs text-slate-500">{earn.company}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{earn.date}</span>
                    <span className="text-[10px] text-blue-500 font-semibold">{earn.period}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: IPO Calendar */}
        {activeTab === 'IPOS' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Public Offerings (IPOs)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {UPCOMING_IPOS.map((ipo, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-purple-500" /> {ipo.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400">
                      {ipo.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-slate-500 text-[10px] block">Price Band</span>
                      <strong className="text-slate-800 dark:text-slate-200">{ipo.priceBand}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px] block">Bidding Dates</span>
                      <strong className="text-slate-800 dark:text-slate-200">{ipo.openDate}</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 text-[10px] block">Lot Size</span>
                      <strong className="text-emerald-500">{ipo.lotSize}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Economic Events */}
        {activeTab === 'EVENTS' && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Global & Domestic Economic Indicators</h3>
            <div className="space-y-3">
              {ECONOMIC_EVENTS.map((ev, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 font-bold text-xs flex items-center justify-center">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ev.event}</h4>
                      <p className="text-xs text-slate-500">{ev.details}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{ev.date}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500">
                      {ev.impact} Impact
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
      <QuickActionsMenu />
    </div>
  );
}
