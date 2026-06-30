import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  AlertCircle,
  MapPin,
  Mail,
  Key,
  UserCheck
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

export default function AdminUsuarios({ user }: any) {
  const [loading, setLoading] = useState(true);
  const { executeAction: withFeedback } = useFeedback();

  const {
    items: users,
    setItems: setUsers,
    selectedIds,
    executeBatch,
    toggleSelection,
    toggleAll,
    isProcessing,
  } = useAdminQueue<any>(user);

  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminUsers();
      setUsers(res.users || []);
    } catch (err: any) {
      console.error('[AdminUsuarios Load Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSimulateResetBatch = () => {
    withFeedback(
      async () => {
        await executeBatch('reset_password', async (ids) => {
          // Mock sending email
          await new Promise(res => setTimeout(res, 500));
        });
      },
      `${selectedIds.size} e-mail(s) de redefinição enviados com sucesso.`,
      'Falha ao enviar redefinição.'
    );
  };

  const handleSaveEdit = async (u: any, form: any) => {
    withFeedback(
      async () => {
        await api.updateAdminUser({ id: u.id, ...form });
        await loadUsers();
      },
      'Cadastro atualizado com sucesso.',
      'Falha ao atualizar cadastro.'
    );
  };

  const renderItemSummary = (u: any) => (
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg border bg-indigo-500/10 border-indigo-500/20">
          <UserCheck className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <Typography variant="body" className="font-bold">{u.nome_completo || 'Sem Nome'}</Typography>
          <Typography variant="caption" color="secondary">{u.email}</Typography>
        </div>
      </div>
      <div className="text-right">
        <Typography variant="body" className="font-mono text-slate-300">
          {u.cpf}
        </Typography>
        <Typography variant="caption" color="secondary" className="uppercase tracking-wider text-[9px] font-bold">
          CPF
        </Typography>
      </div>
    </div>
  );

  const renderItemDetails = (u: any) => {
    return <UserDetailForm user={u} onSave={(form) => handleSaveEdit(u, form)} />;
  };

  return (
    <Section>
      <div className="mb-6 flex justify-between items-end">
        <div>
          <Typography variant="h2">Governança de Identidades</Typography>
          <Typography variant="body" color="secondary">
            Gestão centralizada de usuários e contas de acesso institucionais.
          </Typography>
        </div>
        <div className="w-64 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, email ou CPF..."
            className="pl-9"
          />
        </div>
      </div>

      <GlassSurface>
        <AdminQueue
          title="Fila de Identidades"
          description="Controle e operações em massa de usuários."
          items={users.filter(u => 
            u.nome_completo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.cpf?.includes(searchQuery)
          )}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelection}
          onToggleAll={toggleAll}
          isProcessing={isProcessing}
          renderItemSummary={renderItemSummary}
          renderItemDetails={renderItemDetails}
          emptyMessage="Nenhum usuário encontrado na plataforma."
          batchActions={
            selectedIds.size > 0 && (
              <Button variant="secondary" onClick={handleSimulateResetBatch} disabled={isProcessing}>
                Forçar Redefinição de Senha
              </Button>
            )
          }
        />
      </GlassSurface>
    </Section>
  );
}

// Sub-component to manage form state inside the drawer
function UserDetailForm({ user, onSave }: { user: any, onSave: (form: any) => void }) {
  const [form, setForm] = useState({
    nome_completo: user.nome_completo || '',
    cpf: user.cpf || '',
    cidade: user.cidade || '',
    estado: user.estado || '',
    telefone: user.telefone || '',
    email: user.email || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Nome Completo</label>
          <Input 
            value={form.nome_completo} 
            onChange={e => setForm({...form, nome_completo: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">CPF</label>
          <Input 
            value={form.cpf} 
            onChange={e => setForm({...form, cpf: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">E-mail</label>
          <Input 
            type="email"
            value={form.email} 
            onChange={e => setForm({...form, email: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Telefone</label>
          <Input 
            type="tel"
            value={form.telefone} 
            onChange={e => setForm({...form, telefone: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Cidade</label>
          <Input 
            value={form.cidade} 
            onChange={e => setForm({...form, cidade: e.target.value})} 
            required 
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 block">Estado</label>
          <Input 
            value={form.estado} 
            onChange={e => setForm({...form, estado: e.target.value})} 
            required 
          />
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t border-slate-800">
        <Button type="submit" variant="primary">
          Salvar Alterações
        </Button>
      </div>
    </form>
  );
}
