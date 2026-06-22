export interface CreatePixChargeParams {
  amount: number;
  cpf: string;
  name: string;
  txid?: string;
}

export interface CreatePixChargeResult {
  txid: string;
  qrcode: string;
  copia_cola: string;
  isSimulation: boolean;
}

export interface IPaymentProvider {
  createPixCharge(params: CreatePixChargeParams): Promise<CreatePixChargeResult>;
  checkPixStatus(txid: string): Promise<boolean>;
  configureWebhook(webhookUrl: string): Promise<boolean>;
}
