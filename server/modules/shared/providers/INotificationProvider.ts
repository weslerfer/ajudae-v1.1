export interface INotificationProvider {
  sendPush?(userId: string, title: string, body: string): Promise<void>;
  sendEmail?(email: string, subject: string, body: string): Promise<void>;
}
