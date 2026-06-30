import { PaymentRepository } from '../repositories/PaymentRepository';
import { GroupRepository } from '../../groups/repositories/GroupRepository';
import { ProfileRepository } from '../../users/repositories/ProfileRepository';
import { WalletRepository } from '../../wallets/repositories/WalletRepository';
import { NotificationRepository } from '../../notifications/repositories/NotificationRepository';
import { SystemRepository } from '../../shared/database/SystemRepository';
import { IPaymentProvider } from '../../shared/providers/IPaymentProvider';
import { QueueService } from '../../jobs/services/QueueService';
import { getSupabaseClient } from '../../../supabase';
import { UserProfile, PaymentPix, GroupMember, ActiveGroup, Invite } from '../../../../src/types';
import { randomUUID } from 'crypto';

export class PaymentUseCase {
  private paymentProcessingLocks = new Set<string>();

  constructor(
    private paymentRepository: PaymentRepository,
    private groupRepository: GroupRepository,
    private profileRepository: ProfileRepository,
    private walletRepository: WalletRepository,
    private notificationRepository: NotificationRepository,
    private systemRepository: SystemRepository,
    private paymentProvider: IPaymentProvider,
    private queueService: QueueService
  ) {}

  async createPayment(user: UserProfile, groupId: string) {
      const adminGroup = await this.groupRepository.getAdminGroupById(groupId);
      if (!adminGroup) throw new Error('Grupo disponível não encontrado.');

      const existingPayments = await this.paymentRepository.getPaymentsPix({
        user_id: user.id,
        target_id: groupId,
        status: 'pendente',
        target_type: 'disponivel'
      });

      if (existingPayments.length > 0) return { payment: existingPayments[0] };

      const cleanCpf = user.cpf.replace(/\D/g, '');
      if (cleanCpf.length !== 11) {
        throw new Error('O seu CPF cadastrado não é válido. Por favor, entre em contato com o suporte para alterar');
      }

      const efiRes = await this.paymentProvider.createPixCharge({
        amount: adminGroup.valor_ativacao,
        cpf: cleanCpf,
        name: user.nome_completo
      });
      
      const paymentId = randomUUID();
      const newPayment: PaymentPix = {
        id: paymentId,
        user_id: user.id,
        nome_completo: user.nome_completo,
        target_id: groupId,
        target_type: 'disponivel',
        txid: efiRes.txid,
        valor: adminGroup.valor_ativacao,
        status: 'pendente',
        qrcode: efiRes.qrcode,
        copia_cola: efiRes.copia_cola,
        created_at: new Date().toISOString()
      };

      await this.paymentRepository.addPaymentPix(newPayment);
      return { payment: newPayment };
  }

  async checkStatus(paymentId: string, userId: string) {
      let payment = await this.paymentRepository.getPaymentPixById(paymentId);
      if (!payment) throw new Error('Pagamento não encontrado.');
      if (payment.user_id !== userId) throw new Error('Acesso negado.');

      if (payment.status === 'pendente' && payment.txid) {
        const isPaid = await this.paymentProvider.checkPixStatus(payment.txid);
        if (isPaid) {
          await this.processPaymentSuccess(payment);
          const updatedPayment = await this.paymentRepository.getPaymentPixById(paymentId);
          if (updatedPayment) payment = updatedPayment;
        }
      } else if (payment.status === 'pago' && !payment.processed_at) {
        // O webhook já marcou como pago, mas o sistema ainda não ativou o grupo.
        await this.processPaymentSuccess(payment);
        const updatedPayment = await this.paymentRepository.getPaymentPixById(paymentId);
        if (updatedPayment) payment = updatedPayment;
      }
      return { payment };
  }

  async handleWebhook(pix: any[]) {
      await Promise.all(pix.map(async (item) => {
        try {
          const payment = await this.paymentRepository.getPaymentByTxid(item.txid);
          if (payment && payment.status === 'pendente') {
             const isPaid = await this.paymentProvider.checkPixStatus(item.txid);
             const client = getSupabaseClient();
             if (client) {
                await client.from('webhook_logs').insert({
                  txid: item.txid,
                  payment_id: payment.id,
                  payload: item,
                  status: isPaid ? 'success' : 'failed',
                  error_message: isPaid ? null : 'PixStatus result was false (Spoofed?)'
                });
             }

             if (isPaid) {
               await this.queueService.enqueue('payment-queue', 'process-payment-success', { payment });
               console.log(`[Webhook] Pagamento na fila para processamento. txid: ${item.txid}`);
             } else {
               console.log(`[Webhook Warning] Spoofed webhook detected for txid: ${item.txid}`);
             }
          }
        } catch (err) {
          console.error('[Webhook Error]', err);
        }
      }));
  }

