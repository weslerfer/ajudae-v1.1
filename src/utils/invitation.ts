/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type InvitationState = 'new' | 'expiring' | 'urgent' | 'normal';

export interface InvitationVisuals {
  state: InvitationState;
  label: string;
  color: 'emerald' | 'amber' | 'red' | 'slate';
  message: string;
}

/**
 * Deterministic mock to generate visual states for invitations
 * based on the invite ID to ensure consistent rendering.
 * 
 * Future: This will be replaced by actual backend fields (e.g. expires_at).
 */
export function getInvitationVisualState(inviteId: string): InvitationVisuals {
  if (!inviteId) return { state: 'normal', label: 'Convite', color: 'slate', message: 'Disponível' };

  // Use a simple hash of the ID to deterministically assign a state
  let hash = 0;
  for (let i = 0; i < inviteId.length; i++) {
    hash = inviteId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const absHash = Math.abs(hash);
  const remainder = absHash % 100;

  if (remainder < 20) {
    return {
      state: 'new',
      label: 'Novo',
      color: 'emerald',
      message: 'Recebido recentemente'
    };
  }
  
  if (remainder < 40) {
    return {
      state: 'urgent',
      label: 'Urgente',
      color: 'red',
      message: 'Últimas vagas do grupo'
    };
  }

  if (remainder < 60) {
    return {
      state: 'expiring',
      label: 'Expira em Breve',
      color: 'amber',
      message: 'Válido por poucas horas'
    };
  }

  return {
    state: 'normal',
    label: 'Aguardando',
    color: 'slate',
    message: 'Convite pendente'
  };
}
