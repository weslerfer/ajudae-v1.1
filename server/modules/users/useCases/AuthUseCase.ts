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

  async login(email: string, senha: string) {
    if (!email || !senha) {
      throw new Error('E-mail e senha são obrigatórios.');
    }

    if (!isSupabaseConfigured()) {
       throw new Error('Supabase não está configurado. O sistema apenas funciona com banco de dados em nuvem.');
    }

    const result = await loginUserInSupabase({ email, senha_suporte_plain: senha });
    if (result) {
      const token = jwt.sign({ id: result.user.id }, JWT_SECRET, { expiresIn: '7d' });
      return { user: sanitizeUser(result.user), token };
    }
    throw new Error('E-mail ou senha incorretos.');
  }

  async getMeStats(userId: string) {
    const activeGroups = await this.groupRepository.getActiveGroups();
    const allMembers = await this.groupRepository.getGroupMembers();
    const userActiveGroups = activeGroups.filter((g: any) => 
      allMembers.some((m: any) => m.active_group_id === g.id && m.user_id === userId && m.position === 4)
    );

    const trxList = await this.walletRepository.getUserTransactions(userId);
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
    
    return {
      activeCount: userActiveGroups.length,
      invitedActivated,
      totalEarned,
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
