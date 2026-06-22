import express from 'express';
import { authenticate } from '../middleware/auth';
import { container } from '../shared/container';
import { NotificationController } from '../modules/notifications/controllers/NotificationController';

const router = express.Router();
const notificationController = new NotificationController(container.notificationUseCase);

router.get('/api/notifications', authenticate, notificationController.getUserNotifications);

router.post('/api/notifications/read/:id', authenticate, notificationController.markAsRead);

export default router;
