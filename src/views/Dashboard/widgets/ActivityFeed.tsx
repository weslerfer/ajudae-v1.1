import React from 'react';
import { Typography } from '../../../components/ui/Typography';
import { Icon } from '../../../components/ui/Icon';
import { cn } from '../../../utils/cn';

interface Activity {
  id: string;
  title: string;
  description: string;
  amount: number;
  date: string;
  type: 'income' | 'outcome';
  status?: 'pendente' | 'concluido';
}

interface ActivityFeedProps {
  activities?: Activity[];
  onNavigate?: (view: string) => void;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities = [], onNavigate }) => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6 px-2">
        <Typography variant="h4">Activity Feed</Typography>
        <button 
          onClick={() => onNavigate && onNavigate('minha_carteira')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none focus:underline"
        >
          Ver todas
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
             <Typography variant="body" color="muted">Nenhuma atividade recente</Typography>
             <Typography variant="caption" color="muted" className="mt-1">Ainda não há movimentações financeiras para exibir.</Typography>
          </div>
        ) : activities.map((act) => (
          <div 
            key={act.id} 
            className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-2xl p-3.5 sm:p-4 transition-colors hover:bg-white/5 border border-white/5 sm:border-transparent sm:hover:border-white/5 bg-slate-900/40 sm:bg-transparent gap-3"
          >
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full mt-0.5 sm:mt-0",
                act.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                <Icon 
                  name={act.type === 'income' ? 'solar:arrow-up-bold-duotone' : 'solar:arrow-down-bold-duotone'} 
                  className="h-5 w-5" 
                />
              </div>
              
              <div className="flex flex-col min-w-0 flex-1 gap-1">
                <div className="flex items-center justify-between gap-2 sm:justify-start">
                  <Typography variant="body" className="font-semibold text-slate-200 truncate">
                    {act.title}
                  </Typography>
                  {/* On mobile, show amount next to title */}
                  <Typography variant="body" className={cn(
                    "font-mono font-semibold sm:hidden shrink-0 text-sm",
                    act.amount > 0 ? "text-emerald-400" : "text-slate-300"
                  )}>
                    {act.amount > 0 ? '+' : ''}R$ {Math.abs(act.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Typography>
                </div>

                <Typography variant="caption" color="muted" className="text-slate-400 break-words leading-relaxed text-xs sm:text-sm">
                  {act.description || 'Movimentação'}
                </Typography>

                <div className="flex items-center justify-between sm:justify-start gap-2 pt-1 sm:pt-0 text-[11px] text-slate-500 font-mono">
                  <span>
                    {new Date(act.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="hidden sm:inline h-1 w-1 rounded-full bg-slate-700" />
                  {/* On mobile, show status next to date */}
                  <span className={cn(
                    "sm:hidden uppercase tracking-wider font-bold text-[10px]",
                    act.status === 'pendente' ? "text-amber-500/90" : "text-emerald-500/90"
                  )}>
                    {act.status === 'pendente' ? 'Pendente' : 'Concluído'}
                  </span>
                </div>
              </div>
            </div>

            {/* On desktop (sm and up), show amount and status on the right column */}
            <div className="hidden sm:flex flex-col items-end shrink-0 ml-4">
              <Typography variant="body" className={cn(
                "font-mono font-semibold",
                act.amount > 0 ? "text-emerald-400" : "text-slate-300"
              )}>
                {act.amount > 0 ? '+' : ''}R$ {Math.abs(act.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" className={cn(
                "uppercase tracking-wider font-bold",
                act.status === 'pendente' ? "text-amber-500/70" : "text-emerald-500/70"
              )}>
                {act.status === 'pendente' ? 'Pendente' : 'Concluído'}
              </Typography>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
