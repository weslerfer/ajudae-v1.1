import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { supabaseAdmin } from "../shared/database.ts";
import { logger } from "../shared/logger.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const body = await req.json();

    // Efí validates endpoints by sending an empty `pix` array or an empty object initially.
    // They expect a 200 OK immediately for validation.
    if (Object.keys(body).length === 0 || (body.pix && body.pix.length === 0)) {
      return new Response("OK", { status: 200 });
    }

    // Process actual Pix webhook payload
    const pixArray = body.pix || [];

    for (const pix of pixArray) {
      if (pix.txid) {
        const txid = pix.txid;

        // Check idempotency: Have we already processed this txid?
        const { data: existingPayment } = await supabaseAdmin
          .from("payments_pix")
          .select("*")
          .eq("txid", txid)
          .single();

        if (existingPayment) {
          if (existingPayment.status === "pendente") {
            await supabaseAdmin
              .from("payments_pix")
              .update({
                status: "pago",
                paid_at: pix.horario || new Date().toISOString(),
              })
              .eq("txid", txid);

            await logger.logWebhook(pix, "success", txid, existingPayment.id);
            // Pós-processamento: a ativação das assinaturas / grupos poderia ser acionada via DB Trigger no update do `status` para `pago`,
            // ou integrando diretamente aqui chamando uma função SQL ou processamento adicional.
            await logger.logAudit(
              undefined,
              "ACTIVATE_GROUP_FROM_PIX_WEBHOOK",
              { payment_id: existingPayment.id },
            );
          } else {
            // Already processed (idempotency safety)
            await logger.logWebhook(
              pix,
              "idempotent_skip",
              txid,
              existingPayment.id,
            );
          }
        } else {
          await logger.logWebhook(
            pix,
            "failed",
            txid,
            undefined,
            "TXID not found in db",
          );
        }
      }
    }

    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    await logger.logWebhook({}, "error", undefined, undefined, error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
