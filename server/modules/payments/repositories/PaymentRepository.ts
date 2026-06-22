import { getSupabaseClient } from '../../../supabase';

export class PaymentRepository {
  async getPaymentsPix(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client
      .from("payments_pix")
      .select("*, users_profile(nome_completo)")
      .order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data } = await query;
    return (data || []).map((p: any) => ({
      id: p.id,
      user_id: p.user_id,
      nome_completo: p.users_profile?.nome_completo || "Pagador",
      target_id: p.target_id,
      target_type: p.target_type,
      txid: p.txid,
      valor: Number(p.valor),
      status: p.status,
      qrcode: p.qrcode,
      copia_cola: p.copia_cola,
      created_at: p.created_at,
      processed_at: p.processed_at,
      invite_id: p.invite_id,
    }));
  }

  async addPaymentPix(p: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const { error } = await client.from("payments_pix").insert([{
      id: p.id,
      user_id: p.user_id,
      target_id: p.target_id,
      target_type: p.target_type,
      txid: p.txid,
      valor: Number(p.valor),
      status: p.status,
      qrcode: p.qrcode,
      copia_cola: p.copia_cola,
      created_at: p.created_at,
      invite_id: p.invite_id,
    }]);
    if (error && error.code !== '23505') throw error;
  }

  async getPaymentPixById(id: string): Promise<any | undefined> {
    const payments = await this.getPaymentsPix({ id });
    return payments[0];
  }

  async getPaymentByTxid(txid: string): Promise<any | undefined> {
    const payments = await this.getPaymentsPix({ txid });
    return payments[0];
  }

  async updatePaymentStatus(id: string, status: string, processedAt?: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const updateData: any = { status };
    if (processedAt) updateData.processed_at = processedAt;
    await client.from("payments_pix").update(updateData).eq("id", id);
  }

  async acquirePaymentLock(id: string): Promise<boolean> {
    const client = getSupabaseClient();
    if (!client) return false;
    const { data, error } = await client.from("payments_pix")
        .update({ locked_at: new Date().toISOString() })
        .eq("id", id)
        .is("locked_at", null)
        .select("id");
    return !error && data && data.length > 0;
  }

  async deletePaymentPix(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("payments_pix").delete().eq("id", id);
  }
}
