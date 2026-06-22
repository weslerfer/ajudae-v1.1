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

    const { target_id, target_type } = await req.json();

    if (!target_id || !target_type) {
      return buildErrorResponse(
        "INVALID_PAYLOAD",
        "target_id and target_type are required",
      );
    }

    // Load User Profile to get CPF and Name
    const { data: profile } = await supabaseAdmin
      .from("users_profile")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!profile || !profile.cpf) {
      return buildErrorResponse(
        "PROFILE_INCOMPLETE",
        "Complete o perfil com seu CPF",
      );
    }

    // Determine value based on target
    let amount = 0;
    if (target_type === "disponivel") {
      const { data: group } = await supabaseAdmin
        .from("groups")
        .select("*")
        .eq("id", target_id)
        .single();
      if (!group)
        return buildErrorResponse("NOT_FOUND", "Grupo não encontrado");
      amount = group.valor_ativacao;
    } else if (target_type === "invite") {
      const { data: activeGroup } = await supabaseAdmin
        .from("active_groups")
        .select("*")
        .eq("id", target_id)
        .single();
      if (!activeGroup)
        return buildErrorResponse("NOT_FOUND", "Grupo ativo não encontrado");
      amount = activeGroup.valor_ativacao;
    } else {
      return buildErrorResponse("INVALID_TARGET_TYPE", "Tipo de alvo inválido");
    }

    // Generate PIX
    const efiClient = new EfiClient();
    const pixData = await efiClient.createPixCharge(
      profile.cpf,
      profile.nome_completo,
      amount,
    );

    // Save to Database
    const { data: payment, error } = await supabaseAdmin
      .from("payments_pix")
      .insert({
        user_id: user.id,
        target_id,
        target_type,
        txid: pixData.txid,
        valor: amount,
        status: "pendente",
        qrcode: pixData.qrcode,
        copia_cola: pixData.copia_cola,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`DB Error: ${error.message}`);
    }

    await logger.logAudit(
      user.id,
      "CREATE_PIX",
      { payment_id: payment.id, txid: pixData.txid },
      req.headers.get("x-forwarded-for") || "",
    );

    return buildSuccessResponse(payment);
  } catch (error: any) {
    console.error("Create Pix Error:", error);
    return buildErrorResponse("INTERNAL_ERROR", error.message, 500);
  }
});
