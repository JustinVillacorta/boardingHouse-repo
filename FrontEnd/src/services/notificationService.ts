import apiService from './apiService';
import type { 
  Notification, 
  NotificationFilters, 
  NotificationStats, 
  CreateNotificationData, 
  BroadcastNotificationData 
} from '../types/notification';

class NotificationService {
  // Get user's notifications
  async getUserNotifications(filters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    try {
      const response = await apiService.getNotifications(filters);
      return {
        notifications: response.data.notifications || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Failed to fetch user notifications:', error);
      throw error;
    }
  }

  // Get all notifications (admin/staff only)
  async getAllNotifications(filters: NotificationFilters = {}): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    try {
      const response = await apiService.getAllNotifications(filters);
      return {
        notifications: response.data.notifications || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('Failed to fetch all notifications:', error);
      throw error;
    }
  }

  // Get notification by ID
  async getNotificationById(id: string): Promise<Notification> {
    try {
      const response = await apiService.getNotificationById(id);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification:', error);
      throw error;
    }
  }

  // Create a new notification
  async createNotification(notificationData: CreateNotificationData): Promise<Notification> {
    try {
      const response = await apiService.createNotification(notificationData);
      return response.data;
    } catch (error) {
      console.error('Failed to create notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    try {
      const response = await apiService.markNotificationAsRead(id);
      return response.data;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ modifiedCount: number }> {
    try {
      const response = await apiService.markAllNotificationsAsRead();
      return response.data;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    try {
      await apiService.deleteNotification(id);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Broadcast notification
  async broadcastNotification(broadcastData: BroadcastNotificationData): Promise<{
    notificationCount: number;
    message: string;
  }> {
    try {
      const response = await apiService.broadcastNotification(broadcastData);
      return response.data;
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
      throw error;
    }
  }

  // Get notification statistics
  async getStats(systemWide: boolean = false): Promise<NotificationStats> {
    try {
      const response = await apiService.getNotificationStats(systemWide);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notification stats:', error);
      throw error;
    }
  }

  // Cleanup expired notifications (admin only)
  async cleanupExpired(): Promise<{ deletedCount: number }> {
    try {
      const response = await apiService.cleanupExpiredNotifications();
      return response.data;
    } catch (error) {
      console.error('Failed to cleanup expired notifications:', error);
      throw error;
    }
  }

  // Helper method to get unread count
  async getUnreadCount(): Promise<number> {
    try {
      const { notifications } = await this.getUserNotifications({ status: 'unread' });
      return notifications.length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Helper method to get recent notifications for dropdown
  async getRecentNotifications(limit: number = 5): Promise<Notification[]> {
    try {
      const { notifications } = await this.getUserNotifications({ limit });
      return notifications;
    } catch (error) {
      console.error('Failed to get recent notifications:', error);
      return [];
    }
  }

  // Helper method to format notification for display
  formatNotificationMessage(notification: Notification): string {
    switch (notification.type) {
      case 'payment_due':
        return `Payment due: ₱${notification.metadata?.amount || 'N/A'} by ${
          notification.metadata?.dueDate ? new Date(notification.metadata.dueDate).toLocaleDateString() : 'N/A'
        }`;
      case 'report_update':
        return `Report "${notification.metadata?.title || 'Unknown'}" updated to ${notification.metadata?.status || 'N/A'}`;
      case 'maintenance':
        return `Maintenance scheduled: ${notification.message}`;
      case 'announcement':
        return `Announcement: ${notification.message}`;
      case 'system_alert':
        return `System Alert: ${notification.message}`;
      case 'lease_reminder':
        return `Lease Reminder: ${notification.message}`;
      default:
        return notification.message;
    }
  }

  // Helper method to get notification icon
  getNotificationIcon(type: string): string {
    switch (type) {
      case 'payment_due':
        return '💰';
      case 'report_update':
        return '📋';
      case 'maintenance':
        return '🔧';
      case 'announcement':
        return '📢';
      case 'system_alert':
        return '⚠️';
      case 'lease_reminder':
        return '📅';
      default:
        return '🔔';
    }
  }

  // Helper method to get type color
  getTypeColor(type: string): string {
    switch (type) {
      case 'payment_due':
        return 'text-red-600 bg-red-100';
      case 'report_update':
        return 'text-blue-600 bg-blue-100';
      case 'maintenance':
        return 'text-orange-600 bg-orange-100';
      case 'announcement':
        return 'text-purple-600 bg-purple-100';
      case 'system_alert':
        return 'text-red-600 bg-red-100';
      case 'lease_reminder':
        return 'text-indigo-600 bg-indigo-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }
}

export default new NotificationService();