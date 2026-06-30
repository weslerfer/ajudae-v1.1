/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  Trash2, 
  Wallet,
  Coins,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';
import { Withdrawal, UserProfile } from '../types';
import { AdminQueue } from '../components/admin/AdminQueue';
import { useAdminQueue } from '../hooks/useAdminQueue';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { useFeedback } from '../providers/FeedbackProvider';
import { GlassSurface } from '../components/ui/GlassSurface';

interface AdminSaquesProps {
  user: UserProfile;
}

export default function AdminSaques({ user }: AdminSaquesProps) {
  const [loading, setLoading] = useState(true);
  const { executeAction: withFeedback } = useFeedback();

  // Instantiating Queue State
  const { 
    items: withdrawals, 
    setItems: setWithdrawals, 
    selectedIds, 
    toggleSelection, 
    toggleAll, 
    executeBatch, 
    isProcessing 
  } = useAdminQueue<Withdrawal>(user);

  const loadWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminWithdrawals();
      setWithdrawals(data.withdrawals || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApproveBatch = () => {
    withFeedback(
      async () => {
        await executeBatch('approve_withdrawal', async (ids, audits) => {
          await Promise.all(
            ids.map(id => api.processAdminWithdrawal(id, 'autorizado'))
          );
        });
        await loadWithdrawals();
      },
      `${selectedIds.size} saque(s) aprovado(s) com sucesso.`,
      'Falha ao aprovar saques.'
    );
  };

  const handleRejectBatch = () => {
    withFeedback(
      async () => {
        await executeBatch('reject_withdrawal', async (ids, audits) => {
          await Promise.all(
            ids.map(id => api.processAdminWithdrawal(id, 'rejeitado', 'Rejeitado pela governança administrativa'))
          );
        });
        await loadWithdrawals();
      },
      `${selectedIds.size} saque(s) rejeitado(s) e estornado(s).`,
      'Falha ao rejeitar saques.'
    );
  };

  const renderSummary = (w: Withdrawal) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg border ${
          w.status === 'pendente' ? 'bg-amber-500/10 border-amber-500/20' : 
          w.status === 'aprovado' ? 'bg-emerald-500/10 border-emerald-500/20' : 
          'bg-rose-500/10 border-rose-500/20'
        }`}>
          <Wallet className={`w-5 h-5 ${
            w.status === 'pendente' ? 'text-amber-400' : 
            w.status === 'aprovado' ? 'text-emerald-400' : 
            'text-rose-400'
          }`} />
        </div>
        <div>
          <Typography variant="body" className="font-bold">{w.nome_completo || 'Usuário Desconhecido'}</Typography>
          <Typography variant="caption" color="secondary" className="font-mono">{w.chave_pix || 'Chave não registrada'}</Typography>
        </div>
      </div>
      <div className="text-right">
        <Typography variant="body" className={`font-bold font-mono ${
          w.status === 'pendente' ? 'text-amber-400' : 
          w.status === 'aprovado' ? 'text-emerald-400' : 
          'text-rose-400'
        }`}>
          R$ {Number(w.valor).toFixed(2)}
        </Typography>
        <Typography variant="caption" className={`uppercase tracking-wider text-[9px] font-bold ${
          w.status === 'pendente' ? 'text-amber-500/50' : 
          w.status === 'aprovado' ? 'text-emerald-500/50' : 
          'text-rose-500/50'
        }`}>
          {w.status}
        </Typography>
      </div>
    </div>
  );

  const renderDetails = (w: Withdrawal) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <Typography variant="caption" className="uppercase font-bold text-slate-500 tracking-wider">Destino (PIX)</Typography>
        <div className="bg-slate-950 p-3 rounded-xl border border-white/5 space-y-1">
          <Typography variant="body" className="font-mono text-white font-bold">{w.chave_pix || 'Chave não cadastrada'}</Typography>
          <Typography variant="caption" color="secondary">Instituição: {w.banco_pix || 'Não declarada'}</Typography>
        </div>
      </div>
      
      <div className="space-y-3">
        <Typography variant="caption" className="uppercase font-bold text-slate-500 tracking-wider">Contexto</Typography>
        <div className="space-y-2">
          <Typography variant="caption" color="secondary" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" /> 
            Solicitado em {new Date(w.created_at).toLocaleString('pt-BR')}
          </Typography>
          <Typography variant="caption" color="secondary" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Localidade: N/A - N/A
          </Typography>
        </div>
      </div>
    </div>
  );

  return (
    <Section className="pt-8 pb-24">
      <Container>
        
        <div className="mb-8">
          <Typography variant="h2" className="mb-1">Filas Operacionais</Typography>
          <Typography variant="body" color="secondary">
            Centro de governança e controle de operações financeiras.
          </Typography>
        </div>

        <AdminQueue
          title="Saques Pendentes"
          description="Aprovações aguardando liquidação para a conta do usuário."
          items={withdrawals.filter(w => w.status === 'pendente')}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onToggleAll={toggleAll}
          isProcessing={isProcessing || loading}
          onRefresh={loadWithdrawals}
          renderItemSummary={renderSummary}
          renderItemDetails={renderDetails}
          batchActions={
            <>
              <Button variant="secondary" size="sm" onClick={handleRejectBatch} className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10">
                <X className="w-4 h-4 mr-1" /> Rejeitar e Estornar
              </Button>
              <Button variant="primary" size="sm" onClick={handleApproveBatch} className="bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500">
                <Check className="w-4 h-4 mr-1" /> Aprovar Saque(s)
              </Button>
            </>
          }
        />

        <div className="mt-12">
          <AdminQueue
            title="Histórico de Liquidações"
            description="Transações finalizadas (aprovadas ou rejeitadas)."
            items={withdrawals.filter(w => w.status !== 'pendente')}
            selectedIds={new Set()}
            onToggleSelect={() => {}}
            onToggleAll={() => {}}
            isProcessing={loading}
            renderItemSummary={renderSummary}
            renderItemDetails={renderDetails}
          />
        </div>

      </Container>
    </Section>
  );
}
