import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from './Typography';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';
import { GlassSurface } from './GlassSurface';

export type ActivityPriority = 'low' | 'medium' | 'high' | 'critical';
export type ActivityStatus = 'success' | 'warning' | 'error' | 'info' | 'pending';

export interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  origin: string; // e.g. 'API', 'System', 'User'
  priority: ActivityPriority;
  status: ActivityStatus;
  amount?: number;
  metadata?: Record<string, string>;
}

export interface ActivityTimelineProps {
  events: ActivityEvent[];
  loading?: boolean;
  emptyStateTitle?: string;
  emptyStateMessage?: string;
  className?: string;
}

const statusConfig = {
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: 'solar:check-circle-bold-duotone', iconColor: 'success' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'solar:danger-circle-bold-duotone', iconColor: 'warning' },
  error: { color: 'text-red-400', bg: 'bg-red-500/10', icon: 'solar:close-circle-bold-duotone', iconColor: 'danger' },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: 'solar:info-circle-bold-duotone', iconColor: 'neon-blue' },
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: 'solar:clock-circle-bold-duotone', iconColor: 'warning' },
};

const priorityConfig = {
  low: 'border-slate-500/20',
  medium: 'border-blue-500/30',
  high: 'border-amber-500/40',
  critical: 'border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  events,
  loading = false,
  emptyStateTitle = 'Nenhuma atividade registrada',
  emptyStateMessage = 'Os eventos do sistema aparecerão aqui em tempo real.',
  className
}) => {
  return (
    <div className={cn("relative flex flex-col w-full h-full", className)}>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-6 p-4"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-slate-800/50 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]" />
                  {i !== 3 && <div className="h-full w-px bg-white/5 my-2" />}
                </div>
                <div className="flex-1 flex flex-col gap-2 pt-1">
                  <div className="h-5 w-1/3 rounded bg-slate-800/50 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]" />
                  <div className="h-4 w-1/2 rounded bg-slate-800/30 animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%]" />
                </div>
              </div>
            ))}
          </motion.div>
        ) : events.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, filter: 'blur(4px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            className="flex flex-col items-center justify-center p-12 text-center h-full"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/50 text-slate-500 mb-4">
               <Icon name="solar:history-bold-duotone" className="h-8 w-8" />
            </div>
            <Typography variant="h5" className="text-slate-300">{emptyStateTitle}</Typography>
            <Typography variant="body" color="muted" className="mt-1">{emptyStateMessage}</Typography>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col p-4"
          >
            {events.map((event, index) => {
              const isLast = index === events.length - 1;
              const statusProps = statusConfig[event.status];
              
              return (
                <div key={event.id} className="group relative flex gap-6">
                  {/* Timeline Line & Icon */}
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full ring-4 ring-background z-10 transition-transform group-hover:scale-110",
                      statusProps.bg, statusProps.color
                    )}>
                      <Icon name={statusProps.icon} color={statusProps.iconColor as any} className="h-5 w-5" />
                    </div>
                    {!isLast && (
                      <div className="w-px h-full min-h-[30px] bg-gradient-to-b from-white/10 to-transparent mt-1 mb-1 group-hover:from-white/20 transition-colors" />
                    )}
                  </div>

                  {/* Content Card */}
                  <GlassSurface 
                    intensity="subtle" 
                    className={cn(
                      "flex-1 p-4 mb-6 transition-all duration-300 hover:bg-white/[0.03] border-l-2",
                      priorityConfig[event.priority]
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <Typography variant="body" className="font-semibold text-slate-200 group-hover:text-white transition-colors">
                          {event.title}
                        </Typography>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{event.origin}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-700" />
                          <Typography variant="caption" color="muted">{event.timestamp}</Typography>
                        </div>
                      </div>
                      
                      {event.amount !== undefined && (
                        <Typography variant="body" className={cn("font-mono font-bold", event.amount > 0 ? "text-emerald-400" : "text-slate-300")}>
                          {event.amount > 0 ? '+' : ''}R$ {Math.abs(event.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </Typography>
                      )}
                    </div>
                    
                    {event.description && (
                      <Typography variant="caption" color="muted" className="mt-1 leading-relaxed">
                        {event.description}
                      </Typography>
                    )}
                    
                    {/* Optional Metadata block */}
                    {event.metadata && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {Object.entries(event.metadata).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1 rounded bg-slate-900/50 px-2 py-1 text-xs border border-white/5">
                            <span className="text-slate-500">{key}:</span>
                            <span className="font-mono text-slate-300">{value}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </GlassSurface>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
