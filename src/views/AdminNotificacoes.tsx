/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Mail, Plus, Edit2, Trash2, Calendar, LayoutTemplate, BellRing, RefreshCw } from 'lucide-react';
import { api } from '../api';
import { AdminMessage } from '../types';
import { ActionModal } from '../components/ui/ActionModal';

export default function AdminNotificacoes() {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [fb, setFb] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMsg, setEditingMsg] = useState<AdminMessage | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    titulo: '',
    mensagem: '',
    tipo: 'popup' as 'popup' | 'bell'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminMessages();
      setMessages(res.messages || []);
    } catch (e: any) {
      console.error(e);
      setFb('Erro ao carregar mensagens.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setEditingMsg(null);
    setFormData({ titulo: '', mensagem: '', tipo: 'popup' });
    setIsModalOpen(true);
    setFb('');
  };

  const openEdit = (msg: AdminMessage) => {
    setEditingMsg(msg);
    setFormData({ titulo: msg.titulo, mensagem: msg.mensagem, tipo: msg.tipo });
    setIsModalOpen(true);
    setFb('');
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await api.deleteAdminMessage(deleteId);
      setFb('Mensagem excluída com sucesso.');
      loadData();
    } catch (e) {
      setFb('Erro ao excluir mensagem.');
    } finally {
      setDeleteId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMsg) {
        await api.updateAdminMessage(editingMsg.id, { titulo: formData.titulo, mensagem: formData.mensagem });
        setFb('Mensagem atualizada success.');
      } else {
        await api.createAdminMessage(formData);
        setFb('Mensagem criada e enviada com sucesso!');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setFb(err.message || 'Erro ao processar requisição.');
    }
  };

  const popups = messages.filter(m => m.tipo === 'popup');
  const bells = messages.filter(m => m.tipo === 'bell');

  return (
    <div className="space-y-6 animate-fade-in text-slate-200 uppercase font-mono">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2 tracking-wider">
            <Mail className="w-6 h-6 text-emerald-400" />
            Central de Mensagens
          </h2>
          <p className="text-xs text-slate-400 mt-1">Envie comunicados pop-up ou notificações diretas para todos.</p>
        </div>
        <button
          onClick={openNew}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase"
        >
          <Plus className="w-4 h-4" /> Nova Mensagem
        </button>
      </div>

      {fb && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl text-xs font-bold tracking-wide">
          {fb}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center p-10 text-emerald-400">
          <RefreshCw className="w-8 h-8 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popups Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-widest">Pop-ups Flutuantes</h3>
                <p className="text-[10px] text-slate-400">Aparecem na tela inicial.</p>
              </div>
            </div>

            <div className="space-y-3">
              {popups.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">Sem mensagens de popup.</p>
              ) : (
                popups.map(m => (
                  <MessageCard key={m.id} msg={m} onEdit={() => openEdit(m)} onDelete={() => setDeleteId(m.id)} />
                ))
              )}
            </div>
          </div>

          {/* Bells Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-6 border-b border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <BellRing className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-widest">Sino de Notificação</h3>
                <p className="text-[10px] text-slate-400">Aviso silencioso no menu de alertas.</p>
              </div>
            </div>

            <div className="space-y-3">
              {bells.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-slate-800 rounded-xl">Sem notificações ativas.</p>
              ) : (
                bells.map(m => (
                  <MessageCard key={m.id} msg={m} onEdit={() => openEdit(m)} onDelete={() => setDeleteId(m.id)} />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
            <h3 className="text-base font-bold text-white mb-6 border-b border-slate-800 pb-4 tracking-wider">
              {editingMsg ? 'Editar Mensagem' : 'Nova Mensagem Global'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {!editingMsg && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 tracking-widest">Tipo de Entrega</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'popup'})}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${
                        formData.tipo === 'popup' 
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400' 
                          : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-white'
                      }`}
                    >
                      <LayoutTemplate className="w-5 h-5" />
                      Pop-Up Flutuante
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, tipo: 'bell'})}
                      className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-2 ${
                        formData.tipo === 'bell' 
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' 
                          : 'border-slate-800 bg-slate-950 text-slate-500 hover:text-white'
                      }`}
                    >
                      <BellRing className="w-5 h-5" />
                      Sino de Alertas
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest">Título da Mensagem</label>
                <input
                  required
                  type="text"
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  placeholder="EX: MANUTENÇÃO PROGRAMADA"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 tracking-widest">Conteúdo Principal</label>
                <textarea
                  required
                  value={formData.mensagem}
                  onChange={e => setFormData({...formData, mensagem: e.target.value})}
                  className="w-full h-32 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-[11px] text-white focus:border-emerald-500 focus:outline-none resize-none leading-relaxed"
                  placeholder="Escreva a instrução ou novidade..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl transition-colors text-xs tracking-wider"
                >
                  {editingMsg ? 'Salvar Edição' : 'Disparar Mensagem'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white font-bold py-2.5 rounded-xl transition-colors text-xs tracking-wider"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ActionModal
        isOpen={!!deleteId}
        title="Excluir Mensagem"
        message="Deseja excluir esta mensagem? Ela será apagada para todos os usuários."
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />

    </div>
  );
}

function MessageCard({ msg, onEdit, onDelete }: { msg: AdminMessage, onEdit: () => void, onDelete: () => void }) {
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 group relative overflow-hidden transition-all hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <h4 className="text-xs font-bold text-white tracking-wide">{msg.titulo}</h4>
        <div className="flex gap-1">
          <button onClick={onEdit} className="p-1.5 text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      <p className="text-[10px] text-slate-400 line-clamp-3 leading-relaxed normal-case font-sans">
        {msg.mensagem}
      </p>

      <div className="flex items-center gap-1.5 text-[8px] text-slate-500 font-bold tracking-widest mt-1">
        <Calendar className="w-3 h-3" />
        {new Date(msg.created_at).toLocaleString('pt-BR')}
      </div>
    </div>
  );
}
