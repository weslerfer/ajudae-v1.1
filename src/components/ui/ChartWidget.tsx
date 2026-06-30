import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GlassSurface } from './GlassSurface';
import { Typography } from './Typography';
import { cn } from '../../utils/cn';

export interface ChartWidgetProps {
  title: string;
  subtitle?: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  color?: 'emerald' | 'cyan' | 'purple' | 'amber';
  height?: number;
  loading?: boolean;
  className?: string;
  valueFormatter?: (value: number) => string;
}

const colors = {
  emerald: { stroke: '#10b981', fillId: 'colorEmerald' },
  cyan: { stroke: '#06b6d4', fillId: 'colorCyan' },
  purple: { stroke: '#a855f7', fillId: 'colorPurple' },
  amber: { stroke: '#f59e0b', fillId: 'colorAmber' },
};

export const ChartWidget: React.FC<ChartWidgetProps> = ({
  title,
  subtitle,
  data,
  dataKey,
  xAxisKey,
  color = 'emerald',
  height = 300,
  loading = false,
  className,
  valueFormatter = (val) => val.toString()
}) => {
  const [mounted, setMounted] = useState(false);
  const theme = colors[color];

  useEffect(() => {
    // Artificial delay to prevent stutter during initial heavy view load
    const timer = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GlassSurface intensity="subtle" className={cn("p-6 flex flex-col w-full border border-white/5", className)}>
      <div className="mb-6">
        <Typography variant="h5" className="text-slate-200">{title}</Typography>
        {subtitle && <Typography variant="body" color="muted">{subtitle}</Typography>}
      </div>

      <div style={{ height }} className="w-full relative">
        {loading || !mounted ? (
          <div className="absolute inset-0 flex flex-col justify-end">
            {/* Shimmer loading mask simulating chart shape */}
            <div className="h-full w-full rounded-xl bg-slate-800/30 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] [mask-image:linear-gradient(to_bottom,transparent,black)]" />
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <Typography variant="body" color="muted">Sem dados para exibição.</Typography>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEmerald" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCyan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPurple" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorAmber" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              
              {/* Ultra subtle grid lines */}
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.03} vertical={false} />
              
              <XAxis 
                dataKey={xAxisKey} 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                dy={10}
              />
              
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-3 shadow-2xl">
                        <p className="text-xs text-slate-400 mb-1 font-semibold uppercase">{payload[0].payload[xAxisKey]}</p>
                        <p className="text-lg font-mono font-bold text-white tracking-tight">
                          {valueFormatter(Number(payload[0].value))}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: '#ffffff2a', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey={dataKey} 
                stroke={theme.stroke} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#${theme.fillId})`}
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassSurface>
  );
};
