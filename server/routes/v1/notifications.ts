import express from 'express';
import { authenticate } from '../../middleware/auth';
import { container } from '../../shared/container';
import { NotificationController } from '../../modules/notifications/controllers/NotificationController';

const router = express.Router();
const notificationController = new NotificationController(container.notificationUseCase);

router.get('/api/v1/notifications', authenticate, notificationController.getUserNotifications);

router.post('/api/v1/notifications/read/:id', authenticate, notificationController.markAsRead);

export default router;
