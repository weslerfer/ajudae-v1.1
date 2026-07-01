import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { CountUp } from './CountUp';
import { cn } from '../../utils/cn';
import { GlassSurface } from './GlassSurface';

export interface FinancialCardProps {
  title: string;
  amount: number;
  subtitle?: string;
  icon?: string;
  status?: 'healthy' | 'warning' | 'critical' | 'neutral';
  loading?: boolean;
  className?: string;
}

const statusMap = {
  healthy: 'from-emerald-500/20 to-transparent border-emerald-500/30 text-emerald-400',
  warning: 'from-amber-500/20 to-transparent border-amber-500/30 text-amber-400',
  critical: 'from-red-500/20 to-transparent border-red-500/30 text-red-400',
  neutral: 'from-blue-500/20 to-transparent border-blue-500/30 text-blue-400',
};

export const FinancialCard: React.FC<FinancialCardProps> = ({
  title,
  amount,
  subtitle,
  icon = 'solar:wallet-money-bold-duotone',
  status = 'neutral',
  loading = false,
  className
}) => {
  return (
    <GlassSurface intensity="premium" className={cn("relative overflow-hidden p-6 border-t-[3px]", statusMap[status].split(' ')[1], className)}>
      {/* Background glow indicating status */}
      <div className={cn("absolute inset-0 bg-gradient-to-b opacity-20 pointer-events-none", statusMap[status].split(' ')[0])} />
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        <div className="flex items-center justify-between mb-8">
          <Typography variant="body" className="font-semibold text-slate-300 uppercase tracking-widest text-xs">
            {title}
          </Typography>
          <Icon name={icon} className={cn("h-6 w-6 opacity-80", statusMap[status].split(' ')[2])} />
        </div>

        <div className="relative min-h-[50px]">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col justify-end"
              >
                 <div className="h-10 w-3/4 rounded bg-slate-800/50 motion-safe:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]" />
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                className="flex items-baseline gap-2"
              >
                <Typography variant="h4" className="font-mono text-slate-500">R$</Typography>
                <Typography variant="display" className={cn("text-4xl tracking-tighter", amount < 0 ? "text-slate-300" : "text-white")}>
                  {amount < 0 && "-"}
                  <CountUp value={Math.abs(amount)} duration={0.8} />
                </Typography>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {subtitle && (
          <Typography variant="caption" color="muted" className="mt-2">
            {subtitle}
          </Typography>
        )}
      </div>
    </GlassSurface>
  );
};
