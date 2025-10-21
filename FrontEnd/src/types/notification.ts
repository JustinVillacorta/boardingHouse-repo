// Notification types and interfaces
export interface Notification {
  id: string;
  userId: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  expiresAt?: string;
  isExpired?: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type NotificationType = 
  | 'payment_due'
  | 'report_update'
  | 'system_alert'
  | 'maintenance'
  | 'announcement'
  | 'lease_reminder'
  | 'other';

export type NotificationStatus = 'unread' | 'read';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface NotificationFilters {
  status?: NotificationStatus;
  type?: NotificationType;
  priority?: NotificationPriority;
  limit?: number;
  skip?: number;
  includeExpired?: boolean;
  search?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<NotificationType, number>;
  byPriority: Record<NotificationPriority, number>;
}

export interface CreateNotificationData {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  expiresAt?: string;
}

export interface BroadcastNotificationData {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
  expiresAt?: string;
  userIds?: string[];
  roles?: string[];
}

// UI-specific types
export interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface NotificationDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onViewAll: () => void;
}