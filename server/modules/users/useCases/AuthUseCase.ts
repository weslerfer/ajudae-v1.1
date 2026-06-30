import { ProfileRepository } from '../repositories/ProfileRepository';
import { GroupRepository } from '../../groups/repositories/GroupRepository';
import { WalletRepository } from '../../wallets/repositories/WalletRepository';
import { isSupabaseConfigured, registerAuthUserInSupabase, loginUserInSupabase, updatePasswordInSupabase, getSupabaseClient } from '../../../supabase';
import { UserProfile } from '../../../../src/types';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, sanitizeUser } from '../../../middleware/auth';

export class AuthUseCase {
  constructor(
    private profileRepository: ProfileRepository,
    private groupRepository: GroupRepository,
    private walletRepository: WalletRepository
  ) {}

  async register(data: any) {
    const { nome_completo, cpf, cidade, estado, telefone, email, senha } = data;

    if (!nome_completo || !cpf || !cidade || !estado || !telefone || !email || !senha) {
      throw new Error('Todos os campos são obrigatórios.');
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (cleanCpf.length !== 11) {
      throw new Error('CPF inválido. Deve conter 11 dígitos, não inclua pontos ou traços.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('E-mail inválido.');
    }

    if (!isSupabaseConfigured()) {
      throw new Error('Sistema Supabase não configurado.');
    }

    const userProfile = await registerAuthUserInSupabase({
      nome_completo, cpf: cleanCpf, cidade, estado, telefone, email, senha
    });

    if (userProfile) {
      const token = jwt.sign({ id: userProfile.id }, JWT_SECRET, { expiresIn: '7d' });
      return { user: sanitizeUser(userProfile), token };
    }
  }

  async login(identifier: string, senha: string) {
    if (!identifier || !senha) {
      throw new Error('E-mail/CPF e senha são obrigatórios.');
    }

    if (!isSupabaseConfigured()) {
       throw new Error('Supabase não está configurado. O sistema apenas funciona com banco de dados em nuvem.');
    }

    let emailToLogin = identifier;

    // Se o identificador não contiver '@', assumimos que é um CPF
    if (!identifier.includes('@')) {
      const cleanCpf = identifier.replace(/\D/g, '');
      if (cleanCpf.length === 11) {
        const userByCpf = await this.profileRepository.getProfileByCpf(cleanCpf);
        if (!userByCpf) {
          throw new Error('E-mail, CPF ou senha incorretos.');
        }
        emailToLogin = userByCpf.email;
      }
    }

    const result = await loginUserInSupabase({ email: emailToLogin, senha_suporte_plain: senha });
    if (result) {
      const token = jwt.sign({ id: result.user.id }, JWT_SECRET, { expiresIn: '7d' });
      return { user: sanitizeUser(result.user), token };
    }
    throw new Error('E-mail, CPF ou senha incorretos.');
  }

  async getMeStats(userId: string) {
    const activeGroups = await this.groupRepository.getActiveGroups();
    const allMembers = await this.groupRepository.getGroupMembers();
    const userActiveGroups = activeGroups.filter((g: any) => 
      allMembers.some((m: any) => m.active_group_id === g.id && m.user_id === userId && m.position === 4)
    );

    const trxList = await this.walletRepository.getUserTransactions(userId);
    const wallets = await this.walletRepository.getWallets();
    const userWallet = wallets.find((w: any) => w.user_id === userId);
    const saldo = userWallet ? Number(userWallet.saldo_atual || 0) : 0;

    const totalEarned = trxList
      .filter((t: any) => t.tipo === 'recebimento_grupo' || t.tipo === 'ajuste_admin_adicao')
      .reduce((sum: number, t: any) => sum + Math.abs(t.valor), 0);

    const allInvites = await this.groupRepository.getInvites();
    let invitedActivated = 0;
    for (const g of userActiveGroups) {
      const invite = allInvites.find((i: any) => i.active_group_id === g.id && i.inviter_user_id === userId);
      if (invite && invite.used_count) {
        invitedActivated += invite.used_count;
      }
    }

    const adminGroups = await this.groupRepository.getAdminGroups();
    
    // Revenue History (Multi-period)
    const revenueDay: { date: string, value: number }[] = [];
    const revenueWeek: { date: string, value: number }[] = [];
    const revenueMonth: { date: string, value: number }[] = [];
    const now = new Date();
    
    // Day (24 hours - simplified as 6 segments of 4 hours or just today's hours if needed, but let's just do last 7 days for week, 30 for month)
    // Actually, let's keep it simple: 
    // Day: 24 hours of today
    for (let i = 23; i >= 0; i--) {
       const d = new Date(now);
       d.setHours(now.getHours() - i);
       revenueDay.push({ date: d.toISOString().split('T')[1].substring(0, 5), value: 0 }); // HH:MM
    }

    // Week: 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      revenueWeek.push({ date: d.toISOString().split('T')[0], value: 0 });
    }

    // Month: 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      revenueMonth.push({ date: d.toISOString().split('T')[0], value: 0 });
    }

    trxList.forEach((t: any) => {
      if (t.tipo === 'recebimento_grupo' || t.tipo === 'ajuste_admin_adicao') {
        const tDateStr = t.created_at || new Date().toISOString();
        const tDateObj = new Date(tDateStr);
        const tDate = tDateObj.toISOString().split('T')[0];
        const tHour = tDateObj.toISOString().split('T')[1].substring(0, 5);
        
        // Month
        const mEntry = revenueMonth.find(d => d.date === tDate);
        if (mEntry) mEntry.value += Math.abs(t.valor);
        
        // Week
        const wEntry = revenueWeek.find(d => d.date === tDate);
        if (wEntry) wEntry.value += Math.abs(t.valor);

        // Day (if it matches the hour format we pushed, approx)
        // For simplicity, we just find the closest hour or exact match if it exists
        // A better approach is matching the hour:
        const hourPrefix = tDateObj.getHours().toString().padStart(2, '0');
        const dEntry = revenueDay.find(d => d.date.startsWith(hourPrefix));
        if (dEntry && tDateObj.getTime() > now.getTime() - 24 * 60 * 60 * 1000) {
           dEntry.value += Math.abs(t.valor);
        }
      }
    });

    const hasRevenueDay = revenueDay.some(d => d.value > 0);
    const hasRevenueWeek = revenueWeek.some(d => d.value > 0);
    const hasRevenueMonth = revenueMonth.some(d => d.value > 0);

    const finalRevenueHistory = {
      day: hasRevenueDay ? revenueDay : [],
      week: hasRevenueWeek ? revenueWeek : [],
      month: hasRevenueMonth ? revenueMonth : []
    };

    // Pending Pix Withdrawals
    const withdrawalsList = await this.walletRepository.getWithdrawals({ user_id: userId, status: 'pendente' });
    const pendingPixCount = withdrawalsList.length;
    const pendingPixTotal = withdrawalsList.reduce((sum: number, w: any) => sum + Math.abs(w.valor), 0);

    // Recent Activities (Last 5)
    const recentActivities = trxList
      .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
      .slice(0, 5)
      .map((t: any) => {
        const isPending = withdrawalsList.some((w: any) => w.transaction_id === t.id);
        return {
          id: t.id,
          title: t.tipo === 'recebimento_grupo' ? 'Recebimento de Grupo' : t.tipo === 'saque' ? 'Saque Solicitado' : 'Transação',
          description: t.descricao || '',
          amount: t.valor,
          date: t.created_at || new Date().toISOString(),
          type: t.valor > 0 ? 'income' : 'outcome',
          status: isPending ? 'pendente' : 'concluido'
        };
      });

    return {
      activeCount: userActiveGroups.length,
      invitedActivated,
      totalEarned,
      saldo,
      revenueHistory: finalRevenueHistory,
      pendingPixCount,
      pendingPixTotal,
      pendingPixList: withdrawalsList.map(w => ({ id: w.id, amount: w.valor, date: w.created_at, status: w.status })),
      recentActivities,
      adminGroups: adminGroups.slice(0, 3)
    };
  }

