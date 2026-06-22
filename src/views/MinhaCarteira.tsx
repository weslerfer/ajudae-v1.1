/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  TrendingUp,
  History,
  Coins,
  Settings,
  Plus
} from 'lucide-react';
import { api } from '../api';
import { UserProfile, Wallet as WalletType, WalletTransaction } from '../types';

interface MinhaCarteiraProps {
  user: UserProfile;
  onNavigate: (view: string) => void;
}

export default function MinhaCarteira({ user, onNavigate }: MinhaCarteiraProps) {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const [wdSuccess, setWdSuccess] = useState('');
  const [wdError, setWdError] = useState('');

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const data = await api.getWalletInfo();
      setWallet(data.wallet);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, [user.id]);

  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setWdSuccess('');
    setWdError('');

    const val = Number(withdrawAmount);
    if (isNaN(val) || val < 25.0) {
      setWdError('O valor mínimo de saque é R$ 25,00.');
      return;
    }

    if (!user.chave_pix) {
      setWdError('Por favor, configure sua Chave Pix nas Configurações antes de solicitar saques.');
      return;
    }

    if (wallet && wallet.saldo_atual < val) {
      setWdError('Saldo disponível insuficiente para completar este saque.');
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await api.requestWithdrawal(val);
      setWdSuccess(res.message || 'Solicitação de saque criada com sucesso!');
      setWithdrawAmount('');
      // Reload financial records automatically
      await loadWalletData();
    } catch (err: any) {
      setWdError(err.message || 'Erro ao processar solicitação de saque.');
    } finally {
      setWithdrawLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="border-b border-slate-900 pb-3">
        <h1 className="text-xl font-bold text-white">Minha Carteira Digital</h1>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          Gerencie seu saldo, visualize seu extrato financeiro em tempo real e faça saques.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* BALANCE DISPLAY BOX CARD */}
        <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 md:col-span-1 flex flex-col justify-between relative overflow-hidden h-64">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-550/5 rounded-full blur-2xl" />
          
          <div className="space-y-1">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10 w-fit">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-[10px] uppercase font-mono tracking-wider font-bold text-slate-500 pt-3">
              Saldo Disponível para Saque
            </p>
            <p className="text-3xl font-black text-emerald-400 tracking-tight mt-1">
              R$ {loading ? '...' : (wallet?.saldo_atual || 0).toFixed(2)}
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-900 flex items-center justify-between text-[11px] text-slate-400">
            <span className="truncate">Chave Atribuída:</span>
            <span className="font-mono text-white truncate max-w-[120px] ml-1 font-bold" title={user.chave_pix}>
              {user.chave_pix ? user.chave_pix : 'Nenhuma Configurada'}
            </span>
          </div>
        </div>

        {/* WITHDRAWAL TRANSACTION FORM CARD */}
        <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 md:col-span-2 space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-white text-sm flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Solicitar Resgate de Ganhos (Saque)
            </h3>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Resgate seu saldo. O saque mínimo é de <strong>R$ 25,00</strong>. Chave Pix é requerida.
            </p>
          </div>

          <form onSubmit={handleWithdrawalRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                  Valor do Saque (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="25"
                    placeholder="25,00"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl pl-9 pr-4 py-3 border border-slate-805 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Shortcut actions to configuration if pix is empty */}
              <div className="flex flex-col justify-end">
                {!user.chave_pix ? (
                  <button
                    type="button"
                    onClick={() => onNavigate('configuracoes')}
                    className="w-full bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configurar Chave Pix Agora</span>
                  </button>
                ) : (
                  <div className="border border-slate-800 p-3 rounded-xl bg-slate-950/40 text-[10px] text-slate-400 flex flex-col justify-center leading-relaxed">
                    <span>Pix Registrado: <strong>{user.chave_pix}</strong></span>
                    <span className="text-slate-500 mt-0.5">Dinheiro enviado para esta chave em até 24h.</span>
                  </div>
                )}
              </div>
            </div>

            {wdSuccess && (
              <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-xl p-3.5 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{wdSuccess}</span>
              </div>
            )}

            {wdError && (
              <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3.5 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{wdError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={withdrawLoading || !withdrawAmount}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 px-4 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {withdrawLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Gerando solicitação de saque...</span>
                </>
              ) : (
                'Confirmar Solicitação de Saque'
              )}
            </button>
          </form>
        </div>

      </div>

      {/* DETAILED LEDGER/EXTRATO */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-900 pb-3">
          <History className="w-5 h-5 text-emerald-400" />
          Extrato Detalhado de Lançamentos
        </h2>

        {loading ? (
          <div className="text-center p-8 text-xs text-slate-400">
            Buscando histórico financeiro...
          </div>
        ) : transactions.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl text-center text-xs text-slate-500 italic font-mono">
            Nenhuma transação financeira registrada em sua carteira ainda.
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-900">
            {transactions.map((trx) => {
              const isPositive = trx.valor >= 0;
              
              return (
                <div key={trx.id} className="p-4.5 flex justify-between items-start gap-4 hover:bg-slate-900/20 transition-colors">
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
                      
                      <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">
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
                    <span className="text-[8px] font-mono text-slate-600 block mt-0.5 uppercase">ID: {trx.id}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
