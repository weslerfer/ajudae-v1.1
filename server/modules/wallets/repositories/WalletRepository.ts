import { getSupabaseClient } from '../../../supabase';

export class WalletRepository {
  async getWallets(): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    const { data } = await client.from("wallet").select("*");
    return data || [];
  }

  async getOrCreateWallet(userId: string): Promise<any> {
    const client = getSupabaseClient();
    if (!client) return { user_id: userId, saldo_atual: 0, updated_at: new Date().toISOString() };

    const { data, error } = await client.from("wallet").select("*").eq("user_id", userId).single();
    if (error || !data) {
        const newWallet = { 
            user_id: userId, 
            saldo_atual: 0,
        };
        const { error: insertError } = await client.from("wallet").insert([newWallet]);
        if (insertError) {
             console.error("[Wallet] Insert Error:", insertError);
             throw new Error("Erro ao criar carteira: " + insertError.message);
        }
        return newWallet;
    }
    return data;
  }

  async adjustWalletBalance(userId: string, amount: number, tx: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const wallet = await this.getOrCreateWallet(userId);
    const newBalance = Number(wallet.saldo_atual) + amount;
    
    const { error: updateError } = await client.from("wallet").update({ 
        saldo_atual: newBalance, 
    }).eq("user_id", userId);
    
    if (updateError) {
        console.error("[Wallet] Update Error:", updateError);
        throw new Error("Erro ao atualizar saldo: " + updateError.message);
    }

    tx.balance_after = newBalance;
    const { error: txError } = await client.from("wallet_transactions").insert([{
        id: tx.id,
        user_id: tx.user_id,
        tipo: tx.tipo,
        valor: Number(tx.valor),
        descricao: tx.descricao,
        balance_after: Number(tx.balance_after),
        group_id: tx.group_id,
        payment_id: tx.payment_id,
        withdrawal_id: tx.withdrawal_id,
        created_at: tx.created_at || new Date().toISOString(),
    }]);
    
    if (txError) {
        console.error("[Wallet] Transaction Insert Error:", txError);
        // We log but don't strictly rollback wallets as Supabase JS doesn't support transactions easily without RPC, but we can throw to alert.
        throw new Error("Erro ao registrar transação: " + txError.message);
    }
  }

  async getTransactions(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client.from("wallet_transactions")
      .select("*, users_profile(nome_completo)")
      .order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data } = await query;
    return (data || []).map((t: any) => ({
      id: t.id,
      user_id: t.user_id,
      nome_completo: t.users_profile?.nome_completo || "Sistema / Usuário",
      tipo: t.tipo,
      valor: Number(t.valor),
      descricao: t.descricao,
      balance_after: t.balance_after,
      group_id: t.group_id,
      payment_id: t.payment_id,
      withdrawal_id: t.withdrawal_id,
      created_at: t.created_at,
    }));
  }

  async getUserTransactions(userId: string): Promise<any[]> {
    return this.getTransactions({ user_id: userId });
  }

  async getWithdrawals(match?: Partial<any>): Promise<any[]> {
    const client = getSupabaseClient();
    if (!client) return [];
    let query = client
      .from("withdrawals")
      .select("id, user_id, valor, status, transaction_id, created_at, processed_at, motivo_rejeicao, users_profile(nome_completo, chave_pix, banco_pix)")
      .order("created_at", { ascending: false });
    if (match) query = query.match(match);
    const { data } = await query;

    return (data || []).map((w: any) => ({
      ...w,
      valor: Number(w.valor),
      nome_completo: w.users_profile?.nome_completo || "Usuário",
      chave_pix: w.users_profile?.chave_pix || "Chave não cadastrada",
      banco_pix: w.users_profile?.banco_pix || "Banco não informado"
    }));
  }

  async processWithdrawalRequest(
    user: any,
    numValor: number,
  ): Promise<{
    success: boolean;
    error?: string;
    withdrawal?: any;
    transaction?: any;
  }> {
    const client = getSupabaseClient();
    if (!client) return { success: false, error: "Database not initialized" };

    try {
      const { data, error } = await client.rpc("request_withdrawal", {
        p_user_id: user.id,
        p_amount: numValor,
        p_pix_key: user.chave_pix || "",
        p_bank: user.banco_pix || "",
        p_full_name: user.nome_completo,
      });

      if (error) {
        console.error("[DB] request_withdrawal supabase rpc error:", error);
        return { success: false, error: "Falha interna ao processar o saque." };
      }

      if (!data.success) {
        return { success: false, error: data.error };
      }

      return {
        success: true,
        withdrawal: {
          id: data.withdrawal_id,
          user_id: user.id,
          nome_completo: user.nome_completo,
          valor: numValor,
          chave_pix: user.chave_pix || "",
          banco_pix: user.banco_pix || "",
          status: "pendente",
          created_at: new Date().toISOString(),
          transaction_id: data.transaction_id,
        },
        transaction: {
           id: data.transaction_id,
           user_id: user.id,
           tipo: "saque_solicitado",
           valor: -numValor,
           descricao: "Saque Solicitado",
           created_at: new Date().toISOString()
        }
      };
    } catch (err: any) {
      console.error("[DB] processWithdrawalRequest error:", err);
      return { success: false, error: "Erro de sistema ao processar saque." };
    }
  }

  async addWithdrawal(w: any): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("withdrawals").insert([{
      id: w.id,
      user_id: w.user_id,
      valor: Number(w.valor),
      status: w.status,
      transaction_id: w.transaction_id,
      created_at: w.created_at || new Date().toISOString()
    }]);
  }

  async updateWithdrawalStatus(id: string, status: string, processedAt?: string, motivoRejeicao?: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    const updateData: any = { status };
    if (processedAt) updateData.processed_at = processedAt;
    if (motivoRejeicao !== undefined) updateData.motivo_rejeicao = motivoRejeicao;
    await client.from("withdrawals").update(updateData).eq("id", id);
  }

  async deleteWithdrawal(id: string): Promise<void> {
    const client = getSupabaseClient();
    if (!client) return;
    await client.from("withdrawals").delete().eq("id", id);
  }
}
