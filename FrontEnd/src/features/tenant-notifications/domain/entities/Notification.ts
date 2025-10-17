export type NotificationType = 'payment' | 'maintenance' | 'announcement' | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}
