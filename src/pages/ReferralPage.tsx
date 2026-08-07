import { useState, FormEvent } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  Trophy,
  History,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import { useReferralProgram } from '@/hooks/useReferralProgram';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/formatters';

export default function ReferralPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const {
    referralCode,
    referralLink,
    referredFriends,
    totalRewardsEarned,
    leaderboard,
    simulateInvite,
  } = useReferralProgram();

  const [copied, setCopied] = useState(false);
  const [friendNameInput, setFriendNameInput] = useState('');
  const [friendEmailInput, setFriendEmailInput] = useState('');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast({ title: 'Link Copied', description: 'Referral link copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInvite = (e: FormEvent) => {
    e.preventDefault();
    if (!friendNameInput.trim() || !friendEmailInput.trim()) return;

    simulateInvite(friendNameInput, friendEmailInput);
    toast({
      title: 'Invite Sent!',
      description: `Sent invitation to ${friendNameInput}. Reward will credit upon first trade!`,
    });
    setFriendNameInput('');
    setFriendEmailInput('');
  };

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
          <Gift className="w-4 h-4 text-amber-500" />
          Invite & Earn Program
        </h1>
        <div className="w-8" />
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-5 space-y-6">
        {/* Referral Reward Banner */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white border border-amber-900/40 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-mono font-bold">
                Earn ₹500 Bonus Credits Per Friend
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Invite Friends to Trade on AlphaNXT
              </h2>
              <p className="text-xs text-slate-300 max-w-md">
                Give your friends free virtual starting capital. When they place their first trade, you both receive bonus portfolio credits!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-right shrink-0">
              <span className="text-xs text-slate-300 font-medium block">Total Rewards Earned</span>
              <span className="text-2xl font-black text-amber-400">{formatCurrency(totalRewardsEarned)}</span>
            </div>
          </div>
        </div>

        {/* Unique Referral Code Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Your Unique Referral Code</h3>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="w-full sm:flex-1 h-12 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between font-mono font-black text-sm text-slate-900 dark:text-white">
              <span>{referralCode}</span>
              <span className="text-xs font-normal text-slate-400">Code</span>
            </div>

            <button
              onClick={handleCopyLink}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied Link' : 'Copy Invite Link'}
            </button>
          </div>
        </div>

        {/* Invite Friend Direct Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Send className="w-4 h-4 text-amber-500" /> Direct Invite
          </h3>

          <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Friend's Name"
              value={friendNameInput}
              onChange={(e) => setFriendNameInput(e.target.value)}
              className="h-11 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              required
            />
            <input
              type="email"
              placeholder="Friend's Email"
              value={friendEmailInput}
              onChange={(e) => setFriendEmailInput(e.target.value)}
              className="h-11 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              required
            />
            <button
              type="submit"
              className="h-11 px-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center justify-center gap-1 hover:opacity-90 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Send Invitation
            </button>
          </form>
        </div>

        {/* Referral Leaderboard */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" /> Referral Leaderboard
          </h3>

          <div className="space-y-2">
            {leaderboard.map((item) => (
              <div
                key={item.name}
                className={`p-3.5 rounded-2xl flex items-center justify-between border ${
                  item.isCurrentUser
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 font-bold'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                      item.rank === 1
                        ? 'bg-amber-500 text-slate-950'
                        : item.rank === 2
                        ? 'bg-slate-300 text-slate-900'
                        : item.rank === 3
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    #{item.rank}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                      {item.name} {item.isCurrentUser ? '(You)' : ''}
                    </h4>
                    <p className="text-[10px] text-slate-400">{item.referralsCount} Successful Invites</p>
                  </div>
                </div>

                <span className="font-extrabold text-xs text-amber-500">+{formatCurrency(item.totalEarned)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invited Friends History */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" /> Invited Friends History
          </h3>

          <div className="space-y-3">
            {referredFriends.map((f) => (
              <div
                key={f.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{f.name}</h4>
                  <p className="text-[10px] text-slate-400">{f.email} • Invited on {f.joinedAt}</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-emerald-500 block">+{formatCurrency(f.rewardAmount)}</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-500">
                    {f.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
