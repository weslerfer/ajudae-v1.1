import { getSupabaseClient } from '../../../supabase';
import { UserProfile } from '../../../../src/types'; // Assumindo tipagem compartilhada aqui ou depois migraremos

export class ProfileRepository {
  async getProfiles(match?: Partial<any>): Promise<UserProfile[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("users_profile").select("*");
    if (match) {
        query = query.match(match);
    }
    const { data } = await query;
    return (data || []).map((p: any) => ({
      id: p.id,
      nome_completo: p.nome_completo,
      cpf: p.cpf,
      cidade: p.cidade,
      estado: p.estado,
      telefone: p.telefone,
      email: p.email,
      chave_pix: p.chave_pix || undefined,
      banco_pix: p.banco_pix || undefined,
      is_admin: p.is_admin,
      created_at: p.created_at,
    }));
  }

  async getFirstAdminId(): Promise<string | undefined> {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const { data } = await client.from("users_profile").select("id").eq("is_admin", true).limit(1).single();
    return data?.id;
  }

  async getProfileById(id: string): Promise<UserProfile | undefined> {
    const profiles = await this.getProfiles({ id });
    return profiles[0];
  }

  async getProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const client = getSupabaseClient();
    if (!client) return undefined;
    const { data } = await client.from("users_profile").select("*").eq("email", email).single();
    if (!data) return undefined;
    return {
      id: data.id,
      nome_completo: data.nome_completo,
      cpf: data.cpf,
      cidade: data.cidade,
      estado: data.estado,
      telefone: data.telefone,
      email: data.email,
      chave_pix: data.chave_pix || undefined,
      banco_pix: data.banco_pix || undefined,
      is_admin: data.is_admin,
      created_at: data.created_at,
    };
  }

  async addProfile(profile: UserProfile): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client.from("users_profile").insert([{
      id: profile.id,
      nome_completo: profile.nome_completo,
      cpf: profile.cpf,
      cidade: profile.cidade,
      estado: profile.estado,
      telefone: profile.telefone,
      email: profile.email,
      chave_pix: profile.chave_pix,
      banco_pix: profile.banco_pix,
      is_admin: profile.is_admin,
      created_at: profile.created_at || new Date().toISOString()
    }]);
    if (error && error.code !== '23505') throw error;
  }

  async updateProfile(id: string, updates: Partial<UserProfile>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("users_profile").update(updates).eq("id", id);
  }
}
