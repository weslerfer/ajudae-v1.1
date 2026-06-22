/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Wallet,
  Coins,
  History,
  ShieldCheck,
  Search,
  Key,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { api } from '../api';
import { ActionModal } from '../components/ActionModal';

export default function AdminCarteiras() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Balance adjustment states
  const [selectedWallet, setSelectedWallet] = useState<any | null>(null);
  const [actionType, setActionType] = useState<'adicao' | 'subtracao' | null>(null);
  
  // Transactions modal states
  const [viewingExtratoFor, setViewingExtratoFor] = useState<any | null>(null);

  // Zerar modal
  const [zerarAccountData, setZerarAccountData] = useState<{userId: string, email: string} | null>(null);

  const [amount, setAmount] = useState('');
  const [descricao, setDescricao] = useState('');

  const [saving, setSaving] = useState(false);
  const [fbSuccess, setFbSuccess] = useState('');
  const [fbError, setFbError] = useState('');

  const loadWallets = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminWallets();
      setWallets(res.wallets || []);
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleOpenAdjust = (w: any, type: 'adicao' | 'subtracao') => {
    setSelectedWallet(w);
    setActionType(type);
    setAmount('');
    setDescricao(type === 'adicao' ? 'Crédito administrativo adicionado' : 'Debito administrativo retirado');
    setFbSuccess('');
    setFbError('');
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbSuccess('');
    setFbError('');

    if (!amount || Number(amount) <= 0) {
      setFbError('Por favor digite um valor válido maior do que zero.');
      return;
    }

    setSaving(true);
    try {
      const finalAmount = actionType === 'adicao' ? Number(amount) : -Number(amount);
      const res = await api.adjustWalletBalance(selectedWallet.user_id, finalAmount, descricao.trim());
      
      setFbSuccess(res.message || 'Lançamento financeiro processado e registrado com sucesso!');
      setSelectedWallet(null);
      setActionType(null);
      await loadWallets(); // refresh balances
    } catch (err: any) {
      setFbError(err.message || 'Erro ao reajustar saldo.');
    } finally {
      setSaving(false);
    }
  };

  const confirmZerar = async () => {
    if (!zerarAccountData) return;
    const { userId, email } = zerarAccountData;

    setSaving(true);
    setFbSuccess('');
    setFbError('');
    try {
      const walletToClear = wallets.find(w => w.user_id === userId);
      const currentBalance = walletToClear ? walletToClear.saldo_atual : 0;
      
      const res = await api.adjustWalletBalance(userId, -currentBalance, 'Zeramento de carteira por auditoria física administrativa');
      setFbSuccess('Carteira zerada com sucesso.');
      await loadWallets();
    } catch (err: any) {
      setFbError(err.message || 'Erro ao zerar carteira.');
    } finally {
      setSaving(false);
      setZerarAccountData(null);
    }
  };

  const filteredWallets = wallets.filter(w => 
    w.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header controls search user wallets */}
      <div className="border-b border-slate-900 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-rose-500/5 -mx-4 px-4 py-3 border-y border-rose-500/10 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white leading-none">Controle de Carteiras Digitais</h1>
          <p className="text-[10px] text-rose-455 text-rose-400 mt-1 uppercase font-mono">Lançamentos residuais de créditos e débitos</p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Procurar carteira por nome/email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 text-xs text-white rounded-xl pl-9 pr-3 py-2 border border-slate-805 focus:outline-none focus:border-rose-500 transition-colors"
          />
        </div>
      </div>

      {fbSuccess && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{fbSuccess}</span>
        </div>
      )}

      {fbError && (
        <div className="bg-red-950/20 text-red-550 text-red-400 border border-red-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-450/90 flex-shrink-0" />
          <span>{fbError}</span>
        </div>
      )}

      {/* ADJUSTER ACTION FORM MODAL */}
      {selectedWallet && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full mx-auto space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <div>
                <p className="text-[9px] font-mono text-slate-500 uppercase">LANÇAMENTO ADMINISTRATIVO</p>
                <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
                  {actionType === 'adicao' ? 'Adicionar Créditos +' : 'Debitar Saldos -'}
                </h3>
              </div>
              <button 
                onClick={() => { setSelectedWallet(null); setActionType(null); }} 
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 text-[10px] text-slate-400">
                <span className="text-slate-500">Carteira:</span> <strong className="text-white">{selectedWallet.nome_completo}</strong> <span className="font-mono text-slate-500">({selectedWallet.email})</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Valor do Ajuste (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="25,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl pl-8 pr-4 py-2.5 border border-slate-800 text-sm focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Motivo / Descrição do Lançamento
                </label>
                <input
                  type="text"
                  placeholder="Ex Conceitual: Compensação de bônus Pix"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-rose-600 hover:bg-rose-550 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Processar Entrada Financeira'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED WALLET LOGICAL DATAGRID LISTING */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Processando dados das carteiras...
        </div>
      ) : filteredWallets.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-850 p-12 rounded-3xl text-center text-xs text-slate-500 italic">
          {fbError ? (
            <span className="text-red-400">{fbError}</span>
          ) : (
            'Nenhuma carteira ativa encontrada para a pesquisa.'
          )}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-900/50">
          {filteredWallets.map((w) => (
            <div 
              key={w.id} 
              className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-slate-900/20 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-rose-400 hidden md:block">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                   <p className="font-bold text-white text-sm truncate">{w.nome_completo}</p>
                   <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{w.email} • WAL_ID: {w.id}</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-955 flex items-center justify-between gap-4 font-mono text-[10px] w-full md:w-auto">
                  <span className="text-slate-500">Saldo:</span>
                  <span className="text-xs font-black text-emerald-450 text-emerald-400">
                    R$ {Number(w.saldo_atual || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                  <button
                     onClick={() => setViewingExtratoFor(w)}
                     className="py-1.5 px-3 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[10px] font-semibold transition-all border border-indigo-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                     title="Ver Extrato"
                   >
                     <History className="w-3.5 h-3.5" />
                     <span>Extrato</span>
                   </button>
                  <button
                    onClick={() => handleOpenAdjust(w, 'adicao')}
                    className="py-1.5 px-3 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-[10px] font-semibold transition-all border border-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                    title="Creditar +"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenAdjust(w, 'subtracao')}
                    className="py-1.5 px-3 bg-rose-600/15 hover:bg-rose-500 text-rose-450 hover:text-white rounded-lg text-[10px] font-semibold transition-all border border-rose-550/10 cursor-pointer flex items-center justify-center gap-1.5"
                    title="Debitar -"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setZerarAccountData({ userId: w.user_id, email: w.email })}
                    className="p-1.5 bg-red-950/20 hover:bg-red-500 border border-transparent hover:border-red-500/20 hover:text-white text-red-500/80 rounded-lg transition-all cursor-pointer"
                    title="Zerar carteira e apagar extrato"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EXTRATO MODAL */}
      {viewingExtratoFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Extrato do Usuário
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">{viewingExtratoFor.nome_completo} ({viewingExtratoFor.email})</p>
              </div>
              <button 
                onClick={() => setViewingExtratoFor(null)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 relative">
              {(() => {
                const userTxs = transactions.filter(t => t.user_id === viewingExtratoFor.user_id);
                if (userTxs.length === 0) {
                  return (
                    <div className="text-center py-12 text-xs text-slate-500 italic font-mono bg-slate-950/30 rounded-2xl border border-slate-800">
                      Nenhuma transação financeira registrada para esta carteira.
                    </div>
                  );
                }
                
                return (
                  <div className="bg-slate-950/50 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
                    {userTxs.map((trx) => {
                      const isPositive = trx.valor >= 0;
                      return (
                        <div key={trx.id} className="p-4.5 flex justify-between items-start gap-4 hover:bg-slate-900/40 transition-colors">
                          <div className="flex gap-3">
                            <div className={`p-2 rounded-xl flex-shrink-0 border ${
                              isPositive 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10' 
                                : 'bg-red-500/10 text-red-500 border-red-500/10'
                            }`}>
                              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                            </div>
                            
                            <div className="space-y-1 font-sans">
                              <p className="text-xs font-bold text-white leading-tight">
                                {trx.descricao.includes('\n') 
                                  ? trx.descricao.split('\n')[0] 
                                  : (isPositive ? 'Recebimento de Fundos' : 'Retirada de Fundos')}
                              </p>
                              
                              <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap max-w-sm lg:max-w-md break-words">
                                {trx.descricao.includes('\n') ? trx.descricao.substring(trx.descricao.indexOf('\n') + 1) : trx.descricao}
                              </p>
                              
                              <span className="text-[9px] text-slate-500 font-mono block">
                                {new Date(trx.created_at).toLocaleTimeString('pt-BR')} - {new Date(trx.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>

                          <div className="text-right font-mono flex-shrink-0">
                            <span className={`text-sm font-bold ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                              {isPositive ? '+' : ''}R$ {trx.valor.toFixed(2)}
                            </span>
                            <span className="text-[8px] font-mono text-slate-600 block mt-0.5 uppercase">ID: {trx.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {zerarAccountData && (
        <ActionModal
          isOpen={true}
          title="ZERAR SALDO"
          message={`Deseja realmente ZERAR o saldo da carteira do usuário ${zerarAccountData.email}?`}
          isDanger={true}
          onConfirm={confirmZerar}
          onCancel={() => setZerarAccountData(null)}
        />
      )}
    </div>
  );
}