  async updateProfile(userId: string, data: any) {
    const { nome_completo, cpf, cidade, estado, email, telefone } = data;
    if (!nome_completo || !cidade || !estado || !email || !telefone ) {
      throw new Error('Preencha todos os campos obrigatórios.');
    }

    let cleanCpf = undefined;
    if (cpf !== undefined && cpf !== null) {
      cleanCpf = String(cpf).replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        throw new Error('CPF inválido. Deve conter exatamente 11 dígitos.');
      }
    }

    const userRef = await this.profileRepository.getProfileById(userId);
    if (!userRef) {
      throw new Error('Usuário não encontrado.');
    }

    if (userRef.email !== email) {
      if (isSupabaseConfigured()) {
         const client = getSupabaseClient();
         if (client) {
           const canUseAdminAPI = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0);
           if (canUseAdminAPI) {
              await client.auth.admin.updateUserById(userId, { email });
           } 
         }
      }
    }

    const updates: any = { nome_completo, cidade, estado, email, telefone };
    if (cleanCpf) updates.cpf = cleanCpf;

    await this.profileRepository.updateProfile(userId, updates);
    return this.profileRepository.getProfileById(userId);
  }

  async updatePix(userId: string, chave_pix: string, banco_pix: string) {
    if (!chave_pix) {
      throw new Error('Chave Pix é obrigatória.');
    }
    await this.profileRepository.updateProfile(userId, { chave_pix, banco_pix });
    return this.profileRepository.getProfileById(userId);
  }

  async updatePassword(user: UserProfile, senha_atual: string, nova_senha: string) {
    if (!senha_atual || !nova_senha) {
      throw new Error('Senha atual e nova senha são obrigatórias.');
    }

    if (isSupabaseConfigured()) {
       const loginResult = await loginUserInSupabase({ email: user.email, senha_suporte_plain: senha_atual });
       if (!loginResult) throw new Error('Senha atual incorreta.');

       const supabaseSuccess = await updatePasswordInSupabase(user.id, nova_senha);
       if (!supabaseSuccess) throw new Error('Falha ao atualizar a senha no provedor de autenticação.');
    } else {
      throw new Error('Supabase não configurado. Impossível alterar a senha.');
    }
  }
}
