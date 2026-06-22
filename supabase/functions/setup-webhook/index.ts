import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { EfiClient } from "../shared/efi-client.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const url = new URL(req.url);
    
    // Obter o ID do projeto Supabase a partir da variável que o próprio Supabase injeta
    // SUPABASE_URL é default em toda function
    const projectUrl = Deno.env.get('SUPABASE_URL');
    
    if (!projectUrl) {
      throw new Error("SUPABASE_URL não encontrada no ambiente.");
    }

    let targetWebhookUrl = `${projectUrl}/functions/v1/efi-webhook`;

    // Se você quiser passar uma url manualmente na query string: ?url=https://minha-url.com
    if (url.searchParams.has('url')) {
        targetWebhookUrl = url.searchParams.get('url')!;
    }

    const efiClient = new EfiClient();
    await efiClient.configureWebhook(targetWebhookUrl);

    return new Response(JSON.stringify({
        success: true,
        message: "Webhook configurado com sucesso na Efí!",
        webhookUrl: targetWebhookUrl
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
     return new Response(JSON.stringify({ 
         success: false, 
         error: error.message || "Erro desconhecido ao configurar webhook" 
     }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
});
