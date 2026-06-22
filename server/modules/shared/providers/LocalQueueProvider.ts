import { IQueueProvider, IJobOptions, IJob } from './IQueueProvider';

export class LocalQueueProvider implements IQueueProvider {
  private processors: Map<string, (job: IJob<any>) => Promise<void>> = new Map();
  private pendingJobs: Map<string, Array<{ job: IJob<any>, options?: IJobOptions }>> = new Map();

  async addJob<T>(queueName: string, name: string, data: T, options?: IJobOptions): Promise<void> {
    const job: IJob<T> = { name, data };
    
    if (this.processors.has(queueName)) {
      this.executeJob(queueName, job, options);
    } else {
      if (!this.pendingJobs.has(queueName)) {
        this.pendingJobs.set(queueName, []);
      }
      this.pendingJobs.get(queueName)?.push({ job, options });
    }
  }

  processQueue<T>(queueName: string, processor: (job: IJob<T>) => Promise<void>): void {
    this.processors.set(queueName, processor);
    
    const jobsToProcess = this.pendingJobs.get(queueName) || [];
    this.pendingJobs.set(queueName, []);
    
    for (const { job, options } of jobsToProcess) {
      this.executeJob(queueName, job, options);
    }
  }

  private executeJob(queueName: string, job: IJob<any>, options?: IJobOptions) {
    const delay = options?.delay || 0;
    setTimeout(async () => {
      const processor = this.processors.get(queueName);
      if (processor) {
        try {
          await processor(job);
        } catch (error) {
          console.error(`[LocalQueue] Error processing job ${job.name} in queue ${queueName}:`, error);
        }
      }
    }, delay);
  }
}
