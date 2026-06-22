/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface UserInvitedGroup {
  id: string;
  user_id: string;
  invite_code: string;
  invite_id: string;
  active_group_id: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  chave_pix?: string;
  banco_pix?: string;
  is_admin: boolean;
  created_at: string;
}

export type GroupStatus = 'disponivel' | 'ativo' | 'aguardando_ativacao';

export interface AdminGroup {
  id: string;
  nome_grupo: string;
  valor_base: number;
  valor_ativacao: number;
  status: 'disponivel';
  created_at: string;
  // List of first 4 dummy participants or assigned users (Positions 1 to 4)
  initial_members?: {
    position: number;
    user_id: string;
    nome_completo: string;
    cidade: string;
    estado: string;
  }[];
}

export interface ActiveGroup {
  id: string;
  parent_id: string; // The original group created by admin
  nome_grupo: string;
  valor_base: number;
  valor_ativacao: number;
  status: 'ativo';
  created_at: string;
  activated_at: string;
}

export interface GroupMember {
  id: string;
  group_id?: string; // If in AdminGroup (Coluna A)
  active_group_id?: string; // If in ActiveGroup (Coluna B)
  user_id: string;
  nome_completo: string;
  cidade: string;
  estado: string;
  position: number; // 1, 2, 3, 4
  joined_at: string;
}

export interface Invite {
  id: string;
  active_group_id: string; // Belongs to an active group of the inviter
  inviter_user_id: string;
  invite_code: string;
  max_uses: number; // 10
  used_count: number;
  created_at: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  saldo_atual: number;
  updated_at: string;
}

export type TransactionType = 
  | 'entrada' 
  | 'saida' 
  | 'saque' 
  | 'ajuste_admin_adicao' 
  | 'ajuste_admin_subtracao' 
  | 'taxa_plataforma' 
  | 'recebimento_grupo';

export interface WalletTransaction {
  id: string;
  user_id: string;
  tipo: TransactionType;
  valor: number;
  descricao: string;
  related_user_id?: string | null;
  related_group_id?: string | null;
  created_at: string;
}

export type WithdrawalStatus = 'pendente' | 'aprovado' | 'rejeitado' | 'excluido';

export interface Withdrawal {
  id: string;
  user_id: string;
  nome_completo: string; // Cache for easy list
  valor: number;
  chave_pix: string;
  banco_pix?: string;
  status: WithdrawalStatus;
  created_at: string;
  processed_at?: string | null;
  transaction_id?: string;
  motivo_rejeicao?: string;
}

export type PixStatus = 'pendente' | 'pago' | 'cancelado' | 'processando' | 'erro';

export interface PaymentPix {
  id: string;
  user_id: string;
  nome_completo: string;
  target_id: string;
  target_type: 'disponivel' | 'invite';
  invite_id?: string | null;
  txid: string;
  valor: number;
  status: PixStatus;
  qrcode: string;
  copia_cola: string;
  created_at: string;
  paid_at?: string | null;
}

export interface SystemNotification {
  id: string;
  user_id: string;
  titulo: string;
  mensagem: string;
  valor?: number | null;
  is_read: boolean;
  created_at: string;
  admin_message_id?: string;
  tipo?: 'bell' | 'popup';
}

export interface AdminMessage {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: 'bell' | 'popup';
  created_at: string;
}

export interface PlatformBalance {
  id: string;
  total_recebido: number;
  total_distribuido: number;
  total_lucro: number;
  updated_at: string;
}
