import React from 'react';
import { Typography } from '../../../components/ui/Typography';
import { GlassSurface } from '../../../components/ui/GlassSurface';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../utils/cn';

interface PixStatusProps {
  pendingCount: number;
  pendingTotal: number;
  pendingList?: { id: string; amount: number; date: string; status: string; }[];
}

export const PixStatus: React.FC<PixStatusProps> = ({ pendingCount, pendingTotal, pendingList = [] }) => {
  if (pendingCount === 0) {
    return (
      <GlassSurface intensity="subtle" className="p-6 h-full flex flex-col justify-between border-slate-500/10">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 text-slate-400">
              <Icon name="solar:check-circle-bold-duotone" className="h-5 w-5" />
            </div>
            <div>
              <Typography variant="body" className="font-semibold text-slate-300">Tudo em dia</Typography>
              <Typography variant="caption" color="muted">Sem PIX pendentes</Typography>
            </div>
          </div>
        </div>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface intensity="subtle" className="p-6 h-full flex flex-col justify-between border-amber-500/10 hover:border-amber-500/30 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Icon name="solar:clock-circle-bold-duotone" className="h-5 w-5" />
          </div>
          <div>
            <Typography variant="body" className="font-semibold text-slate-200">PIX Pendentes</Typography>
            <Typography variant="caption" color="muted">Aguardando liquidação</Typography>
          </div>
        </div>
        
        {/* Pulsing attention badge */}
        <div className="flex h-6 items-center justify-center rounded-full bg-amber-500/20 px-2 text-xs font-bold text-amber-400 ring-1 ring-amber-500/50 animate-[pulse_3s_ease-in-out_infinite]">
          {pendingCount}
        </div>
      </div>
      
      <div className="mt-6 flex flex-col gap-3">
        <Typography variant="h3" className="font-mono text-amber-400 mb-2">R$ {pendingTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Typography>
        
        {pendingList.map(item => (
          <div key={item.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
            <div className="flex flex-col">
              <Typography variant="body" className="font-semibold text-slate-300">
                Saque Solicitado
              </Typography>
              <Typography variant="caption" color="muted">
                {new Date(item.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
              </Typography>
            </div>
            <Typography variant="body" className="font-mono font-semibold text-slate-200">
              R$ {Math.abs(item.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Typography>
          </div>
        ))}
      </div>
    </GlassSurface>
  );
};
