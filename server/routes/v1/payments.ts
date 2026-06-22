import express from 'express';
import { authenticate } from '../../middleware/auth';
import { container } from '../../shared/container';
import { PaymentController } from '../../modules/payments/controllers/PaymentController';

const router = express.Router();
const paymentController = new PaymentController(container.paymentUseCase);

router.post('/api/v1/payments/create', authenticate, paymentController.createPayment);

router.get('/api/v1/payments/status/:id', authenticate, paymentController.checkStatus);

export default router;
