/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Search, 
  Edit, 
  Key, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  X,
  UserCheck,
  Mail,
  MapPin,
  ShieldCheck,
  Percent,
  TrendingUp,
  Link2,
  Layers
} from 'lucide-react';
import { api } from '../api';

export default function AdminUsuarios() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Editing state
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.getAdminUsers();
      setUsers(res.users || []);
    } catch (err: any) {
      console.error('[AdminUsuarios Load Error]', err);
      setError(err.message || 'Erro de comunicação ao carregar participantes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenEdit = (u: any) => {
    setEditingUser(u);
    setNome(u.nome_completo);
    setCpf(u.cpf);
    setCidade(u.cidade);
    setEstado(u.estado);
    setTelefone(u.telefone);
    setEmail(u.email);
    setShowEditForm(true);
    setSuccess('');
    setError('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');

    if (!nome || !cpf || !cidade || !estado || !telefone || !email) {
      setError('Todos os campos cadastrais são obrigatórios para salvamento.');
      return;
    }

    setSaving(true);
    try {
      await api.updateAdminUser({
        id: editingUser.id,
        nome_completo: nome,
        cpf,
        cidade,
        estado,
        telefone,
        email
      });
      setSuccess('Cadastro do usuário atualizado com sucesso!');
      setShowEditForm(false);
      await loadUsers();
    } catch (err: any) {
      setError(err.message || 'Código duplicado ou outro erro de banco.');
    } finally {
      setSaving(false);
    }
  };

  const [viewingGroupsFor, setViewingGroupsFor] = useState<any | null>(null);

  const handleSimulateResetPassword = (emailParam: string) => {
    setSuccess(`E-mail de redefinição de senha enviado com sucesso de forma simulada via Supabase para: ${emailParam}`);
    setShowEditForm(false);
  };

  const filteredUsers = users.filter(u => 
    u.nome_completo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.cpf.includes(searchQuery)
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header controls search user */}
      <div className="border-b border-slate-900 pb-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-rose-500/5 -mx-4 px-4 py-3 border-y border-rose-500/10 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white leading-none">Cadastros de Participantes</h1>
          <p className="text-[10px] text-rose-455 text-rose-400 mt-1 uppercase font-mono">Modificações cadastrais de usuários e convites</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Procurar nome ou CPF..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-xs text-white rounded-xl pl-9 pr-3 py-2 border border-slate-805 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-950/20 text-red-550 text-red-400 border border-red-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-450 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* USER EDIT FORM MODAL */}
      {showEditForm && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full mx-auto space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="font-bold text-white text-xs uppercase tracking-wider font-mono">Editar Cadastro do Usuário</h3>
              <button 
                onClick={() => setShowEditForm(false)} 
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase text-slate-450 font-mono">Nome Completo</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-805 text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-450 font-mono">CPF</label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-805 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-450 font-mono">Cidade</label>
              <input
                type="text"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-805 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-450 font-mono">Estado (UF)</label>
              <input
                type="text"
                maxLength={2}
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-805 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-450 font-mono">Telefone</label>
              <input
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-805 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold uppercase text-slate-450 font-mono">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-955 bg-slate-950 text-white rounded-xl px-3.5 py-2 border border-slate-805 text-xs focus:outline-none"
              />
            </div>

            <div className="col-span-1 sm:col-span-2 pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-rose-600 hover:bg-rose-550 text-white py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Salvar Alterações'}
              </button>
              <button
                type="button"
                onClick={() => handleSimulateResetPassword(email)}
                className="flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 px-4 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700/50 cursor-pointer"
              >
                <Key className="w-4 h-4 text-rose-400" />
                Redefinir Senha
              </button>
            </div>
          </form>
          </div>
        </div>
      )}

      {/* DETAILED USERS DATAGRID LISTING */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Carregando banco de participantes...
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-850 p-12 rounded-3xl text-center text-xs text-slate-500 italic">
          Nenhum participante encontrado correspondente à pesquisa.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-900 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
          {filteredUsers.map((u) => {
            const isAdmin = u.is_admin;
            return (
              <div 
                key={u.id} 
                className="p-5 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 hover:bg-slate-900/40 transition-colors"
              >
                <div className="flex items-center gap-4 w-full xl:w-auto">
                  <div className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hidden md:block">
                    {isAdmin ? <UserCheck className="w-5 h-5 text-emerald-400" /> : <Users className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm truncate flex items-center gap-2">
                      {u.nome_completo}
                      <button
                        onClick={() => handleOpenEdit(u)}
                        className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors"
                        title="Editar Usuário"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                    </p>
                    <p className="text-[10px] text-slate-500 truncate font-mono mt-0.5">{u.email} • ID: {u.id}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                      <MapPin className="w-3 h-3 text-slate-600" />
                      <span>{u.cidade} - {u.estado} • {u.cpf}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col xl:flex-row xl:items-center gap-4 xl:gap-6 mt-4 xl:mt-0 w-full xl:w-auto xl:flex-shrink-0">
                  
                  <div className="flex items-center gap-5 w-full xl:w-auto justify-between xl:justify-end border-t border-slate-800 xl:border-0 pt-4 xl:pt-0">
                    <div className="text-left xl:text-right">
                      <p className="text-[10px] font-mono text-slate-500">Saldo Digital</p>
                      <p className="text-xs font-bold text-emerald-400">R$ {u.saldo.toFixed(2)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-[10px] font-mono text-slate-500">Grupos / Ativações</p>
                      <p className="text-xs font-bold text-white font-mono">{u.active_groups_count} / {u.activated_invites_sum}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setViewingGroupsFor(u)}
                    className="w-full xl:w-auto py-2.5 px-4 bg-indigo-500/10 hover:bg-indigo-600 text-indigo-400 hover:text-white rounded-lg text-[11px] font-semibold flex-shrink-0 transition-all border border-indigo-500/10 cursor-pointer text-center whitespace-nowrap"
                  >
                    Ver Grupos Ativos
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVE GROUPS MODAL */}
      {viewingGroupsFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Grupos Ativos do Usuário
                </h2>
                <p className="text-xs font-mono text-slate-500 mt-1">{viewingGroupsFor.nome_completo} ({viewingGroupsFor.email})</p>
              </div>
              <button 
                onClick={() => setViewingGroupsFor(null)} 
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 relative">
              {viewingGroupsFor.detailed_active_groups && viewingGroupsFor.detailed_active_groups.length > 0 ? (
                <div className="space-y-4">
                  {viewingGroupsFor.detailed_active_groups.map((group: any) => {
                    const remainingInvites = group.max_uses - group.used_count;
                    return (
                      <div key={group.id} className="bg-slate-950/50 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <p className="font-bold text-sm text-white">{group.nome_grupo}</p>
                          <p className="text-[10px] text-slate-500 font-mono mt-1">ID: {group.id}</p>
                          {group.invite_code ? (
                            <p className="text-[10px] text-indigo-400 font-mono mt-0.5">Convite: {group.invite_code}</p>
                          ) : (
                            <p className="text-[10px] text-rose-400 font-mono mt-0.5">Sem código de convite</p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-mono">Convites Restantes</p>
                            <p className="text-sm font-bold text-white font-mono">
                              {remainingInvites} <span className="text-slate-500 text-xs font-normal">/ {group.max_uses}</span>
                            </p>
                          </div>
                          {/* Removed Edit button for max uses as form is missing */}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-2xl text-center text-xs text-slate-500 italic">
                  Este usuário não possui grupos ativos no momento.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
