import { randomUUID } from 'crypto';
import { IPaymentProvider } from '../../shared/providers/IPaymentProvider';
import { isSupabaseConfigured, getSupabaseClient } from '../../../supabase';
import { AdminGroup } from '../../../../src/types';

import { ProfileRepository } from '../../users/repositories/ProfileRepository';
import { GroupRepository } from '../../groups/repositories/GroupRepository';
import { WalletRepository } from '../../wallets/repositories/WalletRepository';
import { NotificationRepository } from '../../notifications/repositories/NotificationRepository';
import { SystemRepository } from '../../shared/database/SystemRepository';
import { PaymentRepository } from '../../payments/repositories/PaymentRepository';

export class AdminUseCase {
  constructor(
    private profileRepository: ProfileRepository,
    private groupRepository: GroupRepository,
    private walletRepository: WalletRepository,
    private notificationRepository: NotificationRepository,
    private systemRepository: SystemRepository,
    private paymentRepository: PaymentRepository,
    private paymentProvider: IPaymentProvider
  ) {}

  async configWebhook(webhookUrl: string) {
    if (!webhookUrl) throw new Error('webhookUrl é obrigatório');
    const success = await this.paymentProvider.configureWebhook(webhookUrl);
    if (!success) {
      throw new Error('Falha ao configurar webhook na Efí. Certifique-se que o certificado está correto e tente novamente.');
    }
  }

  async getStats() {
    const allProfiles = await this.profileRepository.getProfiles();
    const activeGroups = await this.groupRepository.getActiveGroups();
    const balance = await this.systemRepository.getPlatformBalance();
    const withdrawals = await this.walletRepository.getWithdrawals();
    const transactions = await this.walletRepository.getTransactions();

    const activeUserIds = new Set(transactions.map((t: any) => t.user_id));
    const activeUsersCount = activeUserIds.size;

    return {
      total_recebido: balance.total_recebido,
      total_distribuido: balance.total_distribuido,
      total_lucro: balance.total_lucro,
      total_users: allProfiles.length,
      active_users: activeUsersCount,
      pending_withdrawals: withdrawals.filter(w => w.status === 'pendente'),
      recent_groups: activeGroups.slice(-5)
    };
  }

  async getUsers() {
    const profiles = await this.profileRepository.getProfiles();
    const activeGroups = await this.groupRepository.getActiveGroups();
    const allInvites = await this.groupRepository.getInvites();
    const allMembers = await this.groupRepository.getGroupMembers();
    const allWallets = await this.walletRepository.getWallets();

    return profiles.map(p => {
      const invites = allInvites.filter(i => i.inviter_user_id === p.id);
      const userWallets = allWallets.filter(w => w.user_id === p.id);
      const userSaldo = userWallets.length > 0 ? Number(userWallets[0].saldo_atual || 0) : 0;
      
      const userActiveGroupsDetails = [];
      for (const g of activeGroups) {
        const member = allMembers.find(m => m.active_group_id === g.id && m.user_id === p.id && m.position === 4);
        if (member) {
          const invite = invites.find(i => i.active_group_id === g.id);
          userActiveGroupsDetails.push({
            id: g.id,
            nome_grupo: g.nome_grupo || 'Desconhecido',
            invite_code: invite ? invite.invite_code : null,
            max_uses: invite ? invite.max_uses : 0,
            used_count: invite ? invite.used_count : 0
          });
        }
      }

      const activationsCount = invites.reduce((sum, inv) => sum + (inv.used_count || 0), 0);
      const { password, ...safeProfile } = p as any;

      return {
        ...safeProfile,
        active_groups_count: userActiveGroupsDetails.length,
        detailed_active_groups: userActiveGroupsDetails,
        activated_invites_sum: activationsCount,
        saldo: userSaldo
      };
    });
  }

  async updateUser(data: any) {
    const { id, nome_completo, cpf, cidade, estado, telefone, email, is_admin } = data;
    if (!id) throw new Error('ID do usuário é requirido.');

    const oldUser = await this.profileRepository.getProfileById(id);
    if (oldUser && oldUser.email !== email) {
      if (isSupabaseConfigured()) {
         const client = getSupabaseClient();
         if (client) {
           const canUseAdminAPI = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0);
           if (canUseAdminAPI) {
              await client.auth.admin.updateUserById(id, { email });
           } 
         }
      }
    }

