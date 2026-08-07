import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  Trophy,
  ChevronLeft,
  TrendingUp,
  Activity,
  Award,
  Users,
  UserCheck,
  UserPlus,
  Lock,
  User,
  Medal,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { LeaderboardEntry, LeaderboardType, LeaderboardTimeframe } from '@/types/community';
import { fetchLeaderboards, followUser, unfollowUser } from '@/lib/communityService';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { UserAvatar } from '@/components/common/UserAvatar';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { useToast } from '@/hooks/use-toast';

export default function LeaderboardPage() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const [leaderboardType, setLeaderboardType] = useState<LeaderboardType>('return');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('alltime');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboards(leaderboardType, timeframe)
      .then((res) => {
        setEntries(res);
      })
      .catch((err) => {
        console.error('Leaderboard error:', err);
      })
      .finally(() => setLoading(false));
  }, [leaderboardType, timeframe]);

  const top3 = entries.slice(0, 3);
  const remaining = entries.slice(3);

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-4xl mx-auto pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/80 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLocation('/community')}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-base text-foreground leading-none">Trader Leaderboard</h1>
              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                Top Performers & Active Community
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Category & Timeframe Controls */}
      <div className="p-4 space-y-3 bg-card/40 border-b border-border/50">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
          {[
            { id: 'return', label: 'Highest Return', icon: TrendingUp },
            { id: 'activity', label: 'Most Active', icon: Activity },
            { id: 'level', label: 'Highest Level', icon: Award },
            { id: 'referrals', label: 'Top Referrals', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = leaderboardType === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLeaderboardType(tab.id as LeaderboardType)}
                className={`py-2 px-2.5 rounded-xl border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 font-bold shadow-sm'
                    : 'bg-card/80 border-border/80 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Timeframe Filter */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Time Horizon
          </span>
          <div className="flex items-center gap-1 font-mono text-xs bg-secondary/50 p-1 rounded-xl border border-border">
            {[
              { id: 'daily', label: '1D' },
              { id: 'weekly', label: '1W' },
              { id: 'monthly', label: '1M' },
              { id: 'alltime', label: 'ALL' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id as LeaderboardTimeframe)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Leaderboard Display */}
      <main className="flex-1 p-4 space-y-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-48 bg-card border border-border/80 rounded-3xl animate-pulse" />
            <div className="h-64 bg-card border border-border/80 rounded-3xl animate-pulse" />
          </div>
        ) : entries.length === 0 ? (
          <div className="bg-card/50 border border-border/80 rounded-3xl p-10 text-center space-y-2">
            <Trophy className="w-10 h-10 text-muted-foreground mx-auto opacity-40" />
            <p className="font-bold text-base text-foreground">No leaderboard data yet</p>
            <p className="text-xs text-muted-foreground">Start trading or posting to claim the #1 spot!</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Section */}
            {top3.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 pb-2 font-mono">
                {/* 2nd Place */}
                {top3[1] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => setLocation(`/profile/${top3[1].uid}`)}
                    className="bg-card/90 border border-slate-400/40 rounded-2xl p-3 text-center space-y-2 cursor-pointer hover:border-slate-400 transition-all shadow-sm"
                  >
                    <div className="relative inline-block mx-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-500/20 border-2 border-slate-400 flex items-center justify-center overflow-hidden mx-auto">
                        {top3[1].avatarUrl ? (
                          <img src={top3[1].avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-slate-950 font-bold text-[10px] px-2 py-0.2 rounded-full shadow">
                        #2
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-foreground truncate">{top3[1].fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{top3[1].level}</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">{top3[1].displayMetric}</p>
                    </div>
                  </motion.div>
                )}

                {/* 1st Place (Gold Podium) */}
                {top3[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border-2 border-amber-500/80 rounded-3xl p-4 text-center space-y-2.5 cursor-pointer hover:border-amber-400 transition-all shadow-lg relative -translate-y-2"
                  >
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-amber-500 text-slate-950 font-bold text-[9px] uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
                        <Trophy className="w-3 h-3" /> Champion
                      </span>
                    </div>

                    <div className="relative inline-block mx-auto pt-1">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center overflow-hidden mx-auto shadow-inner">
                        {top3[0].avatarUrl ? (
                          <img src={top3[0].avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-7 h-7 text-amber-400" />
                        )}
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-bold text-[10px] px-2.5 py-0.2 rounded-full shadow">
                        #1
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-sm sm:text-base text-foreground truncate">{top3[0].fullName}</p>
                      <p className="text-[10px] text-amber-400 font-semibold">{top3[0].title || top3[0].level}</p>
                      <p className="text-sm font-bold text-amber-400 mt-1">{top3[0].displayMetric}</p>
                    </div>
                  </motion.div>
                )}

                {/* 3rd Place */}
                {top3[2] && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => setLocation(`/profile/${top3[2].uid}`)}
                    className="bg-card/90 border border-amber-700/40 rounded-2xl p-3 text-center space-y-2 cursor-pointer hover:border-amber-700 transition-all shadow-sm"
                  >
                    <div className="relative inline-block mx-auto">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-800/20 border-2 border-amber-700 flex items-center justify-center overflow-hidden mx-auto">
                        {top3[2].avatarUrl ? (
                          <img src={top3[2].avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-amber-700" />
                        )}
                      </div>
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-amber-700 text-amber-100 font-bold text-[10px] px-2 py-0.2 rounded-full shadow">
                        #3
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-foreground truncate">{top3[2].fullName}</p>
                      <p className="text-[10px] text-muted-foreground">{top3[2].level}</p>
                      <p className="text-xs font-bold text-amber-600 mt-1">{top3[2].displayMetric}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Remaining Rankings List Table */}
            <div className="bg-card/90 backdrop-blur-xl border border-border/80 rounded-3xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-border/80 flex items-center justify-between font-mono text-xs text-muted-foreground">
                <span>Rank & Trader</span>
                <span>Performance</span>
              </div>

              <div className="divide-y divide-border/50">
                {entries.map((entry) => (
                  <div
                    key={entry.uid}
                    onClick={() => setLocation(`/profile/${entry.uid}`)}
                    className="p-3.5 flex items-center justify-between gap-3 hover:bg-secondary/40 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-xs text-muted-foreground w-6 text-center">
                        #{entry.rank}
                      </span>

                      <UserAvatar
                        src={entry.avatarUrl}
                        name={entry.fullName}
                        frame={entry.avatarFrame as any}
                        size="sm"
                      />

                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="font-semibold text-sm text-foreground">{entry.fullName}</p>
                          {entry.title && (
                            <span className="bg-cyan-500/10 text-cyan-400 font-mono text-[9px] px-1.5 py-0.2 rounded border border-cyan-500/30">
                              {entry.title}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] font-mono text-muted-foreground">
                          {entry.username ? `@${entry.username} • ` : ''}
                          {entry.level}
                        </p>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <p className="font-bold text-sm text-primary">{entry.displayMetric}</p>
                      {!entry.isPortfolioPublic && (
                        <p className="text-[9px] text-amber-400 flex items-center justify-end gap-0.5">
                          <Lock className="w-2.5 h-2.5" /> Private
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
