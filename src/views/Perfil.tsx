/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  UserCircle2, 
  Mail, 
  Phone, 
  ShieldCheck, 
  Smartphone, 
  KeyRound, 
  ShieldAlert,
  Activity,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
  BadgeCheck,
  Building2,
  MapPin,
  Banknote,
  Landmark,
  CreditCard
} from 'lucide-react';
import { UserProfile } from '../types';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Typography } from '../components/ui/Typography';
import { Grid } from '../components/ui/Grid';
import { GlassSurface } from '../components/ui/GlassSurface';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { useProfileIdentity } from '../hooks/useProfileIdentity';
import { EditProfileModal } from '../components/profile/EditProfileModal';
import { ChangePasswordModal } from '../components/profile/ChangePasswordModal';
import { useToast } from '../components/ui/useToast';

interface PerfilProps {
  user: UserProfile;
  onUserUpdate?: (user: UserProfile) => void;
}

export default function Perfil({ user, onUserUpdate }: PerfilProps) {
  const identity = useProfileIdentity(user);
  const { toast } = useToast();

  if (!identity) return null;

  const { papel, statusConta, health, security, activity } = identity;

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  const handleManageSessions = () => {
    toast({
      title: 'Em breve',
      description: 'O gerenciamento de sessões e dispositivos será disponibilizado em uma próxima atualização.',
      variant: 'default'
    });
  };

  const renderHealthIndicator = (label: string, active: boolean) => (
    <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-white/5">
      {active ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 text-slate-600 shrink-0" />
      )}
      <Typography variant="caption" className={active ? 'text-white' : 'text-slate-500'}>
        {label}
      </Typography>
    </div>
  );

  return (
    <Section className="pt-8 pb-24">
      <Container>
        
        {/* Header / Identity Hero */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 mb-8">
          <Typography variant="h2" className="mb-1">Identidade Digital</Typography>
          <Typography variant="body" color="secondary">
            Sua identidade verificada e credenciais de acesso ao sistema.
          </Typography>
        </div>

        <Grid cols={3} gap="lg">
          
          {/* Coluna Principal (Identidade e Conta) */}
          <div className="col-span-1 md:col-span-2 space-y-8">
            
            {/* Identity Card */}
            <Surface className="p-8 relative overflow-hidden bg-slate-900 border-slate-800 flex items-center gap-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center border border-white/10 shrink-0 shadow-xl z-10 relative">
                <UserCircle2 className="w-12 h-12 text-slate-500" />
                {health.score > 50 && (
                  <div className="absolute bottom-0 right-0 bg-emerald-500 text-slate-900 p-1 rounded-full border-2 border-slate-900">
                    <BadgeCheck className="w-4 h-4" />
                  </div>
                )}
              </div>
              
              <div className="z-10 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <Typography variant="h3" className="truncate">{user.nome_completo}</Typography>
                </div>
                <Typography variant="body" color="secondary" className="mb-4">{papel}</Typography>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    statusConta === 'Ativa' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    Conta {statusConta}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Registrado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            </Surface>

            {/* Conta (Read-only por padrão) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <Typography variant="h4" className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  Dados do Usuário
                </Typography>
                <Button variant="secondary" size="sm" onClick={() => setIsEditProfileOpen(true)}>
                  Editar Perfil
                </Button>
              </div>
              
              <GlassSurface intensity="subtle" className="p-6 border-slate-800">
                <Grid cols={2} gap="md">
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase flex items-center gap-2">
                      <UserCircle2 className="w-3 h-3" /> Nome Completo
                    </Typography>
                    <Typography variant="body" className="font-bold truncate">{user.nome_completo}</Typography>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase flex items-center gap-2">
                      <Mail className="w-3 h-3" /> Endereço de E-mail
                    </Typography>
                    <Typography variant="body" className="font-bold truncate">{user.email}</Typography>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase flex items-center gap-2">
                      <Phone className="w-3 h-3" /> Telefone Celular
                    </Typography>
                    <Typography variant="body" className="font-bold">{user.telefone || 'Não informado'}</Typography>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase flex items-center gap-2">
                      <CreditCard className="w-3 h-3" /> CPF
                    </Typography>
                    <Typography variant="body" className="font-bold">{user.cpf || 'Não informado'}</Typography>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase flex items-center gap-2">
                      <Building2 className="w-3 h-3" /> Cidade
                    </Typography>
                    <Typography variant="body" className="font-bold truncate">{user.cidade || 'Não informada'}</Typography>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-1">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase flex items-center gap-2">
                      <MapPin className="w-3 h-3" /> Estado
                    </Typography>
                    <Typography variant="body" className="font-bold uppercase">{user.estado || 'NI'}</Typography>
                  </div>

                </Grid>
              </GlassSurface>
            </div>

            {/* Segurança */}
            <div>
              <Typography variant="h4" className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Segurança e Acessos
              </Typography>
              
              <GlassSurface intensity="subtle" className="p-0 border-slate-800 overflow-hidden divide-y divide-white/5">
                <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-900 rounded-lg border border-white/10">
                      <KeyRound className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold block">Senha de Acesso</Typography>
                      <Typography variant="caption" color="secondary">Última alteração: {security.ultimaSenhaAlterada}</Typography>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => setIsChangePasswordOpen(true)}>Alterar Senha</Button>
                </div>
                
                <div className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-slate-900 rounded-lg border border-white/10">
                      <Smartphone className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <Typography variant="body" className="font-bold block">Sessões e Dispositivos</Typography>
                      <Typography variant="caption" color="secondary">{security.sessoesAtivas} sessão ativa neste momento</Typography>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={handleManageSessions}>Gerenciar</Button>
                </div>
              </GlassSurface>
            </div>

          </div>

          {/* Coluna Lateral (Saúde e Atividade) */}
          <div className="col-span-1 space-y-8">
            
            {/* Saúde da Conta */}
            <div>
              <Typography variant="h4" className="mb-4">Saúde da Conta</Typography>
              <GlassSurface intensity="subtle" className="p-6 border-slate-800">
                <div className="mb-6">
                  <div className="flex justify-between items-end mb-2">
                    <Typography variant="caption" className="font-mono uppercase text-slate-400">Nível de Completude</Typography>
                    <Typography variant="h3" className="font-mono text-emerald-400">{health.score}%</Typography>
                  </div>
                  <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 transition-all duration-1000 ease-out"
                      style={{ width: `${health.score}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  {renderHealthIndicator('E-mail Verificado', health.emailVerificado)}
                  {renderHealthIndicator('Telefone Confirmado', health.telefoneConfirmado)}
                  {renderHealthIndicator('Identidade Validada (KYC)', health.documentoValidado)}
                  {renderHealthIndicator('Autenticação 2 Fatores', health.doisFatoresAtivo)}
                  {renderHealthIndicator('Foto de Perfil', health.fotoPerfil)}
                </div>
              </GlassSurface>
            </div>

            {/* Resumo de Atividade */}
            <div>
              <Typography variant="h4" className="mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Sua Atividade
              </Typography>
              <GlassSurface intensity="subtle" className="p-6 border-slate-800">
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase">Grupos Ativos</Typography>
                    <Typography variant="h4" className="font-mono">{activity.gruposAtivos}</Typography>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase">Convites Pendentes</Typography>
                    <Typography variant="h4" className="font-mono">{activity.convitesRecebidos}</Typography>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/5">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase">Movimentações no Mês</Typography>
                    <Typography variant="h4" className="font-mono">{activity.movimentacoesRecentes}</Typography>
                  </div>
                  <div className="pt-2">
                    <Typography variant="caption" color="secondary" className="flex items-center gap-1.5 text-[10px]">
                      <History className="w-3 h-3" />
                      Último acesso: hoje, às {new Date(activity.ultimoAcesso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute:'2-digit' })}
                    </Typography>
                  </div>
                </div>
              </GlassSurface>
            </div>

          </div>
        </Grid>

      </Container>

      {/* Modals */}
      <EditProfileModal 
        isOpen={isEditProfileOpen} 
        onClose={() => setIsEditProfileOpen(false)} 
        user={user}
        onUpdate={(u) => onUserUpdate && onUserUpdate(u)}
      />

      <ChangePasswordModal 
        isOpen={isChangePasswordOpen} 
        onClose={() => setIsChangePasswordOpen(false)} 
        onSuccess={() => {}}
      />
    </Section>
  );
}