  async processPaymentSuccess(payment: PaymentPix): Promise<{ success: boolean; error?: string }> {
    if ((payment as any).processed_at) {
      return { success: false, error: 'Este pagamento já foi processado anteriormente.' };
    }
    
    if (payment.status !== 'pendente' && payment.status !== 'pago') {
      return { success: false, error: 'O status do pagamento não permite processamento.' };
    }
    
    if (this.paymentProcessingLocks.has(payment.id)) {
      return { success: false, error: 'Este pagamento está sendo processado neste momento. Aguarde.' };
    }
    
    this.paymentProcessingLocks.add(payment.id);
    
    try {
      const isLocked = await this.paymentRepository.acquirePaymentLock(payment.id);
      if (!isLocked) {
        this.paymentProcessingLocks.delete(payment.id);
        return { success: false, error: 'Payment lock already acquired or not pending in DB.' };
      }

      const activatingUser = await this.profileRepository.getProfileById(payment.user_id);
      if (!activatingUser) {
        this.paymentProcessingLocks.delete(payment.id);
        return { success: false, error: 'Usuário do pagamento não encontrado.' };
      }

    let inheritedMembers: GroupMember[] = [];
    let groupName = '';
    let valorBase = 0;
    let valorAtivacao = 5 * valorBase;

    let originalGroupId = '';
    if (payment.target_type === 'disponivel') {
      const adminGroup = await this.groupRepository.getAdminGroupById(payment.target_id);
      if (!adminGroup) return { success: false, error: 'Grupo disponível de referência inexistente.' };
      inheritedMembers = await this.groupRepository.getMembersForGroup(adminGroup.id, 'admin');
      groupName = adminGroup.nome_grupo;
      valorBase = adminGroup.valor_base;
      valorAtivacao = adminGroup.valor_ativacao;
      originalGroupId = adminGroup.id;
    } else {
      const parentActiveGroup = await this.groupRepository.getActiveGroupById(payment.target_id);
      if (!parentActiveGroup) return { success: false, error: 'Grupo ativo de referência inexistente.' };
      inheritedMembers = await this.groupRepository.getMembersForGroup(parentActiveGroup.id);
      groupName = parentActiveGroup.nome_grupo;
      valorBase = parentActiveGroup.valor_base;
      valorAtivacao = parentActiveGroup.valor_ativacao;
      originalGroupId = parentActiveGroup.parent_id;
    }

    if (inheritedMembers.length < 4) {
      const systemAdminId = (await this.profileRepository.getProfiles())[0]?.id || randomUUID();
      const filledMembers = [...inheritedMembers];
      for (let i = filledMembers.length + 1; i <= 4; i++) {
              filledMembers.push({
          id: randomUUID(),
          user_id: systemAdminId,
          nome_completo: 'Sistema', 
          cidade: 'São Paulo', 
          estado: 'SP',
          position: i,
          joined_at: new Date().toISOString()
        });
      }
      inheritedMembers = filledMembers.sort((a,b) => a.position - b.position);
    }

    const shareValue = valorBase;
    let totalDistributed = 0;

    for (const member of inheritedMembers) {
      const existingTrx = await this.walletRepository.getTransactions({
        tipo: 'recebimento_grupo',
        user_id: member.user_id,
        related_user_id: activatingUser.id,
        related_group_id: payment.target_id
      });

      if (existingTrx.length === 0) {
        const trxDesc = `Voce recebeu R$ ${shareValue.toFixed(2)}! ${activatingUser.nome_completo} ativou o Grupo ${groupName} e você recebeu R$ ${shareValue.toFixed(2)}.`;

        await this.walletRepository.adjustWalletBalance(
          member.user_id,
          shareValue,
          {
            id: randomUUID(),
            user_id: member.user_id,
            related_user_id: activatingUser.id,
            related_group_id: payment.target_id,
            tipo: 'recebimento_grupo',
            valor: shareValue,
            descricao: trxDesc,
            created_at: new Date().toISOString()
          }
        );

        await this.queueService.enqueue('notification-queue', 'send-notification', { 
          notificationData: {
            id: randomUUID(),
            user_id: member.user_id,
            title: `Você recebeu R$ ${shareValue.toFixed(2)}`,
            message: `${activatingUser.nome_completo} ativou o grupo ${groupName} e você recebeu R$ ${shareValue.toFixed(2)} em sua carteira!`,
            tipo_referencia: 'pagamento_recebido',
            valor_referencia: shareValue,
            type: 'pagamento',
            created_at: new Date().toISOString()
          }
        });
      }
      totalDistributed += shareValue;
    }

    const platformFee = Number((valorAtivacao - totalDistributed).toFixed(2));
    await this.systemRepository.updatePlatformBalance(valorAtivacao, totalDistributed, platformFee);

    const activeGroupId = payment.id;
    const newActiveGroup: ActiveGroup = {
      id: activeGroupId,
      parent_id: originalGroupId,
      nome_grupo: groupName,
      valor_base: valorBase,
      valor_ativacao: valorAtivacao,
      status: 'ativo',
      created_at: new Date().toISOString(),
      activated_at: new Date().toISOString()
    };
    
    await this.groupRepository.addActiveGroup(newActiveGroup);

    const newMembersList = [
      {
        id: randomUUID(),
        user_id: inheritedMembers[1].user_id,
        active_group_id: activeGroupId,
        nome_completo: inheritedMembers[1].nome_completo,
        cidade: inheritedMembers[1].cidade,
        estado: inheritedMembers[1].estado,
        position: 1,
        joined_at: new Date().toISOString()
      },
      {
        id: randomUUID(),
        user_id: inheritedMembers[2].user_id,
        active_group_id: activeGroupId,
        nome_completo: inheritedMembers[2].nome_completo,
        cidade: inheritedMembers[2].cidade,
        estado: inheritedMembers[2].estado,
        position: 2,
        joined_at: new Date().toISOString()
      },
      {
        id: randomUUID(),
        user_id: inheritedMembers[3].user_id,
        active_group_id: activeGroupId,
        nome_completo: inheritedMembers[3].nome_completo,
        cidade: inheritedMembers[3].cidade,
        estado: inheritedMembers[3].estado,
        position: 3,
        joined_at: new Date().toISOString()
      },
      {
        id: randomUUID(),
        user_id: activatingUser.id,
        active_group_id: activeGroupId,
        nome_completo: activatingUser.nome_completo,
        cidade: activatingUser.cidade,
        estado: activatingUser.estado,
        position: 4,
        joined_at: new Date().toISOString()
      }
    ];

    await this.groupRepository.setGroupMembers(activeGroupId, newMembersList);

    const inviteCode = 'INV' + payment.id.substring(0, 6).toUpperCase();
    const inviteId = randomUUID();
    
    const existingInvite = await this.groupRepository.getInviteByCode(inviteCode);
    if (!existingInvite) {
      const newInvite: Invite = {
        id: inviteId,
        active_group_id: activeGroupId,
        inviter_user_id: activatingUser.id,
        invite_code: inviteCode,
        max_uses: 10,
        used_count: 0,
        created_at: new Date().toISOString()
      };
      await this.groupRepository.addInvite(newInvite);
    }

    if (payment.target_type === 'invite') {
      let inviteRecord: Invite | undefined = undefined;
      if (payment.invite_id) {
         const invites = await this.groupRepository.getInvites({ id: payment.invite_id });
         inviteRecord = invites[0];
      } else {
         const invites = await this.groupRepository.getInvites({ active_group_id: payment.target_id });
         inviteRecord = invites[0];
      }

      if (inviteRecord) {
        await this.groupRepository.updateInvite(inviteRecord.id, {
          used_count: inviteRecord.used_count + 1
        });

        await this.queueService.enqueue('notification-queue', 'send-notification', {
          notificationData: {
            id: randomUUID(),
            user_id: inviteRecord.inviter_user_id,
            title: 'Convidado Ativado ✅',
            message: `${activatingUser.nome_completo} ativou o grupo através de seu convite! Restam ${inviteRecord.max_uses - (inviteRecord.used_count + 1)} convites neste link.`,
            type: 'aviso',
            created_at: new Date().toISOString()
          }
        });
      }
      
      const uig = (await this.groupRepository.getUserInvitedGroups()).find((uig: any) => 
        uig.user_id === activatingUser.id && 
        (payment.invite_id ? uig.invite_id === payment.invite_id : uig.active_group_id === payment.target_id)
      );
      if (uig) {
        await this.groupRepository.deleteUserInvitedGroup(uig.id);
      }
    }

      await this.paymentRepository.updatePaymentStatus(payment.id, 'pago', new Date().toISOString());

      return { success: true };
    } catch (err: any) {
      console.error(`[ProcessPaymentSuccess] Fatal error processing payment ${payment.id}:`, err);
      await this.paymentRepository.updatePaymentStatus(payment.id, 'erro');
      return { success: false, error: err.message };
    } finally {
      this.paymentProcessingLocks.delete(payment.id);
    }
  }
}
