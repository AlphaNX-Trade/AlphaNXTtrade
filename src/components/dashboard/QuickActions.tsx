import { useLocation } from 'wouter';
import {
  TrendingUp,
  Layers,
  Sparkles,
  Target,
  Gift,
  Download,
  BookMarked,
  Scale,
  Users,
  Trophy,
} from 'lucide-react';
import { motion } from 'framer-motion';

export function QuickActions() {
  const [, setLocation] = useLocation();

  const actions = [
    { icon: Users, label: 'Community', active: true, path: '/community' },
    { icon: Trophy, label: 'Leaderboard', active: true, path: '/leaderboard' },
    { icon: TrendingUp, label: 'Trade', active: false, path: '/trade' },
    { icon: Scale, label: 'Compare', active: false, path: '/compare' },
    { icon: BookMarked, label: 'Journal', active: false, path: '/journal' },
    { icon: Download, label: 'Reports', active: false, path: '/reports' },
    { icon: Gift, label: 'Invite', active: false, path: '/referral' },
    { icon: Sparkles, label: 'Insights', active: false, path: '/insights' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs text-muted-foreground uppercase font-mono tracking-wider px-1">
        V8 Smart Ecosystem Hub
      </h3>
      <div className="grid grid-cols-4 gap-2.5">
        {actions.map((action) => (
          <motion.button
            key={action.label}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation(action.path)}
            className="group flex flex-col items-center justify-center gap-1.5 py-3 px-1 bg-card/80 backdrop-blur-xl border border-border/70 hover:border-primary/40 rounded-2xl transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(0,210,210,0.1)] cursor-pointer"
            data-testid={`action-${action.label.toLowerCase().replace(' ', '-')}`}
          >
            <div
              className={`p-2 rounded-xl border transition-all ${
                action.active
                  ? 'bg-primary/15 text-primary border-primary/30'
                  : 'bg-muted/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 border-border/50'
              }`}
            >
              <action.icon className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-semibold text-foreground truncate max-w-full">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
