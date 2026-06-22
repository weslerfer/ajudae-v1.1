import express from 'express';
import { authenticate, requireAdmin } from '../middleware/auth';
import { container } from '../shared/container';
import { AdminController } from '../modules/admin/controllers/AdminController';

const router = express.Router();
const adminController = new AdminController(container.adminUseCase);

router.post('/api/admin/efi/config_webhook', authenticate, requireAdmin, adminController.configWebhook);
router.get('/api/admin/stats', authenticate, requireAdmin, adminController.getStats);
router.get('/api/admin/users', authenticate, requireAdmin, adminController.getUsers);
router.post('/api/admin/users/update', authenticate, requireAdmin, adminController.updateUser);
router.post('/api/admin/users/invite_limit', authenticate, requireAdmin, adminController.updateInviteLimit);
router.get('/api/admin/withdrawals', authenticate, requireAdmin, adminController.getWithdrawals);
router.post('/api/admin/withdrawals/:id/action', authenticate, requireAdmin, adminController.actionWithdrawal);
router.post('/api/admin/groups/create', authenticate, requireAdmin, adminController.createGroup);
router.post('/api/admin/groups/edit/:id', authenticate, requireAdmin, adminController.editGroup);
router.post('/api/admin/groups/delete/:id', authenticate, requireAdmin, adminController.deleteGroup);
router.get('/api/admin/wallets', authenticate, requireAdmin, adminController.getWallets);
router.post('/api/admin/wallets/adjust', authenticate, requireAdmin, adminController.adjustWallet);
router.get('/api/admin/messages', authenticate, requireAdmin, adminController.getMessages);
router.post('/api/admin/messages', authenticate, requireAdmin, adminController.createMessage);
router.put('/api/admin/messages/:id', authenticate, requireAdmin, adminController.updateMessage);
router.delete('/api/admin/messages/:id', authenticate, requireAdmin, adminController.deleteMessage);

export default router;
