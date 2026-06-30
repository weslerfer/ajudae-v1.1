/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  Link2,
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
import { Icon } from '../components/ui/Icon';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerChildren } from '../experience/presets/presets';
import { useFeedback } from '../providers/FeedbackProvider';
import { useToast } from '../components/ui/useToast';

interface MeusGruposProps {
  user: UserProfile;
}

export default function MeusGrupos({ user }: MeusGruposProps) {
  const [activeGroups, setActiveGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteStats, setInviteStats] = useState({ used_count: 0, max_uses: 10 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { executeAction } = useFeedback();
  const { toast } = useToast();

  const loadGroups = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await api.getActiveGroups();
      setActiveGroups(res.groups || []);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user.id]);

  const handleSelectGroup = async (group: any) => {
    await executeAction(async () => {
      const details = await api.getGroupDetails(group.id);
      setSelectedGroup(details.group);
      setInviteCode(details.invite_code || '');
      setInviteStats({
        used_count: details.used_count || 0,
        max_uses: details.max_uses || 10
      });
    }, undefined, 'Falha ao carregar os detalhes do grupo.');
  };

  const inviteUrl = `${window.location.origin}/?invite=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Copiado', description: 'Link de convite copiado para a área de transferência', variant: 'success' });
  };

  const handleShare = () => {
    const textMsg = `Olá! Quero te convidar para o grupo "${selectedGroup?.nome_grupo}" na plataforma Ajudae! Ative utilizando este link oficial: ${inviteUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Convite Ajudae',
        text: textMsg,
        url: inviteUrl,
      }).catch(err => {
        console.error(err);
      });
    } else {
      navigator.clipboard.writeText(textMsg);
      toast({ title: 'Pronto', description: 'Mensagem pronta para compartilhar copiada!', variant: 'success' });
    }
  };

  if (selectedGroup) {
    return (
      <Section className="pt-8">
        <Container>
          <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={fadeUp}>
              <Button 
                variant="ghost" 
                onClick={() => setSelectedGroup(null)}
                className="text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Meus Grupos
              </Button>
            </motion.div>

            {/* Header Surface */}
            <motion.div variants={fadeUp}>
              <GlassSurface intensity="premium" className="p-8 border-emerald-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none" />
                
                <div className="flex flex-col gap-6 relative z-10">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                      <Typography variant="caption" className="text-emerald-400 font-bold uppercase tracking-wider mb-2 font-mono">
                        Grupo Ativado
                      </Typography>
                      <Typography variant="h2">{selectedGroup.nome_grupo}</Typography>
                    </div>
                    <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl font-mono text-xs font-bold uppercase">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,1)]" />
                      Status Ativo
                    </div>
                  </div>

                  <Grid cols={2} gap="lg">
                    <GlassSurface className="p-5 flex-1">
                      <Typography variant="caption" color="secondary" className="uppercase font-bold tracking-wider text-[10px] mb-1 block">Valor Base</Typography>
                      <Typography variant="h3" className="text-emerald-400 font-mono">
                        R$ {Number(selectedGroup.valor_base).toFixed(2)}
                      </Typography>
                    </GlassSurface>
                    <GlassSurface className="p-5 flex-1 flex items-center">
                      <div>
                        <Typography variant="caption" color="secondary" className="uppercase font-mono mb-1">Ativação</Typography>
                        <Typography variant="h3" className="text-emerald-400">R$ {selectedGroup.valor_ativacao.toFixed(2)}</Typography>
                      </div>
                    </GlassSurface>
                  </Grid>
                </div>
              </GlassSurface>
            </motion.div>

            {/* Participantes */}
            <motion.div variants={fadeUp} className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <Typography variant="h4">Participantes Ativos</Typography>
              </div>
              
              <div className="flex flex-col gap-3">
                {selectedGroup.members && selectedGroup.members.length > 0 ? (
                  selectedGroup.members.map((member: any) => {
                    const isCurrentUser = member.user_id === user.id && member.nome_completo === user.nome_completo;
                    
                    return (
                      <GlassSurface 
                        key={member.id} 
                        className={`p-4 flex items-center justify-between transition-all ${
                          isCurrentUser ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center font-black text-slate-500 text-lg">
                            #{member.position}
                          </div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <Typography variant="body" className="font-bold">{member.nome_completo}</Typography>
                              {isCurrentUser && (
                                <span className="bg-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded-full uppercase font-bold border border-emerald-500/30">
                                  Você
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{member.cidade} - {member.estado}</span>
                            </div>
                          </div>
                        </div>
                      </GlassSurface>
                    );
                  })
                ) : (
                  <GlassSurface className="p-8 text-center border-dashed">
                    <Typography variant="body" color="secondary" className="font-mono">
                      Sem participantes atribuídos ainda.
                    </Typography>
                  </GlassSurface>
                )}
              </div>
            </motion.div>

            {/* Share Hub */}
            {inviteCode && (
              <motion.div variants={fadeUp}>
                <GlassSurface className="p-8 border-indigo-500/20 bg-indigo-500/5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/10 pb-6 mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Link2 className="w-5 h-5 text-emerald-400" />
                        <Typography variant="h4">Compartilhe seu Convite</Typography>
                      </div>
                      <Typography variant="caption" color="secondary">
                        Conclua novas ativações para elevar de posição.
                      </Typography>
                    </div>

                    <div className="text-left sm:text-right">
                      <Typography variant="caption" color="secondary" className="font-mono mb-1">Fichas disponíveis</Typography>
                      <Typography variant="h3" className="text-emerald-400 font-mono">
                        {inviteStats.max_uses - inviteStats.used_count} <span className="text-sm text-slate-500">/ {inviteStats.max_uses}</span>
                      </Typography>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Typography variant="caption" className="font-mono uppercase font-bold text-slate-400">
                      Link Único do Grupo
                    </Typography>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        readOnly
                        value={inviteUrl}
                        className="flex-1 bg-slate-950 font-mono text-sm text-slate-300 rounded-xl px-5 py-4 border border-white/10 focus:outline-none focus:border-emerald-500/50 transition-colors selection:bg-emerald-500/30"
                      />
                      <Button 
                        variant="secondary"
                        onClick={handleCopyLink}
                        className="px-6 h-[58px]"
                        title="Copiar Link"
                      >
                        {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>

                  <Button 
                    variant="primary" 
                    className="w-full h-14"
                    onClick={handleShare}
                  >
                    <Share2 className="w-5 h-5 mr-2" />
                    Compartilhar Convite Oficial
                  </Button>
                </GlassSurface>
              </motion.div>
            )}
          </motion.div>
        </Container>
      </Section>
    );
  }

  return (
    <Section className="pt-8 pb-24">
      <Container>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/10 pb-8 mb-8">
          <div>
            <Typography variant="h2" className="mb-2">Meus Grupos</Typography>
            <Typography variant="body" color="secondary">Gerencie suas ativações e posições financeiras.</Typography>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-white/5 px-4 py-2 rounded-xl font-mono text-sm">
            <span className="text-emerald-400 font-bold">{activeGroups.length}</span>
            <span className="text-slate-400">Ativos</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" variants={staggerChildren} initial="hidden" animate="visible">
              <Grid cols={3} gap="lg">
                {[1, 2, 3].map((i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Skeleton className="h-[280px] rounded-3xl" />
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          ) : error ? (
            <motion.div key="error" variants={fadeUp} initial="hidden" animate="visible">
              <EmptyState 
                icon="solar:danger-triangle-bold-duotone"
                title="Erro de Conexão"
                description="Não foi possível carregar seus grupos no momento. Tente novamente."
                actionLabel="Tentar Novamente"
                onAction={loadGroups}
              />
            </motion.div>
          ) : activeGroups.length === 0 ? (
            <motion.div key="empty" variants={fadeUp} initial="hidden" animate="visible">
              <EmptyState 
                icon="solar:users-group-two-rounded-bold-duotone"
                title="Nenhum Grupo Ativo"
                description="Você ainda não ativou nenhum grupo. Escolha um na lista de disponíveis para começar!"
              />
            </motion.div>
          ) : (
            <motion.div key="content" variants={staggerChildren} initial="hidden" animate="visible">
              <Grid cols={3} gap="lg">
                {activeGroups.map((group) => (
                  <motion.div key={group.id} variants={fadeUp}>
                    <GlassSurface 
                      key={group.id} 
                      className="group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/20 h-full flex flex-col p-0"
                    >
                      <div className="p-6 flex-1 flex flex-col cursor-pointer" onClick={() => handleSelectGroup(group)}>
                        <div className="flex items-center justify-between mb-3 pr-10">
                          <Typography variant="caption" className="font-mono text-slate-500">
                            ID: {group.id.substring(0,8).toUpperCase()}
                          </Typography>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider font-mono absolute top-4 right-4 z-10">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]" />
                            Ativo
                          </div>
                        </div>

                        <Typography variant="h3" className="mb-4 line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
                          {group.nome_grupo}
                        </Typography>
                        
                        <div className="mt-auto bg-slate-950/50 p-4 rounded-2xl border border-white/5 space-y-4 mb-6">
                          <div className="flex justify-between items-end pb-3 border-b border-white/5">
                            <div>
                              <Typography variant="caption" color="secondary" className="uppercase font-mono mb-1 block">Valor Base</Typography>
                              <Typography variant="h3" className="text-emerald-400 font-mono">R$ {group.valor_base.toFixed(2)}</Typography>
                            </div>
                          </div>
                          
                          <div className="space-y-3 pt-1">
                            {[1, 2, 3, 4].map(pos => {
                              const m = group.members?.find((x: any) => x.position === pos);
                              const isMe = m?.user_id === user.id && m?.nome_completo === user.nome_completo;
                              return (
                                <div key={pos} className="flex items-center gap-3">
                                  <div className={`w-5 h-5 flex items-center justify-center rounded-md font-mono text-[10px] font-bold ${isMe ? 'bg-emerald-500 text-slate-950' : 'bg-slate-900 text-slate-500 border border-white/5'}`}>
                                    {pos}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    {m ? (
                                      <Typography variant="caption" className={`truncate font-medium block ${isMe ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                                        {m.nome_completo}
                                      </Typography>
                                    ) : (
                                      <Typography variant="caption" className="text-slate-600 italic block">Posição Livre</Typography>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-auto">
                          <Button 
                            variant="primary" 
                            className="w-full"
                            onClick={(e) => { e.stopPropagation(); handleSelectGroup(group); }}
                          >
                            Ver Grupo
                            <ArrowLeft className="w-4 h-4 rotate-180 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </GlassSurface>
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Section>
  );
}
