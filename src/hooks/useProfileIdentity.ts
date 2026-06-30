/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useMemo } from 'react';
import { UserProfile } from '../types';

export interface AccountHealth {
  emailVerificado: boolean;
  telefoneConfirmado: boolean;
  documentoValidado: boolean;
  doisFatoresAtivo: boolean;
  fotoPerfil: boolean;
  score: number; // 0 to 100
}

export interface SecuritySummary {
  ultimaSenhaAlterada: string;
  sessoesAtivas: number;
  dispositivosConectados: number;
}

export interface ActivitySummary {
  gruposAtivos: number;
  convitesRecebidos: number;
  movimentacoesRecentes: number;
  ultimoAcesso: string;
}

export interface IdentityProfile {
  user: UserProfile;
  papel: string;
  statusConta: 'Ativa' | 'Restrita' | 'Pendente';
  health: AccountHealth;
  security: SecuritySummary;
  activity: ActivitySummary;
}

export function useProfileIdentity(user: UserProfile | null): IdentityProfile | null {
  return useMemo(() => {
    if (!user) return null;

    // Determine Role
    let papel = 'Membro Colaborador';
    if (user.is_admin) papel = 'Administrador do Sistema';

    // Determine Status
    // Based on whether they have basic info.
    let statusConta: 'Ativa' | 'Restrita' | 'Pendente' = 'Ativa';
    if (!user.telefone) statusConta = 'Pendente';

    // Calculate Health
    const emailVerificado = !!user.email;
    const telefoneConfirmado = !!user.telefone;
    const documentoValidado = false; // Mock for future KYC validation
    const doisFatoresAtivo = false; // Mock for future 2FA
    const fotoPerfil = false; // We don't have avatar field in UserProfile yet, so false.

    let score = 0;
    if (emailVerificado) score += 20;
    if (telefoneConfirmado) score += 20;
    if (documentoValidado) score += 20;
    if (doisFatoresAtivo) score += 20;
    if (fotoPerfil) score += 20;

    const health: AccountHealth = {
      emailVerificado,
      telefoneConfirmado,
      documentoValidado,
      doisFatoresAtivo,
      fotoPerfil,
      score,
    };

    // Mocks for Security (Awaiting backend implementation)
    const security: SecuritySummary = {
      ultimaSenhaAlterada: 'Há 3 meses',
      sessoesAtivas: 1,
      dispositivosConectados: 1,
    };

    // Mocks for Activity (Awaiting backend implementation)
    // We could fetch these from context, but per spec this is a placeholder mock.
    const activity: ActivitySummary = {
      gruposAtivos: 2, // Mock deterministic
      convitesRecebidos: 1,
      movimentacoesRecentes: 5,
      ultimoAcesso: new Date().toISOString(),
    };

    return {
      user,
      papel,
      statusConta,
      health,
      security,
      activity,
    };
  }, [user]);
}
