export interface IJobOptions {
  delay?: number;
  attempts?: number;
}

export interface IJob<T = any> {
  name: string;
  data: T;
}

export interface IQueueProvider {
  addJob<T>(queueName: string, name: string, data: T, options?: IJobOptions): Promise<void>;
  processQueue<T>(queueName: string, processor: (job: IJob<T>) => Promise<void>): void;
}
