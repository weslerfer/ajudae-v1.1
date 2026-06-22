import { IQueueProvider, IJob } from '../../shared/providers/IQueueProvider';
import { PaymentUseCase } from '../../payments/useCases/PaymentUseCase';
import { NotificationRepository } from '../../notifications/repositories/NotificationRepository';
import { PaymentPix, SystemNotification } from '../../../../src/types';

export class JobService {
  constructor(
    private queueProvider: IQueueProvider,
    private paymentUseCase: PaymentUseCase,
    private notificationRepository: NotificationRepository
  ) {}

  startWorkers() {
    this.queueProvider.processQueue<{ pixItems: any[] }>('webhook-queue', async (job) => {
      if (job.name === 'process-efi-webhook') {
        const pixItems = job.data.pixItems;
        await this.paymentUseCase.handleWebhook(pixItems);
      }
    });

    this.queueProvider.processQueue<{ payment: PaymentPix }>('payment-queue', async (job) => {
       if (job.name === 'process-payment-success') {
          const result = await this.paymentUseCase.processPaymentSuccess(job.data.payment);
          if (!result.success) {
            console.error(`[JobService] Failed to process payment success for ${job.data.payment.id}:`, result.error);
          }
       }
    });

    this.queueProvider.processQueue<{ notificationData: SystemNotification }>('notification-queue', async (job) => {
      if (job.name === 'send-notification') {
        await this.notificationRepository.addNotification(job.data.notificationData);
        // Here we could also call INotificationProvider to send push/email
      }
    });
    
    console.log('[JobService] Workers started.');
  }
}
