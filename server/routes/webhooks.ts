import express from 'express';
import { container } from '../shared/container';
import { PaymentWebhookController } from '../modules/payments/controllers/PaymentWebhookController';

const router = express.Router();
const webhookController = new PaymentWebhookController(container.queueService);

router.post(['/api/webhooks/pix/efi', '/api/webhooks/pix/efi/pix'], webhookController.handleEfiWebhook);

export default router;
