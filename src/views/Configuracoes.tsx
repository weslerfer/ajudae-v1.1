/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings2, 
  Palette, 
  BellRing, 
  Shield, 
  LockKeyhole, 
  WalletCards, 
  Plug,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Info
} from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Typography } from '../components/ui/Typography';
import { Grid } from '../components/ui/Grid';
import { GlassSurface } from '../components/ui/GlassSurface';
import { Surface } from '../components/ui/Surface';
import { Button } from '../components/ui/Button';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useSettings, AppSettings } from '../hooks/useSettings';
import { useFeedback } from '../providers/FeedbackProvider';
import { useToast } from '../components/ui/useToast';

interface ConfiguracoesProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onLogout?: () => void;
}

export default function Configuracoes({ user, onUserUpdate }: ConfiguracoesProps) {
  const { settings, updateSetting, loading } = useSettings(user);
  const { executeAction } = useFeedback();
  const { toast } = useToast();

  // Recebimentos (PIX) State
  const [isPixModalOpen, setIsPixModalOpen] = useState(false);
  const [pixStep, setPixStep] = useState<'view' | 'edit' | 'confirm'>('view');
  const [draftChavePix, setDraftChavePix] = useState(user.chave_pix || '');
  const [draftBancoPix, setDraftBancoPix] = useState(user.banco_pix || '');

  if (loading) return null;

  const handleToggle = (key: keyof AppSettings) => {
    const newVal = !settings[key];
    updateSetting(key, newVal as never);
    toast({
      title: 'Preferência Atualizada',
      description: 'A configuração foi salva localmente com sucesso.',
      variant: 'success'
    });
  };

  const handleSavePix = async () => {
    if (!draftChavePix.trim() || !draftBancoPix.trim()) {
      toast({ title: 'Erro', description: 'Por favor, informe a chave Pix e a instituição bancária.', variant: 'error' });
      return;
    }

    await executeAction(
      async () => {
        const res = await api.updatePix(draftChavePix, draftBancoPix);
        if (res.success && res.user) {
          onUserUpdate(res.user);
          setIsPixModalOpen(false);
          setPixStep('view');
        }
      },
      'Conta de recebimento (PIX) atualizada.',
      'Falha ao atualizar conta de recebimento.'
    );
  };

  const RenderToggle = ({ label, desc, settingKey }: { label: string, desc: string, settingKey: keyof AppSettings }) => {
    const isActive = Boolean(settings[settingKey]);
    
    return (
      <div className="flex items-start justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/5 p-4 rounded-xl transition-colors cursor-pointer" onClick={() => handleToggle(settingKey)}>
        <div className="pr-4">
          <Typography variant="body" className="font-bold block mb-1">{label}</Typography>
          <Typography variant="caption" color="secondary" className="leading-tight">{desc}</Typography>
        </div>
        <button 
          role="switch" 
          aria-checked={isActive}
          className={`w-12 h-6 rounded-full flex items-center shrink-0 transition-colors ${isActive ? 'bg-emerald-500' : 'bg-slate-700'}`}
        >
          <span className={`w-4 h-4 rounded-full bg-white shadow transform transition-transform ${isActive ? 'translate-x-7' : 'translate-x-1'}`} />
        </button>
      </div>
    );
  };

  return (
    <Section className="pt-8 pb-24">
      <Container>
        
        {/* Header Institucional */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 mb-8">
          <Typography variant="h2" className="mb-1">Centro de Governança</Typography>
          <Typography variant="body" color="secondary">
            Administre políticas do sistema, notificações e integrações financeiras.
          </Typography>
        </div>

        <Grid cols={3} gap="lg">
          
          {/* Main Content Column */}
          <div className="col-span-1 md:col-span-2 space-y-8">

            {/* Recebimentos (PIX) */}
            <div id="recebimentos">
              <Typography variant="h4" className="flex items-center gap-2 mb-4">
                <WalletCards className="w-5 h-5 text-emerald-400" />
                Conta de Recebimento
              </Typography>
              <GlassSurface intensity="subtle" className="p-6 border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Typography variant="body" className="font-bold block mb-1">Chave PIX de Liquidação</Typography>
                    <Typography variant="caption" color="secondary">
                      Destino padrão para transferências automáticas e saques manuais.
                    </Typography>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <QrCode className="w-6 h-6 text-slate-500" />
                    <div>
                      <Typography variant="body" className="font-mono font-bold text-white">
                        {user.chave_pix ? user.chave_pix : 'Nenhuma chave cadastrada'}
                      </Typography>
                      {user.banco_pix && (
                        <Typography variant="caption" color="secondary" className="uppercase font-mono text-[10px]">
                          Instituição: {user.banco_pix}
                        </Typography>
                      )}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => {
                    setDraftChavePix(user.chave_pix || '');
                    setDraftBancoPix(user.banco_pix || '');
                    setPixStep('view');
                    setIsPixModalOpen(true);
                  }}>
                    {user.chave_pix ? 'Gerenciar Conta' : 'Adicionar Conta'}
                  </Button>
                </div>
              </GlassSurface>
            </div>

            {/* Notificações */}
            <div id="notificacoes">
              <Typography variant="h4" className="flex items-center gap-2 mb-4">
                <BellRing className="w-5 h-5 text-blue-400" />
                Regras de Notificação
              </Typography>
              <GlassSurface intensity="subtle" className="p-0 border-slate-800 divide-y divide-white/5">
                <RenderToggle 
                  label="Alertas Financeiros" 
                  desc="Seja notificado instantaneamente quando transferências e liquidações forem concluídas." 
                  settingKey="notifyFinanceiro" 
                />
                <RenderToggle 
                  label="Novos Convites" 
                  desc="Receba alertas quando for convidado para um novo grupo restrito." 
                  settingKey="notifyConvites" 
                />
                <RenderToggle 
                  label="Resumo por E-mail" 
                  desc="Receba relatórios semanais de performance diretamente na sua caixa de entrada." 
                  settingKey="notifyEmail" 
                />
                <RenderToggle 
                  label="Notificações Push" 
                  desc="Permite que o sistema envie alertas em tempo real no seu dispositivo atual." 
                  settingKey="notifyPush" 
                />
              </GlassSurface>
            </div>

            {/* Privacidade e Visibilidade */}
            <div id="privacidade">
              <Typography variant="h4" className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-indigo-400" />
                Privacidade
              </Typography>
              <GlassSurface intensity="subtle" className="p-0 border-slate-800 divide-y divide-white/5">
                <RenderToggle 
                  label="Perfil Público em Grupos" 
                  desc="Permite que outros membros visualizem seu nome na lista de ocupantes." 
                  settingKey="perfilPublico" 
                />
                <RenderToggle 
                  label="Compartilhar Dados Analíticos" 
                  desc="Ajuda a melhorar a plataforma enviando dados anônimos de uso (desabilitável a qualquer momento)." 
                  settingKey="compartilharDadosAnalytics" 
                />
              </GlassSurface>
            </div>

            {/* Aparência */}
            <div id="aparência">
              <Typography variant="h4" className="flex items-center gap-2 mb-4">
                <Palette className="w-5 h-5 text-fuchsia-400" />
                Aparência
              </Typography>
              <GlassSurface intensity="subtle" className="p-6 border-slate-800">
                <div className="space-y-6">
                  <div>
                    <Typography variant="caption" className="font-bold block mb-3 uppercase tracking-wider text-slate-400">Tema do Sistema</Typography>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="secondary" className="w-full sm:flex-1 bg-slate-900 border-emerald-500/50 ring-1 ring-emerald-500/20">Modo Escuro (Ativo)</Button>
                      <Button variant="secondary" className="w-full sm:flex-1 opacity-50 cursor-not-allowed">Modo Claro (Em Breve)</Button>
                    </div>
                  </div>
                  <div>
                    <Typography variant="caption" className="font-bold block mb-3 uppercase tracking-wider text-slate-400">Acessibilidade Visual</Typography>
                    <RenderToggle 
                      label="Reduzir Animações Visuais" 
                      desc="Desativa efeitos complexos de interface para reduzir carga cognitiva ou salvar bateria." 
                      settingKey="reduzirAnimacoes" 
                    />
                  </div>
                </div>
              </GlassSurface>
            </div>

          </div>

          {/* Right Column */}
          <div className="col-span-1 space-y-8">
            
            {/* Segurança Avançada */}
            <div>
              <Typography variant="h4" className="flex items-center gap-2 mb-4">
                <LockKeyhole className="w-5 h-5 text-red-400" />
                Segurança Avançada
              </Typography>
              <GlassSurface intensity="subtle" className="p-6 border-slate-800">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-950 border border-white/5 rounded-xl">
                    <Typography variant="body" className="font-bold block mb-1">Autenticação 2FA</Typography>
                    <Typography variant="caption" color="secondary" className="mb-3 block">
                      Proteja sua conta exigindo um código adicional durante o login.
                    </Typography>
                    <Button variant="secondary" size="sm" className="w-full text-[11px]" disabled>Não configurado (Em Breve)</Button>
                  </div>
                  
                  <div className="p-4 bg-slate-950 border border-white/5 rounded-xl">
                    <Typography variant="body" className="font-bold block mb-1">Dispositivos Confiáveis</Typography>
                    <Typography variant="caption" color="secondary" className="mb-3 block">
                      Aparelhos que podem acessar sua conta sem verificação adicional.
                    </Typography>
                    <Button variant="secondary" size="sm" className="w-full text-[11px]">Gerenciar {settings.dispositivosConfiaveis} Dispositivo(s)</Button>
                  </div>
                </div>
              </GlassSurface>
            </div>



          </div>
        </Grid>

        {/* Sobre o Sistema */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 opacity-50">
            <Info className="w-5 h-5" />
            <div>
              <Typography variant="caption" className="font-mono block uppercase tracking-wider">Ajudae Engine v1.1.0</Typography>
              <Typography variant="caption" className="font-mono text-[10px]">Status do Sistema: Todos os sistemas operacionais</Typography>
            </div>
          </div>
          <div className="flex gap-4">
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="text-xs text-slate-500 hover:text-white transition-colors">Política de Privacidade</a>
          </div>
        </div>

      </Container>

      {/* PIX Modal - Governance Flow */}
      <Modal open={isPixModalOpen} onOpenChange={setIsPixModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Política de Liquidação (PIX)</ModalTitle>
          </ModalHeader>
          
          <div className="mt-6">
            {pixStep === 'view' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-3">
                  <Typography variant="caption" className="text-slate-500 font-mono uppercase">Estado Atual</Typography>
                  <div>
                    <Typography variant="body" className="font-bold">{user.chave_pix || 'Vazio'}</Typography>
                    <Typography variant="caption" color="secondary">Instituição: {user.banco_pix || 'Não declarada'}</Typography>
                  </div>
                </div>
                
                <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                  <Typography variant="caption" className="text-amber-400">
                    A chave Pix cadastrada será o destino único para todas as transferências solicitadas. Certifique-se de que ela está em seu nome.
                  </Typography>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <Button variant="secondary" className="w-full sm:flex-1" onClick={() => setIsPixModalOpen(false)}>Fechar</Button>
                  <Button variant="primary" className="w-full sm:flex-1" onClick={() => setPixStep('edit')}>Editar Destino</Button>
                </div>
              </div>
            )}

            {pixStep === 'edit' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">Chave Pix</label>
                    <Input 
                      placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                      value={draftChavePix}
                      onChange={(e) => setDraftChavePix(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">Instituição Bancária</label>
                    <Input 
                      placeholder="Ex: Nubank, Itaú, Banco Inter"
                      value={draftBancoPix}
                      onChange={(e) => setDraftBancoPix(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-white/5">
                  <Button variant="secondary" className="w-full sm:flex-1" onClick={() => setPixStep('view')}>Cancelar</Button>
                  <Button variant="primary" className="w-full sm:flex-1" onClick={() => {
                    if (!draftChavePix.trim() || !draftBancoPix.trim()) {
                      toast({ title: 'Atenção', description: 'Preencha a chave Pix e a instituição bancária.', variant: 'warning' });
                      return;
                    }
                    setPixStep('confirm');
                  }}>Revisar Alteração</Button>
                </div>
              </div>
            )}

            {pixStep === 'confirm' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl text-center">
                  <Shield className="w-8 h-8 text-indigo-400 mx-auto mb-3" />
                  <Typography variant="body" className="font-bold text-indigo-400 block mb-2">Confirmação de Segurança</Typography>
                  <Typography variant="caption" className="text-slate-300">
                    Você está alterando o destino de todos os seus saques futuros para a chave:
                  </Typography>
                  <Typography variant="h4" className="font-mono text-white mt-3 bg-slate-950 p-3 rounded-lg border border-white/10">
                    {draftChavePix}
                  </Typography>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                  <Button variant="secondary" className="w-full sm:flex-1" onClick={() => setPixStep('edit')}>Voltar e Editar</Button>
                  <Button variant="primary" className="w-full sm:flex-[2] bg-indigo-600 hover:bg-indigo-500 text-white" onClick={handleSavePix}>
                    Confirmar e Aplicar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </ModalContent>
      </Modal>

    </Section>
  );
}
