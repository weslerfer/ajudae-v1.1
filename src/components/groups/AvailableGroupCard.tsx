import React from 'react';
import { Star, StarOff, ArrowLeft } from 'lucide-react';
import { GlassSurface } from '../ui/GlassSurface';
import { Typography } from '../ui/Typography';
import { Progress } from '../ui/Progress';
import { Button } from '../ui/Button';

export interface AvailableGroupCardProps {
  group: any;
  isFav: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenGroup: (group: any) => void;
}

export const AvailableGroupCard: React.FC<AvailableGroupCardProps> = ({
  group,
  isFav,
  onToggleFavorite,
  onOpenGroup
}) => {
  const slotsTaken = group.members?.length || 0;
  const slotsTotal = 4; // Simulated default
  const returnMultiplier = (group.valor_base / group.valor_ativacao).toFixed(1);

  return (
    <GlassSurface 
      className="group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/20 h-full flex flex-col p-0"
    >
      {/* Pending Badge Absolute */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold uppercase tracking-wider font-mono">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(251,191,36,1)]" />
        Pendente
      </div>
      <div className="p-6 flex-1 flex flex-col cursor-pointer" onClick={() => onOpenGroup(group)}>
        <div className="flex items-center justify-between mb-3 pr-10">
          <Typography variant="caption" className="font-mono text-slate-500">
            {group.id.substring(0,8).toUpperCase()}
          </Typography>
        </div>

        <Typography variant="h3" className="mb-4 line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
          {group.nome_grupo}
        </Typography>
        
        <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-4 mb-6">
          <div className="flex justify-between items-end pb-3 border-b border-white/5">
            <div>
              <Typography variant="caption" color="secondary" className="uppercase font-mono mb-1 block">Valor de Ativação</Typography>
              <Typography variant="h3" className="text-emerald-400 font-mono">R$ {group.valor_ativacao?.toFixed(2) || '0.00'}</Typography>
            </div>
          </div>
          
          <div className="space-y-3 pt-1">
            {[1, 2, 3, 4].map(pos => {
              const m = group.members?.find((x: any) => x.position === pos);
              return (
                <div key={pos} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center rounded-md font-mono text-[10px] font-bold bg-slate-900 text-slate-500 border border-white/5">
                    {pos}
                  </div>
                  <div className="flex-1 min-w-0">
                    {m ? (
                      <Typography variant="caption" className="truncate font-medium block text-slate-300">
                        {m.nome_completo}
                      </Typography>
                    ) : (
                      <Typography variant="caption" className="text-slate-600 italic block">Posição Livre</Typography>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto">
          <Button 
            variant="primary" 
            className="w-full"
            onClick={(e) => { e.stopPropagation(); onOpenGroup(group); }}
          >
            Ver Grupo
            <ArrowLeft className="w-4 h-4 rotate-180 ml-2" />
          </Button>
        </div>
      </div>
    </GlassSurface>
  );
};
