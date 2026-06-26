/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Link2, 
  Trash2, 
  ArrowLeft, 
  QrCode, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Coins,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';
import { ActionModal } from '../components/ActionModal';

interface GruposConviteProps {
  user: UserProfile;
}

export default function GruposConvite({ user }: GruposConviteProps) {
  const [invitedGroups, setInvitedGroups] = useState<any[]>([]);
  const [selectedInvited, setSelectedInvited] = useState<any | null>(null);
  
  const [payment, setPayment] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [copiando, setCopiando] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Delete modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadInvited = async () => {
    try {
      setLoading(true);
      const res = await api.getInvitedGroups();
      setInvitedGroups(res.invitedGroups || []);
    } catch (err) {
      console.error('Error fetching invited groups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvited();
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
            setSelectedInvited(null);
            loadInvited();
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

  const handleOpenInvite = (inviteData: any) => {
    setSelectedInvited(inviteData);
    setPayment(null);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleFetchPaymentCode = async () => {
    if (!selectedInvited) return;

    if (selectedInvited.group.members && selectedInvited.group.members.some((m: any) => m.user_id === user?.id && m.nome_completo.toLowerCase().trim() === user?.nome_completo.toLowerCase().trim())) {
      setErrorMessage("Você já participa deste grupo, ative outro grupo.");
      return;
    }

    setChecking(true);
    setErrorMessage('');
    
    try {
      const res = await api.activateInvitedGroup(selectedInvited.id);
      setPayment(res.payment);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao carregar Pix do convite.');
    } finally {
      setChecking(false);
    }
  };

  const confirmDeleteInvite = async () => {
    if (!deleteId) return;
    const paymentId = deleteId;
    setDeleteId(null);
    
    setCancelingId(paymentId);
    try {
      await api.deleteInvitedGroup(paymentId);
      setInvitedGroups(prev => prev.filter(item => item.id !== paymentId));
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao remover convite.');
    } finally {
      setCancelingId(null);
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
          <h1 className="text-xl font-bold text-white">Grupos de Convite</h1>
          <p className="text-xs text-slate-400 mt-1">
            Grupos que você acessou através de links de convite compartilhados. Ative-os para iniciar seu faturamento.
          </p>
        </div>
        <div className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/10 rounded-xl py-1.5 px-3 font-semibold font-mono">
          {invitedGroups.length} Convites recebidos
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
          Procurando convites de grupos registrados...
        </div>
      ) : invitedGroups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mb-2">
            <Link2 className="w-6 h-6 animate-pulse" />
          </div>
          <h3 className="font-bold text-white text-base">Nenhum convite pendente</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Quando você clicar em um link de convite oficial compartilhado (ex: <code>/?invite=CÓDIGO</code>), o grupo convidado aparecerá listado nesta seção imediatamente!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {invitedGroups.map((item) => (
            <div 
              key={item.id} 
              className="bg-slate-900 border border-slate-900 hover:border-slate-800/80 transition-all rounded-3xl p-5.5 space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">CONVITE: {item.invite_code}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/10 font-bold flex items-center gap-1.5 uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Aguardando Ativação
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-tight">{item.group.nome_grupo}</h3>
                
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 divide-y divide-slate-800/50 space-y-2">
                  <div className="flex justify-between items-center text-[11px] pb-1.5">
                    <span className="text-slate-500 font-mono">Valor de Ativação:</span>
                    <span className="font-extrabold text-white text-xs">R$ {item.group.valor_ativacao.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] pt-1.5">
                    <span className="text-slate-500 font-mono">Valor Base:</span>
                    <span className="font-bold text-emerald-400 text-xs">R$ {item.group.valor_base.toFixed(2)}</span>
                  </div>
                </div>

                {/* Participantes list inside the card */}
                <div className="space-y-2 pt-1 border-t border-slate-800/50">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Participantes do Grupo:</span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {item.group.members && item.group.members.length > 0 ? (
                      item.group.members.map((member: any) => (
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

              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setDeleteId(item.id); }}
                  disabled={cancelingId === item.id}
                  className="px-3 py-2.5 bg-red-950/25 hover:bg-red-950/50 hover:text-red-400 text-slate-500 rounded-xl transition-colors border border-transparent hover:border-red-500/20 cursor-pointer"
                  title="Excluir Convite"
                >
                  {cancelingId === item.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
                <button 
                  onClick={() => handleOpenInvite(item)}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 hover:shadow-emerald-500/10 text-white rounded-xl text-xs font-bold transition-all cursor-pointer block text-center shadow"
                >
                  Ver Convite
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Error out of modal */}
      {!selectedInvited && errorMessage && (
        <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Modal Popup overlay */}
      {selectedInvited && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-5 relative space-y-4 animate-fade-in text-left">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase tracking-wide">
                  RECEBIDO VIA LINK DE CONVITE: {selectedInvited.invite_code}
                </span>
                <h2 className="text-base font-bold text-white">{selectedInvited.group.nome_grupo}</h2>
              </div>
              <button
                onClick={() => {
                  setSelectedInvited(null);
                  setPayment(null);
                }}
                className="p-1.5 rounded-lg bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:bg-slate-850/50 transition-colors cursor-pointer"
                aria-label="Fechar"
              >
                <ArrowLeft className="w-4 h-4" />
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
                    <p className="text-xs font-semibold text-slate-300 mt-1">R$ {selectedInvited.group.valor_base.toFixed(2)}</p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850">
                    <p className="text-[9px] text-slate-500 uppercase font-mono tracking-wider">Valor de Ativação</p>
                    <p className="text-sm font-extrabold text-white mt-1">R$ {selectedInvited.group.valor_ativacao.toFixed(2)}</p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center justify-between bg-slate-950/40 border border-slate-850 rounded-xl p-2.5 px-3.5">
                  <span className="text-xs font-semibold text-slate-400">Status do Convite:</span>
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
                    {selectedInvited.group.members && selectedInvited.group.members.length > 0 ? (
                      selectedInvited.group.members.map((member: any) => (
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
                    onClick={handleFetchPaymentCode}
                    disabled={checking}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-lg"
                  >
                    {checking ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Carregando Pix do invite...</span>
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4" />
                        <span>Ativar Convite (Gerar Pix de R$ {selectedInvited.group.valor_ativacao.toFixed(2)})</span>
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
                    Pagamento do Convite Gerado!
                  </h3>
                  <p className="text-xs text-slate-400">Escaneie o QR Code ou cole o Pix abaixo para concluir ativação.</p>
                  <div className="inline-block bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 rounded-xl px-4 py-2 mt-2 mb-2 font-bold text-sm">
                    Valor: R$ {selectedInvited.group.valor_ativacao.toFixed(2)}
                  </div>
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

                {/* Webhook Simulator trigger Removed */}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete modal */}
      <ActionModal
        isOpen={!!deleteId}
        title="Remover Convite"
        message="Deseja realmente remover este grupo de convites?"
        isDanger={true}
        onConfirm={confirmDeleteInvite}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
