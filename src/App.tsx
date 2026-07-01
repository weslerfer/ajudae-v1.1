/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, Suspense } from 'react';
import { api } from './api';
import { UserProfile } from './types';

// Infrastructure
import { AppShell } from './components/ui/AppShell';
import { ExperienceProvider } from './providers/ExperienceProvider';
import { Toaster } from './components/ui/Toaster';
import GlobalPopupManager from './components/GlobalPopupManager';
import { GlobalProgressBar } from './components/ui/GlobalProgressBar';

// Views - Lazy Loaded
import { AuthScreen } from './views/Auth/AuthScreen';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
const NotFound = React.lazy(() => import('./views/NotFound'));
const Home = React.lazy(() => import('./views/Home'));
const MeusGrupos = React.lazy(() => import('./views/MeusGrupos'));
const GruposDisponiveis = React.lazy(() => import('./views/GruposDisponiveis'));
const GruposConvite = React.lazy(() => import('./views/GruposConvite'));
const MinhaCarteira = React.lazy(() => import('./views/MinhaCarteira'));

const Perfil = React.lazy(() => import('./views/Perfil'));
const Configuracoes = React.lazy(() => import('./views/Configuracoes'));
const Dashboard = React.lazy(() => import('./views/Dashboard/Dashboard'));
const ComoFunciona = React.lazy(() => import('./views/ComoFunciona'));

// Admin Views - Lazy Loaded
const AdminStats = React.lazy(() => import('./views/AdminStats'));
const AdminNotificacoes = React.lazy(() => import('./views/AdminNotificacoes'));
const AdminSaques = React.lazy(() => import('./views/AdminSaques'));
const AdminGrupos = React.lazy(() => import('./views/AdminGrupos'));
const AdminUsuarios = React.lazy(() => import('./views/AdminUsuarios'));
const AdminCarteiras = React.lazy(() => import('./views/AdminCarteiras'));

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [currentView, setCurrentView] = useState('dashboard');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Invite parameter tracking for auto-assignment on AuthScreen
  const [inviteCodeParam, setInviteCodeParam] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) setInviteCodeParam(invite);

    try {
      const cached = localStorage.getItem('ajudae_user_profile');
      if (cached) setUser(JSON.parse(cached));
    } catch (e) {
      console.warn(e);
    }

    const checkLogin = async () => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          const profile = await api.me();
          if (profile && profile.user) {
            setUser(profile.user);
            try { localStorage.setItem('ajudae_user_profile', JSON.stringify(profile.user)); } catch(e) {}
            if (invite) {
              try {
                await api.registerInviteClick(invite);
                window.history.replaceState({}, document.title, window.location.pathname);
                setCurrentView('grupos_convite');
              } catch (err: any) {
                console.error('Error auto-applying invite parameter:', err);
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
          }
          break;
        } catch (err: any) {
          if (err.message && (err.message.includes('502') || err.message.includes('504') || err.message.includes('rede'))) {
            attempts++;
            await new Promise(r => setTimeout(r, 1500));
          } else {
            setUser(null);
            try {
              localStorage.removeItem('ajudae_auth_token');
              localStorage.removeItem('ajudae_user_id');
              localStorage.removeItem('ajudae_user_profile');
            } catch(e) {}
            break;
          }
        }
      }
      setLoading(false);
    };
    checkLogin();
  }, []);

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
    try {
      localStorage.removeItem('ajudae_auth_token');
      localStorage.removeItem('ajudae_user_id');
      localStorage.removeItem('ajudae_user_profile');
    } catch(e) {}
  };

  const handleToggleAdminMode = (mode: boolean) => {
    setIsAdminMode(mode);
    setCurrentView(mode ? 'admin_dashboard' : 'dashboard');
  };

  // --- INITIAL LOADING SCREEN ---
  if (loading) {
    return (
      <div className="min-h-[100dvh] md:min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-400 font-mono text-sm">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500/20 border-t-emerald-500 animate-spin mb-4" />
        Carregando ambiente seguro...
      </div>
    );
  }

  // --- AUTHENTICATION SCREEN ---
  if (!user) {
    return (
      <ExperienceProvider>
        <Toaster />
        <AuthScreen 
          onAuthSuccess={setUser} 
          inviteCodeParam={inviteCodeParam} 
        />
      </ExperienceProvider>
    );
  }

  // --- ROUTER DISPATCHER ---
  const renderView = () => {
    if (isAdminMode) {
      switch (currentView) {
        case 'admin_dashboard': return <AdminStats onNavigate={setCurrentView} />;
        case 'admin_notificacoes': return <AdminNotificacoes />;
        case 'admin_saques': return <AdminSaques user={user} />;
        case 'admin_grupos': return <AdminGrupos />;
        case 'admin_usuarios': return <AdminUsuarios />;
        case 'admin_carteiras': return <AdminCarteiras />;
        default: return <AdminStats onNavigate={setCurrentView} />;
      }
    } else {
      switch (currentView) {
        case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
        case 'home': return <Home user={user} onNavigate={setCurrentView} />;
        case 'meus_grupos': return <MeusGrupos user={user} />;
        case 'grupos_disponiveis': return <GruposDisponiveis user={user} />;
        case 'grupos_convite': return <GruposConvite user={user} />;
        case 'minha_carteira': return <MinhaCarteira user={user} onNavigate={setCurrentView} />;
        case 'como_funciona': return <ComoFunciona />;

        case 'perfil': return <Perfil user={user} onUserUpdate={(u) => { setUser(u); localStorage.setItem('ajudae_user_profile', JSON.stringify(u)); }} />;
        case 'configuracoes': return <Configuracoes user={user} onUserUpdate={setUser} />;
        default: return <NotFound onNavigate={setCurrentView} />;
      }
    }
  };

  // --- MAIN PLATFORM RENDERING WRAPPER (AUTHENTICATED) ---
  return (
    <ErrorBoundary>
      <ExperienceProvider>
        <Toaster />
        <GlobalPopupManager />
        
        <AppShell
          activeView={currentView}
          onNavigate={setCurrentView}
          user={user}
          isAdminMode={isAdminMode}
          onToggleAdminMode={handleToggleAdminMode}
          onLogout={handleLogout}
        >
          <ErrorBoundary>
            <Suspense fallback={<div className="h-full w-full flex items-center justify-center p-8"><GlobalProgressBar /></div>}>
              {renderView()}
            </Suspense>
          </ErrorBoundary>
        </AppShell>
      </ExperienceProvider>
    </ErrorBoundary>
  );
}
