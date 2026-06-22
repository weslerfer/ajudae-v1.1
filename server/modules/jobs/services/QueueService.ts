import { IQueueProvider, IJobOptions } from '../../shared/providers/IQueueProvider';

export class QueueService {
  constructor(private queueProvider: IQueueProvider) {}

  async enqueue<T>(queueName: string, name: string, data: T, options?: IJobOptions): Promise<void> {
    await this.queueProvider.addJob(queueName, name, data, options);
  }
}
