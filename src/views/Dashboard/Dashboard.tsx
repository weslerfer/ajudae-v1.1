import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { staggerChildren, fadeUp } from '../../experience/presets/presets';
import { motion, AnimatePresence } from 'motion/react';
import { Container } from '../../components/ui/Container';
import { Section } from '../../components/ui/Section';
import { HeroWidget } from './widgets/HeroWidget';
import { KpiIndicators } from './widgets/KpiIndicators';
import { RevenueChart } from './widgets/RevenueChart';
import { PixStatus } from './widgets/PixStatus';
import { ActivityFeed } from './widgets/ActivityFeed';
import { SuggestedGroups } from './widgets/SuggestedGroups';
import { GlassSurface } from '../../components/ui/GlassSurface';
import { api } from '../../api';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const userRaw = localStorage.getItem('ajudae_user_profile');
  const user = userRaw ? JSON.parse(userRaw) : null;
  const userName = user?.nome_completo || 'Visitante';

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getHomeStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoaded(true);
      }
    };
    loadStats();
  }, []);



  return (
    <div className="min-h-[100dvh] md:min-h-screen bg-background text-text-primary pb-24 overflow-x-hidden">
      {/* Background Atmosphere */}
      <div className="hidden lg:block fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80vw] h-[50vh] bg-emerald-500/5 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-neon-cyan/5 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      <Section className="relative z-10 pt-10">
        <Container>
          <AnimatePresence>
            {isLoaded && (
              <motion.div 
                variants={staggerChildren}
                initial="hidden"
                animate="visible"
                className="flex flex-col gap-12"
              >
                {/* WELCOME BANNER */}
                <motion.div variants={fadeUp} className="w-full">
                  <GlassSurface intensity="subtle" className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden group border-white/5 hover:border-emerald-500/30 transition-all duration-500">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700 -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute left-0 bottom-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700 translate-y-1/2 -translate-x-1/4" />
                    <div className="space-y-3 relative z-10">
                      <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-md font-mono tracking-wider inline-block">
                        SISTEMA ATIVO
                      </span>
                      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                        Olá, {userName}!
                      </h1>
                      <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
                        Bem-vindo ao Ajudaae. Participe de grupos de ajuda financeira digital, convide amigos e com apenas um grupo você poderá receber o valor base do grupo de até 11.110 pessoas direto na sua carteira digital.
                        <br/><br/>
                        <span className="text-slate-300 font-medium">Isso só Ajudaae faz!</span>
                      </p>
                    </div>
                    <button 
                      onClick={() => onNavigate?.('como_funciona')}
                      className="flex items-center gap-2 bg-emerald-500 text-slate-950 font-bold py-3 px-6 rounded-xl text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:scale-105 hover:bg-emerald-400 cursor-pointer relative z-10 shrink-0"
                    >
                      <span>Aprender Como Funciona</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </GlassSurface>
                </motion.div>

                {/* ROW 1: Hero & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  <motion.div variants={fadeUp} className="col-span-1 lg:col-span-5 xl:col-span-5 flex flex-col order-1">
                    <HeroWidget balance={stats?.saldo || 0} lastUpdated={new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} />
                  </motion.div>
                  <motion.div variants={fadeUp} className="col-span-1 lg:col-span-7 xl:col-span-7 flex justify-center lg:justify-end order-2 lg:order-2 mt-4 lg:mt-0">
                    <KpiIndicators stats={stats} />
                  </motion.div>
                </div>

                {/* ROW 2: Analytics & Status */}
                {/* Note: "Dashboard Respira" -> gap-12 between rows handles the breathing room */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <motion.div variants={fadeUp} className="col-span-1 lg:col-span-8 order-4 lg:order-3">
                    <RevenueChart revenueHistory={stats?.revenueHistory} />
                  </motion.div>
                  
                  <div className="col-span-1 lg:col-span-4 flex flex-col gap-8 order-3 lg:order-4">
                    <motion.div variants={fadeUp} className="h-full">
                      <PixStatus pendingCount={stats?.pendingPixCount || 0} pendingTotal={stats?.pendingPixTotal || 0} pendingList={stats?.pendingPixList || []} />
                    </motion.div>
                  </div>
                </div>

                {/* ROW 3: Timeline & Utilities */}
                <div className="grid grid-cols-1 gap-8 lg:gap-12">
                  <motion.div variants={fadeUp} className="w-full order-5">
                    <GlassSurface intensity="subtle" className="p-6 h-full min-h-[400px]">
                      <ActivityFeed activities={stats?.recentActivities || []} onNavigate={onNavigate} />
                    </GlassSurface>
                  </motion.div>
                </div>

                {/* ROW 4: Suggested Groups */}
                <div className="mt-8 lg:mt-12">
                  <SuggestedGroups onNavigate={onNavigate} />
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </Container>
      </Section>
    </div>
  );
}
