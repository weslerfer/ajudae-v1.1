/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowRight,
  Wallet,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  Receipt,
  PiggyBank
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
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { ActivityTimeline, ActivityEvent, ActivityStatus } from '../components/ui/ActivityTimeline';
import { useWallet } from '../hooks/useWallet';
import { useFeedback } from '../providers/FeedbackProvider';

interface MinhaCarteiraProps {
  user: UserProfile;
  onNavigate: (view: string) => void;
}

export default function MinhaCarteira({ user, onNavigate }: MinhaCarteiraProps) {
  const { wallet, transactions, indicators, loading, refresh } = useWallet();
  const { executeAction } = useFeedback();

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawStep, setWithdrawStep] = useState<'input' | 'review' | 'success'>('input');
  const [withdrawError, setWithdrawError] = useState('');

  const parsedAmount = Number(withdrawAmount);
  const TAX = 0.00; // Mock taxa
  const netAmount = parsedAmount - TAX;

  // Process transactions for ActivityTimeline
  const timelineEvents: ActivityEvent[] = transactions.map(t => {
    let activityStatus: ActivityStatus = 'info';
    if (t.status === 'Concluído') activityStatus = 'success';
    if (t.status === 'Em Processamento') activityStatus = 'pending'; // maps to amber clock
    if (t.status === 'Falhou') activityStatus = 'error';

    return {
      id: t.id,
      title: t.title,
      description: t.cleanDesc,
      timestamp: new Date(t.created_at).toISOString(),
      origin: t.origin,
      priority: 'low',
      status: activityStatus,
      amount: t.valor
    };
  });

  const handleOpenWithdrawal = () => {
    setWithdrawAmount('');
    setWithdrawStep('input');
    setWithdrawError('');
    setIsWithdrawModalOpen(true);
  };

  const handleReview = () => {
    setWithdrawError('');
    if (isNaN(parsedAmount) || parsedAmount < 25.0) {
      setWithdrawError('O valor mínimo de saque é R$ 25,00.');
      return;
    }

    if (!user.chave_pix) {
      setWithdrawError('Por favor, configure sua Chave Pix nas Configurações antes de solicitar saques.');
      return;
    }

    if (indicators.saldoDisponivel < parsedAmount) {
      setWithdrawError('Saldo disponível insuficiente para completar este saque.');
      return;
    }

    setWithdrawStep('review');
  };

  const handleConfirmWithdrawal = async () => {
    setWithdrawError('');
    
    await executeAction(
      async () => {
        await api.requestWithdrawal(parsedAmount);
        setWithdrawStep('success');
        refresh(); // Refresh background ledger
      },
      undefined,
      'Erro ao processar solicitação de transferência.'
    );
  };

  return (
    <Section className="pt-8 pb-24">
      <Container>
        
        {/* Header Institucional */}
        <div className="flex flex-col gap-6 border-b border-white/10 pb-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <Typography variant="h2" className="mb-2">Conta de Resgate</Typography>
              <Typography variant="body" color="secondary">
                Administre seus ganhos, transferências e recebimentos com segurança institucional.
              </Typography>
            </div>
          </div>
        </div>

        <Grid cols={3} gap="lg" className="mb-12">
          {/* Main Balance Hero */}
          <div className="col-span-1 md:col-span-2">
            <Surface className="h-full flex flex-col p-8 relative overflow-hidden bg-slate-900 border-slate-800">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400">
                  <Wallet className="w-6 h-6" />
                </div>
                <Typography variant="h4" className="font-mono text-slate-400 uppercase tracking-wider">Saldo Disponível</Typography>
              </div>
              
              <div className="mb-auto">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-mono text-emerald-500/50">R$</span>
                  <Typography variant="h1" className="text-emerald-400 font-mono tracking-tighter text-6xl">
                    {loading ? '...' : indicators.saldoDisponivel.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Typography>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-8 border-t border-slate-800">
                <Button 
                  variant="primary" 
                  className="px-8 h-12 text-sm font-bold shadow-lg"
                  onClick={handleOpenWithdrawal}
                >
                  Transferir Saldo
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                
                {!user.chave_pix && (
                  <Button 
                    variant="secondary" 
                    className="px-8 h-12 text-sm font-bold"
                    onClick={() => onNavigate('configuracoes')}
                  >
                    Configurar PIX Recebedor
                  </Button>
                )}
              </div>
            </Surface>
          </div>

          {/* Secondary Indicators */}
          <div className="col-span-1 flex flex-col gap-4">
            <GlassSurface intensity="subtle" className="flex-1 p-6 border-slate-800 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <Typography variant="caption" className="font-mono uppercase tracking-wider text-slate-400">Em Processamento</Typography>
              </div>
              <Typography variant="h3" className="font-mono text-white">
                R$ {loading ? '...' : indicators.emProcessamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Typography>
              <Typography variant="caption" color="secondary" className="mt-2">
                Saques solicitados aguardando liquidação bancária.
              </Typography>
            </GlassSurface>


          </div>
        </Grid>

        {/* Linha do Tempo Financeira */}
        <div className="space-y-6">
          <Typography variant="h3" className="border-b border-white/5 pb-4">Linha do Tempo Financeira</Typography>
          
          <div className="bg-slate-900 border border-white/5 rounded-3xl p-6 min-h-[400px]">
            <ActivityTimeline 
              events={timelineEvents} 
              loading={loading}
              emptyStateTitle="Sem movimentações financeiras"
              emptyStateMessage="Seu histórico de recebimentos e transferências aparecerá aqui como uma linha do tempo detalhada."
            />
          </div>
        </div>
      </Container>

      {/* Withdrawal Flow Modal */}
      <Modal open={isWithdrawModalOpen} onOpenChange={setIsWithdrawModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Solicitação de Transferência</ModalTitle>
          </ModalHeader>

          <div className="mt-6">
            {withdrawStep === 'input' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono block mb-2">
                    Valor a transferir
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-500 font-bold">R$</span>
                    <Input
                      type="number"
                      step="0.01"
                      min="25"
                      placeholder="0,00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-12 h-16 text-2xl font-mono font-bold"
                      autoFocus
                    />
                  </div>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <Typography variant="caption" color="secondary">
                      Mínimo permitido: R$ 25,00
                    </Typography>
                    <button 
                      onClick={() => setWithdrawAmount(indicators.saldoDisponivel.toString())}
                      className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider"
                    >
                      Utilizar Máximo
                    </button>
                  </div>
                </div>

                {withdrawError && (
                  <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <Button variant="primary" className="w-full h-12" onClick={handleReview}>
                  Continuar
                </Button>
              </div>
            )}

            {withdrawStep === 'review' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-slate-950 p-5 rounded-2xl border border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <Typography variant="caption" className="text-slate-400">Valor Solicitado</Typography>
                    <Typography variant="body" className="font-mono font-bold">R$ {parsedAmount.toFixed(2)}</Typography>
                  </div>
                  <div className="flex justify-between items-center">
                    <Typography variant="caption" className="text-slate-400">Taxas de Operação</Typography>
                    <Typography variant="body" className="font-mono text-emerald-400 font-bold">Isento</Typography>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                    <Typography variant="caption" className="font-bold text-white uppercase tracking-wider">Valor Líquido</Typography>
                    <Typography variant="h3" className="font-mono text-white">R$ {netAmount.toFixed(2)}</Typography>
                  </div>
                </div>

                <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div>
                      <Typography variant="caption" className="block font-bold">Destino da Transferência</Typography>
                      <Typography variant="caption" color="secondary" className="font-mono">{user.chave_pix}</Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <div>
                      <Typography variant="caption" className="block font-bold">Prazo de Liquidação</Typography>
                      <Typography variant="caption" color="secondary">Em até 24 horas úteis</Typography>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="secondary" className="flex-1" onClick={() => setWithdrawStep('input')}>
                    Voltar
                  </Button>
                  <Button variant="primary" className="flex-[2]" onClick={handleConfirmWithdrawal}>
                    Autorizar Saque
                  </Button>
                </div>
              </div>
            )}

            {withdrawStep === 'success' && (
              <div className="space-y-6 text-center animate-fade-in py-4">
                <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 mx-auto">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <Typography variant="h3" className="mb-2">Transferência Solicitada</Typography>
                  <Typography variant="body" color="secondary" className="max-w-[280px] mx-auto">
                    Seu saque foi enfileirado com sucesso. O valor líquido de <strong>R$ {netAmount.toFixed(2)}</strong> será depositado em breve.
                  </Typography>
                </div>
                
                <div className="pt-6">
                  <Button variant="secondary" className="w-full" onClick={() => setIsWithdrawModalOpen(false)}>
                    Voltar para a Carteira
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
