/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Coins,
  ShieldCheck,
  Search,
  Filter,
  Zap,
  Star,
  StarOff
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/Select';
import { Progress } from '../components/ui/Progress';
import { useAvailableGroups, SortOption, FilterOption } from '../hooks/useAvailableGroups';
import { useFeedback } from '../providers/FeedbackProvider';
import { useToast } from '../components/ui/useToast';
import { motion, AnimatePresence } from 'motion/react';
import { fadeUp, staggerChildren } from '../experience/presets/presets';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../components/ui/Modal';
import { PixCheckout } from '../components/ui/PixCheckout';
import { AvailableGroupCard } from '../components/groups/AvailableGroupCard';
import { GroupDetailsModal } from '../components/groups/GroupDetailsModal';

interface GruposDisponiveisProps {
  user: UserProfile;
}

export default function GruposDisponiveis({ user }: GruposDisponiveisProps) {
  const { 
    groups, 
    loading, 
    error, 
    searchQuery, 
    setSearchQuery, 
    sortBy, 
    setSortBy, 
    filterStatus, 
    setFilterStatus,
    favorites,
    toggleFavorite,
    refresh
  } = useAvailableGroups();
  
  const { executeAction } = useFeedback();
  const { toast } = useToast();

  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [payment, setPayment] = useState<any | null>(null);
  const [paying, setPaying] = useState(false);

  const handleOpenGroup = (group: any) => {
    setSelectedGroup(group);
    setPayment(null);
  };

  const handleGeneratePix = async () => {
    if (!selectedGroup) return;
    setPaying(true);
    
    await executeAction(async () => {
      const res = await api.createPayment(selectedGroup.id);
      setPayment(res.payment);
    }, undefined, 'Falha ao iniciar pagamento Pix.');
    
    setPaying(false);
  };

  const handlePaymentSuccess = () => {
    toast({
      title: 'Ativação Confirmada!',
      description: 'Seu pagamento foi processado e você está no grupo.',
      variant: 'success'
    });
    setPayment(null);
    setSelectedGroup(null);
    refresh();
  };

  return (
    <Section className="pt-8 pb-24">
      <Container>
        {/* Hub de Filtros e Cabeçalho */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <Typography variant="h2" className="mb-2">Grupos Disponiveis</Typography>
              <Typography variant="body" color="secondary">Entre em um grupo disponivel.</Typography>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-xl font-mono text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold">{groups.length} {groups.length === 1 ? 'Grupo Disponível' : 'Grupos Disponíveis'}</span>
            </div>
          </div>


        </div>

        {/* Lista de Oportunidades */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="loading" variants={staggerChildren} initial="hidden" animate="visible">
              <Grid cols={3} gap="lg">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div key={i} variants={fadeUp}>
                    <Skeleton className="h-[380px] rounded-3xl" />
                  </motion.div>
                ))}
              </Grid>
            </motion.div>
          ) : error ? (
            <motion.div key="error" variants={fadeUp} initial="hidden" animate="visible">
              <EmptyState 
                icon="solar:danger-triangle-bold-duotone"
                title="Erro de Conexão"
                description="Não foi possível carregar as oportunidades. Verifique sua conexão."
                actionLabel="Tentar Novamente"
                onAction={refresh}
              />
            </motion.div>
          ) : groups.length === 0 ? (
            <motion.div key="empty" variants={fadeUp} initial="hidden" animate="visible">
              <EmptyState 
                icon="solar:magnifer-bold-duotone"
                title="Nenhum grupo encontrado"
                description="Nenhum grupo corresponde aos seus filtros atuais. Tente limpar sua busca."
                actionLabel="Limpar Filtros"
                onAction={() => {
                  setSearchQuery('');
                  setFilterStatus('all');
                }}
              />
            </motion.div>
          ) : (
            <motion.div key="content" variants={staggerChildren} initial="hidden" animate="visible">
              <Grid cols={3} gap="lg">
                {groups.map((group) => {
                  const slotsTaken = group.members?.length || 0;
                  const slotsTotal = 4; // Simulated default
                  const returnMultiplier = (group.valor_base / group.valor_ativacao).toFixed(1);
                  const isFav = favorites.includes(group.id);

                  return (
                    <motion.div key={group.id} variants={fadeUp}>
                      <AvailableGroupCard 
                        group={group}
                        isFav={isFav}
                        onToggleFavorite={toggleFavorite}
                        onOpenGroup={handleOpenGroup}
                      />
                    </motion.div>
                  );
                })}
              </Grid>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>

      {/* Modal / Detalhes de Checkout */}
      <GroupDetailsModal 
        isOpen={!!selectedGroup}
        group={selectedGroup}
        onClose={() => handleOpenGroup(null)}
        payment={payment}
        paying={paying}
        onGeneratePix={handleGeneratePix}
        onPaymentSuccess={handlePaymentSuccess}
        onCancelPayment={() => setPayment(null)}
      />
    </Section>
  );
}

function FilterChip({ label, active, onClick, icon }: { label: string, active: boolean, onClick: () => void, icon?: React.ReactNode }) {
  return (
    <button 
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-2 border cursor-pointer
        ${active 
          ? 'bg-white text-slate-950 border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]' 
          : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/30 hover:bg-slate-800'
        }
      `}
    >
      {icon}
      {label}
    </button>
  );
}
