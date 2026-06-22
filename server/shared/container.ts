import { ProfileRepository } from '../modules/users/repositories/ProfileRepository';
import { WalletRepository } from '../modules/wallets/repositories/WalletRepository';
import { PaymentRepository } from '../modules/payments/repositories/PaymentRepository';
import { NotificationRepository } from '../modules/notifications/repositories/NotificationRepository';
import { GroupRepository } from '../modules/groups/repositories/GroupRepository';
import { SystemRepository } from '../modules/shared/database/SystemRepository';

import { NotificationUseCase } from '../modules/notifications/useCases/NotificationUseCase';
import { WalletUseCase } from '../modules/wallets/useCases/WalletUseCase';
import { PaymentUseCase } from '../modules/payments/useCases/PaymentUseCase';
import { AuthUseCase } from '../modules/users/useCases/AuthUseCase';
import { GroupUseCase } from '../modules/groups/useCases/GroupUseCase';
import { AdminUseCase } from '../modules/admin/useCases/AdminUseCase';
import { EfiPaymentProvider } from '../modules/shared/providers/EfiPaymentProvider';
import { IPaymentProvider } from '../modules/shared/providers/IPaymentProvider';
import { LocalQueueProvider } from '../modules/shared/providers/LocalQueueProvider';
import { IQueueProvider } from '../modules/shared/providers/IQueueProvider';
import { QueueService } from '../modules/jobs/services/QueueService';
import { JobService } from '../modules/jobs/services/JobService';

export class DIContainer {
  public profileRepository = new ProfileRepository();
  public walletRepository = new WalletRepository();
  public paymentRepository = new PaymentRepository();
  public notificationRepository = new NotificationRepository();
  public groupRepository = new GroupRepository();
  public systemRepository = new SystemRepository();

  public paymentProvider: IPaymentProvider = new EfiPaymentProvider();
  public queueProvider: IQueueProvider = new LocalQueueProvider();

  public queueService = new QueueService(this.queueProvider);

  public notificationUseCase = new NotificationUseCase(this.notificationRepository);
  public walletUseCase = new WalletUseCase(this.walletRepository);
  public paymentUseCase = new PaymentUseCase(this.paymentRepository, this.groupRepository, this.profileRepository, this.walletRepository, this.notificationRepository, this.systemRepository, this.paymentProvider, this.queueService);
  public authUseCase = new AuthUseCase(this.profileRepository, this.groupRepository, this.walletRepository);
  public groupUseCase = new GroupUseCase(this.groupRepository, this.paymentRepository, this.paymentProvider);
  public adminUseCase = new AdminUseCase(this.profileRepository, this.groupRepository, this.walletRepository, this.notificationRepository, this.systemRepository, this.paymentRepository, this.paymentProvider);

  public jobService = new JobService(this.queueProvider, this.paymentUseCase, this.notificationRepository);
}

export const container = new DIContainer();
