import express from 'express';
import { authenticate, requireAdmin } from '../../middleware/auth';
import { container } from '../../shared/container';
import { AdminController } from '../../modules/admin/controllers/AdminController';
import { recoverPendingPayments } from '../../services/pixRecovery';

const router = express.Router();
const adminController = new AdminController(container.adminUseCase);

router.post('/api/v1/admin/efi/config_webhook', authenticate, requireAdmin, adminController.configWebhook);
router.get('/api/v1/admin/stats', authenticate, requireAdmin, adminController.getStats);
router.get('/api/v1/admin/users', authenticate, requireAdmin, adminController.getUsers);
router.post('/api/v1/admin/users/update', authenticate, requireAdmin, adminController.updateUser);
router.post('/api/v1/admin/users/invite_limit', authenticate, requireAdmin, adminController.updateInviteLimit);
router.get('/api/v1/admin/withdrawals', authenticate, requireAdmin, adminController.getWithdrawals);
router.post('/api/v1/admin/withdrawals/:id/action', authenticate, requireAdmin, adminController.actionWithdrawal);
router.post('/api/v1/admin/groups/create', authenticate, requireAdmin, adminController.createGroup);
router.post('/api/v1/admin/groups/edit/:id', authenticate, requireAdmin, adminController.editGroup);
router.post('/api/v1/admin/groups/delete/:id', authenticate, requireAdmin, adminController.deleteGroup);
router.get('/api/v1/admin/wallets', authenticate, requireAdmin, adminController.getWallets);
router.post('/api/v1/admin/wallets/adjust', authenticate, requireAdmin, adminController.adjustWallet);
router.get('/api/v1/admin/messages', authenticate, requireAdmin, adminController.getMessages);
router.post('/api/v1/admin/messages', authenticate, requireAdmin, adminController.createMessage);
router.put('/api/v1/admin/messages/:id', authenticate, requireAdmin, adminController.updateMessage);
router.delete('/api/v1/admin/messages/:id', authenticate, requireAdmin, adminController.deleteMessage);

// Vercel Cron endpoint
router.get('/api/v1/admin/cron/pix-recovery', async (req, res) => {
  // Check authorization if Vercel sets CRON_SECRET
  if (process.env.CRON_SECRET) {
    const authHeader = req.headers.authorization;
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  
  try {
    await recoverPendingPayments();
    res.json({ success: true, message: 'Pix recovery executed' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
