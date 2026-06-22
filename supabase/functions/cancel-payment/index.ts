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

    if (payment.user_id !== user.id) {
      return buildErrorResponse("UNAUTHORIZED", "Não autorizado", 403);
    }

    if (payment.status === "pendente") {
      try {
        const efiClient = new EfiClient();
        await efiClient.cancelPixCharge(payment.txid);
      } catch (err) {
        console.warn(
          "Efi Cancelamento não pode ser completado (pode já estar concluído)",
          err,
        );
      }

      const { data: updatedPayment, error } = await supabaseAdmin
        .from("payments_pix")
        .update({
          status: "cancelado",
        })
        .eq("id", payment_id)
        .select()
        .single();

      await logger.logAudit(
        user.id,
        "CANCEL_PIX",
        { payment_id, txid: payment.txid },
        req.headers.get("x-forwarded-for") || "",
      );

      return buildSuccessResponse(updatedPayment);
    }

    return buildErrorResponse(
      "INVALID_STATE",
      "Pagamento não está mais pendente e não pode ser cancelado",
    );
  } catch (error: any) {
    console.error("Cancel Pix Error:", error);
    return buildErrorResponse("INTERNAL_ERROR", error.message, 500);
  }
});
