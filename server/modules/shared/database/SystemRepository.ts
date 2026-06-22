import { getSupabaseClient } from '../../../supabase';

export class SystemRepository {
  async getPlatformBalance(): Promise<any> {
    const client = getSupabaseClient();
    if (!client) return { total_earnings: 0, pending_withdrawals: 0, balance: 0, last_updated: new Date().toISOString() };
    const { data } = await client.from("platform_balance").select("*").single();
    return data || { total_earnings: 0, pending_withdrawals: 0, balance: 0, last_updated: new Date().toISOString() };
  }

  async updatePlatformBalance(received: number, distributed: number, profit: number): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;

    // Call atomic RPC
    const { error } = await client.rpc('increment_platform_balance', {
      p_received: received,
      p_distributed: distributed,
      p_profit: profit
    });

    if (error) {
       console.error('[Platform Balance] Fallback to read-modify-udpate due to RPC fail (Migration missing?):', error);
       const current = await this.getPlatformBalance();
       await client.from("platform_balance").upsert({
         id: "platform",
         total_recebido: Number((current.total_recebido + received).toFixed(2)),
         total_distribuido: Number(
           (current.total_distribuido + distributed).toFixed(2),
         ),
         total_lucro: Number((current.total_lucro + profit).toFixed(2)),
         updated_at: new Date().toISOString(),
       });
    }
  }
}
