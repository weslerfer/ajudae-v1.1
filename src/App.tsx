/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  Phone, 
  UserPlus2, 
  Compass, 
  Layers, 
  RefreshCw, 
  AlertCircle,
  TrendingUp,
  Coins,
  ShieldAlert,
  Fingerprint
} from 'lucide-react';
import { api } from './api';
import { UserProfile } from './types';

// Components
import Sidebar from './components/Sidebar';

// Views - User
import Home from './views/Home';
import MeusGrupos from './views/MeusGrupos';
import GruposDisponiveis from './views/GruposDisponiveis';
import GruposConvite from './views/GruposConvite';
import MinhaCarteira from './views/MinhaCarteira';
import ComoFunciona from './views/ComoFunciona';
import Configuracoes from './views/Configuracoes';

// Views - Admin
import AdminStats from './views/AdminStats';
import AdminNotificacoes from './views/AdminNotificacoes';
import AdminSaques from './views/AdminSaques';
import AdminGrupos from './views/AdminGrupos';
import AdminUsuarios from './views/AdminUsuarios';
import AdminCarteiras from './views/AdminCarteiras';
import GlobalPopupManager from './components/GlobalPopupManager';
import { AuthForms } from './components/AuthForms';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation states
  const [currentView, setCurrentView] = useState('home');
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Authentication states
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Login form field controls
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form field controls
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regCidade, setRegCidade] = useState('');
  const [regEstado, setRegEstado] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Global Toast
  const [globalMessage, setGlobalMessage] = useState<{ text: string, type: 'success' | 'error' | 'info' } | null>(null);
  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setGlobalMessage({ text, type });
    setTimeout(() => setGlobalMessage(null), 5000);
  };

  // Auto trigger capture invite code parameter
  const [inviteCodeParam, setInviteCodeParam] = useState<string | null>(null);

  // Capture parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteCodeParam(invite);
      console.log('Detected incoming invite code param:', invite);
    }

    // Attempt to instantly load cached local user profile to avoid brief logout flashes during reloads
    try {
      const cached = localStorage.getItem('ajudae_user_profile');
      if (cached) setUser(JSON.parse(cached));
    } catch (e) {
      console.warn(e);
    }

    // Try auto-login using persisted local user id
    const checkLogin = async () => {
      let attempts = 0;
      while (attempts < 3) {
        try {
          const profile = await api.me();
          if (profile && profile.user) {
            setUser(profile.user);
            try { localStorage.setItem('ajudae_user_profile', JSON.stringify(profile.user)); } catch(e) {}
            // If user logs in with invite parameter, automatically trigger invite click association
            if (invite) {
              try {
                const res: any = await api.registerInviteClick(invite);
                window.history.replaceState({}, document.title, window.location.pathname);
                
                if (res.message) {
                  showMessage(res.message, res.already_added ? 'info' : 'success');
                }
                setCurrentView('grupos_convite');
              } catch (err: any) {
                console.error('Error auto-applying invite parameter:', err);
                if (err.message) showMessage(err.message, 'error');
                window.history.replaceState({}, document.title, window.location.pathname);
              }
            }
          }
          break; // successfully verified session
        } catch (err: any) {
          if (err.message && (err.message.includes('502') || err.message.includes('504') || err.message.includes('rede'))) {
            // Container proxy might be restarting during development, retry
            attempts++;
            await new Promise(r => setTimeout(r, 1500));
          } else {
            console.log('No current session detected or session is invalid, clearing cache.');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setAuthError('Preencha seu e-mail e sua senha de acesso.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.login({ email: loginEmail, senha: loginPassword });
      if (res.user && res.user.id) {
        try {
          if (res.token) {
            localStorage.setItem('ajudae_auth_token', res.token);
          }
          localStorage.setItem('ajudae_user_id', res.user.id);
          localStorage.setItem('ajudae_user_profile', JSON.stringify(res.user));
        } catch (e) {
          console.warn('Failed to persist session in localStorage:', e);
        }
      }
      setUser(res.user);
      
      // Auto register the potential invite clicks after successful auth
      if (inviteCodeParam) {
        try {
          const res: any = await api.registerInviteClick(inviteCodeParam);
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (res.message) {
            showMessage(res.message, res.already_added ? 'info' : 'success');
          }
          setCurrentView('grupos_convite');
        } catch (inviteErr: any) {
          console.error('Invite association error during login:', inviteErr);
          if (inviteErr.message) showMessage(inviteErr.message, 'error');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

    } catch (err: any) {
      setAuthError(err.message || 'Credenciais de acesso incorretas. Tente novamente.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome || !regCpf || !regCidade || !regEstado || !regTelefone || !regEmail || !regPassword || !regConfirmPassword) {
      setAuthError('Preencha todos os campos do formulário de cadastro.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setAuthError('As senhas digitadas não coincidem.');
      return;
    }

    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await api.register({
        nome_completo: regNome,
        cpf: regCpf,
        cidade: regCidade,
        estado: regEstado,
        telefone: regTelefone,
        email: regEmail,
        senha: regPassword
      });
      if (res.user && res.user.id) {
        try {
          if (res.token) {
            localStorage.setItem('ajudae_auth_token', res.token);
          }
          localStorage.setItem('ajudae_user_id', res.user.id);
          localStorage.setItem('ajudae_user_profile', JSON.stringify(res.user));
        } catch (e) {
          console.warn('Failed to persist session in localStorage:', e);
        }
      }
      setUser(res.user);

      // Auto register the potential invite clicks after successful signup
      if (inviteCodeParam) {
        try {
          const res: any = await api.registerInviteClick(inviteCodeParam);
          window.history.replaceState({}, document.title, window.location.pathname);
          
          if (res.message) {
            showMessage(res.message, res.already_added ? 'info' : 'success');
          }
          setCurrentView('grupos_convite');
        } catch (inviteErr: any) {
          console.error('Invite association error during signup:', inviteErr);
          if (inviteErr.message) showMessage(inviteErr.message, 'error');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }

    } catch (err: any) {
      setAuthError(err.message || 'Falha ao registrar usuário.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch(e) {}
    try {
      localStorage.removeItem('ajudae_auth_token');
      localStorage.removeItem('ajudae_user_id');
      localStorage.removeItem('ajudae_user_profile');
    } catch (e) {
      console.warn('Failed to remove session from localStorage:', e);
    }
    setUser(null);
    setIsAdminMode(false);
    setCurrentView('home');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 gap-3 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm font-semibold tracking-wide uppercase font-mono">Iniciando plataforma Ajudae...</span>
      </div>
    );
  }

  // --- RENDERING LOGIN / OFF-CAMPUS SECURITY ENTRY SCREENS ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 font-sans antialiased text-slate-200">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          {/* Logo Title Group */}
          <div className="text-center space-y-2">
            <div className="inline-flex py-3 px-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-3xl mb-1 shadow-lg">
              <Coins className="w-8 h-8 animate-bounce" />
            </div>
            
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">AJUDAE</h1>
              <p className="text-xs text-slate-400 font-medium">
                Grupos Digitais de Ajuda Mútua Financeira Responsável
              </p>
            </div>

            {inviteCodeParam && (
              <div className="mt-3 py-1.5 px-3 bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 text-[10px] rounded-xl font-mono uppercase font-bold inline-block animate-pulse">
                Convite Oficial Ativado! Código: {inviteCodeParam}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6.5 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
            
            {/* View toggler */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-905">
              <button
                type="button"
                onClick={() => { setIsRegistering(false); setAuthError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  !isRegistering ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Identificar-se
              </button>
              <button
                type="button"
                onClick={() => { setIsRegistering(true); setAuthError(''); }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isRegistering ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cadastre-se
              </button>
            </div>

            {authError && (
              <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {/* LOGIN E CADASTRO VIA COMPONENTE */}
            <AuthForms
              isRegistering={isRegistering}
              loginEmail={loginEmail}
              setLoginEmail={setLoginEmail}
              loginPassword={loginPassword}
              setLoginPassword={setLoginPassword}
              regNome={regNome}
              setRegNome={setRegNome}
              regCpf={regCpf}
              setRegCpf={setRegCpf}
              regCidade={regCidade}
              setRegCidade={setRegCidade}
              regEstado={regEstado}
              setRegEstado={setRegEstado}
              regTelefone={regTelefone}
              setRegTelefone={setRegTelefone}
              regEmail={regEmail}
              setRegEmail={setRegEmail}
              regPassword={regPassword}
              setRegPassword={setRegPassword}
              regConfirmPassword={regConfirmPassword}
              setRegConfirmPassword={setRegConfirmPassword}
              authLoading={authLoading}
              handleLogin={handleLogin}
              handleRegister={handleRegister}
            />
          </div>
        </div>
      </div>
    );
  }

  // Reload user details state upon settings change callback
  const handleUpdateUserLocally = () => {
    api.me().then(profile => {
      if (profile && profile.user) {
        setUser(profile.user);
        try { localStorage.setItem('ajudae_user_profile', JSON.stringify(profile.user)); } catch(e) {}
      }
    });
  };

  const handleToggleAdminMode = (mode: boolean) => {
    setIsAdminMode(mode);
    setCurrentView(mode ? 'admin_home' : 'home');
  };

  // --- MAIN PLATFORM RENDERING WRAPPER (AUTHENTICATED) ---
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row font-sans antialiased text-slate-200">
      <GlobalPopupManager />

      {/* Side dynamic navigation component */}
      <Sidebar 
        user={user} 
        isAdminMode={isAdminMode} 
        onNavigate={setCurrentView} 
        currentView={currentView}
        onToggleAdminMode={handleToggleAdminMode}
        onLogout={handleLogout}
      />

      {/* Primary interactive layout view pane */}
      <main className="flex-1 min-w-0 px-6 py-6 md:px-10 lg:pt-24 overflow-y-auto relative">
        {globalMessage && (
          <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full text-xs font-bold font-mono tracking-wide shadow-2xl animate-fade-in border ${
            globalMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
            globalMessage.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
            'bg-blue-500/10 text-blue-400 border-blue-500/20'
          }`}>
            {globalMessage.text}
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          
          {/* USER VIEWS ROUTING */}
          {!isAdminMode ? (
            <>
              {currentView === 'home' && (
                <Home user={user} onNavigate={setCurrentView} />
              )}
              {currentView === 'meus_grupos' && (
                <MeusGrupos user={user} />
              )}
              {currentView === 'grupos_disponiveis' && (
                <GruposDisponiveis user={user} />
              )}
              {currentView === 'grupos_convite' && (
                <GruposConvite user={user} />
              )}
              {currentView === 'carteira' && (
                <MinhaCarteira user={user} onNavigate={setCurrentView} />
              )}
              {currentView === 'como_funciona' && (
                <ComoFunciona />
              )}
              {currentView === 'configuracoes' && (
                <Configuracoes user={user} onUserUpdate={handleUpdateUserLocally} />
              )}
            </>
          ) : (
            /* ADMIN VIEWS ROUTING */
            <>
              {currentView === 'admin_home' && (
                <AdminStats onNavigate={setCurrentView} />
              )}
              {currentView === 'admin_notificacoes' && (
                <AdminNotificacoes />
              )}
              {currentView === 'admin_saques' && (
                <AdminSaques />
              )}
              {currentView === 'admin_grupos' && (
                <AdminGrupos />
              )}
              {currentView === 'admin_usuarios' && (
                <AdminUsuarios />
              )}
              {currentView === 'admin_carteiras' && (
                <AdminCarteiras />
              )}
            </>
          )}

        </div>
      </main>

    </div>
  );
}
