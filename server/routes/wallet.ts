import express from 'express';
import { authenticate } from '../middleware/auth';
import { container } from '../shared/container';
import { WalletController } from '../modules/wallets/controllers/WalletController';

const router = express.Router();
const walletController = new WalletController(container.walletUseCase);

router.get('/api/wallet/info', authenticate, walletController.info);
router.post('/api/wallet/withdraw', authenticate, walletController.withdraw);

export default router;
