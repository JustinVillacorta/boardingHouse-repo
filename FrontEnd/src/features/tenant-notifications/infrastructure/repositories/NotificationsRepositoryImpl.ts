import type { NotificationsRepository } from '../../domain/repositories/NotificationsRepository';
import type { Notification } from '../../domain/entities/Notification';

export class NotificationsRepositoryImpl implements NotificationsRepository {
  async getNotifications(): Promise<Notification[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    return [
      {
        id: "1",
        type: "payment",
        title: "Payment Due Soon",
        message: "Your rent payment is due in 3 days",
        timestamp: "2 hours ago",
        isRead: false,
        icon: "dollar-sign",
        priority: "high"
      },
      {
        id: "2",
        type: "maintenance",
        title: "Maintenance Complete",
        message: "Your faucet repair has been completed",
        timestamp: "14 hours ago",
        isRead: false,
        icon: "wrench",
        priority: "medium"
      },
      {
        id: "3",
        type: "announcement",
        title: "Building Notice",
        message: "Scheduled maintenance in common areas this weekend",
        timestamp: "1 day ago",
        isRead: true,
        icon: "bell",
        priority: "low"
      },
      {
        id: "4",
        type: "payment",
        title: "Payment Received",
        message: "Your rent payment for March has been processed",
        timestamp: "2 days ago",
        isRead: true,
        icon: "check-circle",
        priority: "medium"
      },
      {
        id: "5",
        type: "maintenance",
        title: "Maintenance Scheduled",
        message: "AC repair has been scheduled for tomorrow at 2 PM",
        timestamp: "3 days ago",
        isRead: true,
        icon: "calendar",
        priority: "medium"
      }
    ];
  }

  async markAsRead(notificationId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real implementation, this would make an API call
    console.log(`Marking notification ${notificationId} as read`);
  }

  async markAllAsRead(): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // In a real implementation, this would make an API call
    console.log('Marking all notifications as read');
  }

  async getUnreadCount(): Promise<number> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // In a real implementation, this would make an API call
    return 2; // Based on the static data above
  }
}
