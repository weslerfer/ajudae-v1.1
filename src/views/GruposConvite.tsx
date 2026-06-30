/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { 
  Link2, 
  Trash2, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw,
  Coins,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Info
} from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Typography } from '../components/ui/Typography';
import { Grid } from '../components/ui/Grid';
import { Surface } from '../components/ui/Surface';
import { GlassSurface } from '../components/ui/GlassSurface';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { Input } from '../components/ui/Input';
import { useFeedback } from '../providers/FeedbackProvider';
import { useToast } from '../components/ui/useToast';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerChildren } from '../experience/presets/presets';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../components/ui/Modal';
import { PixCheckout } from '../components/ui/PixCheckout';
import { getInvitationVisualState } from '../utils/invitation';
import { Breadcrumb } from '../components/ui/Breadcrumb';

interface GruposConviteProps {
  user: UserProfile;
}

export default function GruposConvite({ user }: GruposConviteProps) {
  const [invitedGroups, setInvitedGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Journey / Modal State
  const [selectedInvited, setSelectedInvited] = useState<any | null>(null);
  const [payment, setPayment] = useState<any | null>(null);
  const [checking, setChecking] = useState(false);

  // Soft Delete / Undo State
  const [pendingDelete, setPendingDelete] = useState<{ id: string, group: any, timeoutId: NodeJS.Timeout } | null>(null);

  const { executeAction } = useFeedback();
  const { toast } = useToast();

  const loadInvited = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.getInvitedGroups();
      setInvitedGroups(res.invitedGroups || []);
    } catch (err) {
      console.error('Error fetching invited groups:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvited();
  }, [loadInvited]);

  const handlePaymentSuccess = async () => {
    toast({
      title: 'Ativação Confirmada!',
      description: 'Você aceitou o convite e ativou o grupo com sucesso.',
      variant: 'success'
    });
    setPayment(null);
    setSelectedInvited(null);
    await loadInvited();
  };

  const handleOpenInvite = (inviteData: any) => {
    setSelectedInvited(inviteData);
    setPayment(null);
  };

  const handleFetchPaymentCode = async () => {
    if (!selectedInvited) return;

    if (selectedInvited.group.members && selectedInvited.group.members.some((m: any) => m.user_id === user?.id && m.nome_completo.toLowerCase().trim() === user?.nome_completo.toLowerCase().trim())) {
      toast({ title: 'Atenção', description: 'Você já participa deste grupo.', variant: 'error' });
      return;
    }

    setChecking(true);
    await executeAction(async () => {
      const res = await api.activateInvitedGroup(selectedInvited.id);
      setPayment(res.payment);
    }, undefined, 'Erro ao carregar Pix do convite.');
    setChecking(false);
  };

  // Reversibilidade: Soft Delete
  const handleArchive = (invite: any) => {
    // Hide from UI immediately
    setInvitedGroups(prev => prev.filter(item => item.id !== invite.id));
    
    // Clear any existing pending delete (execute it immediately)
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      executePermanentDelete(pendingDelete.id);
    }

    const timeoutId = setTimeout(() => {
      executePermanentDelete(invite.id);
      setPendingDelete(null);
    }, 5000);

    setPendingDelete({ id: invite.id, group: invite, timeoutId });
  };

  const handleUndoArchive = () => {
    if (pendingDelete) {
      clearTimeout(pendingDelete.timeoutId);
      // Restore visually
      setInvitedGroups(prev => [pendingDelete.group, ...prev]);
      setPendingDelete(null);
    }
  };

  const executePermanentDelete = async (id: string) => {
    try {
      await api.deleteInvitedGroup(id);
    } catch (e) {
      console.error('Failed to permanent delete invite', e);
      // Optional: Could revert here if API fails
    }
  };

  return (
    <Section className="pt-8 pb-24 relative">
      <Container>
        {/* Header Jornada */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 mb-8">
          <Breadcrumb items={[{ label: 'Ajudae', href: '#' }, { label: 'Convites Recebidos' }]} className="mb-2" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <Typography variant="h2" className="mb-2">Caixa de Convites</Typography>
              <Typography variant="body" color="secondary">
                Você recebeu acessos exclusivos. O próximo passo é confirmar sua entrada nas redes financeiras.
              </Typography>
            </div>
          </div>
        </div>

        {/* Lista de Convites */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" variants={staggerChildren} initial="hidden" animate="visible">
              <Grid cols={3} gap="lg">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Skeleton className="h-[250px] rounded-3xl" />
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          ) : invitedGroups.length === 0 ? (
            <motion.div key="empty" variants={fadeUp} initial="hidden" animate="visible">
              <EmptyState 
                icon="solar:letter-opened-bold-duotone"
                title="Sua caixa está vazia"
                description="Quando você clicar em um link de convite oficial compartilhado, ele aparecerá aqui aguardando sua decisão."
              />
            </motion.div>
          ) : (
            <motion.div key="content" variants={staggerChildren} initial="hidden" animate="visible">
              <Grid cols={3} gap="lg">
                <AnimatePresence>
                  {invitedGroups.map((item) => {
                    const visualState = getInvitationVisualState(item.id);
                    
                    const colorMap = {
                      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
                      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
                      red: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
                      slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    };

                    const dotMap = {
                      emerald: 'bg-emerald-400',
                      amber: 'bg-amber-400',
                      red: 'bg-red-400',
                      slate: 'bg-slate-400'
                    };

                    return (
                      <motion.div 
                        key={item.id} 
                        variants={fadeUp}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        layout
                      >
                    <GlassSurface 
                      className="h-full flex flex-col group overflow-hidden relative transition-all duration-300 hover:border-emerald-500/20 p-6"
                    >
                          
                          {/* Top Tag */}
                          <div className="flex items-center justify-between mb-4">
                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider font-mono ${colorMap[visualState.color]}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${dotMap[visualState.color]} ${visualState.color !== 'slate' ? 'animate-pulse' : ''}`} />
                              {visualState.label}
                            </div>
                            
                            <button
                              onClick={(e) => { e.stopPropagation(); handleArchive(item); }}
                              className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-900 border border-white/5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all cursor-pointer"
                              title="Arquivar Convite"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <Typography variant="h3" className="mb-2 leading-tight pr-4">
                            {item.group.nome_grupo}
                          </Typography>
                          
                          <div className="flex items-center gap-1.5 mb-6">
                            <Info className="w-3.5 h-3.5 text-slate-500" />
                            <Typography variant="caption" color="secondary">
                              {visualState.message}
                            </Typography>
                          </div>
                          
                          <div className="bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-3 mb-6 mt-auto">
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                              <Typography variant="caption" className="font-mono text-slate-500">Valor Retorno Base</Typography>
                              <Typography variant="body" className="font-bold text-emerald-400">R$ {item.group.valor_base.toFixed(2)}</Typography>
                            </div>
                            <div className="flex justify-between items-center">
                              <Typography variant="caption" className="font-mono text-slate-500">Custo de Entrada</Typography>
                              <Typography variant="body" className="font-bold">R$ {item.group.valor_ativacao.toFixed(2)}</Typography>
                            </div>
                          </div>

                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={() => handleOpenInvite(item)}
                          >
                            Decidir Agora
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                    </GlassSurface>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Undo Floating Toast Action */}
      <AnimatePresence>
        {pendingDelete && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40"
          >
            <GlassSurface intensity="premium" className="px-5 py-3 rounded-full flex items-center gap-4 border border-white/10 shadow-2xl">
              <Typography variant="caption">Convite removido.</Typography>
              <Button variant="secondary" onClick={handleUndoArchive} className="h-8 text-[11px] px-4 rounded-full">
                Desfazer
              </Button>
            </GlassSurface>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal / Jornada Continua */}
      {selectedInvited && (
        <Modal open={!!selectedInvited} onOpenChange={(open) => !open && handleOpenInvite(null)}>
          <ModalContent className="max-w-xl">
            <ModalHeader>
              <ModalTitle>Aperto de Mão Digital</ModalTitle>
            </ModalHeader>

            <div className="mt-4">
              {!payment ? (
                <div className="space-y-6">
                  <div className="animate-fade-in">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/20 mx-auto mb-3 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                        <Zap className="w-7 h-7 text-indigo-400" />
                      </div>
                      <Typography variant="h3" className="mb-2">Você foi Convidado Oficialmente</Typography>
                      <Typography variant="body" color="secondary">
                        Ao aceitar o convite para a rede <strong>{selectedInvited.group.nome_grupo}</strong>, você se compromete com o crescimento financeiro do grupo.
                      </Typography>
                    </div>

                    <GlassSurface intensity="subtle" className="p-6 border-indigo-500/20 mb-6">
                      <Grid cols={2} gap="sm">
                        <div className="bg-slate-950 p-4 rounded-xl">
                          <Typography variant="caption" color="secondary" className="font-mono uppercase mb-1">Seu Investimento</Typography>
                          <Typography variant="h4">R$ {selectedInvited.group.valor_ativacao.toFixed(2)}</Typography>
                        </div>
                        <div className="bg-slate-950 p-4 rounded-xl">
                          <Typography variant="caption" color="secondary" className="font-mono uppercase mb-1">Ganhos de Base</Typography>
                          <Typography variant="h4" className="text-emerald-400">R$ {selectedInvited.group.valor_base.toFixed(2)}</Typography>
                        </div>
                      </Grid>
                      
                      <div className="mt-4 pt-4 border-t border-white/5 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <Typography variant="caption" className="font-bold block mb-0.5">Segurança Institucional</Typography>
                          <Typography variant="caption" color="secondary" className="text-[10px] leading-tight">
                            O pagamento será processado via Banco Central (PIX). A sua vaga é assegurada instantaneamente após a confirmação.
                          </Typography>
                        </div>
                      </div>
                    </GlassSurface>

                    <Button 
                      variant="primary" 
                      className="w-full h-14" 
                      onClick={handleFetchPaymentCode}
                      isLoading={checking}
                    >
                      <Check className="w-5 h-5 mr-2" />
                      Eu Aceito o Convite (Gerar Pix)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in -mx-4 -mb-4 -mt-16 bg-slate-950 rounded-b-3xl">
                  <PixCheckout 
                    paymentData={payment} 
                    onSuccess={handlePaymentSuccess} 
                    onCancel={() => setPayment(null)} 
                  />
                </div>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </Section>
  );
}
