import { Request, Response } from 'express';
import { NotificationUseCase } from '../useCases/NotificationUseCase';

export class NotificationController {
  constructor(private notificationUseCase: NotificationUseCase) {}

  getUserNotifications = async (req: Request, res: Response) => {
    const user = (req as any).user;
    const notifications = await this.notificationUseCase.getUserNotifications(user.id);
    res.json({ notifications });
  };

  markAsRead = async (req: Request, res: Response) => {
    await this.notificationUseCase.markAsRead(req.params.id);
    res.json({ success: true });
  };
}
