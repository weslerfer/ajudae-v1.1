import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { cn } from '../../utils/cn';
import { Breadcrumb, BreadcrumbItem } from './Breadcrumb';
import { Button } from './Button';
import { Input } from './Input';
import { Search } from './Search';
import { UserProfile, SystemNotification } from '../../types';
import { api } from '../../api';
import { useCommandPalette } from '../../providers/CommandPaletteProvider';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp } from '../../experience/presets/presets';

export interface NavbarProps extends React.HTMLAttributes<HTMLDivElement> {
  breadcrumbs?: BreadcrumbItem[];
  userAvatar?: string;
  user?: UserProfile | null;
  isAdminMode?: boolean;
  onToggleAdminMode?: (mode: boolean) => void;
  onLogout?: () => void;
  onOpenMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  breadcrumbs,
  userAvatar,
  user,
  isAdminMode,
  onToggleAdminMode,
  onLogout,
  onOpenMobileMenu,
  className,
  ...props
}) => {
  const { setIsOpen } = useCommandPalette();
  
  // Notifications logic
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications();
      const allNotifs: SystemNotification[] = data.notifications || [];
      const bellNotifs = allNotifs.filter(n => n.tipo !== 'popup');
      setNotifications(bellNotifs);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000); // Poll notifications
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-16 md:h-20 w-full items-center justify-between bg-slate-950/80 px-4 md:px-8 backdrop-blur-xl border-b border-white/5 transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2 md:gap-6">
        {onOpenMobileMenu && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onOpenMobileMenu}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <Icon name="solar:hamburger-menu-linear" size="lg" />
          </Button>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="hidden md:flex">
            <Breadcrumb items={breadcrumbs} />
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 md:gap-6">
        <div className="hidden md:block w-64" onClick={() => setIsOpen(true)}>
           <Search shortcut="⌘K" placeholder="Pesquisar..." />
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 border-l border-white/10 pl-4 md:pl-6 relative">
          
          {/* Notifications Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-slate-400 hover:text-white relative"
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
          >
            <Icon name="solar:bell-bing-bold-duotone" size="lg" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
            )}
          </Button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifDropdown && (
              <motion.div 
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-32 top-14 w-80 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                  <span className="font-semibold text-sm text-white">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {unreadCount} Novas
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto custom-scrollbar">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      Você não possui notificações no momento.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-4 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0 ${!notif.is_read ? 'bg-emerald-500/5' : ''}`}
                        onClick={(e) => !notif.is_read && handleMarkAsRead(notif.id, e)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-semibold text-sm text-slate-200">{notif.titulo}</span>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1" />}
                        </div>
                        <p className="text-xs text-slate-400">{notif.mensagem}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Profile Toggle */}
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-900/50 p-1 pr-4 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            <div className="h-8 w-8 overflow-hidden rounded-full bg-slate-800">
              {userAvatar ? (
                <img src={userAvatar} alt={user?.nome_completo || 'User'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950">
                  {user?.nome_completo ? user.nome_completo.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </div>
            <span className="text-sm font-medium text-slate-200 hidden sm:block">{user?.nome_completo || 'Usuário'}</span>
            <Icon name="solar:alt-arrow-down-linear" className="h-4 w-4 text-slate-500" />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfileDropdown && (
              <motion.div 
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute right-0 top-14 w-56 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col p-2"
              >
                <div className="p-3 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold text-white truncate">{user?.nome_completo}</p>
                  <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                </div>

                {user?.is_admin && onToggleAdminMode && (
                  <button 
                    onClick={() => {
                      onToggleAdminMode(!isAdminMode);
                      setShowProfileDropdown(false);
                    }}
                    className="flex items-center gap-3 p-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors w-full text-left"
                  >
                    <Icon name="solar:shield-warning-bold-duotone" className="text-emerald-400" />
                    {isAdminMode ? 'Sair do Painel Admin' : 'Acessar Painel Admin'}
                  </button>
                )}

                <button 
                  onClick={() => {
                    setShowProfileDropdown(false);
                    if (onLogout) onLogout();
                  }}
                  className="flex items-center gap-3 p-2 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors w-full text-left mt-2"
                >
                  <Icon name="solar:logout-2-bold-duotone" />
                  Sair da Plataforma
                </button>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </header>
  );
};
