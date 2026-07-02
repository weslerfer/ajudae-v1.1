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
        {!payment ? (
          <div className="flex flex-col space-y-4 sm:space-y-5 pt-1 sm:pt-0">
            <ModalHeader className="pr-10">
              <ModalTitle className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-tight">
                {group.nome_grupo}
              </ModalTitle>
            </ModalHeader>

            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 bg-slate-950/80 p-3 sm:p-4 rounded-xl border border-emerald-500/20 shadow-inner">
              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-lg border border-white/5">
                <Typography variant="caption" color="secondary" className="font-mono text-[10px] sm:text-xs uppercase mb-1 block">
                  Custo de Ativação
                </Typography>
                <Typography variant="h4" className="text-emerald-400 text-lg sm:text-xl font-bold font-mono">
                  R$ {group.valor_ativacao.toFixed(2)}
                </Typography>
              </div>
              <div className="bg-slate-900/60 p-3 sm:p-3.5 rounded-lg border border-white/5">
                <Typography variant="caption" color="secondary" className="font-mono text-[10px] sm:text-xs uppercase mb-1 block">
                  Valor Base
                </Typography>
                <Typography variant="h4" className="text-white text-lg sm:text-xl font-bold font-mono">
                  R$ {group.valor_base.toFixed(2)}
                </Typography>
              </div>
            </div>

            <div className="space-y-2 sm:space-y-2.5">
              <Typography variant="caption" color="secondary" className="font-mono text-xs uppercase tracking-wider block">
                Ocupação do Grupo
              </Typography>
              <div className="bg-slate-900/80 border border-white/5 p-3 sm:p-3.5 rounded-xl space-y-2 max-h-[160px] sm:max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                {group.members && group.members.length > 0 ? (
                  group.members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 bg-slate-950/90 p-2 sm:p-2.5 rounded-lg border border-white/5">
                      <span className="w-6 h-6 flex items-center justify-center bg-slate-900 rounded font-mono text-xs text-slate-400 border border-white/5 shrink-0">
                        #{member.position}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Typography variant="caption" className="font-bold truncate block text-slate-200 text-xs sm:text-sm">
                          {member.nome_completo}
                        </Typography>
                        <Typography variant="caption" color="secondary" className="truncate text-[10px] sm:text-xs text-slate-400">
                          {member.cidade}/{member.estado}
                        </Typography>
                      </div>
                    </div>
                  ))
                ) : (
                  <Typography variant="caption" color="secondary" className="italic text-center py-4 block w-full text-slate-400">
                    Seja o primeiro a ingressar neste grupo!
                  </Typography>
                )}
              </div>
            </div>

            <Button 
              variant="primary" 
              className="w-full h-12 sm:h-14 text-xs sm:text-sm font-bold shadow-xl mt-1 shrink-0" 
              onClick={onGeneratePix}
              isLoading={paying}
            >
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0" />
              <span className="truncate">Confirmar Ingresso (Gerar Pix de R$ {group.valor_ativacao.toFixed(2)})</span>
            </Button>
          </div>
        ) : (
          <div className="animate-fade-in pt-4 sm:pt-2">
            <ModalTitle className="sr-only">Pagamento Pix</ModalTitle>
            <PixCheckout 
              paymentData={payment} 
              onSuccess={onPaymentSuccess} 
              onCancel={onCancelPayment} 
            />
          </div>
        )}
      </ModalContent>
    </Modal>
  );
};
