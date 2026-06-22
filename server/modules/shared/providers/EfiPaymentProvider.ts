import axios from 'axios';
import fs from 'fs';
import https from 'https';
import { IPaymentProvider, CreatePixChargeParams, CreatePixChargeResult } from './IPaymentProvider';

interface EfiConfig {
  clientId?: string;
  clientSecret?: string;
  sandbox?: boolean;
  certPath?: string;
  pixKey?: string;
  certContent?: string;
  keyContent?: string;
}

export class EfiPaymentProvider implements IPaymentProvider {
  private getConfig(): EfiConfig {
    return {
      clientId: process.env.EFI_CLIENT_ID || '',
      clientSecret: process.env.EFI_CLIENT_SECRET || '',
      sandbox: process.env.EFI_ENV !== 'producao',
      certPath: process.env.EFI_CERTIFICATE_PATH || './certificado-homologacao.p12',
      pixKey: process.env.EFI_PIX_KEY || '',
      certContent: process.env.EFI_CERTIFICATE_CERT,
      keyContent: process.env.EFI_CERTIFICATE_KEY
    };
  }

  private getBaseUrl(sandbox: boolean): string {
    return sandbox 
      ? 'https://pix-h.api.efipay.com.br' 
      : 'https://pix.api.efipay.com.br';
  }

  private getAgent(config: EfiConfig): https.Agent {
    if (config.certPath && fs.existsSync(config.certPath)) {
      const cert = fs.readFileSync(config.certPath);
      return new https.Agent({
        pfx: cert,
        passphrase: '', 
        rejectUnauthorized: false
      });
    } else if (config.certContent && config.keyContent) {
      return new https.Agent({
        cert: config.certContent.replace(/\\n/g, '\n'),
        key: config.keyContent.replace(/\\n/g, '\n'),
        rejectUnauthorized: false
      });
    } else {
      throw new Error('Certificado não encontrado. Forneça o arquivo .p12 ou as chaves CERT e KEY nas variáveis de ambiente.');
    }
  }

  private hasCredentials(config: EfiConfig): boolean {
    const hasIds = !!(config.clientId && config.clientSecret);
    const hasFile = !!(config.certPath && fs.existsSync(config.certPath));
    const hasStrings = !!(config.certContent && config.keyContent);
    return hasIds && (hasFile || hasStrings);
  }
  private cachedToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private async getAccessToken(config: EfiConfig, baseUrl: string, httpsAgent: https.Agent): Promise<string> {
    if (this.cachedToken && Date.now() < this.tokenExpiresAt) {
      return this.cachedToken;
    }

    const authHeader = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const tokenRes = await axios({
      method: 'POST',
      url: `${baseUrl}/oauth/token`,
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/json'
      },
      data: { grant_type: 'client_credentials' },
      httpsAgent
    });

    this.cachedToken = tokenRes.data.access_token;
    // Expire 60 seconds before actual expiration to be safe
    this.tokenExpiresAt = Date.now() + (tokenRes.data.expires_in - 60) * 1000;
    
    return this.cachedToken!;
  }

  async createPixCharge(params: CreatePixChargeParams): Promise<CreatePixChargeResult> {
    const config = this.getConfig();
    
    if (this.hasCredentials(config)) {
      try {
        const baseUrl = this.getBaseUrl(config.sandbox || false);
        const httpsAgent = this.getAgent(config);

        const accessToken = await this.getAccessToken(config, baseUrl, httpsAgent);

        const generateTxid = () => {
          const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          let t = "";
          for (let i = 0; i < 30; i++) t += chars.charAt(Math.floor(Math.random() * chars.length));
          return t;
        };
        const txid = params.txid || generateTxid();
        const cobRes = await axios({
          method: 'PUT',
          url: `${baseUrl}/v2/cob/${txid}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          data: {
            calendario: { expiracao: 3600 },
            devedor: {
              cpf: params.cpf.replace(/\D/g, ''),
              nome: params.name
            },
            valor: {
              original: params.amount.toFixed(2)
            },
            chave: config.pixKey
          },
          httpsAgent
        });

        const locId = cobRes.data.loc.id;

        const qrRes = await axios({
          method: 'GET',
          url: `${baseUrl}/v2/loc/${locId}/qrcode`,
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          httpsAgent
        });

        return {
          txid: txid,
          qrcode: qrRes.data.imagemQrcode,
          copia_cola: qrRes.data.qrcode,
          isSimulation: false
        };
      } catch (err: any) {
        console.error('Éfi Bank API failed:', err.response?.data || err.message || err);
        const errObj = err.response?.data;
        const efiMsg = errObj?.mensagem || errObj?.error_description || err.message;
        
        if (efiMsg?.includes('Documento CPF') && efiMsg?.includes('inválido') || efiMsg?.toLowerCase().includes('cpf inválido')) {
          throw new Error('Documento CPF é inválido! Entre em contato com o suporte para alterar.');
        }
        
        throw new Error(`Falha na API da Efí: ${efiMsg}`);
      }
    } else {
       throw new Error(`Credenciais do Éfi Bank não configuradas corretamente.`);
    }
  }

  async configureWebhook(webhookUrl: string): Promise<boolean> {
    const config = this.getConfig();
    
    if (this.hasCredentials(config)) {
      try {
        const baseUrl = this.getBaseUrl(config.sandbox || false);
        const httpsAgent = this.getAgent(config);

        const accessToken = await this.getAccessToken(config, baseUrl, httpsAgent);

        await axios({
          method: 'PUT',
          url: `${baseUrl}/v2/webhook/${config.pixKey}`,
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'x-skip-mtls-checking': 'true'
          },
          data: {
            webhookUrl
          },
          httpsAgent
        });

        return true;
      } catch (err: any) {
        console.error('Falha ao configurar Webhook na Éfi', err.response?.data || err.message);
        return false;
      }
    }
    return false;
  }

  async checkPixStatus(txid: string): Promise<boolean> {
    const config = this.getConfig();
    if (this.hasCredentials(config)) {
      try {
        const baseUrl = this.getBaseUrl(config.sandbox || false);
        const httpsAgent = this.getAgent(config);

        const accessToken = await this.getAccessToken(config, baseUrl, httpsAgent);
        const cobRes = await axios({
          method: 'GET',
          url: `${baseUrl}/v2/cob/${txid}`,
          headers: { 'Authorization': `Bearer ${accessToken}` },
          httpsAgent
        });

        if (cobRes.data && (cobRes.data.status === 'CONCLUIDA' || cobRes.data.status === 'CONCLUIDO')) {
          return true;
        }
        return false;
      } catch (err) {
        console.error('Erro ao verificar status na Éfi:', err);
        return false;
      }
    }
    return false;
  }
}
