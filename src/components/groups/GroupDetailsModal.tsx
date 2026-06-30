import React from 'react';
import { Coins } from 'lucide-react';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../ui/Modal';
import { GlassSurface } from '../ui/GlassSurface';
import { Grid } from '../ui/Grid';
import { Typography } from '../ui/Typography';
import { Button } from '../ui/Button';
import { PixCheckout } from '../ui/PixCheckout';

export interface GroupDetailsModalProps {
  group: any;
  isOpen: boolean;
  onClose: () => void;
  payment: any;
  paying: boolean;
  onGeneratePix: () => void;
  onPaymentSuccess: () => void;
  onCancelPayment: () => void;
}

export const GroupDetailsModal: React.FC<GroupDetailsModalProps> = ({
  group,
  isOpen,
  onClose,
  payment,
  paying,
  onGeneratePix,
  onPaymentSuccess,
  onCancelPayment
}) => {
  if (!group) return null;

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ModalContent className="max-w-md">
        <ModalTitle className="sr-only">Análise da Oportunidade</ModalTitle>

        <div className="mt-2">
          {!payment ? (
            <div className="space-y-6">
              <GlassSurface intensity="subtle" className="p-6 border-emerald-500/20">
                <Typography variant="h3" className="mb-4">{group.nome_grupo}</Typography>
                <Grid cols={2} gap="sm">
                  <div className="bg-slate-950 p-4 rounded-xl">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase mb-1">Custo de Ativação</Typography>
                    <Typography variant="h4" className="text-emerald-400">R$ {group.valor_ativacao.toFixed(2)}</Typography>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl">
                    <Typography variant="caption" color="secondary" className="font-mono uppercase mb-1">Valor Base</Typography>
                    <Typography variant="h4">R$ {group.valor_base.toFixed(2)}</Typography>
                  </div>
                </Grid>
              </GlassSurface>

              <div className="space-y-3">
                <Typography variant="caption" color="secondary" className="font-mono uppercase tracking-wider">
                  Ocupação do Grupo
                </Typography>
                <div className="bg-slate-900 border border-white/5 p-4 rounded-xl space-y-2">
                  {group.members && group.members.length > 0 ? (
                    group.members.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-lg border border-white/5">
                        <span className="w-6 h-6 flex items-center justify-center bg-slate-900 rounded font-mono text-xs text-slate-500 border border-white/5 shrink-0">
                          #{member.position}
                        </span>
                        <div className="flex-1 min-w-0">
                          <Typography variant="caption" className="font-bold truncate block">{member.nome_completo}</Typography>
                          <Typography variant="caption" color="secondary" className="truncate text-[10px]">{member.cidade}/{member.estado}</Typography>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Typography variant="caption" color="secondary" className="italic text-center block w-full">
                      Seja o primeiro a ingressar neste grupo!
                    </Typography>
                  )}
                </div>
              </div>

              <Button 
                variant="primary" 
                className="w-full h-14" 
                onClick={onGeneratePix}
                isLoading={paying}
              >
                <Coins className="w-5 h-5 mr-2" />
                Confirmar Ingresso (Gerar Pix de R$ {group.valor_ativacao.toFixed(2)})
              </Button>
            </div>
          ) : (
            <div className="animate-fade-in">
              <PixCheckout 
                paymentData={payment} 
                onSuccess={onPaymentSuccess} 
                onCancel={onCancelPayment} 
              />
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
};
