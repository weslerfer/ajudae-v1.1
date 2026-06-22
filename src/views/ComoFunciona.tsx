/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  Users, 
  Layers, 
  HelpCircle, 
  ArrowRight, 
  RotateCw, 
  QrCode, 
  Wallet,
  Sparkles
} from 'lucide-react';

export default function ComoFunciona() {
  const steps = [
    {
      title: '1. Escolha ou Convite',
      desc: 'Entre em um grupo disponível ou através de um link de convite compartilhado por outro participante ativo.',
      icon: Layers,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/10'
    },
    {
      title: '2. Ativação via Pix',
      desc: 'Realize o pagamento de ativação do grupo via Pix escaneando o QR Code ou copiando o código copia-e-cola.',
      icon: QrCode,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/10'
    },
    {
      title: '3. Distribuição de Fundos',
      desc: 'O valor pago pela ativação do grupo será automaticamente distribuídos: cada um dos 4 participantes atuais do grupo recebe instantaneamente 20% em sua carteira digital.\nExemplo: Se voce pagou R$25,00 pela ativação do grupo, cada participante recebe R$5,00.\nSe voce pagou R$50,00 pela ativação do grupo, cada participante recebe R$10,00.',
      icon: Wallet,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/10'
    },
    {
      title: '4. O Giro do Grupo ("Giro")',
      desc: 'Quando voce ativa um grupo voce assume a 4ª posição do grupo, e os outros sobem 1 posição, retirando o 1º do grupo.\nVoce recebe 10 convites para poder convidar outras pessoas a entrar no seu grupo. Cada pessoa que entra com seu link voce recebe instantaneamente 20% do valor do grupo.',
      icon: RotateCw,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/10'
    },
    {
      title: '5. A Mágica',
      desc: 'Voce tem 10 convites para convidar pessoas a entrar no seu grupo, voce recebe 20% de cada pessoa que voce convidar.\nPorém voce também recebe das pessoas que entrarem com o convite da pessoa que você convidou.\nExemplo: Voce convidou 10 pessoas. - Recebe de 10 pessoas.\nAs 10 pessoas convidaram mais 10 cada uma. Voce recebe de 100 pessoas.\nAs 100 pessoas também convidaram 10 cada uma. Voce recebe de 1000 pessoas.\ne por fim voce recebe de mais DEZ MIL pessoas.\nAté a 4 geração de convite voce recebe até voce ser excluido da primeira posição do grupo.\n\nÉ claro que não é todo mundo que irá convidar 10 pessoas, o sistema não é feito para te deixar rico, mas para ganhar uma boa grana extra.',
      icon: Sparkles,
      color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/10'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Visual Header */}
      <div className="bg-slate-900 border border-slate-900 rounded-3xl p-6 md:p-10 relative overflow-hidden text-center max-w-4xl mx-auto">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl" />
        <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="inline-flex bg-emerald-500/10 border border-emerald-500/25 p-2.5 rounded-2xl mb-4 text-emerald-400">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-3">Como funciona a Plataforma Ajudae?</h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
          Compreenda a mecânica inovadora de cooperação recíproca digital, onde você cresce à medida que compartilha novos convites.
        </p>
      </div>

      {/* Steps List */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          Mecânica de Participação Passo a Passo
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={idx} className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 rounded-2xl p-6 transition-all space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${step.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500">ETAPA 0{idx + 1}</span>
                </div>
                <h3 className="font-semibold text-white text-base">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explanatory visual about the member shifting rotation (Giro) */}
      <div className="max-w-4xl mx-auto bg-emerald-950/10 border border-slate-900 hover:border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            Entendendo Dinamicamente o Giro do Grupo
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Cada grupo mantém exatamente 4 posições ativas. Veja como as posições mudam no momento que você ou seu convidado realiza um pagamento:
          </p>
        </div>

        {/* Visual Queue Graphics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center pt-2">
          
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-500 mb-1">Posição antiga: 1º</span>
            <span className="text-xs font-bold text-slate-400">Usuário 1</span>
            <span className="text-[10px] bg-red-950 text-red-400 px-2 py-0.5 rounded-full mt-3 font-semibold uppercase">
              Removido
            </span>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
          </div>

          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 text-center flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-500 mb-1">Posições 2º, 3º e 4º</span>
            <span className="text-xs font-bold text-slate-200">Submembros</span>
            <span className="text-[10px] bg-sky-950 text-sky-400 px-2 py-0.5 rounded-full mt-3 font-semibold">
              Sobem 1 Posição
            </span>
          </div>

          <div className="flex justify-center text-slate-500">
            <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
          </div>

          <div className="bg-emerald-950/30 p-4 rounded-2xl border border-emerald-500/20 text-center flex flex-col items-center">
            <span className="text-[10px] font-mono text-emerald-500 mb-1">Posição nova: 4º</span>
            <span className="text-xs font-bold text-emerald-400">Novo Ativador</span>
            <span className="text-[10px] bg-emerald-500 text-white px-2.5 py-0.5 rounded-full mt-3 font-semibold uppercase">
              Você Entra
            </span>
          </div>

        </div>

        {/* Quick summary bullet list */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-900 space-y-3">
          <p className="text-xs font-bold text-white uppercase tracking-wider font-mono">Regras Importantes Complementares:</p>
          <ul className="list-disc list-inside text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <li>Os convites são limitados a <strong>10 ativações bem-sucedidas</strong> por grupo ativado.</li>
            <li>Seu link de convite pode ser clicado livremente, porém o desconto de convite só ocorre quando o convidado <strong>efetivamente pagar</strong> e completar a ativação.</li>
            <li>As solicitações de saque dependem de informações corretas da sua <strong>Chave Pix E CPF</strong> nas configurações e será processado o pagamento em até 48h uteis.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
