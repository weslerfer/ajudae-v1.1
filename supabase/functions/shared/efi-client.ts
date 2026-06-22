import { EfiConfig } from "./types.ts";

export class EfiClient {
  private config: EfiConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor() {
    this.config = {
      clientId: Deno.env.get("EFI_CLIENT_ID") || "",
      clientSecret: Deno.env.get("EFI_CLIENT_SECRET") || "",
      pixKey: Deno.env.get("EFI_PIX_KEY") || "",
      certContent: Deno.env.get("EFI_CERTIFICATE_CERT") || "",
      keyContent: Deno.env.get("EFI_CERTIFICATE_KEY") || "",
      sandbox: Deno.env.get("EFI_ENV") !== "producao",
    };
  }

  private get baseUrl() {
    return this.config.sandbox
      ? "https://pix-h.api.efipay.com.br"
      : "https://pix.api.efipay.com.br";
  }

  private async getClient() {
    if (!this.config.certContent || !this.config.keyContent) return undefined;

    // Attempting mTLS via Deno's createHttpClient if supported in the environment
    try {
      // NOTE: Supabase Edge Functions might require specific handling for MTLS.
      // Deno createHttpClient usage with mtls:
      return Deno.createHttpClient({
        cert: this.config.certContent.replace(/\\n/g, '\n'),
        key: this.config.keyContent.replace(/\\n/g, '\n'),
      });
    } catch (e) {
      console.warn("Could not create HTTPS client with mTLS", e);
      return undefined;
    }
  }

  private async authenticate() {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const authHeader = btoa(
      `${this.config.clientId}:${this.config.clientSecret}`,
    );
    const client = await this.getClient();

    const response = await fetch(`${this.baseUrl}/oauth/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${authHeader}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ grant_type: "client_credentials" }),
      client: client as any, // Deno specific extension
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`EFI Auth Error: ${err}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Expire 1 minute before actual expiration to be safe
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    return this.accessToken;
  }

  async configureWebhook(webhookUrl: string) {
    const token = await this.authenticate();
    const client = await this.getClient();

    const response = await fetch(`${this.baseUrl}/v2/webhook/${this.config.pixKey}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-skip-mtls-checking": "true",
      },
      body: JSON.stringify({ webhookUrl }),
      client: client as any,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    // A resposta do Efí pode ser um 200 OK vazio ou vazio em algumas situações
    // Então só validamos se ok == true
    return { success: true };
  }

  async createPixCharge(cpf: string, nome: string, valor: number) {
    const token = await this.authenticate();
    const client = await this.getClient();

    const payload = {
      calendario: { expiracao: 3600 },
      devedor: { cpf, nome },
      valor: { original: valor.toFixed(2) },
      chave: this.config.pixKey,
      solicitacaoPagador: "Pagamento de Ativação",
    };

    const response = await fetch(`${this.baseUrl}/v2/cob`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      client: client as any,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const cobData = await response.json();

    const qrResponse = await fetch(
      `${this.baseUrl}/v2/loc/${cobData.loc.id}/qrcode`,
      {
        headers: { Authorization: `Bearer ${token}` },
        client: client as any,
      },
    );

    const qrData = await qrResponse.json();

    return {
      txid: cobData.txid,
      qrcode: qrData.imagemQrcode,
      copia_cola: qrData.qrcode,
    };
  }

  async checkPixStatus(txid: string) {
    const token = await this.authenticate();
    const client = await this.getClient();

    const response = await fetch(`${this.baseUrl}/v2/cob/${txid}`, {
      headers: { Authorization: `Bearer ${token}` },
      client: client as any,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const data = await response.json();
    return data;
  }

  async cancelPixCharge(txid: string) {
    const token = await this.authenticate();
    const client = await this.getClient();

    const response = await fetch(`${this.baseUrl}/v2/cob/${txid}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "REMOVIDA_PELO_USUARIO_RECEBEDOR" }),
      client: client as any,
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }
    return await response.json();
  }
}
