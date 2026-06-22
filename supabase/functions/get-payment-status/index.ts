import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { validateToken } from "../shared/auth.ts";
import {
  buildErrorResponse,
  buildSuccessResponse,
} from "../shared/validators.ts";
import { supabaseAdmin } from "../shared/database.ts";

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

    // Assume id comes from search params e.g. /get-payment-status?id=123
    const url = new URL(req.url);
    const payment_id = url.searchParams.get("id");

    if (!payment_id) {
      return buildErrorResponse("INVALID_PAYLOAD", "payment_id is required");
    }

    const { data: payment } = await supabaseAdmin
      .from("payments_pix")
      .select("*")
      .eq("id", payment_id)
      .single();
    if (!payment)
      return buildErrorResponse(
        "PAYMENT_NOT_FOUND",
        "Pagamento não encontrado",
        404,
      );

    if (payment.user_id !== user.id) {
      return buildErrorResponse("UNAUTHORIZED", "Não autorizado", 403);
    }

    return buildSuccessResponse(payment);
  } catch (error: any) {
    console.error("Get Payment Status Error:", error);
    return buildErrorResponse("INTERNAL_ERROR", error.message, 500);
  }
});
