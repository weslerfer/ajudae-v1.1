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
  RefreshCw,
  Server,
  Zap,
  LayoutList
} from 'lucide-react';
import { api } from '../api';
import { Typography } from '../components/ui/Typography';
import { Grid } from '../components/ui/Grid';
import { GlassSurface } from '../components/ui/GlassSurface';
import { Button } from '../components/ui/Button';

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
      <div className="flex justify-between items-center bg-rose-500/5 px-6 py-4 border border-rose-500/10 rounded-2xl mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 rounded-xl">
            <Server className="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <Typography variant="h3" className="text-white">Centro de Operações</Typography>
            <Typography variant="caption" color="secondary" className="uppercase tracking-wider font-mono">
              Governança e Auditoria Financeira
            </Typography>
          </div>
        </div>
        <button 
          onClick={loadStats}
          className="p-2 hover:bg-white/5 text-slate-400 hover:text-white rounded-lg transition-colors border border-white/5"
          title="Recarregar dados"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* HEALTH BANNER (Critical Attention Center) */}
      <GlassSurface intensity="subtle" className="p-0 border-emerald-500/20 overflow-hidden mb-8">
        <div className="bg-emerald-500/10 px-6 py-4 flex items-center justify-between border-b border-emerald-500/20">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <Typography variant="h4" className="text-emerald-400">Sistema Saudável</Typography>
          </div>
          <Typography variant="caption" className="font-mono text-emerald-500/70">
            Última sincronização: Agora
          </Typography>
        </div>
        <div className="px-6 py-5">
          <Grid cols={4} gap="md">
            <div>
              <Typography variant="caption" color="secondary" className="uppercase font-bold mb-1 block">Exceções Críticas</Typography>
              <Typography variant="h3" className="text-slate-300">0</Typography>
            </div>
            <div>
              <Typography variant="caption" color="secondary" className="uppercase font-bold mb-1 block">Filas Bloqueadas</Typography>
              <Typography variant="h3" className="text-slate-300">0</Typography>
            </div>
            <div>
              <Typography variant="caption" color="secondary" className="uppercase font-bold mb-1 block">Atenção Requerida</Typography>
              <Typography variant="h3" className="text-amber-400">
                {withdrawalsPending.length} <span className="text-xs text-amber-500/50">Saques</span>
              </Typography>
            </div>
            <div className="text-right">
              <Button variant="secondary" size="sm" onClick={() => onNavigate('admin_saques')}>
                Resolver Pendências
              </Button>
            </div>
          </Grid>
        </div>
      </GlassSurface>

      {/* CORE FINANCIAL STATISTICS GRIDS */}
      <Grid cols={3} gap="md">
        
        {/* TOTAL FLOW RECEIVED */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <Typography variant="caption" color="secondary" className="uppercase font-bold">Volume Capturado</Typography>
          <Typography variant="h2" className="mt-2 text-white">R$ {Number(stats?.total_recebido || 0).toFixed(2)}</Typography>
          <div className="absolute right-6 top-6 p-3 rounded-lg bg-indigo-500/10 text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* TOTAL DISTRIBUTED */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <Typography variant="caption" color="secondary" className="uppercase font-bold">Liquidação de Usuários</Typography>
          <Typography variant="h2" className="mt-2 text-emerald-400">R$ {Number(stats?.total_distribuido || 0).toFixed(2)}</Typography>
          <div className="absolute right-6 top-6 p-3 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* PLATFORM NET PROFIT */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
          <Typography variant="caption" color="secondary" className="uppercase font-bold">Lucro Líquido</Typography>
          <Typography variant="h2" className="mt-2 text-amber-400">R$ {Number(stats?.total_lucro || 0).toFixed(2)}</Typography>
          <div className="absolute right-6 top-6 p-3 rounded-lg bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
        
      </Grid>

      {/* FILAS ADMINISTRATIVAS RAPIDAS */}
      <div className="mt-12">
        <Typography variant="h4" className="flex items-center gap-2 mb-6">
          <LayoutList className="w-5 h-5 text-slate-400" />
          Filas Operacionais (Visão Geral)
        </Typography>

        <Grid cols={3} gap="lg">
          <GlassSurface intensity="subtle" className="p-5 border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="body" className="font-bold text-amber-400">Pagamentos / Saques</Typography>
              <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded text-[10px] font-bold">{withdrawalsPending.length} pendentes</span>
            </div>
            <Typography variant="caption" color="secondary" className="block mb-4">
              Liquidações aguardando transferência bancária (PIX) para os membros.
            </Typography>
            <Button variant="secondary" size="sm" className="w-full text-[11px]" onClick={() => onNavigate('admin_saques')}>
              Acessar Fila
            </Button>
          </GlassSurface>

          <GlassSurface intensity="subtle" className="p-5 border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="body" className="font-bold text-slate-300">Revisão de Convites</Typography>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">0 pendentes</span>
            </div>
            <Typography variant="caption" color="secondary" className="block mb-4">
              Convites gerados que exigem auditoria manual ou aprovação compliance.
            </Typography>
            <Button variant="secondary" size="sm" className="w-full text-[11px] opacity-50" disabled>
              Fila Vazia
            </Button>
          </GlassSurface>

          <GlassSurface intensity="subtle" className="p-5 border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <Typography variant="body" className="font-bold text-slate-300">Auditoria de Usuários</Typography>
              <span className="bg-slate-800 text-slate-400 px-2 py-0.5 rounded text-[10px] font-bold">Normal</span>
            </div>
            <Typography variant="caption" color="secondary" className="block mb-4">
              Acompanhamento de novos registros, validações KYC e bloqueios de segurança.
            </Typography>
            <Button variant="secondary" size="sm" className="w-full text-[11px]" onClick={() => onNavigate('admin_usuarios')}>
              Gerenciar
            </Button>
          </GlassSurface>
        </Grid>
      </div>

    </div>
  );
}
