import { Request, Response } from 'express';
import { PaymentUseCase } from '../useCases/PaymentUseCase';
import { UserProfile } from '../../../../src/types';

export class PaymentController {
  constructor(private paymentUseCase: PaymentUseCase) {}

  createPayment = async (req: Request, res: Response) => {
    const { group_id } = req.body;
    if (!group_id) {
      return res.status(400).json({ error: 'Grupo é obrigatório.' });
    }

    const user = (req as any).user as UserProfile;

    try {
      const result = await this.paymentUseCase.createPayment(user, group_id);
      res.json(result);
    } catch (err: any) {
      console.error('Error generating Pix:', err);
      let errorMsg = 'Erro interno ao processar pagamento.';
      if (err.response?.status === 400 || err.message?.includes('Documento CPF é inválido')) {
         errorMsg = 'Ocorreu um erro com os dados fornecidos. O CPF pode ser inválido.';
      } else if (err.message) {
         errorMsg = err.message;
      }
      res.status(500).json({ error: errorMsg });
    }
  };

  checkStatus = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const result = await this.paymentUseCase.checkStatus(req.params.id, user.id);
      res.json(result);
    } catch (err: any) {
      if (err.message === 'Pagamento não encontrado.') {
        return res.status(404).json({ error: err.message });
      } else if (err.message === 'Acesso negado.') {
        return res.status(403).json({ error: err.message });
      }
      res.status(500).json({ error: err.message });
    }
  };

  simulatePayment = async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Apenas ambiente local.' });
    }
    try {
      // Find the payment
      const paymentRepository = (this.paymentUseCase as any).paymentRepository;
      const payment = await paymentRepository.getPaymentPixById(req.params.id);
      if (!payment) return res.status(404).json({ error: 'Pagamento não encontrado.' });
      
      const result = await this.paymentUseCase.processPaymentSuccess(payment);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  };
}
