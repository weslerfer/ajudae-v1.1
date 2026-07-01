import React, { useEffect, useState } from 'react';
import { 
  Wallet,
  Coins,
  History,
  ArrowUpRight,
  ArrowDownRight,
  Search
} from 'lucide-react';
import { api } from '../api';
import { AdminQueue } from '../components/admin/AdminQueue';
import { useAdminQueue } from '../hooks/useAdminQueue';
import { Section } from '../components/ui/Section';
import { GlassSurface } from '../components/ui/GlassSurface';
import { Typography } from '../components/ui/Typography';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useFeedback } from '../providers/FeedbackProvider';

const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export default function AdminCarteiras({ user }: any) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { executeAction: withFeedback } = useFeedback();

  const {
    items: wallets,
    setItems: setWallets,
    selectedIds,
    executeBatch,
    toggleSelection,
    toggleAll,
    isProcessing,
  } = useAdminQueue<any>(user);

  const [searchQuery, setSearchQuery] = useState('');

  const loadWallets = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminWallets();
      const mappedWallets = (res.wallets || []).map((w: any) => ({ 
        ...w, 
        id: w.user_id,
        user: { nome_completo: w.nome_completo, email: w.email },
        saldo: Number(w.saldo_atual || 0)
      }));
      setWallets(mappedWallets);
      setTransactions(res.transactions || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const handleResetBatch = () => {
    withFeedback(
      async () => {
        await executeBatch('reset_wallet', async (ids) => {
          await Promise.all(ids.map(async (id) => {
            const wallet = wallets.find(w => w.user_id === id);
            if (wallet && wallet.saldo > 0) {
              await api.adjustWalletBalance(id, -wallet.saldo, 'Zeramento administrativo de saldo');
            }
          }));
        });
        await loadWallets();
      },
      `${selectedIds.size} carteira(s) zerada(s) com sucesso.`,
      'Falha ao zerar carteiras.'
    );
  };

  const renderItemSummary = (w: any) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg border bg-amber-500/10 border-amber-500/20">
          <Wallet className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <Typography variant="body" className="font-bold">{w.user?.nome_completo || 'Usuário Desconhecido'}</Typography>
          <Typography variant="caption" color="secondary">{w.user?.email || 'N/A'}</Typography>
        </div>
      </div>
      <div className="text-right">
        <Typography variant="body" className="font-mono text-emerald-400 font-bold">
          {formatCurrency(w.saldo)}
        </Typography>
        <Typography variant="caption" color="secondary" className="uppercase tracking-wider text-[9px] font-bold">
          Saldo Atual
        </Typography>
      </div>
    </div>
  );

  const renderItemDetails = (w: any) => {
    const userTxs = transactions.filter(t => t.user_id === w.user_id);
    return <WalletDetailForm wallet={w} transactions={userTxs} onSaved={loadWallets} />;
  };

  return (
    <Section>
      <div className="mb-6 flex justify-between items-end gap-4">
        <div>
          <Typography variant="h2">Carteiras Virtuais</Typography>
          <Typography variant="body" color="secondary">
            Monitoramento de saldos, lançamentos manuais e extrato detalhado.
          </Typography>
        </div>
        <div className="w-64 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar carteira..."
            className="pl-9"
          />
        </div>
      </div>

      <GlassSurface>
        <AdminQueue
          title="Fila de Carteiras"
          description="Operações em massa e extrato das carteiras"
          items={wallets.filter(w => (w.user?.nome_completo || '').toLowerCase().includes(searchQuery.toLowerCase()))}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onToggleAll={toggleAll}
          isProcessing={isProcessing}
          renderItemSummary={renderItemSummary}
          renderItemDetails={renderItemDetails}
          emptyMessage="Nenhuma carteira virtual ativa."
          batchActions={
            selectedIds.size > 0 && (
              <Button variant="danger" onClick={handleResetBatch} disabled={isProcessing}>
                Zerar Saldo
              </Button>
            )
          }
        />
      </GlassSurface>
    </Section>
  );
}

function WalletDetailForm({ wallet, transactions, onSaved }: { wallet: any, transactions: any[], onSaved: () => void }) {
  const [form, setForm] = useState({ amount: '', description: '' });
  const [actionType, setActionType] = useState<'adicao' | 'subtracao' | null>(null);
  const { executeAction: withFeedback } = useFeedback();

  const handleAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(form.amount);
    if (!actionType || isNaN(val) || val <= 0) return;

    withFeedback(
      async () => {
        const finalAmount = actionType === 'adicao' ? val : -val;
        await api.adjustWalletBalance(wallet.user_id, finalAmount, form.description.trim() || 'Ajuste administrativo');
        onSaved();
        setForm({ amount: '', description: '' });
        setActionType(null);
      },
      'Lançamento financeiro registrado com sucesso.',
      'Falha ao reajustar saldo.'
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Ajuste Manual */}
      <div>
        <Typography variant="caption" className="uppercase font-bold tracking-wider text-slate-500 mb-4 block">Ajuste Manual</Typography>
        <div className="flex gap-2 mb-4">
          <Button 
            variant={actionType === 'adicao' ? 'primary' : 'secondary'} 
            className="flex-1"
            onClick={() => { setActionType('adicao'); setForm({...form, description: 'Crédito administrativo adicionado'}) }}
          >
            <ArrowUpRight className="w-4 h-4 mr-2" />
            Adicionar
          </Button>
          <Button 
            variant={actionType === 'subtracao' ? 'danger' : 'secondary'} 
            className="flex-1"
            onClick={() => { setActionType('subtracao'); setForm({...form, description: 'Débito administrativo retirado'}) }}
          >
            <ArrowDownRight className="w-4 h-4 mr-2" />
            Subtrair
          </Button>
        </div>

        {actionType && (
          <form onSubmit={handleAdjust} className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Valor (R$)</label>
              <Input 
                type="number"
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                required 
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Motivo do Lançamento</label>
              <Input 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                required 
              />
            </div>
            <div className="pt-2">
              <Button type="submit" variant={actionType === 'adicao' ? 'primary' : 'danger'} className="w-full">
                Confirmar Operação
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Extrato */}
      <div>
        <Typography variant="caption" className="uppercase font-bold tracking-wider text-slate-500 mb-4 block">Histórico de Transações</Typography>
        <div className="bg-slate-950 p-4 rounded-xl border border-white/5 max-h-64 overflow-y-auto space-y-3">
          {transactions.length === 0 ? (
            <Typography variant="caption" color="secondary" className="text-center block py-4">Nenhuma transação registrada.</Typography>
          ) : (
            transactions.map(t => (
              <div key={t.id} className="flex justify-between items-center text-xs border-b border-slate-800/50 pb-2 last:border-0 last:pb-0">
                <div>
                  <Typography variant="caption" className="text-white block">{t.descricao}</Typography>
                  <Typography variant="caption" color="secondary" className="text-[9px]">{new Date(t.created_at).toLocaleString('pt-BR')}</Typography>
                </div>
                <Typography variant="caption" className={`font-mono font-bold ${t.valor >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {t.valor >= 0 ? '+' : ''}{formatCurrency(t.valor)}
                </Typography>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
