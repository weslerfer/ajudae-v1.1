/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  Coins, 
  ArrowRight,
  Layers,
  Sparkles,
  Link2
} from 'lucide-react';
import { api } from '../api';
import { UserProfile, AdminGroup, ActiveGroup } from '../types';

interface HomeProps {
  user: UserProfile;
  onNavigate: (view: string) => void;
}

export default function Home({ user, onNavigate }: HomeProps) {
  const [activeCount, setActiveCount] = useState(0);
  const [invitedActivated, setInvitedActivated] = useState(0);
  const [totalEarned, setTotalEarned] = useState(0);
  const [adminGroups, setAdminGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const stats = await api.getHomeStats();
        
        setActiveCount(stats.activeCount || 0);
        setTotalEarned(stats.totalEarned || 0);
        setInvitedActivated(stats.invitedActivated || 0);
        setAdminGroups(stats.adminGroups || []);

      } catch (err) {
        console.error('Error loading home stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [user.id]);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Welcome Banner Card */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-900 rounded-3xl p-6.5 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl" />
        <div className="space-y-2">
          <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 rounded-lg font-mono tracking-wider mb-2 inline-block">
            SISTEMA ATIVO
          </span>
          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Olá, {user.nome_completo}!
          </h1>
          <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
            Bem-vindo ao <strong>Ajudae</strong>. Sua participação em grupos de ajuda mútua digital começa aqui. Participe de grupos, convide amigos e veja sua carteira girar.
          </p>
        </div>
        <button 
          onClick={() => onNavigate('como_funciona')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4.5 rounded-xl text-xs transition-colors shadow-lg cursor-pointer"
        >
          <span>Aprender Como Funciona</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* QUICK STATS COUNTERS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* ACTIVE GROUPS STAT CARD */}
        <div className="bg-slate-900/60 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Grupos Ativados</p>
            <p className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : activeCount}</p>
            <button 
              onClick={() => onNavigate('meus_grupos')}
              className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline pt-2 cursor-pointer border border-transparent"
            >
              <span>Ver meus grupos</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/10 text-orange-400 group-hover:scale-105 transition-transform">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        {/* ACTIVATED HOSTS COUNT CARD */}
        <div className="bg-slate-900/60 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Convidados Ativos</p>
            <p className="text-3xl font-extrabold text-white tracking-tight">{loading ? '...' : invitedActivated}</p>
            <button 
              onClick={() => onNavigate('meus_grupos')}
              className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline pt-2 cursor-pointer border border-transparent"
            >
              <span>Partilhar mais convites</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/10 text-indigo-400 group-hover:scale-105 transition-transform">
            <Link2 className="w-6 h-6" />
          </div>
        </div>

        {/* WALLET EARNINGS STAT CARD */}
        <div className="bg-slate-900/60 border border-slate-900 hover:border-slate-800/80 rounded-2xl p-6 flex items-center justify-between transition-all group">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Lucro Acumulado</p>
            <p className="text-3xl font-extrabold text-emerald-400 tracking-tight">R$ {loading ? '0,00' : totalEarned.toFixed(2)}</p>
            <button 
              onClick={() => onNavigate('carteira')}
              className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 group-hover:underline pt-2 cursor-pointer border border-transparent"
            >
              <span>Acessar carteira digital</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
            <Coins className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* GROUPS PREVIEWS PANEL */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-slate-900 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            Sugestão de Grupos Disponíveis
          </h2>
          <button 
            onClick={() => onNavigate('grupos_disponiveis')}
            className="text-xs text-slate-400 hover:text-emerald-400 font-semibold flex items-center gap-1 border border-transparent"
          >
            <span>Explorar todos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="text-center p-10 text-xs text-slate-400">
            Carregando grupos...
          </div>
        ) : adminGroups.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl text-center">
            <p className="text-sm font-semibold text-slate-300">Nenhum grupo disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminGroups.map((group) => (
              <div 
                key={group.id} 
                className="bg-slate-900 border border-slate-900 hover:border-slate-800/80 transition-all rounded-2xl p-5.5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500">ID: {group.id.substring(0,8)}...</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/10 font-bold flex items-center gap-1.5 uppercase">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Disponível
                    </span>
                  </div>
                  <h3 className="font-bold text-white text-base leading-tight">{group.nome_grupo}</h3>
                  <div className="flex justify-between items-center bg-slate-950/60 p-2.5 rounded-xl border border-slate-900">
                    <span className="text-[10px] text-slate-400">Valor Ativação:</span>
                    <span className="text-sm font-extrabold text-white">R$ {group.valor_ativacao.toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={() => onNavigate('grupos_disponiveis')}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors block text-center"
                >
                  Entrar no Grupo
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
