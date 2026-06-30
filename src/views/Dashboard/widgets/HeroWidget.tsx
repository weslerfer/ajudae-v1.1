import React, { useState } from 'react';

import { Typography } from '../../../components/ui/Typography';
import { Icon } from '../../../components/ui/Icon';
import { CountUp } from '../../../components/ui/CountUp';
import { cn } from '../../../utils/cn';

interface HeroWidgetProps {
  balance: number;
  lastUpdated: string;
  trend?: number;
}

export const HeroWidget: React.FC<HeroWidgetProps> = ({ balance, lastUpdated, trend }) => {
  const [isCountFinished, setIsCountFinished] = useState(false);

  return (
    <div className="relative group w-full">
      {/* Background glow that reveals after CountUp finishes */}
      <div 
        className={cn("absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-emerald-500/0 via-emerald-400/20 to-neon-cyan/0 blur-2xl transition-opacity duration-1000", isCountFinished ? "opacity-100" : "opacity-0")}
      />
      
      <div className="relative flex flex-col items-center sm:items-start justify-center rounded-[2rem] border border-white/10 bg-slate-900/60 p-10 backdrop-blur-3xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.05),0_30px_60px_rgba(0,0,0,0.6)]">
        
        {/* Top Meta Info */}
        <div className="mb-4 flex items-center justify-between w-full">
          <Typography variant="body" color="muted" className="font-semibold tracking-wider uppercase text-xs">
            Saldo Disponível
          </Typography>
          <div className="flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 border border-white/5">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)] animate-pulse" />
            <span className="text-[10px] font-mono text-slate-400">{lastUpdated}</span>
          </div>
        </div>

        {/* Protagonist: The Balance */}
        <div className="flex items-baseline gap-2 mb-6">
          <Typography variant="h3" color="secondary" className="font-mono opacity-50">R$</Typography>
          <Typography 
            as="h1" 
            className="text-6xl sm:text-7xl lg:text-[5.5rem] font-display font-bold tracking-tighter text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] leading-none"
          >
            <CountUp 
              value={balance} 
              duration={1.2} 
              onComplete={() => setIsCountFinished(true)} 
            />
          </Typography>
        </div>

        {/* Secondary Info: Trend & Comparison */}
        {trend !== undefined && (
          <div className="flex items-center gap-4">
            <div className={cn(
              "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-medium ring-1",
              trend >= 0 
                ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" 
                : "bg-red-500/10 text-red-400 ring-red-500/20"
            )}>
              <Icon name={trend >= 0 ? "solar:trend-up-bold" : "solar:trend-down-bold"} className="h-4 w-4" />
              <span>{trend >= 0 ? '+' : ''}{trend}%</span>
            </div>
            <Typography variant="caption" color="muted">
              vs. ontem
            </Typography>
          </div>
        )}
      </div>
    </div>
  );
};
