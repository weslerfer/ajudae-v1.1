import { getSupabaseClient } from '../../../supabase';

export class GroupRepository {
  async getAdminGroups(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("groups").select("*").order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data, error } = await query;
    if (error) console.error("Error fetching admin groups", error);
    return data || [];
  }

  async getAdminGroupById(id: string): Promise<any | undefined> {
    const groups = await this.getAdminGroups({ id });
    return groups[0];
  }

  async addAdminGroup(group: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client.from("groups").insert([{
      ...group,
      valor_base: Number(group.valor_base),
      valor_ativacao: Number(group.valor_ativacao)
    }]);
    if (error) throw error;
  }

  async updateAdminGroup(id: string, updates: Partial<any>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    if (updates.valor_base !== undefined) updates.valor_base = Number(updates.valor_base);
    if (updates.valor_ativacao !== undefined) updates.valor_ativacao = Number(updates.valor_ativacao);
    await client.from("groups").update(updates).eq("id", id);
  }

  async deleteAdminGroup(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("groups").delete().eq("id", id);
  }

  async getActiveGroups(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("active_groups").select("*, groups(nome_grupo, valor_base, valor_ativacao), members:active_group_members(*)").order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data } = await query;
    return (data || []).map((g: any) => ({
      ...g,
      nome_grupo: g.groups?.nome_grupo || g.nome_grupo || "Grupo Desconhecido",
      valor_base: Number(g.groups?.valor_base) || Number(g.valor_base) || 0,
      valor_ativacao: Number(g.groups?.valor_ativacao) || Number(g.valor_ativacao) || 0,
      members: g.members || []
    }));
  }

  async getActiveGroupById(id: string): Promise<any | undefined> {
    const groups = await this.getActiveGroups({ id });
    return groups[0];
  }

  async addActiveGroup(group: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client.from("active_groups").insert([{
      id: group.id,
      parent_id: group.parent_id,
      nome_grupo: group.nome_grupo,
      valor_base: group.valor_base,
      valor_ativacao: group.valor_ativacao,
      status: group.status,
      created_at: group.created_at || new Date().toISOString(),
      activated_at: group.activated_at || new Date().toISOString()
    }]);
    if (error && error.code !== '23505') throw error;
  }

  async getGroupMembers(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("active_group_members").select("*");
    if (match) query = query.match(match);
    const { data } = await query;
    return (data || []).map((m: any) => ({
      ...m,
      position: Number(m.position)
    }));
  }

  async getMembersForGroup(groupId: string, type: 'admin' | 'active' = 'active'): Promise<any[]> {
    const match = type === 'admin' ? { group_id: groupId } : { active_group_id: groupId };
    const members = await this.getGroupMembers(match);
    return members.sort((a, b) => a.position - b.position);
  }

  async setGroupMembers(groupId: string, members: any[]): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    // We delete from both possible relations to ensure clean slate for updates
    await client.from("active_group_members").delete().or(`group_id.eq.${groupId},active_group_id.eq.${groupId}`);
    if (members.length === 0) return;
    const inserts = members.map(m => ({
      ...m,
      position: Number(m.position),
      joined_at: m.joined_at || new Date().toISOString()
    }));
    const { error } = await client.from("active_group_members").insert(inserts);
    if (error) console.error("Error setting group members", error);
  }

  async getInvites(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("invites").select("*").order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data } = await query;
    return data || [];
  }

  async getInviteByCode(code: string): Promise<any | undefined> {
    const invites = await this.getInvites({ invite_code: code });
    return invites[0];
  }

  async addInvite(invite: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client.from("invites").insert([{
      id: invite.id,
      active_group_id: invite.active_group_id,
      inviter_user_id: invite.inviter_user_id,
      invite_code: invite.invite_code,
      used_count: Number(invite.used_count),
      max_uses: Number(invite.max_uses),
      created_at: invite.created_at || new Date().toISOString()
    }]);
    if (error && error.code !== '23505') throw error;
  }

  async updateInvite(id: string, updates: Partial<any>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("invites").update(updates).eq("id", id);
  }

  async getUserInvitedGroups(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("user_invited_groups").select("*").order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data, error } = await query;
    if (error) console.error("Error fetching user_invited_groups:", error);
    return data || [];
  }

  async addUserInvitedGroup(group: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client.from("user_invited_groups").insert([{
      ...group
    }]);
    if (error && error.code !== '23505') throw error;
  }

  async deleteUserInvitedGroup(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("user_invited_groups").delete().eq("id", id);
  }
}
