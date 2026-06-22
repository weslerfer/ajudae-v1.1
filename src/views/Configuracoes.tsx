/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Key, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  User,
  X
} from 'lucide-react';
import { api } from '../api';
import { UserProfile } from '../types';

interface ConfiguracoesProps {
  user: UserProfile;
  onUserUpdate: (updatedUser: UserProfile) => void;
}

export default function Configuracoes({ user, onUserUpdate }: ConfiguracoesProps) {
  // Profile state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [editNome, setEditNome] = useState(user.nome_completo || '');
  const [editCpf, setEditCpf] = useState(user.cpf || '');
  const [editCidade, setEditCidade] = useState(user.cidade || '');
  const [editEstado, setEditEstado] = useState(user.estado || '');
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editTelefone, setEditTelefone] = useState(user.telefone || '');
  
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Pix state
  const [chavePix, setChavePix] = useState(user.chave_pix || '');
  const [bancoPix, setBancoPix] = useState(user.banco_pix || '');
  const [pixSuccess, setPixSuccess] = useState('');
  const [pixError, setPixError] = useState('');
  const [pixLoading, setPixLoading] = useState(false);

  // Password state
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setProfileLoading(true);

    try {
      const res = await api.updateProfile({
        nome_completo: editNome,
        cidade: editCidade,
        estado: editEstado,
        email: editEmail,
        telefone: editTelefone
      });
      
      if (res.success && res.user) {
        onUserUpdate(res.user);
        setProfileSuccess('Perfil atualizado com sucesso!');
        setTimeout(() => {
          setShowProfileModal(false);
          setProfileSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setProfileError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSavePix = async (e: React.FormEvent) => {
    e.preventDefault();
    setPixSuccess('');
    setPixError('');
    if (!chavePix.trim()) {
      setPixError('Por favor, informe uma chave Pix válida.');
      return;
    }

    setPixLoading(true);
    try {
      const res = await api.updatePix(chavePix, bancoPix);
      if (res.success && res.user) {
        onUserUpdate(res.user);
        setPixSuccess('Chave Pix atualizada com sucesso!');
      }
    } catch (err: any) {
      setPixError(err.message || 'Erro ao salvar chave Pix.');
    } finally {
      setPixLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSuccess('');
    setPassError('');

    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      setPassError('Preencha todos os campos para alteração de senha.');
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setPassError('A confirmação não coincide com a nova senha.');
      return;
    }

    setPassLoading(true);
    try {
      const res = await api.updatePassword({ senha_atual: senhaAtual, nova_senha: novaSenha });
      if (res.success) {
        setPassSuccess('Sua senha foi alterada com sucesso!');
        setSenhaAtual('');
        setNovaSenha('');
        setConfirmarSenha('');
      }
    } catch (err: any) {
      setPassError(err.message || 'Falha ao trocar senha. Verifique sua senha atual.');
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Configurações de Conta</h1>
          <p className="text-xs text-slate-400 mt-1">
            Defina suas credenciais Pix e faça a manutenção de segurança da sua conta.
          </p>
        </div>
        <button
          onClick={() => setShowProfileModal(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          Editar Perfil
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* PIX KEY FORM CARD */}
        <div className="bg-slate-900 border border-slate-900 rounded-2xl p-6.5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400 border border-emerald-500/10">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Chave Pix de Saque</h3>
              <p className="text-[10px] text-slate-500">Onde você receberá as transferências solicitadas</p>
            </div>
          </div>

          <form onSubmit={handleSavePix} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Banco da Chave Pix
              </label>
              <input
                type="text"
                placeholder="Ex: Nubank, Inter, Caixa..."
                value={bancoPix}
                onChange={(e) => setBancoPix(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Chave Pix (CPF, Celular, E-mail ou Chave Aleatória)
              </label>
              <input
                type="text"
                placeholder="Insira sua chave Pix aqui..."
                value={chavePix}
                onChange={(e) => setChavePix(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-4 py-3 border border-slate-800 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="pt-2">
              <p className="text-[10px] text-slate-500 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                <span className="font-bold text-emerald-400 block mb-1">Dica de Segurança:</span>
                Por segurança, a chave Pix cadastrada para saques deve estar vinculada ao CPF informado no momento do cadastro.
              </p>
            </div>

            {pixSuccess && (
              <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{pixSuccess}</span>
              </div>
            )}

            {pixError && (
              <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{pixError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={pixLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {pixLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                'Salvar Chave Pix'
              )}
            </button>
          </form>
        </div>

        {/* CHANGE PASSWORD FORM CARD */}
        <div className="bg-slate-900 border border-slate-900 rounded-2xl p-6.5 space-y-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/10">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Segurança de Acesso</h3>
              <p className="text-[10px] text-slate-500">Altere sua senha de acesso ao sistema</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Senha Atual
              </label>
              <input
                type="password"
                placeholder="Sua senha atual..."
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Nova Senha
              </label>
              <input
                type="password"
                placeholder="Crie uma nova senha..."
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                Confirmar Nova Senha
              </label>
              <input
                type="password"
                placeholder="Repita a nova senha..."
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {passSuccess && (
              <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            {passError && (
              <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={passLoading}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {passLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Atualizando...</span>
                </>
              ) : (
                'Atualizar Senha'
              )}
            </button>
          </form>
        </div>

      </div>

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <h3 className="font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Editar Perfil
              </h3>
              <button 
                onClick={() => setShowProfileModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto custom-scrollbar">
              <form id="profileForm" onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={editNome}
                    onChange={e => setEditNome(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5 opacity-60">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                    CPF
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={user.cpf || ''}
                    className="w-full bg-slate-950/50 text-slate-400 rounded-xl px-4 py-2.5 border border-slate-800 text-xs cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Cidade</label>
                    <input
                      type="text"
                      required
                      value={editCidade}
                      onChange={e => setEditCidade(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Estado</label>
                    <input
                      type="text"
                      required
                      value={editEstado}
                      onChange={e => setEditEstado(e.target.value)}
                      className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Email</label>
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Telefone (WhatsApp)</label>
                  <input
                    type="text"
                    required
                    value={editTelefone}
                    onChange={e => setEditTelefone(e.target.value)}
                    className="w-full bg-slate-950 text-white rounded-xl px-4 py-2.5 border border-slate-800 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {profileSuccess && (
                  <div className="bg-emerald-950/20 text-emerald-400 border border-emerald-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div className="bg-red-950/20 text-red-400 border border-red-500/20 rounded-xl p-3 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{profileError}</span>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                form="profileForm"
                type="submit"
                disabled={profileLoading}
                className="px-6 py-2 rounded-xl text-xs font-semibold text-slate-900 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {profileLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
