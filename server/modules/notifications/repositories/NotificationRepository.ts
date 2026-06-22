import { getSupabaseClient } from '../../../supabase';

export class NotificationRepository {
  async getNotifications(): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await client.from("system_notifications").select("*").order("created_at", { ascending: false });
    return data || [];
  }

  async getUserNotifications(userId: string): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    try {
        const { data } = await client.from("system_notifications")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });
        return data || [];
    } catch (e) {
        console.error("Error fetching notifications for user", userId, e);
        return [];
    }
  }

  async addNotification(n: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    try {
        await client.from("system_notifications").insert([{
            id: n.id,
            user_id: n.user_id,
            title: n.title,
            message: n.message,
            type: n.type,
            read: n.read || false,
            created_at: n.created_at || new Date().toISOString()
        }]);
    } catch (e) {
        console.error("Error adding notification", n, e);
    }
  }

  async markNotificationRead(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("system_notifications").update({ read: true }).eq("id", id);
  }

  // Integrado aqui as System/Admin messages que tambem sao tipo de aviso/notificacao do sistema
  async getAdminMessages(): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await client.from("admin_messages").select("*").order("created_at", { ascending: false });
    return data || [];
  }

  async createAdminMessage(m: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("admin_messages").insert([m]);
  }

  async updateAdminMessage(id: string, updates: Partial<any>): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("admin_messages").update(updates).eq("id", id);
  }

  async deleteAdminMessage(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("admin_messages").delete().eq("id", id);
  }
}
