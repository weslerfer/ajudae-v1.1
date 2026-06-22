/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  MapPin, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft, 
  QrCode, 
  Link2,
  Calendar,
  Layers
} from 'lucide-react';
import { api } from '../api';
import { UserProfile, ActiveGroup } from '../types';

interface MeusGruposProps {
  user: UserProfile;
}

export default function MeusGrupos({ user }: MeusGruposProps) {
  const [activeGroups, setActiveGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteStats, setInviteStats] = useState({ used_count: 0, max_uses: 10 });
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await api.getActiveGroups();
      setActiveGroups(res.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user.id]);

  const handleSelectGroup = async (group: any) => {
    try {
      const details = await api.getGroupDetails(group.id);
      setSelectedGroup(details.group);
      setInviteCode(details.invite_code || '');
      setInviteStats({
        used_count: details.used_count || 0,
        max_uses: details.max_uses || 10
      });
    } catch (err) {
      console.error('Error fetching group details:', err);
    }
  };

  const inviteUrl = `${window.location.origin}/?invite=${inviteCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    const textMsg = `Olá! Quero te convidar para o grupo "${selectedGroup?.nome_grupo}" na plataforma Ajudae! Ative utilizando este link de convite oficial: ${inviteUrl}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Convite Ajudae',
        text: textMsg,
        url: inviteUrl,
      }).then(() => {
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      }).catch(err => {
        console.error(err);
      });
    } else {
      // Fallback: Copy and notify user
      navigator.clipboard.writeText(textMsg);
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  if (selectedGroup) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
        {/* Back navigation header button */}
        <button
          onClick={() => setSelectedGroup(null)}
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors py-2 px-3 bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para Meus Grupos</span>
        </button>

        {/* Selected Group details card */}
        <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6.5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-550/5 rounded-full blur-2xl" />
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500 uppercase">GRUPO ATIVADO</span>
                <h2 className="text-xl font-bold text-white">{selectedGroup.nome_grupo}</h2>
              </div>
              <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-xl font-mono text-xs font-bold uppercase">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Ativado
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900">
                <p className="text-[10px] text-slate-500 uppercase font-mono">ID Único do Grupo</p>
                <p className="text-xs font-mono text-white mt-1 break-all">{selectedGroup.id}</p>
              </div>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Valor de Ativação</p>
                  <p className="text-base font-extrabold text-white mt-1">R$ {selectedGroup.valor_ativacao.toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 uppercase font-mono">Valor Base</p>
                  <p className="text-sm font-semibold text-slate-300 mt-1">R$ {selectedGroup.valor_base.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Participating active members sequence queue (1º ao 4º) */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-400" />
            Participantes Ativos do Grupo
          </h3>
          
          <div className="flex flex-col gap-3">
            {selectedGroup.members && selectedGroup.members.length > 0 ? (
              selectedGroup.members.map((member: any, index: number) => {
                const isCurrentUser = member.user_id === user.id && member.nome_completo === user.nome_completo;
                
                return (
                  <div 
                    key={member.id} 
                    className={`p-4 rounded-xl border flex items-center justify-between relative overflow-hidden ${
                      isCurrentUser 
                        ? 'bg-emerald-600/5 border-emerald-500/30' 
                        : 'bg-slate-900 border-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-10 h-10 rounded-lg bg-slate-950 flex flex-shrink-0 items-center justify-center font-black text-slate-500 border border-slate-800">
                        #{member.position}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-white flex items-center gap-2 truncate">
                          <span className="truncate">{member.nome_completo}</span>
                          {isCurrentUser && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded uppercase font-extrabold flex-shrink-0 border border-emerald-500/20">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-slate-500" />
                          <span className="truncate">{member.cidade} - {member.estado}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center p-6 text-sm text-slate-500 font-mono">
                Sem participantes atribuídos.
              </div>
            )}
          </div>
        </div>

        {/* CUSTOM SHARE & INVITES INTEGRATED HUB */}
        {inviteCode && (
          <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 md:p-8 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-400" />
                  Compartilhe seu Link de Convite
                </h3>
                <p className="text-xs text-slate-400 mt-1">Conclua novas ativações para elevar de posição no grupo!</p>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono text-slate-400">Fichas disponíveis:</span>
                <p className="text-lg font-black text-emerald-400 mt-0.5 font-mono">
                  {inviteStats.max_uses - inviteStats.used_count} / {inviteStats.max_uses} restam
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Link Único do seu Grupo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="w-full bg-slate-950 font-mono text-xs text-slate-400 rounded-xl px-4 py-3 border border-slate-800 select-all"
                />
                
                <button
                  onClick={handleCopyLink}
                  className="bg-slate-800 hover:bg-slate-705 p-3 text-white rounded-xl flex items-center gap-1 bg-slate-800 hover:bg-slate-750 transition-colors border border-slate-800 cursor-pointer text-xs font-semibold"
                  title="Copiar Link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleShare}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-colors shadow-lg cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                <span>{shared ? 'Mensagem Copiada & Pronto para Compartilhar!' : 'Compartilhar Convite'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Meus Grupos Ativos</h1>
          <p className="text-xs text-slate-400 mt-1">Veja os grupos que você ativou e as posições de faturamento.</p>
        </div>
        <div className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 rounded-xl py-1.5 px-3 font-semibold font-mono">
          {activeGroups.length} Ativos
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Pesquisando seus grupos ativos...
        </div>
      ) : activeGroups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto mt-6">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
            <Users className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-white text-base">Você não possui grupos ativos</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
            Para ativar seu primeiro grupo de ajuda financeira, escolha um nas listas de <strong>Grupos Disponíveis</strong> ou entre por meio de links de convite de terceiros!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activeGroups.map((group) => {
            return (
              <div 
                key={group.id} 
                className="bg-slate-900 border border-slate-900 hover:border-slate-800/80 transition-all rounded-3xl p-5.5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono text-slate-500">ID: {group.id.substring(0,8)}...</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/10 font-bold flex items-center gap-1.5 uppercase font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Ativado
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-base leading-tight">{group.nome_grupo}</h3>
                  
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-2">
                    <div className="flex justify-between items-center text-[11px] pb-2 border-b border-slate-800/50">
                      <span className="text-slate-500 font-mono">Valor Base:</span>
                      <span className="font-bold text-emerald-400 text-xs">R$ {group.valor_base.toFixed(2)}</span>
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {[1, 2, 3, 4].map(pos => {
                        const m = group.members?.find((x: any) => x.position === pos);
                        const isMe = m?.user_id === user.id && m?.nome_completo === user.nome_completo;
                        return (
                          <div key={pos} className="flex items-center gap-2 text-[10px]">
                            <span className="text-slate-500 font-mono w-4">#{pos}</span>
                            <span className="font-medium truncate">
                              {m ? (
                                isMe ? (
                                  <span className="text-emerald-400 font-bold">{m.nome_completo}</span>
                                ) : (
                                  <span className="text-slate-300">{m.nome_completo}</span>
                                )
                              ) : (
                                <span className="text-slate-600 italic">Livre</span>
                              )}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleSelectGroup(group)}
                  className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer block text-center"
                >
                  Ver Grupo
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
