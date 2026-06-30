import React from 'react';
import { motion } from 'motion/react';
import { staggerChildren, fadeUp } from '../experience/presets/presets';
import { Section } from '../components/ui/Section';
import { Container } from '../components/ui/Container';
import { Grid } from '../components/ui/Grid';
import { Stack } from '../components/ui/Stack';
import { GlassSurface } from '../components/ui/GlassSurface';
import { GlowSurface } from '../components/ui/GlowSurface';
import { Typography } from '../components/ui/Typography';
import { Badge } from '../components/ui/Badge';
import { Icon } from '../components/ui/Icon';
import { cn } from '../utils/cn';

export default function ComoFunciona() {
  return (
    <Section className="pb-24 pt-8">
      <Container>
        <motion.div variants={staggerChildren} initial="hidden" animate="visible" className="flex flex-col gap-12">
          
          {/* HERO INSTITUCIONAL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-4">
            <motion.div variants={fadeUp} className="flex flex-col gap-4">
              <Typography variant="h1" className="text-4xl md:text-5xl font-display font-bold text-white tracking-tighter leading-tight">
                Como funciona o <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">AJUDAAE</span>
              </Typography>
              <Typography variant="body" color="secondary" className="text-lg max-w-md">
                Entenda rapidamente como funciona o ciclo de participação da plataforma.
              </Typography>
            </motion.div>
            
            <motion.div variants={fadeUp}>
               <Grid cols={2} gap="md">
                  <GlassSurface intensity="subtle" className="p-5 flex flex-col gap-2 border-emerald-500/10 hover:border-emerald-500/30 transition-colors">
                     <Icon name="solar:users-group-rounded-bold-duotone" className="w-8 h-8 text-emerald-400" />
                     <Typography variant="h3" className="text-white">4</Typography>
                     <Typography variant="caption" color="muted" className="font-semibold uppercase tracking-wider">Participantes por Grupo</Typography>
                  </GlassSurface>
                  <GlassSurface intensity="subtle" className="p-5 flex flex-col gap-2 border-blue-500/10 hover:border-blue-500/30 transition-colors">
                     <Icon name="solar:letter-bold-duotone" className="w-8 h-8 text-blue-400" />
                     <Typography variant="h3" className="text-white">10</Typography>
                     <Typography variant="caption" color="muted" className="font-semibold uppercase tracking-wider">Convites por Grupo</Typography>
                  </GlassSurface>
                  <GlassSurface intensity="subtle" className="p-5 flex flex-col gap-2 border-purple-500/10 hover:border-purple-500/30 transition-colors">
                     <Icon name="solar:layers-bold-duotone" className="w-8 h-8 text-purple-400" />
                     <Typography variant="h3" className="text-white">4</Typography>
                     <Typography variant="caption" color="muted" className="font-semibold uppercase tracking-wider">Receba de 4 gerações</Typography>
                  </GlassSurface>
                  <GlassSurface intensity="subtle" className="p-5 flex flex-col gap-2 border-amber-500/10 hover:border-amber-500/30 transition-colors">
                     <Icon name="solar:wallet-money-bold-duotone" className="w-8 h-8 text-amber-400" />
                     <Typography variant="h3" className="text-white">Instantâneo</Typography>
                     <Typography variant="caption" color="muted" className="font-semibold uppercase tracking-wider text-[10px]">Receba na hora quando alguém ativar</Typography>
                  </GlassSurface>
               </Grid>
            </motion.div>
          </div>

          {/* TIMELINE PREMIUM - ETAPAS */}
          <motion.div variants={fadeUp}>
             <Typography variant="h3" className="mb-6 flex items-center gap-3">
               <Icon name="solar:route-bold-duotone" className="w-7 h-7 text-emerald-400" />
               Jornada Visual
             </Typography>
             <Grid cols={1} gap="lg">
                {/* Etapa 1 */}
                <GlowSurface glowColor="neon-green" className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center group">
                   <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all">
                      <Icon name="solar:cursor-square-bold-duotone" className="w-8 h-8" />
                   </div>
                   <div className="flex-1">
                      <Badge variant="glass" className="mb-2 uppercase tracking-widest font-bold text-[10px]">Etapa 01</Badge>
                      <Typography variant="h4" className="text-white mb-2">Ative um Grupo</Typography>
                      <Typography variant="body" color="secondary">Entre em um grupo disponível ou através de um link de convite compartilhado por outro participante ativo.</Typography>
                   </div>
                </GlowSurface>

                {/* Etapa 2 */}
                <GlowSurface glowColor="neon-blue" className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center group">
                   <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.3)] transition-all">
                      <Icon name="solar:qr-code-bold-duotone" className="w-8 h-8" />
                   </div>
                   <div className="flex-1">
                      <Badge variant="glass" className="mb-2 uppercase tracking-widest font-bold text-[10px]">Etapa 02</Badge>
                      <Typography variant="h4" className="text-white mb-2">Ativação via Pix</Typography>
                      <Typography variant="body" color="secondary">Realize o pagamento de ativação do grupo via Pix escaneando o QR Code ou copiando o código copia-e-cola.</Typography>
                   </div>
                </GlowSurface>

                {/* Etapa 3 */}
                <GlowSurface glowColor="neon-blue" className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center group">
                   <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.3)] transition-all">
                      <Icon name="solar:wallet-bold-duotone" className="w-8 h-8" />
                   </div>
                   <div className="flex-1">
                      <Badge variant="glass" className="mb-2 uppercase tracking-widest font-bold text-[10px]">Etapa 03</Badge>
                      <Typography variant="h4" className="text-white mb-2">Distribuição de Fundos</Typography>
                      <Typography variant="body" color="secondary">O valor pago pela ativação do grupo será automaticamente distribuído: cada um dos 4 participantes atuais do grupo recebe instantaneamente o valor base do grupo em sua carteira digital.</Typography>
                   </div>
                </GlowSurface>

                {/* Etapa 4 */}
                <GlowSurface glowColor="neon-cyan" className="p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-start lg:items-center group">
                   <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.1)] group-hover:shadow-[0_0_25px_rgba(14,165,233,0.3)] transition-all">
                      <Icon name="solar:refresh-circle-bold-duotone" className="w-8 h-8" />
                   </div>
                   <div className="flex-1">
                      <Badge variant="glass" className="mb-2 uppercase tracking-widest font-bold text-[10px]">Etapa 04</Badge>
                      <Typography variant="h4" className="text-white mb-2">O Giro do Grupo</Typography>
                      <Typography variant="body" color="secondary">Quando você ativa um grupo você assume a 4ª posição do grupo, e os outros sobem 1 posição, retirando o 1º do grupo. Você recebe 10 convites para poder convidar outras pessoas a entrar no seu grupo.</Typography>
                   </div>
                </GlowSurface>
             </Grid>
          </motion.div>

          {/* A Mágica - Glass Cards Sequenciais */}
          <motion.div variants={fadeUp} className="mt-4">
             <Typography variant="h3" className="mb-6 flex items-center gap-3">
                <Icon name="solar:magic-stick-3-bold-duotone" className="w-7 h-7 text-fuchsia-400" />
                A Mágica
             </Typography>
             
             <Grid cols={5} gap="sm">
                {/* Card 1 */}
                <GlassSurface intensity="subtle" className="p-6 flex flex-col items-center text-center h-full border-fuchsia-500/10 hover:border-fuchsia-500/40 transition-colors">
                   <Icon name="solar:add-square-bold-duotone" className="w-10 h-10 text-fuchsia-400 mb-4" glow />
                   <Typography variant="body" className="font-semibold text-white">Você convida pessoas</Typography>
                </GlassSurface>

                {/* Card 2 */}
                <GlassSurface intensity="subtle" className="p-6 flex flex-col items-center text-center h-full border-emerald-500/10 hover:border-emerald-500/40 transition-colors">
                   <Icon name="solar:money-bag-bold-duotone" className="w-10 h-10 text-emerald-400 mb-4" glow />
                   <Typography variant="body" className="font-semibold text-white">Recebe pelas ativações</Typography>
                </GlassSurface>

                {/* Card 3 */}
                <GlassSurface intensity="subtle" className="p-6 flex flex-col items-center text-center h-full border-blue-500/10 hover:border-blue-500/40 transition-colors">
                   <Icon name="solar:users-group-two-rounded-bold-duotone" className="w-10 h-10 text-blue-400 mb-4" glow />
                   <Typography variant="body" className="font-semibold text-white">Essas pessoas convidam</Typography>
                </GlassSurface>

                {/* Card 4 */}
                <GlassSurface intensity="subtle" className="p-6 flex flex-col items-center text-center h-full border-indigo-500/10 hover:border-indigo-500/40 transition-colors">
                   <Icon name="solar:graph-up-bold-duotone" className="w-10 h-10 text-indigo-400 mb-4" glow />
                   <Typography variant="body" className="font-semibold text-white">Você recebe mais e mais</Typography>
                </GlassSurface>

                {/* Card 5 */}
                <GlassSurface intensity="subtle" className="p-6 flex flex-col items-center text-center h-full border-amber-500/10 hover:border-amber-500/40 transition-colors">
                   <Icon name="solar:infinity-bold-duotone" className="w-10 h-10 text-amber-400 mb-4" glow />
                   <Typography variant="body" className="font-semibold text-white mb-1">Você continua recebendo</Typography>
                   <Typography variant="caption" color="muted">Até a 4ª geração</Typography>
                </GlassSurface>
             </Grid>
          </motion.div>

          {/* Workflow Institucional (Giro do Grupo) */}
          <motion.div variants={fadeUp} className="mt-4">
             <Typography variant="h3" className="mb-6 flex items-center gap-3">
               <Icon name="solar:refresh-circle-bold-duotone" className="w-7 h-7 text-blue-400" />
               Giro do Grupo
             </Typography>
             <GlassSurface intensity="subtle" className="p-8">
                <Grid cols={4} gap="md">
                   
                   <div className="flex flex-col items-center text-center gap-3 group">
                      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center ring-1 ring-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)] group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                         <Icon name="lucide:circle-dollar-sign" className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <Typography variant="caption" color="muted" className="uppercase tracking-widest font-bold mb-1 text-[10px]">Na 4º Posição</Typography>
                        <Typography variant="body" className="font-semibold text-slate-300">Receba de até 10 Pessoas</Typography>
                      </div>
                   </div>

                   <div className="flex flex-col items-center text-center gap-3 group">
                      <div className="w-14 h-14 rounded-full bg-blue-500/10 flex items-center justify-center ring-1 ring-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all">
                         <Icon name="lucide:coins" className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <Typography variant="caption" color="muted" className="uppercase tracking-widest font-bold mb-1 text-[10px]">Na 3º Posição</Typography>
                        <Typography variant="body" className="font-semibold text-slate-300">Receba de até 100 Pessoas</Typography>
                      </div>
                   </div>

                   <div className="flex flex-col items-center text-center gap-3 group">
                      <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center ring-1 ring-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all">
                         <Icon name="lucide:banknote" className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <Typography variant="caption" color="muted" className="uppercase tracking-widest font-bold mb-1 text-[10px]">Na 2º Posição</Typography>
                        <Typography variant="body" className="font-semibold text-slate-300">Receba de até 1.000 Pessoas</Typography>
                      </div>
                   </div>

                   <div className="flex flex-col items-center text-center gap-3 group">
                      <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center ring-1 ring-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)] group-hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all animate-[pulse_4s_ease-in-out_infinite]">
                         <Icon name="lucide:landmark" className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex flex-col">
                        <Typography variant="caption" color="muted" className="uppercase tracking-widest font-bold mb-1 text-[10px]">Na 1º Posição</Typography>
                        <Typography variant="body" className="font-semibold text-slate-300">Receba de até 10.000 Pessoas</Typography>
                      </div>
                   </div>

                </Grid>
             </GlassSurface>
          </motion.div>

          {/* Checklist Premium - Regras */}
          <motion.div variants={fadeUp} className="mt-4">
             <Typography variant="h3" className="mb-6 flex items-center gap-3">
               <Icon name="solar:shield-check-bold-duotone" className="w-7 h-7 text-amber-400" />
               Regras Importantes
             </Typography>
             <Grid cols={2} gap="md">
                
                <GlassSurface intensity="subtle" className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors cursor-default">
                   <div className="mt-0.5 text-emerald-400"><Icon name="solar:check-circle-bold-duotone" className="w-6 h-6" /></div>
                   <div className="flex flex-col gap-1">
                      <Typography variant="body" className="font-bold text-white">Recebimentos via PIX</Typography>
                      <Typography variant="caption" color="muted">O desconto de convite e repasse financeiro ocorrem apenas quando o convidado efetivamente confirmar o pagamento (PIX Instantâneo).</Typography>
                   </div>
                </GlassSurface>

                <GlassSurface intensity="subtle" className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors cursor-default">
                   <div className="mt-0.5 text-emerald-400"><Icon name="solar:check-circle-bold-duotone" className="w-6 h-6" /></div>
                   <div className="flex flex-col gap-1">
                      <Typography variant="body" className="font-bold text-white">Convites Limitados</Typography>
                      <Typography variant="caption" color="muted">Os convites são estritamente limitados a 10 ativações bem-sucedidas por grupo ativado na plataforma.</Typography>
                   </div>
                </GlassSurface>

                <GlassSurface intensity="subtle" className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors cursor-default">
                   <div className="mt-0.5 text-emerald-400"><Icon name="solar:check-circle-bold-duotone" className="w-6 h-6" /></div>
                   <div className="flex flex-col gap-1">
                      <Typography variant="body" className="font-bold text-white">Chave PIX Correta</Typography>
                      <Typography variant="caption" color="muted">Para solicitar saques sem atrasos, sua Chave PIX e CPF devem estar 100% corretos nas configurações da conta. E a chave PIX deve ser atrelada ao CPF da conta cadastrada.</Typography>
                   </div>
                </GlassSurface>

                <GlassSurface intensity="subtle" className="p-6 flex items-start gap-4 hover:bg-white/[0.02] transition-colors cursor-default">
                   <div className="mt-0.5 text-emerald-400"><Icon name="solar:check-circle-bold-duotone" className="w-6 h-6" /></div>
                   <div className="flex flex-col gap-1">
                      <Typography variant="body" className="font-bold text-white">Solicitação de Saque</Typography>
                      <Typography variant="caption" color="muted">O processamento das solicitações de saque é realizado em até 48h úteis.</Typography>
                   </div>
                </GlassSurface>

             </Grid>
          </motion.div>

        </motion.div>
      </Container>
    </Section>
  );
}
