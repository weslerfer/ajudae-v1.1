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
            className="group flex items-center justify-between rounded-2xl p-4 transition-colors hover:bg-white/5 border border-transparent hover:border-white/5"
          >
            <div className="flex items-center gap-4">
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                act.type === 'income' ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              )}>
                <Icon 
                  name={act.type === 'income' ? 'solar:arrow-up-bold-duotone' : 'solar:arrow-down-bold-duotone'} 
                  className="h-5 w-5" 
                />
              </div>
              <div className="flex flex-col">
                <Typography variant="body" className="font-semibold text-slate-200">
                  {act.title}
                </Typography>
                <div className="flex items-center gap-2">
                  <Typography variant="caption" color="muted">
                    {act.description || 'Movimentação'}
                  </Typography>
                  <span className="h-1 w-1 rounded-full bg-slate-700" />
                  <Typography variant="caption" color="muted">
                    {new Date(act.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </Typography>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end">
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
