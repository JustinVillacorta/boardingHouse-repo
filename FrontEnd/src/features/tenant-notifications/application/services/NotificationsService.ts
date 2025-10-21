import type { NotificationsRepository } from '../../domain/repositories/NotificationsRepository';
import type { Notification } from '../../domain/entities/Notification';
import { GetNotificationsUseCase } from '../usecases/GetNotificationsUseCase';
import { MarkNotificationAsReadUseCase } from '../usecases/MarkNotificationAsReadUseCase';
import { MarkAllNotificationsAsReadUseCase } from '../usecases/MarkAllNotificationsAsReadUseCase';
import { GetUnreadCountUseCase } from '../usecases/GetUnreadCountUseCase';

export class NotificationsService {
  private getNotificationsUseCase: GetNotificationsUseCase;
  private markNotificationAsReadUseCase: MarkNotificationAsReadUseCase;
  private markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase;
  private getUnreadCountUseCase: GetUnreadCountUseCase;

  constructor(notificationsRepository: NotificationsRepository) {
    this.getNotificationsUseCase = new GetNotificationsUseCase(notificationsRepository);
    this.markNotificationAsReadUseCase = new MarkNotificationAsReadUseCase(notificationsRepository);
    this.markAllNotificationsAsReadUseCase = new MarkAllNotificationsAsReadUseCase(notificationsRepository);
    this.getUnreadCountUseCase = new GetUnreadCountUseCase(notificationsRepository);
  }

  async getNotifications(): Promise<Notification[]> {
    return await this.getNotificationsUseCase.execute();
  }

  async markAsRead(notificationId: string): Promise<void> {
    return await this.markNotificationAsReadUseCase.execute(notificationId);
  }

  async markAllAsRead(): Promise<void> {
    return await this.markAllNotificationsAsReadUseCase.execute();
  }

  async getUnreadCount(): Promise<number> {
    return await this.getUnreadCountUseCase.execute();
  }
}
