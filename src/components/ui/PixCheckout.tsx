/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  QrCode, 
  Copy, 
  Check, 
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Typography } from './Typography';
import { Button } from './Button';
import { usePixCheckout, PixPaymentData, PixStatus } from '../../hooks/usePixCheckout';
import { GlowSurface } from './GlowSurface';
import { useToast } from './useToast';

interface PixCheckoutProps {
  paymentData: PixPaymentData | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const statusConfig: Record<PixStatus, { color: string; label: string; icon: React.ReactNode; glowColor: string }> = {
  aguardando: {
    color: 'text-slate-400',
    label: 'Aguardando Pagamento',
    icon: <Clock className="w-5 h-5 animate-pulse" />,
    glowColor: 'bg-slate-500/20',
  },
  processando: {
    color: 'text-amber-400',
    label: 'Processando Pagamento',
    icon: <RefreshCw className="w-5 h-5 animate-spin" />,
    glowColor: 'bg-amber-500/30',
  },
  recebido: {
    color: 'text-emerald-400',
    label: 'Pagamento Recebido',
    icon: <CheckCircle2 className="w-5 h-5" />,
    glowColor: 'bg-emerald-500/30',
  },
  confirmado: {
    color: 'text-emerald-400',
    label: 'Crédito Liberado',
    icon: <CheckCircle2 className="w-5 h-5" />,
    glowColor: 'bg-emerald-500/40',
  },
  cancelado: {
    color: 'text-red-400',
    label: 'Cancelado',
    icon: <XCircle className="w-5 h-5" />,
    glowColor: 'bg-red-500/20',
  },
  expirado: {
    color: 'text-slate-500',
    label: 'Expirado',
    icon: <AlertCircle className="w-5 h-5" />,
    glowColor: 'bg-slate-500/10',
  }
};

export function PixCheckout({ paymentData, onSuccess, onCancel }: PixCheckoutProps) {
  const { status, timeLeft } = usePixCheckout(paymentData, onSuccess);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!paymentData) return null;

  const currentConfig = statusConfig[status];

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentData.copia_cola);
    setCopied(true);
    toast({ title: 'Copiado', description: 'Código Pix copiado para a área de transferência', variant: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {/* Payment Lifecycle Header */}
      <div className="w-full max-w-sm flex items-center justify-between mb-3">
        <Step active={true} completed={true} label="Gerado" />
        <Line active={true} />
        <Step active={status === 'aguardando' || status === 'processando' || status === 'confirmado'} completed={status === 'processando' || status === 'confirmado'} label="Leitura" />
        <Line active={status === 'processando' || status === 'confirmado'} />
        <Step active={status === 'processando' || status === 'confirmado'} completed={status === 'confirmado'} label="Processamento" />
        <Line active={status === 'confirmado'} />
        <Step active={status === 'confirmado'} completed={status === 'confirmado'} label="Concluído" />
      </div>

      <div className="text-center space-y-1 mb-3">
        <Typography variant="h3" className="font-mono text-emerald-400 text-4xl font-bold tracking-tighter">
          R$ {paymentData.valor.toFixed(2)}
        </Typography>
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 font-bold text-sm ${currentConfig.color} bg-slate-900 shadow-xl`}>
          {currentConfig.icon}
          {currentConfig.label}
        </div>
      </div>

      {/* QR Code Protagonism */}
      <div className="relative mb-3">
        {/* Animated Glow depending on status */}
        <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-50 transition-colors duration-1000 ${currentConfig.glowColor}`} />
        
        <div className="relative bg-white p-4 rounded-3xl shadow-2xl border border-white/20">
          <img 
            src={paymentData.qrcode.startsWith('data:') || paymentData.qrcode.startsWith('http') ? paymentData.qrcode : `data:image/png;base64,${paymentData.qrcode}`} 
            alt="QR Code Pix" 
            className={`w-48 h-48 md:w-56 md:h-56 transition-opacity duration-300 ${status === 'expirado' || status === 'cancelado' ? 'opacity-20 grayscale' : 'opacity-100'}`}
            referrerPolicy="no-referrer"
          />
          
          {/* Overlay for terminal states */}
          <AnimatePresence>
            {(status === 'expirado' || status === 'cancelado' || status === 'confirmado') && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm rounded-3xl"
              >
                <div className={`flex flex-col items-center justify-center p-6 bg-slate-900 rounded-2xl shadow-xl ${currentConfig.color}`}>
                  {currentConfig.icon}
                  <Typography variant="h4" className={`mt-2 ${currentConfig.color}`}>{currentConfig.label}</Typography>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full max-w-sm space-y-4">
        {(status === 'aguardando' || status === 'processando') && (
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono mb-2">
            <span>Validade do QR Code:</span>
            <span className={timeLeft < 60 ? 'text-red-400 font-bold' : 'text-slate-300'}>{formattedTime}</span>
          </div>
        )}

        <Button 
          variant="primary" 
          className="w-full h-14 text-sm font-bold shadow-xl"
          onClick={handleCopy}
          disabled={status !== 'aguardando' && status !== 'processando'}
        >
          {copied ? (
            <>
              <Check className="w-5 h-5 mr-2" /> Copiado!
            </>
          ) : (
            <>
              <Copy className="w-5 h-5 mr-2" /> Copiar Código Pix
            </>
          )}
        </Button>

        <Button 
          variant="secondary" 
          className="w-full h-14"
          onClick={onCancel}
        >
          {status === 'confirmado' ? 'Concluir e Voltar' : 'Cancelar Pagamento'}
        </Button>
      </div>
    </div>
  );
}

// Lifecycle Timeline Helpers
function Step({ active, completed, label }: { active: boolean, completed: boolean, label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5 z-10 w-16">
      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
        completed ? 'bg-emerald-500 border-emerald-500 text-slate-900' :
        active ? 'bg-slate-900 border-emerald-500' :
        'bg-slate-900 border-slate-700'
      }`}>
        {completed && <Check className="w-3 h-3 font-bold" />}
      </div>
      <span className={`text-[9px] font-bold uppercase tracking-wider font-mono text-center ${
        active ? 'text-slate-300' : 'text-slate-600'
      }`}>{label}</span>
    </div>
  );
}

function Line({ active }: { active: boolean }) {
  return (
    <div className={`flex-1 h-0.5 rounded transition-colors -mt-4 ${
      active ? 'bg-emerald-500/50' : 'bg-slate-800'
    }`} />
  );
}
