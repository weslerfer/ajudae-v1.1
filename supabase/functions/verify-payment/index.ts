import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { validateToken } from "../shared/auth.ts";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../shared/validators.ts";
import { EfiClient } from "../shared/efi-client.ts";
import { supabaseAdmin } from "../shared/database.ts";
import { logger } from "../shared/logger.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    const user = await validateToken(authHeader);

    const { payment_id } = await req.json();
    if (!payment_id) {
      return buildErrorResponse("INVALID_PAYLOAD", "payment_id is required");
    }

    const { data: payment } = await supabaseAdmin
      .from("payments_pix")
      .select("*")
      .eq("id", payment_id)
      .single();
    if (!payment)
      return buildErrorResponse("NOT_FOUND", "Pagamento não encontrado", 404);

    if (payment.status === "pendente") {
      const efiClient = new EfiClient();
      const pixStatus = await efiClient.checkPixStatus(payment.txid);

      if (pixStatus.status === "CONCLUIDA") {
        const { data: updatedPayment, error } = await supabaseAdmin
          .from("payments_pix")
          .update({
            status: "pago",
            paid_at: new Date().toISOString(),
          })
          .eq("id", payment_id)
          .select()
          .single();

        await logger.logAudit(
          user.id,
          "VERIFY_PIX_UPDATE",
          { payment_id, txid: payment.txid, status: "pago" },
          req.headers.get("x-forwarded-for") || "",
        );

        return buildSuccessResponse(updatedPayment);
      }
    }

    return buildSuccessResponse(payment);
  } catch (error: any) {
    console.error("Verify Pix Error:", error);
    return buildErrorResponse("INTERNAL_ERROR", error.message, 500);
  }
});
