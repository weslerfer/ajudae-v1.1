/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, RefreshCw, Fingerprint, ArrowLeft, Send, MapPin, Building2, Phone } from 'lucide-react';
import { api } from '../../api';
import { UserProfile } from '../../types';
import { useFeedback } from '../../providers/FeedbackProvider';
import { useToast } from '../../components/ui/useToast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Typography } from '../../components/ui/Typography';
import { Surface } from '../../components/ui/Surface';
import { fadeUp } from '../../experience/presets/presets';
import { motion, AnimatePresence } from 'motion/react';
import { GlassSurface } from '../../components/ui/GlassSurface';

interface AuthScreenProps {
  onAuthSuccess: (user: UserProfile) => void;
  inviteCodeParam: string | null;
}

type AuthState = 'login' | 'register' | 'forgot_password' | 'waiting_email' | 'reset_password' | 'mfa_challenge';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess, inviteCodeParam }) => {
  const [authState, setAuthState] = useState<AuthState>('login');
  
  const { executeAction, isGlobalLoading } = useFeedback();
  const { toast } = useToast();

  // Shared state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Registry state
  const [regNome, setRegNome] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regCidade, setRegCidade] = useState('');
  const [regEstado, setRegEstado] = useState('');
  const [regTelefone, setRegTelefone] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  useEffect(() => {
    // If we land with a reset token in URL, we could parse it and jump to reset_password
    const params = new URLSearchParams(window.location.search);
    const token = params.get('reset');
    if (token) {
      setResetToken(token);
      setAuthState('reset_password');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Atenção', description: 'Preencha seu e-mail e sua senha.', variant: 'warning' });
      return;
    }

    await executeAction(
      async () => {
        const res = await api.login({ email, senha: password });
        
        // MFA Preparation Mock Logic
        if (res.status === 'mfa_required') {
          setAuthState('mfa_challenge');
          return;
        }

        if (res.user && res.user.id) {
          try {
            if (res.token) localStorage.setItem('ajudae_auth_token', res.token);
            localStorage.setItem('ajudae_user_id', res.user.id);
            localStorage.setItem('ajudae_user_profile', JSON.stringify(res.user));
          } catch (e) {
            console.warn('Failed to persist session in localStorage:', e);
          }
        }
        
        if (inviteCodeParam) {
          try {
            const resInvite: any = await api.registerInviteClick(inviteCodeParam);
            window.history.replaceState({}, document.title, window.location.pathname);
            if (resInvite.message) {
              toast({ title: 'Convite', description: resInvite.message, variant: resInvite.already_added ? 'info' : 'success' });
            }
          } catch (inviteErr: any) {
            if (inviteErr.message) toast({ title: 'Erro de Convite', description: inviteErr.message, variant: 'error' });
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }
        onAuthSuccess(res.user);
      },
      undefined,
      'Credenciais incorretas ou conta não encontrada.'
    );
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNome || !regCpf || !regCidade || !regEstado || !regTelefone || !email || !password || !regConfirmPassword) {
      toast({ title: 'Atenção', description: 'Preencha todos os campos.', variant: 'warning' });
      return;
    }

    if (password !== regConfirmPassword) {
      toast({ title: 'Atenção', description: 'As senhas digitadas não coincidem.', variant: 'warning' });
      return;
    }

    await executeAction(
      async () => {
        const res = await api.register({
          nome_completo: regNome,
          cpf: regCpf,
          cidade: regCidade,
          estado: regEstado,
          telefone: regTelefone,
          email,
          senha: password
        });

        if (res.user && res.user.id) {
          if (res.token) localStorage.setItem('ajudae_auth_token', res.token);
          localStorage.setItem('ajudae_user_id', res.user.id);
          localStorage.setItem('ajudae_user_profile', JSON.stringify(res.user));
          
          if (inviteCodeParam) {
            try {
              const resInvite: any = await api.registerInviteClick(inviteCodeParam);
              window.history.replaceState({}, document.title, window.location.pathname);
              if (resInvite.message) {
                toast({ title: 'Convite', description: resInvite.message, variant: resInvite.already_added ? 'info' : 'success' });
              }
            } catch (err: any) {}
          }
          onAuthSuccess(res.user);
        }
      },
      'Sua conta foi criada com sucesso. Bem-vindo!',
      'Falha ao criar conta. O e-mail ou CPF pode já estar em uso.'
    );
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({ title: 'Atenção', description: 'Digite seu e-mail para continuar.', variant: 'warning' });
      return;
    }

    await executeAction(
      async () => {
        const res: any = await api.requestPasswordReset(email);
        if (res.nextStep === 'waiting_email') {
          setAuthState('waiting_email');
        }
      },
      'Link enviado. Verifique sua caixa de entrada.',
      'Erro ao solicitar redefinição.'
    );
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !regConfirmPassword) {
      toast({ title: 'Atenção', description: 'Preencha a nova senha.', variant: 'warning' });
      return;
    }
    if (password !== regConfirmPassword) {
      toast({ title: 'Atenção', description: 'As senhas não coincidem.', variant: 'warning' });
      return;
    }

    await executeAction(
      async () => {
        const res: any = await api.verifyPasswordReset(resetToken, password);
        if (res.nextStep === 'login') {
          setAuthState('login');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      },
      'Sua senha foi redefinida com sucesso.',
      'Erro ao redefinir. Token expirado.'
    );
  };

  // ---- RENDER HELPERS ----


  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-slate-950 flex">
      {/* Left Column (Brand/Info) */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative overflow-hidden bg-slate-900 border-r border-slate-800/50">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-full h-[500px] bg-rose-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none transform translate-x-1/3 translate-y-1/3"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-emerald-400 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-black text-xl tracking-wider">AJUDAAE</span>
          </div>
          <Typography variant="body" color="secondary" className="max-w-md mt-6 text-lg">
            A plataforma de gestão de ajuda financeira mais completa do Brasil.
          </Typography>
        </div>


      </div>

      {/* Right Column (Auth Journey) */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-24 xl:px-32 relative overflow-y-auto">
        
        <div className="max-w-[400px] w-full mx-auto relative z-10">
          <AnimatePresence mode="wait">
            
            {/* LOGIN STATE */}
            {authState === 'login' && (
              <motion.div key="login" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="mb-8">
                  <Typography variant="h2" className="text-white mb-2">Entrar no Sistema</Typography>
                  <Typography variant="body" color="secondary">
                    Insira suas credenciais para continuar.
                  </Typography>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">E-mail ou CPF</label>
                    <Input
                      type="text"
                      icon={<Mail />}
                      placeholder="seu.nome@empresa.com ou CPF"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Senha de Acesso</label>
                      <button type="button" onClick={() => setAuthState('forgot_password')} className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 uppercase tracking-wider">
                        Recuperar Acesso
                      </button>
                    </div>
                    <Input
                      type="password"
                      icon={<Lock />}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" variant="primary" className="w-full mt-4" disabled={isGlobalLoading}>
                    {isGlobalLoading ? 'Autenticando...' : 'Acessar Conta'}
                  </Button>
                </form>


                <div className="mt-8 text-center">
                  <Typography variant="caption" color="secondary">
                    Não possui acesso?{' '}
                    <button type="button" onClick={() => setAuthState('register')} className="text-emerald-400 hover:text-emerald-300 font-bold ml-1">
                      Faça o Cadastro
                    </button>
                  </Typography>
                </div>
              </motion.div>
            )}

            {/* REGISTER STATE */}
            {authState === 'register' && (
              <motion.div key="register" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <Typography variant="h2" className="text-white mb-2">Novo Cadastro</Typography>
                    <Typography variant="body" color="secondary">
                      Preencha a ficha de ativação para solicitar acesso.
                    </Typography>
                  </div>
                  <button type="button" onClick={() => setAuthState('login')} className="p-2 hover:bg-white/5 rounded-lg text-slate-400 transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-6">
                  {/* Etapa 1: Conta */}
                  <div className="space-y-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold">1</div>
                      <Typography variant="caption" className="font-bold uppercase tracking-widest text-slate-300">Credenciais</Typography>
                    </div>
                    <div>
                      <Input icon={<Mail />} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input icon={<Lock />} type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
                      <Input icon={<Lock />} type="password" placeholder="Repetir Senha" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required />
                    </div>
                  </div>

                  {/* Etapa 2: Identidade */}
                  <div className="space-y-5 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs font-bold">2</div>
                      <Typography variant="caption" className="font-bold uppercase tracking-widest text-slate-300">Identidade</Typography>
                    </div>
                    <div>
                      <Input icon={<User />} placeholder="Nome Completo" value={regNome} onChange={(e) => setRegNome(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input icon={<User />} placeholder="CPF" value={regCpf} onChange={(e) => setRegCpf(e.target.value)} required />
                      <Input icon={<Phone />} type="tel" placeholder="Telefone" value={regTelefone} onChange={(e) => setRegTelefone(e.target.value)} required />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input icon={<Building2 />} placeholder="Cidade" value={regCidade} onChange={(e) => setRegCidade(e.target.value)} required />
                      <Input icon={<MapPin />} placeholder="Estado (UF)" value={regEstado} onChange={(e) => setRegEstado(e.target.value)} maxLength={2} required />
                    </div>
                  </div>
                  
                  <Button type="submit" variant="primary" className="w-full mt-4" disabled={isGlobalLoading}>
                    {isGlobalLoading ? 'Processando...' : 'Finalizar Registro'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* FORGOT PASSWORD STATE */}
            {authState === 'forgot_password' && (
              <motion.div key="forgot_password" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="mb-8">
                  <button type="button" onClick={() => setAuthState('login')} className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white mb-6">
                    <ArrowLeft className="w-4 h-4" /> Voltar
                  </button>
                  <Typography variant="h2" className="text-white mb-2">Recuperar Acesso</Typography>
                  <Typography variant="body" color="secondary">
                    Enviaremos um link seguro para a sua caixa de entrada para redefinição.
                  </Typography>
                </div>
                
                <form onSubmit={handleForgotPassword} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">E-mail Cadastrado</label>
                    <Input
                      type="email"
                      icon={<Mail />}
                      placeholder="seu.nome@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button type="submit" variant="primary" className="w-full" disabled={isGlobalLoading}>
                    {isGlobalLoading ? 'Enviando...' : 'Solicitar Link'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* WAITING EMAIL STATE */}
            {authState === 'waiting_email' && (
              <motion.div key="waiting_email" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center">
                <div className="w-16 h-16 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Send className="w-8 h-8 text-indigo-400" />
                </div>
                <Typography variant="h2" className="text-white mb-3">Verifique seu E-mail</Typography>
                <Typography variant="body" color="secondary" className="mb-8">
                  Nós enviamos instruções de acesso para <strong>{email || 'o seu e-mail'}</strong>. O link de segurança expira em 15 minutos.
                </Typography>
                
                <Button variant="secondary" className="w-full" onClick={() => setAuthState('login')}>
                  Voltar para o Login
                </Button>
              </motion.div>
            )}

            {/* RESET PASSWORD STATE */}
            {authState === 'reset_password' && (
              <motion.div key="reset_password" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                <div className="mb-8">
                  <Typography variant="h2" className="text-white mb-2">Nova Senha</Typography>
                  <Typography variant="body" color="secondary">
                    Crie uma credencial de acesso forte para proteger sua conta.
                  </Typography>
                </div>
                
                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">Nova Senha</label>
                    <Input type="password" icon={<Lock />} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">Repita a Senha</label>
                    <Input type="password" icon={<Lock />} placeholder="••••••••" value={regConfirmPassword} onChange={(e) => setRegConfirmPassword(e.target.value)} required />
                  </div>
                  
                  <Button type="submit" variant="primary" className="w-full" disabled={isGlobalLoading}>
                    {isGlobalLoading ? 'Salvando...' : 'Redefinir e Entrar'}
                  </Button>
                </form>
              </motion.div>
            )}

            {/* MFA CHALLENGE STATE (Mock) */}
            {authState === 'mfa_challenge' && (
              <motion.div key="mfa_challenge" variants={fadeUp} initial="hidden" animate="visible" exit="exit" className="text-center">
                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Fingerprint className="w-8 h-8 text-amber-400" />
                </div>
                <Typography variant="h2" className="text-white mb-3">Autenticação Dupla</Typography>
                <Typography variant="body" color="secondary" className="mb-8">
                  Para garantir a segurança, valide sua identidade.
                </Typography>
                
                <div className="space-y-4">
                  <Input type="text" placeholder="Código de 6 dígitos" className="text-center text-lg tracking-widest font-mono" />
                  <Button variant="primary" className="w-full">
                    Confirmar Código
                  </Button>
                  <Button variant="secondary" className="w-full" onClick={() => setAuthState('login')}>
                    Cancelar
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};
