/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Users, 
  Layers, 
  Link2, 
  Wallet, 
  HelpCircle, 
  Settings, 
  LogOut, 
  Bell, 
  ShieldAlert, 
  Menu, 
  X,
  Check
} from 'lucide-react';
import { api } from '../api';
import { UserProfile, SystemNotification } from '../types';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  user: UserProfile;
  isAdminMode: boolean;
  onToggleAdminMode: (mode: boolean) => void;
  onLogout: () => void;
}

export default function Sidebar({
  currentView,
  onNavigate,
  user,
  isAdminMode,
  onToggleAdminMode,
  onLogout
}: SidebarProps) {
  const [navOpen, setNavOpen] = useState(false);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [supabaseActive, setSupabaseActive] = useState<boolean | null>(null);

  useEffect(() => {
    api.getSupabaseConfigured().then(res => {
      setSupabaseActive(res?.configured);
    }).catch(() => {
      setSupabaseActive(false);
    });
  }, []);

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

  const navItems = [
    { id: 'home', label: 'Início', icon: Home, admin: false },
    { id: 'meus_grupos', label: 'Grupos Ativos', icon: Users, admin: false },
    { id: 'grupos_disponiveis', label: 'Grupos Disponíveis', icon: Layers, admin: false },
    { id: 'grupos_convite', label: 'Grupos de Convite', icon: Link2, admin: false },
    { id: 'carteira', label: 'Minha Carteira', icon: Wallet, admin: false },
    { id: 'como_funciona', label: 'Como Funciona', icon: HelpCircle, admin: false },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, admin: false },
  ];

  const adminItems = [
    { id: 'admin_home', label: 'Painel Geral', icon: Home, admin: true },
    { id: 'admin_notificacoes', label: 'Notificações', icon: Bell, admin: true },
    { id: 'admin_saques', label: 'Verificar Saques', icon: Wallet, admin: true },
    { id: 'admin_grupos', label: 'Gerenciar Grupos', icon: Layers, admin: true },
    { id: 'admin_usuarios', label: 'Usuários', icon: Users, admin: true },
    { id: 'admin_carteiras', label: 'Carteira dos Usuários', icon: Settings, admin: true }
  ];

  const displayItems = isAdminMode ? adminItems : navItems;

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="lg:hidden bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between p-4 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-wider text-emerald-400 font-sans">Ajudae</span>
          {user?.is_admin && (
            <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded font-mono uppercase">
              Admin
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {/* Mobile Notifications Trigger */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="text-slate-300 hover:text-white p-1 rounded-full relative bg-slate-800 focus:outline-none"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>
            {/* Mobile Notifications Dropdown */}
            {showNotifDropdown && (
              <div className="absolute right-0 top-10 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-100">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                  <span className="font-semibold text-xs">Notificações</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {unreadCount} Novas
                    </span>
                  )}
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-[10px] text-slate-500 italic">
                      Nenhuma notificação.
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div 
                        key={notif.id} 
                        className={`p-3 hover:bg-slate-800/40 transition-colors ${!notif.is_read ? 'bg-slate-850 border-l-2 border-emerald-500' : ''}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[11px] text-white leading-tight">{notif.titulo}</p>
                          {!notif.is_read && (
                            <button 
                              onClick={(e) => handleMarkAsRead(notif.id, e)}
                              className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/10"
                              title="Marcar como lida"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 whitespace-pre-wrap">{notif.mensagem}</p>
                        <span className="text-[8px] text-slate-500 font-mono mt-1 block">
                          {new Date(notif.created_at).toLocaleTimeString('pt-BR')} - {new Date(notif.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setNavOpen(!navOpen)} 
            className="text-slate-300 hover:text-white focus:outline-none"
          >
            {navOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Navigation Overlay list */}
      <aside className={`fixed inset-y-0 left-0 bg-slate-950 border-r border-slate-900 text-slate-100 w-72 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between ${navOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Sidebar Top Header Logo */}
          <div className="p-6 border-b border-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-555 flex items-center justify-center bg-emerald-600 font-bold text-white text-lg font-sans">A</div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-wide font-sans text-white flex items-center gap-2">
                  Ajudae
                  {supabaseActive !== null && (
                    <span 
                      title={supabaseActive ? "Supabase Banco de Dados Ativo" : "Banco de Dados Local (de demonstração)"} 
                      className={`w-2 h-2 rounded-full ${supabaseActive ? 'bg-emerald-500 shadow-sm shadow-emerald-550' : 'bg-amber-500'}`} 
                    />
                  )}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Ajuda Mutua Digital</span>
              </div>
            </div>
            
            <button 
              onClick={() => setNavOpen(false)} 
              className="lg:hidden text-slate-400 hover:text-white focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Brief Session Details Card */}
          <div className="p-4 mx-3 my-4 bg-slate-900/60 rounded-xl border border-slate-900 text-slate-300 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-800/50 border border-emerald-500/10 flex items-center justify-center font-bold text-emerald-400">
              {(user?.nome_completo || 'User').substring(0,2).toUpperCase()}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-semibold truncate text-white block">{user?.nome_completo || 'Participante'}</span>
              <span className="text-xs text-slate-400 truncate block">{user?.email || ''}</span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="px-3 space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">
              {isAdminMode ? 'Navegação Admin' : 'Menu Principal'}
            </p>
            {displayItems.map((item) => {
              const Icon = item.icon;
              const isSelected = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all group ${
                    isSelected 
                      ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/50 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-transform group-hover:scale-105 ${isSelected ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-900 space-y-3">
          {/* Admin Switcher Mode */}
          {user?.is_admin && (
            <div className="bg-slate-900/80 border border-slate-900 rounded-xl p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-[11px] font-mono uppercase font-bold text-rose-400 tracking-wide">
                    Modo Admin
                  </span>
                </div>
                <span className={`w-2 h-2 rounded-full ${isAdminMode ? 'bg-rose-500 animate-pulse' : 'bg-slate-700'}`} />
              </div>
              <button
                onClick={() => {
                  onToggleAdminMode(!isAdminMode);
                  onNavigate(isAdminMode ? 'home' : 'admin_home');
                }}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors border block text-center ${
                  isAdminMode 
                    ? 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-400' 
                    : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
                }`}
              >
                {isAdminMode ? 'Alternar para Usuário' : 'Alternar para Admin'}
              </button>
            </div>
          )}

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-900 hover:bg-red-950/20 hover:text-red-400 border border-slate-800 hover:border-red-500/20 transition-all text-sm font-medium text-slate-300"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Laptop Header Bar with Notification Bell on Desktop */}
      <div className="hidden lg:flex fixed top-0 right-0 left-72 h-16 bg-slate-900 border-b border-slate-900 px-6 items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold font-mono text-slate-400">
            {isAdminMode ? '🛠️ MODO ADMINISTRATIVO - AJUDAE' : '👋 Seja bem vindo à plataforma Ajudae'}
          </span>
        </div>
        <div className="flex items-center gap-4 relative">
          {/* Notifications Button */}
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="text-slate-300 hover:text-white p-2 rounded-xl relative bg-slate-800 cursor-pointer focus:outline-none transition-colors border border-slate-800/60"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-ping" />
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifDropdown && (
            <div className="absolute right-0 top-12 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden text-slate-100">
              <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <span className="font-semibold text-sm">Notificações</span>
                {unreadCount > 0 && (
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                    {unreadCount} Novas
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 italic">
                    Nenhuma notificação por aqui.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-4 hover:bg-slate-800/40 transition-colors ${!notif.is_read ? 'bg-slate-850 border-l-2 border-emerald-500' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-xs text-white leading-tight">{notif.titulo}</p>
                        {!notif.is_read && (
                          <button 
                            onClick={(e) => handleMarkAsRead(notif.id, e)}
                            className="text-emerald-400 hover:text-emerald-300 p-0.5 rounded border border-emerald-500/20 hover:bg-emerald-500/10"
                            title="Marcar como lida"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 whitespace-pre-wrap">{notif.mensagem}</p>
                      <span className="text-[9px] text-slate-500 font-mono mt-2 block">
                        {new Date(notif.created_at).toLocaleTimeString('pt-BR')} - {new Date(notif.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
