/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Check, 
  X, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  CheckCircle2, 
  Coins,
  MapPin,
  Calendar,
  Wallet
} from 'lucide-react';
import { api } from '../api';
import { Withdrawal } from '../types';
import { ActionModal } from '../components/ActionModal';

export default function AdminSaques() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [sortOrder, setSortOrder] = useState<string>('newest');

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    id: string;
    action: 'autorizado' | 'rejeitado' | 'excluido';
    title: string;
    message: string;
    promptLabel?: string;
    isDanger: boolean;
  } | null>(null);

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

  const requestAction = (id: string, action: 'autorizado' | 'rejeitado' | 'excluido') => {
    let confirmMsg = '';
    let title = '';
    let isDanger = false;
    let promptLabel = undefined;

    if (action === 'autorizado') {
      title = 'Autorizar Saque';
      confirmMsg = 'Deseja realmente AUTORIZAR este saque? O status será alterado para Pago e o usuário será notificado.';
    }
    if (action === 'rejeitado') {
      title = 'Rejeitar Saque';
      confirmMsg = 'Deseja realmente REJEITAR este saque? O valor será estornado na hora para a carteira digital do usuário.';
      promptLabel = 'Motivo da rejeição (aparecerá no extrato do usuário):';
      isDanger = true;
    }
    if (action === 'excluido') {
      title = 'Excluir Saque';
      confirmMsg = 'Confirmar EXCLUSÃO deste saque? O lançamento será apagado do extrato do usuário e o valor estornado.';
      isDanger = true;
    }

    setModalConfig({
      isOpen: true,
      id,
      action,
      title,
      message: confirmMsg,
      promptLabel,
      isDanger
    });
  };

  const executeAction = async (val?: string) => {
    if (!modalConfig) return;
    const { id, action } = modalConfig;
    let motivo = val;
    if (action === 'rejeitado' && !motivo) {
      motivo = 'Não informado';
    }

    setModalConfig(null);
    setActionId(id);
    setFeedbackSuccess('');
    setFeedbackError('');

    try {
      const res = await api.processAdminWithdrawal(id, action, motivo);
      setFeedbackSuccess(res.message || 'Operação realizada com sucesso!');
      await loadWithdrawals(); // Reload
    } catch (err: any) {
      setFeedbackError(err.message || 'Erro ao processar alteração de saque.');
    } finally {
      setActionId(null);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'aprovado': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'rejeitado': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'excluido': return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (filterStatus !== 'Todos' && w.status !== filterStatus) return false;
    return true;
  });

  const sortedWithdrawals = [...filteredWithdrawals].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    } else if (sortOrder === 'alpha_asc') {
      return (a.nome_completo || '').localeCompare(b.nome_completo || '');
    } else if (sortOrder === 'alpha_desc') {
      return (b.nome_completo || '').localeCompare(a.nome_completo || '');
    }
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="border-b border-slate-900 pb-3 flex justify-between items-center bg-rose-500/5 -mx-4 px-4 py-3 border-y border-rose-500/10 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white leading-none">Verificação de Saques</h1>
          <p className="text-[10px] text-rose-450 text-rose-400 mt-1 uppercase font-mono">Processamento de solicitações e estornos</p>
        </div>
        <div className="text-xs bg-rose-500/10 text-rose-400 border border-rose-500/10 px-3 py-1.5 rounded-xl font-bold font-mono">
          {withdrawals.filter(w=>w.status==='pendente').length} Pendentes
        </div>
      </div>

      {feedbackSuccess && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{feedbackSuccess}</span>
        </div>
      )}

      {feedbackError && (
        <div className="bg-red-950/20 text-red-500 border border-red-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
          <span>{feedbackError}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Pesquisando solicitações de saques...
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl mx-auto">
          {/* Filters Dashboard */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between bg-slate-900/40 p-4 border border-slate-800 rounded-3xl">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-mono text-slate-500 font-bold">Filtrar por Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="Todos">Todos</option>
                <option value="pendente">Pendentes</option>
                <option value="aprovado">Aprovados</option>
                <option value="rejeitado">Rejeitados</option>
                <option value="excluido">Excluídos</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-mono text-slate-500 font-bold">Ordenação</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-rose-500/50 cursor-pointer"
              >
                <option value="newest">Data (Mais recentes)</option>
                <option value="oldest">Data (Mais antigas)</option>
                <option value="alpha_asc">Nome (A - Z)</option>
                <option value="alpha_desc">Nome (Z - A)</option>
              </select>
            </div>
          </div>

          {sortedWithdrawals.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl text-center text-xs text-slate-500 italic">
              Nenhuma solicitação encontrada para os filtros selecionados.
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl overflow-hidden divide-y divide-slate-800">
              {sortedWithdrawals.map((w) => {
              const works = actionId === w.id;
              const isPendente = w.status === 'pendente';

              return (
                <div key={w.id} className="p-5.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-900/20 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold ${getStatusStyle(w.status)}`}>
                        {w.status}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">ID: {w.id}</span>
                    </div>

                    <div className="font-sans">
                      <p className="text-white text-sm font-semibold">{w.nome_completo}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 items-center text-slate-400 text-xs mt-1 leading-relaxed">
                        <span className="flex items-center gap-1">
                          <Wallet className="w-3.5 h-3.5 text-slate-500" />
                          Pix: <strong className="text-indigo-400 font-mono">{w.chave_pix}</strong>
                          {w.banco_pix && <span className="text-slate-500 text-[10px] uppercase ml-1">({w.banco_pix})</span>}
                        </span>
                        <span>•</span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {new Date(w.created_at).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right font-mono pr-2">
                      <p className="text-[10px] text-slate-500 uppercase font-mono">Valor solicitado</p>
                      <p className="text-base font-extrabold text-rose-400">R$ {w.valor.toFixed(2)}</p>
                    </div>

                    {isPendente && (
                      <div className="flex gap-2">
                        {/* Autorizar */}
                        <button
                          onClick={() => requestAction(w.id, 'autorizado')}
                          disabled={works}
                          className="p-2.5 bg-emerald-600/10 hover:bg-emerald-600 hover:text-white border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          title="Autorizar Saque (Pago)"
                        >
                          {works ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        </button>

                        {/* Rejeitar */}
                        <button
                          onClick={() => requestAction(w.id, 'rejeitado')}
                          disabled={works}
                          className="p-2.5 bg-orange-600/10 hover:bg-orange-605 bg-orange-600/10 hover:bg-orange-600/20 hover:text-orange-400 text-orange-400/80 rounded-xl transition-all border border-orange-500/10 cursor-pointer disabled:opacity-50"
                          title="Rejeitar Saque (Estornar)"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        {/* Excluir */}
                        <button
                          onClick={() => requestAction(w.id, 'excluido')}
                          disabled={works}
                          className="p-2.5 bg-red-950/20 hover:bg-red-500 border border-transparent hover:border-red-500/20 hover:text-white text-red-500/80 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                          title="Excluir Saque e Estornar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
         )}
        </div>
      )}

      {modalConfig && (
        <ActionModal
          isOpen={modalConfig.isOpen}
          title={modalConfig.title}
          message={modalConfig.message}
          promptLabel={modalConfig.promptLabel}
          isDanger={modalConfig.isDanger}
          onConfirm={executeAction}
          onCancel={() => setModalConfig(null)}
        />
      )}
    </div>
  );
}
