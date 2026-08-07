import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  Trophy,
  Lock,
  Zap,
  Award,
  TrendingUp,
  ShieldCheck,
  PieChart,
  GraduationCap,
  Sparkles,
  DollarSign,
} from 'lucide-react';
import { useAchievementsV5 } from '@/hooks/useAchievementsV5';
import { BottomNav } from '@/components/dashboard/BottomNav';
import { QuickActionsMenu } from '@/components/dashboard/QuickActionsMenu';

const ICON_MAP: Record<string, any> = {
  TrendingUp,
  Zap,
  Award,
  DollarSign,
  ShieldCheck,
  PieChart,
  GraduationCap,
  Trophy,
};

export default function AchievementsPage() {
  const [, setLocation] = useLocation();
  const { levelInfo, badges, loading } = useAchievementsV5();

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col max-w-[480px] mx-auto relative pb-28">
      {/* Header */}
      <header className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] bg-card/90 backdrop-blur-2xl border-b border-border/80 h-14 flex items-center justify-between px-4 z-40">
        <button
          onClick={() => setLocation('/profile')}
          className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-xl hover:bg-muted/80 cursor-pointer"
          aria-label="Back to profile"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <span className="font-bold text-sm text-foreground tracking-tight">Achievements & Levels</span>
        </div>

        <div className="w-6" aria-hidden />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-18 pb-6 space-y-6">
        {/* User Level Card */}
        <section className="bg-gradient-to-br from-card/90 via-card/70 to-card/90 border border-amber-500/30 rounded-3xl p-6 shadow-[0_8px_30px_rgba(245,158,11,0.1)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center text-2xl shadow-sm">
                {levelInfo.badge}
              </div>
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest block">
                  Current Level {levelInfo.level}
                </span>
                <h2 className="text-xl font-bold font-mono text-foreground">{levelInfo.name} Tier</h2>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              {levelInfo.currentXp} XP
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
              <span>Progress to Next Tier</span>
              <span>{levelInfo.progressPercent.toFixed(0)}%</span>
            </div>
            <div className="w-full h-3 bg-muted/60 rounded-full overflow-hidden p-0.5 border border-border">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${levelInfo.progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full"
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>{levelInfo.currentXp} XP</span>
              <span>Target: {levelInfo.nextLevelXp} XP</span>
            </div>
          </div>
        </section>

        {/* Badges Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Unlockable Badges ({badges.filter((b) => b.unlocked).length}/{badges.length})
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3 animate-pulse">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-card border border-border rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge, i) => {
                const Icon = ICON_MAP[badge.icon] ?? Trophy;
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl border p-4 flex flex-col items-center text-center gap-2 transition-all ${
                      badge.unlocked
                        ? 'bg-card/90 border-amber-500/40 shadow-[0_4px_20px_rgba(245,158,11,0.1)]'
                        : 'bg-card/40 border-border/60 opacity-80'
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        badge.unlocked
                          ? 'bg-amber-500/15 border border-amber-500/30 text-amber-400'
                          : 'bg-muted/60 text-muted-foreground'
                      }`}
                    >
                      {badge.unlocked ? (
                        <Icon className="w-6 h-6 text-amber-400" />
                      ) : (
                        <Lock className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>

                    <p className={`text-xs font-bold ${badge.unlocked ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {badge.title}
                    </p>

                    <p className="text-[10px] text-muted-foreground leading-relaxed">{badge.description}</p>

                    {!badge.unlocked && (
                      <div className="w-full bg-muted/60 h-1.5 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-amber-500/60 h-full rounded-full"
                          style={{ width: `${badge.progress}%` }}
                        />
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <QuickActionsMenu />
      <BottomNav />
    </div>
  );
}
