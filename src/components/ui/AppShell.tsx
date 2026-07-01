import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { GlobalProgressBar } from './GlobalProgressBar';
import { CommandPalette } from './CommandPalette';
import { Drawer, DrawerContent } from './Drawer';
import { UserProfile } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  user: UserProfile | null;
  isAdminMode: boolean;
  onToggleAdminMode?: (mode: boolean) => void;
  onLogout?: () => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeView,
  onNavigate,
  user,
  isAdminMode,
  onToggleAdminMode,
  onLogout,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mapped standard items with proper solar icons
  const navItems = [
    { id: 'dashboard', label: 'Início', icon: 'solar:home-smile-bold-duotone' },
    { id: 'meus_grupos', label: 'Grupos Ativos', icon: 'solar:users-group-two-rounded-bold-duotone' },
    { id: 'grupos_disponiveis', label: 'Grupos Disponíveis', icon: 'solar:layers-bold-duotone' },
    { id: 'grupos_convite', label: 'Convites', icon: 'solar:link-bold-duotone' },
    { id: 'minha_carteira', label: 'Minha Carteira', icon: 'solar:wallet-money-bold-duotone' },
    { id: 'como_funciona', label: 'Como Funciona', icon: 'solar:question-circle-bold-duotone' },
    { id: 'perfil', label: 'Meu Perfil', icon: 'solar:user-circle-bold-duotone' },
    { id: 'configuracoes', label: 'Configurações', icon: 'solar:settings-bold-duotone' },
  ];

  const adminItems = [
    { id: 'admin_dashboard', label: 'Painel Geral', icon: 'solar:home-smile-bold-duotone' },
    { id: 'admin_notificacoes', label: 'Notificações', icon: 'solar:bell-bold-duotone' },
    { id: 'admin_saques', label: 'Saques', icon: 'solar:wallet-bold-duotone' },
    { id: 'admin_grupos', label: 'Gerenciar Grupos', icon: 'solar:layers-bold-duotone' },
    { id: 'admin_usuarios', label: 'Usuários', icon: 'solar:users-group-rounded-bold-duotone' },
    { id: 'admin_carteiras', label: 'Carteiras', icon: 'solar:settings-bold-duotone' },
  ];

  const displayItems = isAdminMode ? adminItems : navItems;

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 overflow-hidden text-slate-200 font-sans">
      <GlobalProgressBar />
      <CommandPalette />
      
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full z-30">
        <Sidebar 
          items={displayItems}
          activeId={activeView} 
          onItemClick={handleNavigate} 
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="h-full"
        />
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <Drawer open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <DrawerContent side="left" className="w-80 p-0 border-r border-white/10 flex flex-col">
          <Sidebar 
            items={displayItems}
            activeId={activeView} 
            onItemClick={handleNavigate} 
            isCollapsed={false}
            onToggleCollapse={() => {}} 
            className="w-full h-full border-none"
          />
        </DrawerContent>
      </Drawer>
      
      <div className="flex-1 flex flex-col min-w-0 relative h-full w-full">
        <Navbar 
          user={user}
          isAdminMode={isAdminMode}
          onToggleAdminMode={onToggleAdminMode}
          onLogout={onLogout}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[url('/noise.png')] bg-repeat relative custom-scrollbar">
          {/* Subtle global gradient background */}
          <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none mix-blend-screen" />
          
          <div className="max-w-7xl mx-auto px-4 md:px-8 pb-[max(1rem,env(safe-area-inset-bottom))] md:pb-8 pt-2 min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
