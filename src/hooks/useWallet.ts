/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../api';
import { Wallet, WalletTransaction } from '../types';

export interface FinancialIndicators {
  saldoDisponivel: number;
  emProcessamento: number;
  disponivelParaSaque: number;
  previsaoRecebimentos: number;
}

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await api.getWalletInfo();
      setWallet(data.wallet);
      setTransactions(data.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet info:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  // Consolidate financial indicators deterministically
  const indicators = useMemo<FinancialIndicators>(() => {
    if (!wallet) {
      return {
        saldoDisponivel: 0,
        emProcessamento: 0,
        disponivelParaSaque: 0,
        previsaoRecebimentos: 0
      };
    }

    // Calcular "Em Processamento" baseado em saques pendentes (valores negativos no extrato que ainda não estão concluídos, 
    // ou se a API tivesse status. Como não tem status explícito na interface atual, usaremos um mock ou 
    // somaremos saques recentes).
    // Como a API atual não retorna status na transação de forma padronizada, vamos iterar as transações 
    // procurando strings como "pendente" na descrição para identificar saques em andamento.
    const emProcessamento = transactions
      .filter(t => t.valor < 0 && (t.descricao.toLowerCase().includes('pendente') || t.descricao.toLowerCase().includes('aguardando') || t.descricao.toLowerCase().includes('solicitação de saque')))
      .reduce((acc, t) => acc + Math.abs(t.valor), 0);

    // Previsão de recebimentos (Mock estático para MVP ou soma de grupos ativos)
    // Se a API for atualizada, este é o único local que mudará.
    const previsaoRecebimentos = 0; 

    return {
      saldoDisponivel: wallet.saldo_atual,
      emProcessamento,
      disponivelParaSaque: wallet.saldo_atual,
      previsaoRecebimentos
    };
  }, [wallet, transactions]);

  // Enrich transactions for Timeline View
  const enrichedTransactions = useMemo(() => {
    return transactions.map(t => {
      const isPositive = t.valor >= 0;
      
      // Determine origin/destination
      const origin = isPositive ? 'Sistema Ajudaae' : 'Chave PIX Externa';
      
      // Determine standardized status
      let status: 'Concluído' | 'Em Processamento' | 'Falhou' = 'Concluído';
      const descLower = t.descricao.toLowerCase();
      
      if (descLower.includes('pendente') || descLower.includes('agendado') || descLower.includes('aguardando') || descLower.includes('solicitação de saque')) {
        status = 'Em Processamento';
      } else if (descLower.includes('erro') || descLower.includes('falha') || descLower.includes('cancelado')) {
        status = 'Falhou';
      }

      // Format description cleanly (remove technical newlines)
      const cleanDesc = t.descricao.includes('\n') ? t.descricao.split('\n')[1] || t.descricao.split('\n')[0] : t.descricao;
      const title = t.descricao.includes('\n') ? t.descricao.split('\n')[0] : (isPositive ? 'Recebimento' : 'Saque');

      return {
        ...t,
        isPositive,
        origin,
        status,
        cleanDesc,
        title
      };
    });
  }, [transactions]);

  return {
    wallet,
    transactions: enrichedTransactions,
    indicators,
    loading,
    error,
    refresh: loadWallet
  };
}
