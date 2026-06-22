/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Layers, 
  MapPin, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Coins,
  ShieldCheck,
  Zap,
  X
} from 'lucide-react';
import { api } from '../api';
import { UserProfile, AdminGroup } from '../types';

interface GruposDisponiveisProps {
  user: UserProfile;
}

export default function GruposDisponiveis({ user }: GruposDisponiveisProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [payment, setPayment] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [copiando, setCopiando] = useState(false);
  const [checking, setChecking] = useState(false);
  
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const loadGroups = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminGroups();
      setGroups(res.groups || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [user.id]);

  useEffect(() => {
    let interval: any;
    if (payment && payment.status === 'pendente') {
      interval = setInterval(async () => {
        try {
          const res = await api.getPaymentStatus(payment.id);
          if (res.payment && res.payment.status !== 'pendente') {
            clearInterval(interval);
            if (res.payment.status === 'pago') {
              setSuccessMessage('Pagamento recebido e processado com sucesso. O grupo foi ativado!');
            } else if (res.payment.status === 'erro' || res.payment.status === 'cancelado') {
              setErrorMessage('Ocorreu um erro no processamento do pagamento ou ele foi cancelado.');
            }
            setPayment(null);
            setSelectedGroup(null);
            loadGroups();
          }
        } catch (e) {
          console.error('Error polling status', e);
        }
      }, 5000); // Check every 5 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [payment]);

  const handleOpenGroup = async (group: any) => {
    setSelectedGroup(group);
    setPayment(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleGeneratePix = async () => {
    if (!selectedGroup) return;
    setPaying(true);
    setErrorMessage('');
    
    try {
      const res = await api.createPayment(selectedGroup.id);
      setPayment(res.payment);
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao iniciar pagamento Pix.');
    } finally {
      setPaying(false);
    }
  };

  const handleCopyPixCode = () => {
    if (!payment) return;
    navigator.clipboard.writeText(payment.copia_cola);
    setCopiando(true);
    setTimeout(() => setCopiando(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">Grupos Disponíveis</h1>
          <p className="text-xs text-slate-400 mt-1">Inscreva-se nos grupos gerais criados pela equipe administrativa.</p>
        </div>
      </div>

      {successMessage && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-2xl p-4.5 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Procurando grupos disponíveis pela administração...
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-white text-base">Nenhum grupo disponível no momento</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map((group) => (
            <div 
              key={group.id} 
              className="bg-slate-900 border border-slate-900 hover:border-slate-800/80 transition-all rounded-3xl p-5.5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500">ID: {group.id.substring(0,8)}...</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/10 font-bold flex items-center gap-1.5 uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Aguardando Ativação
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-tight">{group.nome_grupo}</h3>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 divide-y divide-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center text-[11px] pb-1.5">
                    <span className="text-slate-500 font-mono">Valor de Ativação:</span>
                    <span className="font-extrabold text-white text-xs">R$ {group.valor_ativacao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1.5">
                    <span className="text-slate-500 font-mono">Valor Base:</span>
                    <span className="font-bold text-emerald-400 text-xs">R$ {group.valor_base.toFixed(2)}</span>
                  </div>
                </div>

                {/* List participants on card, listed one under another */}
                <div className="space-y-2 pt-1 border-t border-slate-800/50">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Participantes do Grupo:</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {group.members && group.members.length > 0 ? (
                      group.members.map((member: any) => (
                        <div key={member.id} className="bg-slate-950 p-2 border border-slate-900 rounded-xl flex items-center justify-between text-xs gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="w-5 h-5 rounded bg-slate-900 border border-slate-850 text-[9px] font-bold text-slate-400 flex items-center justify-center font-mono shrink-0">
                              #{member.position}
                            </span>
                            <span className="text-slate-200 truncate block font-sans text-[11px] font-medium">{member.nome_completo}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 shrink-0 font-mono">{member.cidade}/{member.estado}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">Sem participantes designados.</p>
                    )}
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleOpenGroup(group)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer block text-center shadow"
              >
                Ver Grupo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal Popup overlay */}
      {selectedGroup && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-5 relative space-y-4 animate-fade-in text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="space-y-0.5">
                <h2 className="text-base font-bold text-white">{selectedGroup.nome_grupo}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedGroup(null);
                  setPayment(null);
                }}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-850/50 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error notifications and success instructions inside modal */}
            {errorMessage && (
              <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Main content split depending on whether payment has been initiated or not */}
            {!payment ? (
              <div className="space-y-3">
                {/* Information cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Valor Base</p>
                    <p className="text-xs font-semibold text-slate-300 mt-1">R$ {selectedGroup.valor_base.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Valor de Ativação</p>
                    <p className="text-sm font-extrabold text-white mt-1">R$ {selectedGroup.valor_ativacao.toFixed(2)}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between bg-slate-950/40 border border-slate-850 rounded-xl p-2.5 px-3.5">
                  <span className="text-xs font-semibold text-slate-400">Status do Grupo:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold flex items-center gap-1.5 uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Aguardando Ativação
                  </span>
                </div>

                {/* Participants in vertical list inside modal */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    Participantes deste Grupo
                  </h3>
                  
                  <div className="bg-slate-950/45 border border-slate-850 p-2 rounded-2xl space-y-1.5">
                    {selectedGroup.members && selectedGroup.members.length > 0 ? (
                      selectedGroup.members.map((member: any) => (
                        <div key={member.id} className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex items-center gap-3">
                          <div className="w-7 h-7 rounded-lg bg-slate-900 font-bold text-white text-[11px] flex items-center justify-center font-mono border border-slate-800 shrink-0">
                            #{member.position}
                          </div>
                          <div className="font-sans overflow-hidden flex-1 text-left">
                            <p className="text-xs font-semibold text-white truncate">{member.nome_completo}</p>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">{member.cidade} - {member.estado}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">Sem participantes designados.</p>
                    )}
                  </div>
                </div>

                {/* Confirm & Join Action Button */}
                <div className="pt-3 border-t border-slate-850">
                  <button
                    onClick={handleGeneratePix}
                    disabled={paying}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
                  >
                    {paying ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Iniciando cobrança Pix epígrafe...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>Entrar no Grupo (Gerar Pix de R$ {selectedGroup.valor_ativacao.toFixed(2)})</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Modal Active Payment view (Pix QR code details inside pop-up) */
              <div className="space-y-5 text-center">
                <div className="space-y-1 text-center">
                  <h3 className="font-bold text-white text-base flex items-center justify-center gap-2">
                    <QrCode className="w-5 h-5 text-emerald-400 animate-pulse" />
                    Pagamento Pix Gerado!
                  </h3>
                  <p className="text-xs text-slate-400">Escaneie o QR Code ou cole o Pix abaixo para concluir ativação.</p>
                </div>

                {/* QR Code graphic */}
                <div className="bg-white p-3 rounded-2xl inline-block border border-slate-205 shadow-xl mx-auto">
                  <img 
                    src={payment.qrcode.startsWith('data:') || payment.qrcode.startsWith('http') ? payment.qrcode : `data:image/png;base64,${payment.qrcode}`} 
                    alt="QR Code Pix" 
                    className="w-40 h-40 mx-auto"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Copy and Paste fields */}
                <div className="space-y-1.5 text-left max-w-sm mx-auto">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                    Código Copia e Cola Pix
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={payment.copia_cola}
                      className="w-full bg-slate-950 font-mono text-[9px] text-slate-400 rounded-xl px-3 py-2 border border-slate-800 select-all"
                    />
                    <button
                      onClick={handleCopyPixCode}
                      className="bg-slate-800 hover:bg-slate-750 p-2 px-2.5 text-white rounded-xl flex items-center transition-colors border border-slate-800 cursor-pointer text-xs"
                      title="Copiar Pix"
                    >
                      {copiando ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
