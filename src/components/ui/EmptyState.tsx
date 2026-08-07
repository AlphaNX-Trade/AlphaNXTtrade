import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  className = '',
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col items-center justify-center text-center p-6 rounded-3xl bg-card/60 backdrop-blur-xl border border-primary/20 shadow-sm ${className}`}
    >
      {/* Icon Container with glowing aura */}
      <div className="relative mb-4">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,210,210,0.15)]">
          <Icon className="w-8 h-8" />
        </div>
      </div>

      {badge && (
        <span className="mb-2 px-2.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20 rounded-full">
          {badge}
        </span>
      )}

      <h3 className="text-base font-bold text-foreground mb-1 tracking-tight">
        {title}
      </h3>

      <p className="text-xs text-muted-foreground max-w-[260px] leading-relaxed mb-5">
        {description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-2.5">
        {actionLabel && onAction && (
          <button
            onClick={onAction}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-xl shadow-[0_0_15px_rgba(0,210,210,0.3)] hover:brightness-110 active:scale-95 transition-all cursor-pointer"
          >
            {actionLabel}
          </button>
        )}

        {secondaryActionLabel && onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="px-4 py-2 bg-secondary text-secondary-foreground font-semibold text-xs rounded-xl hover:bg-secondary/80 active:scale-95 transition-all cursor-pointer"
          >
            {secondaryActionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
}
