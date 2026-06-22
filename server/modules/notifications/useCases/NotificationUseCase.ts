import { NotificationRepository } from '../repositories/NotificationRepository';

export class NotificationUseCase {
  constructor(private notificationRepository: NotificationRepository) {}

  async getUserNotifications(userId: string) {
    return this.notificationRepository.getUserNotifications(userId);
  }

  async markAsRead(id: string) {
    await this.notificationRepository.markNotificationRead(id);
  }
}
