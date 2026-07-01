import React from 'react';
import { GlassSurface } from '../../../components/ui/GlassSurface';
import { Typography } from '../../../components/ui/Typography';
import { Icon } from '../../../components/ui/Icon';

interface KpiIndicatorsProps {
  stats: any;
}

export const KpiIndicators: React.FC<KpiIndicatorsProps> = ({ stats }) => {
  const activeCount = stats?.activeCount ?? 0;
  const invitedActivated = stats?.invitedActivated ?? 0;
  const totalEarned = stats?.totalEarned ?? 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 w-full">
      {/* Grupos Ativados */}
      <div className="group text-left rounded-2xl">
        <GlassSurface intensity="subtle" className="p-4 flex flex-col gap-3 h-full border-white/5 hover:border-emerald-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] transition-all">
              <Icon name="solar:users-group-two-rounded-bold-duotone" className="h-5 w-5" glow />
            </div>
            <div>
              <Typography variant="body" className="font-semibold text-slate-200">Grupos</Typography>
              <Typography variant="caption" color="muted">Ativados</Typography>
            </div>
          </div>
          <Typography variant="h3" className="text-white mt-1">{activeCount}</Typography>
        </GlassSurface>
      </div>

      {/* Convidados Ativos */}
      <div className="group text-left rounded-2xl">
        <GlassSurface intensity="subtle" className="p-4 flex flex-col gap-3 h-full border-white/5 hover:border-blue-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all">
              <Icon name="solar:link-bold-duotone" className="h-5 w-5" glow />
            </div>
            <div>
              <Typography variant="body" className="font-semibold text-slate-200">Convidados</Typography>
              <Typography variant="caption" color="muted">Ativos</Typography>
            </div>
          </div>
          <Typography variant="h3" className="text-white mt-1">{invitedActivated}</Typography>
        </GlassSurface>
      </div>

      {/* Lucro Acumulado */}
      <div className="group text-left rounded-2xl">
        <GlassSurface intensity="subtle" className="p-4 flex flex-col gap-3 h-full border-white/5 hover:border-amber-500/30 transition-colors">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 group-hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] transition-all">
              <Icon name="solar:wallet-money-bold-duotone" className="h-5 w-5" glow />
            </div>
            <div>
              <Typography variant="body" className="font-semibold text-slate-200">Lucro</Typography>
              <Typography variant="caption" color="muted">Acumulado</Typography>
            </div>
          </div>
          <Typography variant="h4" className="text-emerald-400 font-mono tracking-tight mt-1">
            R$ {Number(totalEarned).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Typography>
        </GlassSurface>
      </div>
    </div>
  );
};
