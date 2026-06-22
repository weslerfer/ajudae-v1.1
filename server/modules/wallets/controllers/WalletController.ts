import { Request, Response } from 'express';
import { WalletUseCase } from '../useCases/WalletUseCase';
import { UserProfile } from '../../../../src/types';

export class WalletController {
  constructor(private walletUseCase: WalletUseCase) {}

  info = async (req: Request, res: Response) => {
    const user = (req as any).user as UserProfile;
    const { wallet, transactions } = await this.walletUseCase.getInfo(user.id);
    res.json({ wallet, transactions });
  };

  withdraw = async (req: Request, res: Response) => {
    try {
      const { valor } = req.body;
      const numValor = Number(valor);
      const user = (req as any).user as UserProfile;

      await this.walletUseCase.withdraw(user, numValor);
      res.json({ success: true, message: 'Solicitação de saque registrada com sucesso. O saldo foi deduzido da sua carteira.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  };
}
