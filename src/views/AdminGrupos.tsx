/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Plus, 
  Trash2, 
  Edit, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck, 
  Search,
  X,
  Layers,
  Users,
  GripVertical
} from 'lucide-react';
import { api } from '../api';
import { Reorder } from 'motion/react';

export default function AdminGrupos() {
  const [adminGroups, setAdminGroups] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Forms state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [nomeGrupo, setNomeGrupo] = useState('');
  const [valorBase, setValorBase] = useState('');
  
  const [positions, setPositions] = useState([
    { id: 'pos1', val: '' },
    { id: 'pos2', val: '' },
    { id: 'pos3', val: '' },
    { id: 'pos4', val: '' }
  ]);

  const [fbSuccess, setFbSuccess] = useState('');
  const [fbError, setFbError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setFbError('');
      const grpsRes = await api.getAdminGroups();
      setAdminGroups(grpsRes.groups || []);
      
      const usrRes = await api.getAdminUsers();
      setUsers(usrRes.users || []);
    } catch (err: any) {
      console.error('[AdminGrupos Load Error]', err);
      setFbError(err.message || 'Erro de comunicação ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Controlar o scroll do body quando o modal abrir
  useEffect(() => {
    if (showForm || confirmDeleteId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showForm, confirmDeleteId]);

  const handleOpenCreate = () => {
    setShowForm(true);
    setEditingId(null);
    setNomeGrupo('');
    setValorBase('');
    setPositions([
      { id: 'pos1', val: '' },
      { id: 'pos2', val: '' },
      { id: 'pos3', val: '' },
      { id: 'pos4', val: '' }
    ]);
    setFbSuccess('');
    setFbError('');
  };

  const handleOpenEdit = (group: any) => {
    setShowForm(true);
    setEditingId(group.id);
    setNomeGrupo(group.nome_grupo);
    setValorBase(group.valor_base.toString());
    
    if (group.members) {
      setPositions([
        { id: 'pos1', val: group.members.find((m: any) => m.position === 1)?.user_id || '' },
        { id: 'pos2', val: group.members.find((m: any) => m.position === 2)?.user_id || '' },
        { id: 'pos3', val: group.members.find((m: any) => m.position === 3)?.user_id || '' },
        { id: 'pos4', val: group.members.find((m: any) => m.position === 4)?.user_id || '' }
      ]);
    } else {
      setPositions([
        { id: 'pos1', val: '' },
        { id: 'pos2', val: '' },
        { id: 'pos3', val: '' },
        { id: 'pos4', val: '' }
      ]);
    }

    setFbSuccess('');
    setFbError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFbSuccess('');
    setFbError('');

    if (!nomeGrupo || !valorBase) {
      setFbError('Nome do grupo e valor base são obrigatórios.');
      return;
    }

    const numBase = Number(valorBase);
    if (isNaN(numBase) || numBase <= 0) {
      setFbError('O valor base deve ser maior do que R$ 0,00.');
      return;
    }

    const pos1 = positions[0].val;
    const pos2 = positions[1].val;
    const pos3 = positions[2].val;
    const pos4 = positions[3].val;

    if (!pos1 || !pos2 || !pos3 || !pos4) {
      setFbError('Você deve preencher todos os 4 participantes obrigatórios.');
      return;
    }

    const uniqueSet = new Set([pos1, pos2, pos3, pos4]);
    if (uniqueSet.size < 4) {
      setFbError('Por favor selecione 4 usuários distintos (sem duplicidade).');
      return;
    }

    setSaving(true);
    try {
      const initial_members = [pos1, pos2, pos3, pos4];

      if (editingId) {
        await api.editAdminGroup(editingId, { nome_grupo: nomeGrupo, valor_base: numBase, initial_members });
        setFbSuccess('Grupo original editado com sucesso!');
      } else {
        const payload: any = { nome_grupo: nomeGrupo, valor_base: numBase, initial_members };
        await api.createAdminGroup(payload);
        setFbSuccess('Novo grupo disponível criado com sucesso!');
      }

      setShowForm(false);
      await loadData();
    } catch (err: any) {
      setFbError(err.message || 'Erro ao persistir grupo no banco.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (groupId: string) => {
    setConfirmDeleteId(groupId);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    setFbSuccess('');
    setFbError('');
    try {
      await api.deleteAdminGroup(confirmDeleteId);
      setFbSuccess('Grupo disponível original excluído do banco.');
      await loadData();
    } catch (err: any) {
      setFbError(err.message || 'Falha ao remover grupo.');
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDeleteId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header Controls */}
      <div className="border-b border-slate-900 pb-3 flex justify-between items-center bg-rose-500/5 -mx-4 px-4 py-3 border-y border-rose-500/10 rounded-xl">
        <div>
          <h1 className="text-lg font-bold text-white leading-none">Gerenciar Grupos Originais</h1>
          <p className="text-[10px] text-rose-455 text-rose-400 mt-1 uppercase font-mono">Modelos de captação (Coluna A)</p>
        </div>
        
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-rose-500 hover:bg-rose-405 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs transition-colors cursor-pointer shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Grupo</span>
          </button>
        )}
      </div>

      {fbSuccess && (
        <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <ShieldCheck className="w-5 h-5 text-emerald-300 flex-shrink-0" />
          <span>{fbSuccess}</span>
        </div>
      )}

      {fbError && (
        <div className="bg-red-950/20 text-red-550 text-red-400 border border-red-500/20 rounded-2xl p-4 text-xs flex items-center gap-2 max-w-2xl mx-auto">
          <AlertCircle className="w-5 h-5 text-red-450 flex-shrink-0" />
          <span>{fbError}</span>
        </div>
      )}

      {/* CREATE / EDIT BOX ACCORDION FORM */}
      {showForm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in sm:p-6">
          <div className="flex flex-col w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header Fixo */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 shrink-0 bg-slate-900 z-10">
              <h3 className="text-sm font-bold text-white">
                {editingId ? 'Editar Detalhes do Grupo' : 'Registrar Novo Grupo Original'}
              </h3>
              <button 
                onClick={() => setShowForm(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 focus:outline-none transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Scrollável */}
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              <div className="space-y-5 font-sans">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Nome do Grupo
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Grupo de Teste de R$ 5"
                      value={nomeGrupo}
                      onChange={(e) => setNomeGrupo(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Valor Base (1/5 da Ativ)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="5.00"
                      value={valorBase}
                      onChange={(e) => setValorBase(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-sm focus:outline-none focus:border-rose-500 transition-colors"
                    />
                    {valorBase && (
                      <p className="text-[9px] text-emerald-400 font-mono italic">
                        Ativação: R$ {(Number(valorBase) * 5).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                {/* INITIAL 4 PARTICIPANTS CONFIGURATION (Mandatory) */}
                <div className="bg-slate-950/50 p-4 border border-slate-800/80 rounded-xl space-y-3">
                  <div>
                    <h4 className="text-[11px] font-bold text-white uppercase tracking-wider font-mono">Participantes Iniciais</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Selecione os 4 usuários participantes obrigatórios para este grupo.</p>
                  </div>

                  <Reorder.Group axis="y" values={positions} onReorder={setPositions} className="grid grid-cols-1 gap-2 pt-1">
                    {positions.map((pos, index) => {
                      const checks = positions.filter((p, i) => i !== index).map(p => p.val);
                      const labels = ['1º', '2º', '3º', '4º'];
                      
                      return (
                      <Reorder.Item 
                        key={pos.id}
                        value={pos}
                        className="flex items-center gap-3 p-2 rounded-lg transition-colors border border-transparent hover:bg-slate-900/80 hover:border-slate-800 bg-slate-900/40"
                      >
                        <div className="flex items-center gap-2 cursor-grab active:cursor-grabbing w-16 shrink-0">
                          <GripVertical className="w-3.5 h-3.5 text-slate-600" />
                          <label className="text-[10px] font-mono font-semibold uppercase text-slate-400">{labels[index]}</label>
                        </div>
                        <select 
                          value={pos.val} 
                          onChange={(e) => {
                            const newPositions = [...positions];
                            newPositions[index] = { ...pos, val: e.target.value };
                            setPositions(newPositions);
                          }}
                          className="flex-1 bg-slate-950 text-xs text-white border border-slate-800 rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500 cursor-pointer transition-colors"
                        >
                          <option value="">Selecione...</option>
                          {users
                            .filter(u => u.id === pos.val || !checks.includes(u.id))
                            .map(u => <option key={u.id} value={u.id}>{u.nome_completo} ({u.email})</option>)
                          }
                        </select>
                      </Reorder.Item>
                    )})}
                  </Reorder.Group>
                </div>
              </div>
            </div>

            {/* Footer Fixo */}
            <div className="px-6 py-4 border-t border-slate-800 shrink-0 bg-slate-900 z-10 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Salvando...</span>
                  </>
                ) : (
                  'Salvar Grupo'
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* DETAILED GRYPS LISTING CARD GRID */}
      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400">
          Pesquisando grupos configurados no banco...
        </div>
      ) : adminGroups.length === 0 ? (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-805 flex items-center justify-center text-slate-500 mb-2">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-white text-sm">Nenhum grupo original cadastrado</h3>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
            Por favor, utilize o botão <strong>Criar Grupo</strong> superior direito para iniciar grupos originais para participantes!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminGroups.map((group) => (
            <div 
              key={group.id} 
              className="bg-slate-900 border border-slate-900 rounded-3xl p-5.5 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono text-slate-500">ID: {group.id}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(group)}
                      className="p-1.5 hover:bg-slate-850 text-slate-400 hover:text-white rounded border border-transparent hover:border-slate-800 cursor-pointer"
                      title="Editar Grupo"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => confirmDelete(group.id)}
                      className="p-1.5 hover:bg-red-950/20 text-red-500 rounded border border-transparent hover:border-red-500/10 cursor-pointer"
                      title="Excluir Grupo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-base leading-tight">{group.nome_grupo}</h3>
                  <div className="flex justify-between items-center text-[11px] bg-slate-950 p-2.5 rounded-xl border border-slate-950 font-mono mt-2">
                    <span className="text-slate-500">Valor Base:</span>
                    <span className="font-semibold text-slate-300">R$ {group.valor_base.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] bg-slate-955 bg-slate-950 p-2.5 rounded-xl border border-slate-950 font-mono">
                    <span className="text-slate-500">Valor Ativação:</span>
                    <span className="font-bold text-rose-450 text-rose-400">R$ {group.valor_ativacao.toFixed(2)}</span>
                  </div>
                </div>

                {/* Assigned Participants listing */}
                <div className="space-y-2 pt-2 border-t border-slate-800/60">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center gap-1">
                    <Users className="w-3 h-3 text-rose-400" />
                    Participantes na fila (Atendendo faturamentos):
                  </span>
                  <div className="space-y-1">
                    {group.members && group.members.length > 0 ? (
                      group.members.map((m: any) => (
                        <div key={m.id} className="flex justify-between items-center bg-slate-950/40 px-2.5 py-1.5 rounded-lg text-[10px] text-slate-400 border border-slate-950">
                          <span className="truncate max-w-[120px] font-medium">{m.nome_completo}</span>
                          <span className="font-mono text-[9px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 rounded uppercase">
                            {m.position}º
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-500 italic">Sem participantes vinculados.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {confirmDeleteId && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-6 shadow-2xl">
            <h3 className="font-bold text-white text-lg">Excluir Grupo?</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-sans">
              Tem certeza que deseja excluir este grupo disponível permanentemente? Os participantes vinculados a este modelo serão removidos.
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