    await this.profileRepository.updateProfile(id, { nome_completo, cpf, cidade, estado, telefone, email, is_admin: !!is_admin });
    return this.profileRepository.getProfileById(id);
  }

  async updateInviteLimit(invite_code: string, max_uses: number) {
    if (!invite_code || max_uses === undefined) {
      throw new Error('Código de convite e novo limite são obrigatórios.');
    }

    const invite = await this.groupRepository.getInviteByCode(invite_code);
    if (!invite) throw new Error('Link de convite não encontrado.');

    await this.groupRepository.updateInvite(invite.id, { max_uses: Number(max_uses) });
    return this.groupRepository.getInviteByCode(invite_code);
  }

  async getWithdrawals() {
    const withdrawals = await this.walletRepository.getWithdrawals();
    return withdrawals.sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  async actionWithdrawal(id: string, action: string, motivo?: string) {
    if (!['autorizado', 'rejeitado', 'excluido'].includes(action)) {
      throw new Error('Ação inválida para o saque.');
    }

    const withdrawal = (await this.walletRepository.getWithdrawals()).find(w => w.id === id);
    if (!withdrawal) {
      throw new Error('Solicitação de saque não encontrada.');
    }

    if (action === 'excluido') {
      await this.walletRepository.updateWithdrawalStatus(id, 'excluido', undefined, undefined);
      if (withdrawal.transaction_id) {
        await this.walletRepository.deleteTransaction(withdrawal.transaction_id);
      }
      return { message: 'Saque excluído e fundos estornados silenciosamente.' };
    }

    await this.walletRepository.updateWithdrawalStatus(id, action === 'autorizado' ? 'aprovado' : 'rejeitado', new Date().toISOString(), motivo);
    return { message: `Saque ${action === 'autorizado' ? 'aprovado' : 'rejeitado'} com sucesso.` };
  }

  async createGroup(data: any) {
    const { nome_grupo, valor_base, initial_members } = data;

    if (!nome_grupo || !valor_base) {
      throw new Error('Nome do grupo e valor base são obrigatórios.');
    }

    const base = Number(valor_base);
    const groupId = randomUUID();
    const newAdminGroup: AdminGroup = {
      id: groupId,
      nome_grupo,
      valor_base: base,
      valor_ativacao: Number((base * 5).toFixed(2)),
      status: 'disponivel',
      created_at: new Date().toISOString()
    };

    await this.groupRepository.addAdminGroup(newAdminGroup);

    let assignedMembers: any[] = [];
    const systemAdminId = (await this.profileRepository.getProfiles())[0]?.id || randomUUID();
    if (initial_members && Array.isArray(initial_members) && initial_members.length === 4) {
      assignedMembers = await Promise.all(initial_members.map(async (userId, i) => {
        const user = await this.profileRepository.getProfileById(userId);
        return {
          id: randomUUID(),
          user_id: userId,
          group_id: groupId,
          nome_completo: user?.nome_completo || `Usuário Posição ${i+1}`,
          cidade: user?.cidade || 'São Paulo',
          estado: user?.estado || 'SP',
          position: i + 1,
          joined_at: new Date().toISOString()
        };
      }));
    } else {
      assignedMembers = [
        { id: randomUUID(), group_id: groupId, user_id: systemAdminId, nome_completo: 'Sistema', cidade: 'São Paulo', estado: 'SP', position: 1, joined_at: new Date().toISOString() },
        { id: randomUUID(), group_id: groupId, user_id: systemAdminId, nome_completo: 'Sistema', cidade: 'Rio de Janeiro', estado: 'RJ', position: 2, joined_at: new Date().toISOString() },
        { id: randomUUID(), group_id: groupId, user_id: systemAdminId, nome_completo: 'Sistema', cidade: 'Belo Horizonte', estado: 'MG', position: 3, joined_at: new Date().toISOString() },
        { id: randomUUID(), group_id: groupId, user_id: systemAdminId, nome_completo: 'Sistema', cidade: 'Curitiba', estado: 'PR', position: 4, joined_at: new Date().toISOString() }
      ];
    }

    await this.groupRepository.setGroupMembers(groupId, assignedMembers);

    return newAdminGroup;
  }

  async editGroup(groupId: string, data: any) {
    const { nome_grupo, valor_base, initial_members } = data;

    const group = await this.groupRepository.getAdminGroupById(groupId);
    if (!group) throw new Error('Grupo não encontrado.');

    const base = valor_base ? Number(valor_base) : group.valor_base;
    await this.groupRepository.updateAdminGroup(groupId, {
      nome_grupo: nome_grupo || group.nome_grupo,
      valor_base: base,
      valor_ativacao: Number((base * 5).toFixed(2))
    });

    if (initial_members && Array.isArray(initial_members) && initial_members.length === 4) {
      const assignedMembers = await Promise.all(initial_members.map(async (userId, i) => {
        const user = await this.profileRepository.getProfileById(userId);
        return {
          id: randomUUID(),
          user_id: userId,
          group_id: groupId,
          nome_completo: user?.nome_completo || `Usuário Posição ${i+1}`,
          cidade: user?.cidade || 'São Paulo',
          estado: user?.estado || 'SP',
          position: i + 1,
          joined_at: new Date().toISOString()
        };
      }));
      await this.groupRepository.setGroupMembers(groupId, assignedMembers);
    }
  }

  async deleteGroup(id: string) {
    await this.groupRepository.deleteAdminGroup(id);
  }

  async getWallets() {
    const wallets = await this.walletRepository.getWallets();
    const transactions = (await this.walletRepository.getTransactions()).sort((a,b) => b.created_at.localeCompare(a.created_at));
    const allProfiles = await this.profileRepository.getProfiles();

    const formattedWallets = allProfiles.map(user => {
      const w = wallets.find(p => p.user_id === user.id);
      return {
        id: w ? w.id : `virt_${user.id}`,
        user_id: user.id,
        nome_completo: user.nome_completo || 'Sem Nome',
        email: user.email || 'N/A',
        saldo_atual: w ? Number(w.saldo_atual || 0) : 0
      };
    });

    return { wallets: formattedWallets, transactions };
  }

  async adjustWallet(user_id: string, amount: number, description: string) {
    if (!user_id || isNaN(amount) || !description) {
      throw new Error('ID, valor e justificativa são obrigatórios.');
    }

    const user = await this.profileRepository.getProfileById(user_id);
    if (!user) throw new Error('Usuário não encontrado.');

    const isAddition = amount >= 0;
    
    await this.walletRepository.adjustWalletBalance(
      user_id,
      amount,
      {
        id: "tx_" + Date.now() + Math.random().toString(36).substr(2, 9),
        user_id,
        tipo: isAddition ? 'ajuste_admin_adicao' : 'ajuste_admin_subtracao',
        valor: amount,
        descricao: `Ajuste Administrativo: ${description}`,
        created_at: new Date().toISOString()
      }
    );

    await this.notificationRepository.addNotification({
        id: "ntf_" + Date.now(),
        user_id,
        title: 'Saldo Ajustado pelo Admin ⚙️',
        message: `Seu saldo foi ${isAddition ? 'acrescido' : 'reduzido'} em R$ ${Math.abs(amount).toFixed(2)} por um administrador.\nJustificativa: ${description}`,
        type: 'aviso',
        created_at: new Date().toISOString()
      });
  }

  async getMessages() {
    return (await this.notificationRepository.getAdminMessages()).sort((a,b) => b.created_at.localeCompare(a.created_at));
  }

  async createMessage(titulo: string, mensagem: string, tipo: string) {
    if (!titulo || !mensagem || !tipo) throw new Error('Dados insuficientes');
    
    const msg = {
      id: randomUUID(),
      titulo,
      mensagem,
      tipo,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await this.notificationRepository.createAdminMessage(msg);
    return msg;
  }

  async updateMessage(id: string, titulo: string, mensagem: string) {
    if (!titulo || !mensagem) throw new Error('Dados insuficientes');
    await this.notificationRepository.updateAdminMessage(id, { titulo, mensagem, updated_at: new Date().toISOString() });
    return { id, titulo, mensagem };
  }

  async deleteMessage(id: string) {
    await this.notificationRepository.deleteAdminMessage(id);
  }
}
