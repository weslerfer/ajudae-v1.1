import React from 'react';
import { Mail, Lock, User, RefreshCw, Fingerprint } from 'lucide-react';

interface AuthFormsProps {
  isRegistering: boolean;
  loginEmail: string;
         setLoginEmail: (val: string) => void;
  loginPassword: string;
         setLoginPassword: (val: string) => void;
  regNome: string;
         setRegNome: (val: string) => void;
  regCpf: string;
         setRegCpf: (val: string) => void;
  regCidade: string;
         setRegCidade: (val: string) => void;
  regEstado: string;
         setRegEstado: (val: string) => void;
  regTelefone: string;
         setRegTelefone: (val: string) => void;
  regEmail: string;
         setRegEmail: (val: string) => void;
  regPassword: string;
         setRegPassword: (val: string) => void;
  regConfirmPassword: string;
         setRegConfirmPassword: (val: string) => void;
  authLoading: boolean;
  handleLogin: (e: React.FormEvent) => void;
  handleRegister: (e: React.FormEvent) => void;
}

export function AuthForms(props: AuthFormsProps) {
  if (!props.isRegistering) {
    return (
      <form onSubmit={props.handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            E-mail ou CPF
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              required
              placeholder="email@provedor.com ou 12345678900"
              value={props.loginEmail}
              onChange={(e) => props.setLoginEmail(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-3 border border-slate-805 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Senha Secreta
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••••••"
              value={props.loginPassword}
              onChange={(e) => props.setLoginPassword(e.target.value)}
              className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-3 border border-slate-805 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={props.authLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-550 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
        >
          {props.authLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Validando acesso seguro...</span>
            </>
          ) : (
            'Entrar na Plataforma'
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={props.handleRegister} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Nome Completo do Participante
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="Fulano de Tal da Silva"
            value={props.regNome}
            onChange={(e) => props.setRegNome(e.target.value)}
            className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-805 text-xs focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          CPF (Apenas números)
        </label>
        <div className="relative">
          <Fingerprint className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            required
            placeholder="12345678900"
            value={props.regCpf}
            onChange={(e) => props.setRegCpf(e.target.value)}
             className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-805 text-xs focus:outline-none focus:border-emerald-500"
           />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="col-span-2 space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Cidade
          </label>
          <input
            type="text"
            required
            placeholder="São Paulo"
            value={props.regCidade}
            onChange={(e) => props.setRegCidade(e.target.value)}
            className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-805 text-xs focus:outline-none"
          />
        </div>
        
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Estado (UF)
          </label>
          <input
            type="text"
            required
            placeholder="SP"
            maxLength={2}
            value={props.regEstado}
            onChange={(e) => props.setRegEstado(e.target.value.toUpperCase())}
            className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-805 text-xs focus:outline-none uppercase"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            WhatsApp (Celular)
          </label>
          <input
            type="tel"
            required
            placeholder="(11) 90000-0000"
            value={props.regTelefone}
            onChange={(e) => props.setRegTelefone(e.target.value)}
            className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-805 text-xs focus:outline-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            E-mail
          </label>
          <input
            type="email"
            required
            placeholder="email@provedor.com"
            value={props.regEmail}
            onChange={(e) => props.setRegEmail(e.target.value)}
            className="w-full bg-slate-950 text-white rounded-xl px-3.5 py-2.5 border border-slate-805 text-xs focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Criar Nova Senha
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            required
            placeholder="No mínimo 6 caracteres"
            value={props.regPassword}
            onChange={(e) => props.setRegPassword(e.target.value)}
            className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-805 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
          Confirmar Senha
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="password"
            required
            placeholder="Repita a senha criada"
            value={props.regConfirmPassword}
            onChange={(e) => props.setRegConfirmPassword(e.target.value)}
            className="w-full bg-slate-950 text-white rounded-xl pl-10 pr-4 py-2.5 border border-slate-805 text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={props.authLoading}
        className="w-full mt-2 bg-slate-100 hover:bg-white text-slate-900 font-bold py-3.5 rounded-xl text-xs transition-colors flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {props.authLoading ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin border-slate-900" />
            <span>Processando Conta...</span>
          </>
        ) : (
          'Concluir Meu Cadastro'
        )}
      </button>
    </form>
  );
}
