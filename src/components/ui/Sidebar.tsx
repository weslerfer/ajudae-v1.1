import React from 'react';
import { motion } from 'motion/react';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  href?: string;
  badge?: number;
}

export interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  items: SidebarItem[];
  activeId: string;
  onItemClick: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeId,
  onItemClick,
  isCollapsed,
  onToggleCollapse,
  className,
  ...props
}) => {
  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-white/5 bg-slate-950/80 backdrop-blur-2xl transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-72',
        className
      )}
      {...props}
    >
      {/* Brand / Logo Area */}
      <div className={cn(
        'flex h-20 items-center border-b border-white/5 px-6 transition-all duration-300',
        isCollapsed ? 'justify-center px-0' : 'justify-start'
      )}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan shadow-[0_0_20px_rgba(0,255,157,0.3)]">
            <Icon name="solar:leaf-bold" className="h-6 w-6 text-slate-950" />
          </div>
          {!isCollapsed && (
            <span className="font-display text-xl font-bold tracking-tight text-white animate-in fade-in zoom-in duration-300">
              AJUDAAE
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden p-4">
        {items.map((item) => {
          const isActive = activeId === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick(item.id)}
              className={cn(
                'group relative flex w-full items-center rounded-xl py-3 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-950',
                isCollapsed ? 'justify-center px-0' : 'px-4',
                isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              )}
              title={isCollapsed ? item.label : undefined}
            >
              {/* Active State Background (Framer Motion Shared Layout) */}
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute inset-0 z-0 rounded-xl bg-white/10 border border-white/10 shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]"
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Active Edge Glow */}
              {isActive && (
                 <motion.div
                 layoutId="sidebar-active-glow"
                 className="absolute left-0 top-1/4 h-1/2 w-1 rounded-r-full bg-neon-green shadow-[0_0_10px_rgba(0,255,157,1)] z-10"
                 initial={false}
                 transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
               />
              )}

              <div className="relative z-10 flex items-center justify-center gap-3 w-full">
                <Icon 
                  name={item.icon} 
                  className={cn(
                    "h-6 w-6 shrink-0 transition-all duration-300",
                    isActive ? "text-neon-green drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]" : "text-slate-400 group-hover:text-slate-300"
                  )} 
                />
                
                {!isCollapsed && (
                  <span className="flex-1 text-left truncate transition-opacity duration-300">
                    {item.label}
                  </span>
                )}

                {!isCollapsed && item.badge !== undefined && (
                  <span className="ml-auto inline-flex h-5 items-center justify-center rounded-full bg-emerald-500/20 px-2 text-xs font-semibold text-emerald-400 ring-1 ring-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                
                {/* Badge dot for collapsed state */}
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,1)]" />
                )}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Footer / Toggle */}
      <div className="border-t border-white/5 p-4">
        <button
          onClick={onToggleCollapse}
          className={cn(
            'flex w-full items-center rounded-xl p-3 text-slate-400 transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-emerald-400',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && <span className="text-sm font-medium">Recolher</span>}
          <Icon 
            name="solar:alt-arrow-left-linear" 
            className={cn("h-5 w-5 transition-transform duration-300", isCollapsed && "rotate-180")} 
          />
        </button>
      </div>
    </aside>
  );
};
