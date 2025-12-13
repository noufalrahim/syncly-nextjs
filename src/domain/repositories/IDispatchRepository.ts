export interface IDispatchRepository {
  sendEmailNotification(email: string, subject: string, body: string): Promise<boolean>;
}
