import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Typography } from '../../../components/ui/Typography';
import { Button } from '../../../components/ui/Button';
import { Grid } from '../../../components/ui/Grid';
import { Skeleton } from '../../../components/ui/Skeleton';
import { EmptyState } from '../../../components/ui/EmptyState';
import { ArrowRight } from 'lucide-react';
import { useAvailableGroups } from '../../../hooks/useAvailableGroups';
import { AvailableGroupCard } from '../../../components/groups/AvailableGroupCard';
import { GroupDetailsModal } from '../../../components/groups/GroupDetailsModal';
import { fadeUp, staggerChildren } from '../../../experience/presets/presets';
import { api } from '../../../api';
import { useFeedback } from '../../../providers/FeedbackProvider';
import { useToast } from '../../../components/ui/useToast';

interface SuggestedGroupsProps {
  onNavigate?: (view: string) => void;
}

export const SuggestedGroups: React.FC<SuggestedGroupsProps> = ({ onNavigate }) => {
  const { groups, loading, error, refresh, favorites, toggleFavorite } = useAvailableGroups();
  const { executeAction } = useFeedback();
  const { toast } = useToast();

  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [payment, setPayment] = useState<any | null>(null);
  const [paying, setPaying] = useState(false);

  const displayedGroups = groups.slice(0, 3);

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
    <div className="w-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Typography variant="h4">Sugestão de Grupos Disponíveis</Typography>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={() => onNavigate && onNavigate('grupos_disponiveis')}
        >
          Ver Grupos
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" variants={staggerChildren} initial="hidden" animate="visible">
            <Grid cols={3} gap="lg" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
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
        ) : displayedGroups.length === 0 ? (
          <motion.div key="empty" variants={fadeUp} initial="hidden" animate="visible">
            <EmptyState 
              icon="solar:magnifer-bold-duotone"
              title="Nenhum grupo disponível"
              description="Nenhum grupo disponível no momento."
            />
          </motion.div>
        ) : (
          <motion.div key="content" variants={staggerChildren} initial="hidden" animate="visible">
            <Grid gap="lg" className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {displayedGroups.map((group) => (
                <motion.div key={group.id} variants={fadeUp}>
                  <AvailableGroupCard 
                    group={group}
                    isFav={favorites.includes(group.id)}
                    onToggleFavorite={toggleFavorite}
                    onOpenGroup={handleOpenGroup}
                  />
                </motion.div>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>

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
    </div>
  );
};
