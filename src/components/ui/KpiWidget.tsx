import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { CountUp } from './CountUp';
import { cn } from '../../utils/cn';
import { GlassSurface } from './GlassSurface';

export interface KpiWidgetProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: number; // percentage
  trendLabel?: string;
  loading?: boolean;
  isCurrency?: boolean;
  colorScheme?: 'emerald' | 'blue' | 'amber' | 'purple' | 'slate';
  className?: string;
}

const colorMap = {
  emerald: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-400',
    glow: 'shadow-[0_0_15px_rgba(52,211,153,0.15)]',
    borderHover: 'hover:border-emerald-500/30'
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    borderHover: 'hover:border-blue-500/30'
  },
  amber: {
    bg: 'bg-amber-500/10',
    icon: 'text-amber-400',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    borderHover: 'hover:border-amber-500/30'
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-400',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    borderHover: 'hover:border-purple-500/30'
  },
  slate: {
    bg: 'bg-slate-500/10',
    icon: 'text-slate-400',
    glow: 'shadow-[0_0_15px_rgba(148,163,184,0.15)]',
    borderHover: 'hover:border-slate-500/30'
  }
};

export const KpiWidget: React.FC<KpiWidgetProps> = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  loading = false,
  isCurrency = false,
  colorScheme = 'slate',
  className
}) => {
  const scheme = colorMap[colorScheme];

  return (
    <GlassSurface intensity="subtle" className={cn("p-5 flex flex-col justify-between transition-colors duration-500 border border-transparent", scheme.borderHover, className)}>
      <div className="flex justify-between items-start mb-4">
        <Typography variant="body" className="font-semibold text-slate-300">
          {title}
        </Typography>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", scheme.bg, scheme.icon, scheme.glow)}>
          <Icon name={icon} className="h-5 w-5" />
        </div>
      </div>

      <div className="relative min-h-[40px]">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)' }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 flex flex-col gap-2"
            >
              <div className="h-8 w-24 rounded bg-slate-800/50 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]" />
              {trend !== undefined && (
                <div className="h-4 w-16 rounded bg-slate-800/50 animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]" />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-baseline gap-1">
                {isCurrency && <span className="text-xl font-mono text-slate-500">R$</span>}
                <Typography variant="h3" className="font-mono tracking-tight text-white">
                  {typeof value === 'number' ? (
                    <CountUp value={value} duration={0.8} />
                  ) : (
                    value
                  )}
                </Typography>
              </div>

              {trend !== undefined && (
                <div className="mt-2 flex items-center gap-2">
                  <div className={cn(
                    "flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold ring-1",
                    trend > 0 ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" : 
                    trend < 0 ? "bg-red-500/10 text-red-400 ring-red-500/20" : 
                    "bg-slate-500/10 text-slate-400 ring-slate-500/20"
                  )}>
                    <Icon name={trend > 0 ? "solar:trend-up-bold" : trend < 0 ? "solar:trend-down-bold" : "solar:minus-square-bold"} className="h-3 w-3" />
                    <span>{Math.abs(trend)}%</span>
                  </div>
                  {trendLabel && (
                    <Typography variant="caption" color="muted">
                      {trendLabel}
                    </Typography>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassSurface>
  );
};
