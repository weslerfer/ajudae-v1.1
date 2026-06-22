/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { 
  UserProfile, 
  AdminGroup, 
  ActiveGroup, 
  GroupMember, 
  Invite,
  UserInvitedGroup, 
  Wallet, 
  WalletTransaction, 
  Withdrawal, 
  PaymentPix, 
  SystemNotification, 
  PlatformBalance,
  AdminMessage
} from '../src/types';

dotenv.config();

let supabaseInstance: SupabaseClient | null = null;

/**
 * Lazily initializes and returns the Supabase Client.
 * Falls back gracefully to null if credentials are not provided.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!url || !key) {
    return null;
  }

  try {
    supabaseInstance = createClient(url, key, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('[Supabase] Client initialized successfully.');
    return supabaseInstance;
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err);
    return null;
  }
}

/**
 * Checks if Supabase connection is fully configured.
 */
export function isSupabaseConfigured(): boolean {
  return getSupabaseClient() !== null;
}

/**
 * Registers a user in Supabase Auth and inserts the profile inside 'users_profile'
 */
export async function registerAuthUserInSupabase(data: {
  id?: string;
  nome_completo: string;
  cpf: string;
  cidade: string;
  estado: string;
  telefone: string;
  email: string;
  senha: string;
}): Promise<UserProfile | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  console.log(`[Supabase Auth] Registering user ${data.email} in Supabase Auth`);

  try {
    // 1. Check if user already exists
    const { data: userCheck } = await client.from('users_profile').select('id').eq('email', data.email).maybeSingle();
    if (userCheck) {
      throw new Error('Endereço de e-mail já cadastrado no Supabase.');
    }

    const { data: cpfCheck } = await client.from('users_profile').select('id').eq('cpf', data.cpf).maybeSingle();
    if (cpfCheck) {
      throw new Error('Este CPF já está cadastrado em outra conta. Por favor, utilize outro CPF.');
    }

    // 2. Register user in Supabase Auth
    // Use admin.createUser if service role is available (cleanest, bypasses email verification)
    const canUseAdminAPI = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0);
    
    let authUser: any = null;

    if (canUseAdminAPI) {
      const { data: authData, error: authError } = await client.auth.admin.createUser({
        email: data.email,
        password: data.senha,
        email_confirm: true,
        user_metadata: {
          nome_completo: data.nome_completo,
          cpf: data.cpf,
          cidade: data.cidade,
          estado: data.estado,
          telefone: data.telefone
        }
      });

      if (authError) {
        throw new Error(`Erro ao criar conta de autenticação (Admin API): ${authError.message}`);
      }
      authUser = authData.user;
    } else {
      // Fallback to standard signUp
      const { data: authData, error: authError } = await client.auth.signUp({
        email: data.email,
        password: data.senha,
        options: {
          data: {
            nome_completo: data.nome_completo,
            cpf: data.cpf,
            cidade: data.cidade,
            estado: data.estado,
            telefone: data.telefone
          }
        }
      });

      if (authError) {
        throw new Error(`Erro ao criar conta de autenticação (Sign Up API): ${authError.message}`);
      }
      authUser = authData.user;
    }

    if (!authUser) {
      throw new Error('Falha ao obter objeto de usuário cadastrado do Supabase.');
    }

    // 3. Confirm profile exists in public.users_profile.
    // If the DB trigger was run, it should already be there. Just in case it's not or query failed, we check.
    const userId = authUser.id;
    let { data: profile } = await client.from('users_profile').select('*').eq('id', userId).maybeSingle();

    if (!profile) {
      console.log('[Supabase Auth] DB trigger did not create users_profile. Manually creating profile...');
      const isAdmin = false;
      const { data: inserted, error: insertError } = await client.from('users_profile').insert({
        id: userId,
        nome_completo: data.nome_completo,
        cpf: data.cpf,
        cidade: data.cidade,
        estado: data.estado,
        telefone: data.telefone,
        email: data.email,
        is_admin: isAdmin,
        created_at: new Date().toISOString()
      }).select().single();

      if (insertError) {
        throw new Error(`Erro ao salvar perfil do usuário: ${insertError.message}`);
      }
      profile = inserted;

      // Manually create wallet too
      await client.from('wallet').insert({
        user_id: userId,
        saldo_atual: 0.00
      });
    }

    return {
      id: profile.id,
      nome_completo: profile.nome_completo,
      cpf: profile.cpf,
      cidade: profile.cidade,
      estado: profile.estado,
      telefone: profile.telefone,
      email: profile.email,
      is_admin: profile.is_admin,
      chave_pix: profile.chave_pix || undefined,
      created_at: profile.created_at
    };
  } catch (err: any) {
    console.error('[Supabase Auth] Registration error:', err.message);
    throw err;
  }
}

