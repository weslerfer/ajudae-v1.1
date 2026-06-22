import { supabaseAdmin } from "./database.ts";

export const logger = {
  async logAudit(
    userId: string | undefined,
    action: string,
    details: any,
    ipAddress?: string,
  ) {
    console.log(`[AUDIT] ${action}: `, details);
    try {
      await supabaseAdmin.from("audit_logs").insert({
        user_id: userId,
        action,
        details,
        ip_address: ipAddress,
      });
    } catch (e) {
      console.error("Failed to log audit event", e);
    }
  },

  async logWebhook(
    payload: any,
    status: string,
    txid?: string,
    paymentId?: string,
    errorMessage?: string,
  ) {
    console.log(`[WEBHOOK] ${status} for ${txid}: `, errorMessage || "");
    try {
      await supabaseAdmin.from("webhook_logs").insert({
        txid,
        payment_id: paymentId,
        payload,
        status,
        error_message: errorMessage,
      });
    } catch (e) {
      console.error("Failed to log webhook event", e);
    }
  },
};
