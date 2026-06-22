import { GroupRepository } from '../repositories/GroupRepository';
import { PaymentRepository } from '../../payments/repositories/PaymentRepository';
import { IPaymentProvider } from '../../shared/providers/IPaymentProvider';
import { UserProfile, UserInvitedGroup, PaymentPix } from '../../../../src/types';
import { randomUUID } from 'crypto';

const inviteProcessingLocks = new Set<string>();

export class GroupUseCase {
  constructor(
    private groupRepository: GroupRepository,
    private paymentRepository: PaymentRepository,
    private paymentProvider: IPaymentProvider
  ) {}

  async getAdminGroups() {
    const groups = await this.groupRepository.getAdminGroups();
    const allMembers = await this.groupRepository.getGroupMembers();
    
    return groups.map(g => {
      const members = allMembers.filter(m => m.group_id === g.id).sort((a,b) => a.position - b.position);
      return { ...g, members };
    });
  }

  async getActiveGroups(user: UserProfile) {
    const activeGroups = await this.groupRepository.getActiveGroups();
    
    const result = activeGroups.map(g => {
      const members = (g.members || []).map((m: any) => ({
        ...m,
        position: Number(m.position)
      })).sort((a: any, b: any) => a.position - b.position);
      return { ...g, members };
    });

    return result.filter(g => 
      g.members.some((m: any) => m.user_id === user.id && m.position === 4)
    );
  }

  async getInvitedGroups(user: UserProfile) {
    const userInvited = await this.groupRepository.getUserInvitedGroups({ user_id: user.id });
    const allInvites = await this.groupRepository.getInvites();
    const allActiveGroups = await this.groupRepository.getActiveGroups();
    const allMembers = await this.groupRepository.getGroupMembers();

    const result = userInvited.map(uig => {
      const invite = allInvites.find(i => i.id === uig.invite_id);
      if (!invite) return null;

      const sourceActiveGroup = allActiveGroups.find(a => a.id === invite.active_group_id);
      if (!sourceActiveGroup) return null;

      const members = allMembers.filter(m => m.active_group_id === sourceActiveGroup.id).sort((a,b) => a.position - b.position);
      
      return {
        id: uig.id,
        invite_code: invite.invite_code,
        invite_id: invite.id,
        group: {
          id: sourceActiveGroup.id,
          nome_grupo: sourceActiveGroup.nome_grupo,
          valor_base: sourceActiveGroup.valor_base,
          valor_ativacao: sourceActiveGroup.valor_ativacao,
          status: sourceActiveGroup.status,
          created_at: sourceActiveGroup.created_at,
          members
        }
      };
    });

    return result.filter(Boolean);
  }

  async getGroupDetails(id: string, user: UserProfile) {
    let adminGroup = await this.groupRepository.getAdminGroupById(id);
    if (adminGroup) {
      const members = await this.groupRepository.getMembersForGroup(id);
      return { type: 'disponivel', group: { ...adminGroup, members } };
    }

    let activeGroup = await this.groupRepository.getActiveGroupById(id);
    if (activeGroup) {
      const members = await this.groupRepository.getMembersForGroup(id);
      const invite = (await this.groupRepository.getInvites()).find(i => i.active_group_id === id && i.inviter_user_id === user.id);

      return { 
        type: 'ativo', 
        group: { ...activeGroup, members },
        invite_code: invite?.invite_code || null,
        max_uses: invite?.max_uses || 10,
        used_count: invite?.used_count || 0
      };
    }

    throw new Error('Grupo não encontrado.');
  }

