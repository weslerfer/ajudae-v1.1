import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Layers,
  Plus,
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

export default function AdminGrupos({ user }: any) {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { executeAction: withFeedback } = useFeedback();

  const {
    items: groups,
    setItems: setGroups,
    selectedIds,
    executeBatch,
    toggleSelection,
    toggleAll,
    isProcessing,
  } = useAdminQueue<any>(user);

  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const grpsRes = await api.getAdminGroups();
      setGroups(grpsRes.groups || []);
      const usrRes = await api.getAdminUsers();
      setUsers(usrRes.users || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteBatch = () => {
    withFeedback(
      async () => {
        await executeBatch('delete_group', async (ids) => {
          await Promise.all(ids.map(id => api.deleteAdminGroup(id)));
        });
        await loadData();
      },
      `${selectedIds.size} grupo(s) removido(s) com sucesso.`,
      'Falha ao remover grupos.'
    );
  };

  const renderItemSummary = (g: any) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg border bg-rose-500/10 border-rose-500/20">
          <Layers className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <Typography variant="body" className="font-bold">{g.nome_grupo}</Typography>
          <Typography variant="caption" color="secondary">
            {g.members?.length || 0} Membros • Base: {formatCurrency(g.valor_base)}
          </Typography>
        </div>
      </div>
      <div className="text-right">
        <Typography variant="body" className="font-mono text-slate-300">
          {formatCurrency(g.valor_base * 10)}
        </Typography>
        <Typography variant="caption" color="secondary" className="uppercase tracking-wider text-[9px] font-bold">
          Retorno Total Previsto
        </Typography>
      </div>
    </div>
  );

  const renderItemDetails = (g: any) => {
    return <GroupDetailForm group={g} users={users} onSaved={loadData} />;
  };

  return (
    <Section>
      <div className="mb-6 flex justify-between items-end gap-4">
        <div>
          <Typography variant="h2">Células (Grupos)</Typography>
          <Typography variant="body" color="secondary">
            Administração das células de ajuda mútua ativas no sistema.
          </Typography>
        </div>
        <div className="flex gap-2">
          <div className="w-64 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar grupo..."
              className="pl-9"
            />
          </div>
          {!showCreateForm && (
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Célula
            </Button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <GlassSurface className="mb-6 border-emerald-500/20 bg-emerald-500/5">
          <Typography variant="h3" className="mb-4">Criar Novo Grupo</Typography>
          <GroupDetailForm users={users} onSaved={() => { setShowCreateForm(false); loadData(); }} onCancel={() => setShowCreateForm(false)} />
        </GlassSurface>
      )}

      <GlassSurface>
        <AdminQueue
          title="Fila de Grupos"
          description="Operações em massa para grupos"
          items={groups.filter(g => g.nome_grupo?.toLowerCase().includes(searchQuery.toLowerCase()))}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onToggleAll={toggleAll}
          isProcessing={isProcessing}
          renderItemSummary={renderItemSummary}
          renderItemDetails={renderItemDetails}
          emptyMessage="Nenhuma célula configurada na plataforma."
          batchActions={
            selectedIds.size > 0 && (
              <Button variant="danger" onClick={handleDeleteBatch} disabled={isProcessing}>
                Remover Selecionados
              </Button>
            )
          }
        />
      </GlassSurface>
    </Section>
  );
}

function GroupDetailForm({ group, users, onSaved, onCancel }: { group?: any, users: any[], onSaved: () => void, onCancel?: () => void }) {
  const [form, setForm] = useState({
    nome_grupo: group?.nome_grupo || '',
    valor_base: group?.valor_base || '',
    pos1: group?.members?.find((m: any) => m.position === 1)?.user_id || '',
    pos2: group?.members?.find((m: any) => m.position === 2)?.user_id || '',
    pos3: group?.members?.find((m: any) => m.position === 3)?.user_id || '',
    pos4: group?.members?.find((m: any) => m.position === 4)?.user_id || '',
  });

  const { executeAction: withFeedback } = useFeedback();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numBase = Number(form.valor_base);
    const { pos1, pos2, pos3, pos4 } = form;
    const initial_members = [pos1, pos2, pos3, pos4];

    withFeedback(
      async () => {
        if (group) {
          await api.editAdminGroup(group.id, { nome_grupo: form.nome_grupo, valor_base: numBase, initial_members });
        } else {
          await api.createAdminGroup({ nome_grupo: form.nome_grupo, valor_base: numBase, initial_members });
        }
        onSaved();
      },
      group ? 'Grupo editado com sucesso.' : 'Novo grupo criado com sucesso.',
      'Falha ao salvar grupo. Verifique se os 4 usuários são únicos.'
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Nome da Célula</label>
          <Input 
            value={form.nome_grupo} 
            onChange={e => setForm({...form, nome_grupo: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Valor Base (R$)</label>
          <Input 
            type="number"
            value={form.valor_base} 
            onChange={e => setForm({...form, valor_base: e.target.value})} 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(pos => {
          const key = `pos${pos}` as keyof typeof form;
          return (
            <div key={pos}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Membro Posição {pos}</label>
              <select 
                value={form[key]} 
                onChange={e => setForm({...form, [key]: e.target.value})} 
                required
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-800 text-sm focus:outline-none focus:border-rose-500"
              >
                <option value="">-- Selecione o usuário --</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.nome_completo} ({u.cpf})</option>
                ))}
              </select>
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>Cancelar</Button>
        )}
        <Button type="submit" variant="primary">
          {group ? 'Salvar Célula' : 'Criar Célula'}
        </Button>
      </div>
    </form>
  );
}
