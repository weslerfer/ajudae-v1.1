import { Request, Response } from 'express';
import { QueueService } from '../../jobs/services/QueueService';
import crypto from 'crypto';

export class PaymentWebhookController {
  constructor(private queueService: QueueService) {}

  handleEfiWebhook = async (req: Request, res: Response) => {
    
    if (process.env.EFI_WEBHOOK_SECRET) {
        const receivedToken = (req.query.token as string) || '';
        const expectedToken = process.env.EFI_WEBHOOK_SECRET;
        
        const a = crypto.createHash('sha256').update(receivedToken).digest();
        const b = crypto.createHash('sha256').update(expectedToken).digest();

        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
           console.warn('[Webhook Warning] Acesso negado. Token invalido ou ausente.');
           return res.status(401).send('Unauthorized');
        }
    }

    const { pix } = req.body;
    if (!pix || !Array.isArray(pix)) {
      return res.status(200).send('Webhook registered OK.');
    }

    res.status(200).send('Webhook recebido e em processamento.');

    try {
      await this.queueService.enqueue('webhook-queue', 'process-efi-webhook', { pixItems: pix });
    } catch (err) {
      console.error('[Webhook Error]', err);
    }
  };
}
