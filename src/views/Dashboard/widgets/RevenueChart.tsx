import React, { useEffect, useState, useMemo } from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { GlassSurface } from '../../../components/ui/GlassSurface';
import { Typography } from '../../../components/ui/Typography';

type Timeframe = 'Dia' | 'Semana' | 'Mês';

export const RevenueChart = React.memo<{ revenueHistory?: any }>(({ revenueHistory }) => {
  const [mounted, setMounted] = useState(false);
  const [period, setPeriod] = useState<Timeframe>('Dia');

  useEffect(() => {
    // Slight delay to allow entrance animation to finish before rendering heavy chart
    const timer = setTimeout(() => setMounted(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const chartData = useMemo(() => {
    if (!revenueHistory) return [];
    if (period === 'Dia') return revenueHistory.day || [];
    if (period === 'Semana') return revenueHistory.week || [];
    if (period === 'Mês') return revenueHistory.month || [];
    return [];
  }, [revenueHistory, period]);

  return (
    <GlassSurface intensity="subtle" className="h-[400px] w-full p-6 flex flex-col border border-white/5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <Typography variant="h4">Receita Hoje</Typography>
          <Typography variant="body" color="muted">
            {period === 'Dia' ? 'Evolução nas últimas 24h' : 
             period === 'Semana' ? 'Evolução nos últimos 7 dias' : 
             'Evolução nos últimos 30 dias'}
          </Typography>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {(['Dia', 'Semana', 'Mês'] as Timeframe[]).map((tf) => (
            <button 
              key={tf} 
              onClick={() => setPeriod(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${period === tf ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0 relative">
        {!mounted ? (
          <div className="absolute inset-0 flex items-center justify-center">
             <div className="h-px w-0 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent animate-[expand_1s_ease-out_forwards]" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
             <Typography variant="body" color="muted">Nenhum dado disponível</Typography>
             <Typography variant="caption" color="muted" className="mt-1">Ainda não há movimentações financeiras para exibir.</Typography>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              {/* Invisible grid, ultra premium look */}
              <XAxis 
                dataKey="date" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickFormatter={(val) => {
                  if (!val) return '';
                  if (val.includes(':')) return val; // it's already HH:MM
                  const parts = val.split('-');
                  if (parts.length === 3) {
                    const [y, m, d] = parts;
                    return `${d}/${m}`;
                  }
                  return val;
                }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 12 }} 
                tickFormatter={(val) => `R$${(val/1000).toFixed(1)}k`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-white/10 bg-slate-900/90 backdrop-blur-xl p-3 shadow-2xl">
                        <p className="text-xs text-slate-400 mb-1">{payload[0].payload.date}</p>
                        <p className="text-lg font-bold text-white tracking-tight">
                          R$ {Number(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
                cursor={{ stroke: '#ffffff1a', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
                animationDuration={1500}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </GlassSurface>
  );
});
