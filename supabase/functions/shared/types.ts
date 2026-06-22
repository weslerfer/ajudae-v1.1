export interface EfiConfig {
  clientId: string;
  clientSecret: string;
  pixKey: string;
  certContent: string;
  keyContent: string;
  sandbox: boolean;
}

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      payments_pix: {
        Row: {
          id: string;
          user_id: string;
          target_id: string;
          target_type: string;
          txid: string;
          valor: number;
          status: string;
          qrcode: string;
          copia_cola: string;
          created_at: string;
          paid_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          target_id: string;
          target_type: string;
          txid: string;
          valor: number;
          status?: string;
          qrcode: string;
          copia_cola: string;
          created_at?: string;
          paid_at?: string | null;
        };
        Update: {
          status?: string;
          paid_at?: string | null;
        };
      };
      webhook_logs: {
        Insert: {
          txid?: string;
          payment_id?: string;
          payload: Json;
          status: string;
          error_message?: string;
        };
      };
      audit_logs: {
        Insert: {
          user_id?: string;
          action: string;
          details?: Json;
          ip_address?: string;
        };
      };
    };
  };
}
