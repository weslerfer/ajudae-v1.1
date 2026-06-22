import express from 'express';
import { authenticate } from '../middleware/auth';
import { container } from '../shared/container';
import { PaymentController } from '../modules/payments/controllers/PaymentController';

const router = express.Router();
const paymentController = new PaymentController(container.paymentUseCase);

router.post('/api/payments/create', authenticate, paymentController.createPayment);

router.get('/api/payments/status/:id', authenticate, paymentController.checkStatus);

router.post('/api/payments/simulate/:id', authenticate, paymentController.simulatePayment);

export default router;