/**
 * Authenticates a user in Supabase Auth and returns their profile
 */
export async function loginUserInSupabase(credentials: {
  email: string;
  senha_suporte_plain?: string; // plane text we bypass to check if we can signIn
}): Promise<{ user: UserProfile; token: string } | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  console.log(`[Supabase Auth] Attempting login for user ${credentials.email}`);

  try {
    const url = process.env.SUPABASE_URL || '';
    const anonKey = process.env.SUPABASE_ANON_KEY || '';
    const tempClient = createClient(url, anonKey, { auth: { persistSession: false } });

    const { data: authData, error: authError } = await tempClient.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.senha_suporte_plain || ''
    });

    if (authError) {
      throw new Error(`E-mail ou senha inválidos no Supabase: ${authError.message}`);
    }

    const { user: authUser, session } = authData;
    if (!authUser) {
      throw new Error('Falha na obtenção do usuário autenticado.');
    }

    // Query profile from database
    const { data: profile, error: profileErr } = await client
      .from('users_profile')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();

    if (profileErr || !profile) {
      // If profile is missing (e.g. trigger didn't run), create it
      console.log(`[Supabase Auth] Profile missing for logged-in user ${authUser.id}. Re-creating...`);
      const isAdmin = false;
      const { data: inserted } = await client.from('users_profile').insert({
        id: authUser.id,
        nome_completo: authUser.user_metadata?.nome_completo || 'Usuário',
        cpf: authUser.user_metadata?.cpf || '000.000.000-00',
        cidade: authUser.user_metadata?.cidade || 'Mogi das Cruzes',
        estado: authUser.user_metadata?.estado || 'SP',
        telefone: authUser.user_metadata?.telefone || '(11) 90000-0000',
        email: credentials.email,
        is_admin: isAdmin,
        created_at: new Date().toISOString()
      }).select().single();

      // Create matching wallet too if missing
      await client.from('wallet').upsert({ user_id: authUser.id, saldo_atual: 0.00 });

      return {
        user: {
          id: authUser.id,
          nome_completo: inserted?.nome_completo || 'Usuário',
          cpf: inserted?.cpf || '000.000.000-00',
          cidade: inserted?.cidade || 'Mogi das Cruzes',
          estado: inserted?.estado || 'SP',
          telefone: inserted?.telefone || '(11) 90000-0000',
          email: credentials.email,
          is_admin: isAdmin,
          created_at: new Date().toISOString()
        },
        token: session?.access_token || authUser.id
      };
    }

    return {
      user: {
        id: profile.id,
        nome_completo: profile.nome_completo,
        cpf: profile.cpf,
        cidade: profile.cidade,
        estado: profile.estado,
        telefone: profile.telefone,
        email: profile.email,
        is_admin: profile.is_admin,
        chave_pix: profile.chave_pix || undefined,
        created_at: profile.created_at
      },
      token: session?.access_token || profile.id
    };
  } catch (err: any) {
    console.error('[Supabase Auth] Login error:', err.message);
    throw err;
  }
}

/**
 * Updates a password inside Supabase Auth
 */
export async function updatePasswordInSupabase(userId: string, newPassword: string): Promise<boolean> {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const canUseAdminAPI = (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY.length > 0);
    if (canUseAdminAPI) {
      const { error } = await client.auth.admin.updateUserById(userId, { password: newPassword });
      if (error) throw error;
    } else {
      console.warn('[Supabase Auth] Cannot update password without Service Role Key.');
      return false;
    }
    return true;
  } catch (err: any) {
    console.error('[Supabase Auth] Password update error:', err.message);
    return false;
  }
}

