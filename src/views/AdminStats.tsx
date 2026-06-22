/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Coins, 
  Users, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';

interface AdminStatsProps {
  onNavigate: (view: string) => void;
}

export default function AdminStats({ onNavigate }: AdminStatsProps) {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-24 text-xs text-slate-400">
        <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-rose-500" />
        <span>Buscando números consolidados da plataforma...</span>
      </div>
    );
  }

  const withdrawalsPending = stats?.pending_withdrawals || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Admin Title Bar */}
      <div className="border-b border-slate-900 pb-3 flex justify-between items-center bg-rose-500/5 -mx-4 px-4 py-3 border-y border-rose-500/10 rounded-xl">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-rose-450 text-rose-400" />
          <div>
            <h1 className="text-lg font-bold text-white leading-none">Painel Administrativo Geral</h1>
            <p className="text-[10px] text-rose-400 mt-1 uppercase font-mono">Consolidação e Auditoria Financeira</p>
          </div>
        </div>
        <button 
          onClick={loadStats}
          className="p-2 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg transition-colors border border-slate-800"
          title="Recarregar dados"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* CORE FINANCIAL STATISTICS GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* TOTAL FLOW RECEIVED */}
        <div className="bg-slate-905 bg-slate-900 border border-slate-905 rounded-2xl p-6.5 relative overflow-hidden group">
          <p className="text-xs text-slate-400">Total Recebido (Pix Geral)</p>
          <p className="text-2xl font-black text-white mt-1">R$ {Number(stats?.total_recebido || 0).toFixed(2)}</p>
          <p className="text-[9px] text-slate-500 font-mono mt-3 uppercase">Total capturado pelo sistema (100%)</p>
          <div className="absolute right-6 top-6 p-3 rounded-lg bg-orange-600/10 text-orange-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* TOTAL DISTRIBUTED */}
        <div className="bg-slate-900 border border-slate-900 rounded-2xl p-6.5 relative overflow-hidden group">
          <p className="text-xs text-slate-300">Total Pago aos Usuários</p>
          <p className="text-2xl font-black text-emerald-400 mt-1">R$ {Number(stats?.total_distribuido || 0).toFixed(2)}</p>
          <p className="text-[9px] text-slate-500 font-mono mt-3 uppercase">Distribuído entre os membros (80%)</p>
          <div className="absolute right-6 top-6 p-3 rounded-lg bg-emerald-600/10 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* PLATFORM NET PROFIT */}
        <div className="bg-slate-900 border border-slate-900 rounded-2xl p-6.5 relative overflow-hidden group">
          <p className="text-xs text-slate-300">Lucro Líquido Plataforma</p>
          <p className="text-2xl font-black text-amber-400 mt-1 font-sans">R$ {Number(stats?.total_lucro || 0).toFixed(2)}</p>
          <p className="text-[9px] text-slate-500 font-mono mt-3 uppercase">Taxa retida na ativação (20%)</p>
          <div className="absolute right-6 top-6 p-3 rounded-lg bg-amber-600/10 text-amber-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PLATFORM USER SUMMARY COUNTERS */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 space-y-4">
          <h3 className="font-bold text-white text-sm">Controle de Cadastros</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-900">
              <span className="text-slate-500 text-xs font-mono uppercase block">Usuários Registrados</span>
              <span className="text-4xl font-extrabold text-white block mt-2">{stats?.total_users || 0}</span>
              <button 
                onClick={() => onNavigate('admin_usuarios')}
                className="text-[10px] text-rose-450 text-rose-400 hover:underline flex items-center gap-1 mt-3 font-semibold"
              >
                <span>Inspecionar registros</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-slate-950 p-4.5 rounded-2xl border border-slate-900">
              <span className="text-slate-500 text-xs font-mono uppercase block">Participantes Ativos</span>
              <span className="text-4xl font-extrabold text-white block mt-2">{stats?.active_users || 0}</span>
              <span className="text-[9px] text-slate-500 block mt-4 font-mono">Possuem transações na carteira</span>
            </div>
          </div>
        </div>

        {/* PENDING WITHDRAWALS WARNING CARD */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6.5 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase font-mono text-slate-400">
              <AlertTriangle className="w-4 h-4 text-rose-450 text-rose-400" />
              Saques aguardando Liberação
            </h3>
            
            {withdrawalsPending.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-6">Nenhuma solicitação de saque pendente.</p>
            ) : (
              <div className="space-y-2 py-2">
                <p className="text-xs text-slate-300">
                  Existem <strong>{withdrawalsPending.length}</strong> solicitações de resgates aguardando sua validação manual para Pix.
                </p>
                <div className="bg-rose-500/5 p-2 px-3 border border-rose-500/10 rounded-xl flex justify-between items-center font-mono text-[10px]">
                  <span className="text-slate-400">Total das solicitações:</span>
                  <span className="text-rose-400 font-bold">
                    R$ {withdrawalsPending.reduce((sum: number, w: any) => sum + w.valor, 0).toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => onNavigate('admin_saques')}
            disabled={withdrawalsPending.length === 0}
            className="w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-semibold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Ir para Gerenciador de Saques</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
}
