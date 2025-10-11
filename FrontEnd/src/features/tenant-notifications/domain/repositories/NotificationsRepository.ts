import type { Notification } from '../entities/Notification';

export interface NotificationsRepository {
  getNotifications(): Promise<Notification[]>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  getUnreadCount(): Promise<number>;
}