  async processInviteClick(code: string, user: UserProfile) {
    if (!code) throw new Error('Código de convite inválido.');

    const lockKey = `${user.id}_${code}`;
    if (inviteProcessingLocks.has(lockKey)) {
      return { message: 'O grupo do convite foi adicionado e está disponível para ativá-lo.', already_added: false };
    }
    
    inviteProcessingLocks.add(lockKey);
    const removeLock = () => inviteProcessingLocks.delete(lockKey);
    setTimeout(removeLock, 3000);

    const invite = await this.groupRepository.getInviteByCode(code);
    if (!invite) {
      removeLock();
      throw new Error('Convite não encontrado ou expirado.');
    }

    if (invite.used_count >= invite.max_uses) {
      removeLock();
      throw new Error('Este link de convite já atingiu o limite de 10 ativações.');
    }

    if (invite.inviter_user_id === user.id) {
      removeLock();
      throw new Error('Você não pode entrar no seu próprio grupo de convite.');
    }

    const activeGroup = await this.groupRepository.getActiveGroupById(invite.active_group_id);
    if (!activeGroup) {
      removeLock();
      throw new Error('Grupo originador deste convite não está mais ativo.');
    }

    const existingInvitedGroupList = (await this.groupRepository.getUserInvitedGroups()).filter((uig: UserInvitedGroup) =>
      uig.user_id === user.id && uig.invite_id === invite.id
    );

    if (existingInvitedGroupList.length > 0) {
      removeLock();
      const existingInvitedGroup = existingInvitedGroupList[0];
      const createdTime = new Date(existingInvitedGroup.created_at).getTime();
      if (Date.now() - createdTime < 5000) {
        return { message: 'O grupo do convite foi adicionado e está disponível para ativá-lo.', already_added: false };
      }
      return { message: 'O grupo do Convite já está adicionado, tente outro convite.', already_added: true };
    }

    const newUig: UserInvitedGroup = {
      id: randomUUID(),
      user_id: user.id,
      invite_code: invite.invite_code,
      invite_id: invite.id,
      active_group_id: activeGroup.id,
      created_at: new Date().toISOString()
    };

    await this.groupRepository.addUserInvitedGroup(newUig);

    return { message: 'O grupo do convite foi adicionado e está disponível para ativá-lo.', already_added: false };
  }

  async deleteInvitedGroup(id: string, user: UserProfile) {
    if (!id) throw new Error('ID inválido.');

    const userInvited = (await this.groupRepository.getUserInvitedGroups()).find((uig: any) => uig.id === id);
    if (!userInvited || userInvited.user_id !== user.id) throw new Error('Registro não encontrado.');

    await this.groupRepository.deleteUserInvitedGroup(id);
  }

  async activateInvitedGroup(id: string, user: UserProfile) {
    if (!id) throw new Error('ID inválido.');

    const userInvited = (await this.groupRepository.getUserInvitedGroups()).find((uig: any) => uig.id === id);
    if (!userInvited || userInvited.user_id !== user.id) throw new Error('Registro não encontrado.');

    const sourceActiveGroup = await this.groupRepository.getActiveGroupById(userInvited.active_group_id);
    if (!sourceActiveGroup) throw new Error('Grupo ativo não encontrado.');

    const members = await this.groupRepository.getMembersForGroup(sourceActiveGroup.id);
    if (members.some(m => m.user_id === user.id && m.nome_completo.toLowerCase().trim() === user.nome_completo.toLowerCase().trim())) {
      throw new Error('Você já participa deste grupo, ative outro grupo.');
    }

    const existingPending = (await this.paymentRepository.getPaymentsPix()).find(p => 
      p.user_id === user.id && 
      p.target_id === sourceActiveGroup.id && 
      p.status === 'pendente' &&
      p.target_type === 'invite' &&
      p.invite_id === userInvited.invite_id
    );

    if (existingPending) {
      return { payment: existingPending };
    }

    try {
      const cleanCpf = user.cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        throw new Error('O seu CPF cadastrado não é válido. Por favor, entre em contato com o suporte para alterar');
      }

      const efiRes = await this.paymentProvider.createPixCharge({
        amount: sourceActiveGroup.valor_ativacao,
        cpf: cleanCpf,
        name: user.nome_completo
      });
      
      const paymentId = randomUUID();
      const newPayment: PaymentPix = {
        id: paymentId,
        user_id: user.id,
        nome_completo: user.nome_completo,
        target_id: sourceActiveGroup.id,
        target_type: 'invite',
        invite_id: userInvited.invite_id,
        txid: efiRes.txid,
        valor: sourceActiveGroup.valor_ativacao,
        status: 'pendente',
        qrcode: efiRes.qrcode,
        copia_cola: efiRes.copia_cola,
        created_at: new Date().toISOString()
      };
      
      await this.paymentRepository.addPaymentPix(newPayment);
      return { payment: newPayment };
    } catch (err: any) {
      throw new Error('Erro interno ao processar pagamento. ' + (err.message || ''));
    }
  }
}
