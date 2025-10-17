const notificationRepository = require('../repositories/notificationRepository');
const userRepository = require('../repositories/userRepository');

class NotificationService {
  // Create a notification
  async createNotification(notificationData, createdById = null) {
    try {
      // Validate user exists
      const user = await userRepository.findById(notificationData.user_id);
      if (!user) {
        throw new Error('User not found');
      }

      const notification = await notificationRepository.create({
        ...notificationData,
        createdBy: createdById,
      });

      return this.formatNotificationResponse(notification);
    } catch (error) {
      throw error;
    }
  }

  // Get user's notifications
  async getUserNotifications(userId, filters = {}) {
    try {
      // Validate user exists
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const notifications = await notificationRepository.findByUserId(userId, filters);
      return notifications.map(notification => this.formatNotificationResponse(notification));
    } catch (error) {
      throw error;
    }
  }

  // Get all notifications (admin/staff only)
  async getAllNotifications(filters = {}) {
    try {
      const notifications = await notificationRepository.findAll(filters);
      return notifications.map(notification => this.formatNotificationResponse(notification));
    } catch (error) {
      throw error;
    }
  }

  // Get notification by ID
  async getNotificationById(notificationId, userId = null, userRole = null) {
    try {
      const notification = await notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Check permissions - user can only access their own notifications unless admin/staff
      if (userId && userRole !== 'admin' && userRole !== 'staff') {
        if (notification.user_id.toString() !== userId.toString()) {
          throw new Error('Access denied');
        }
      }

      return this.formatNotificationResponse(notification);
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId, userId = null, userRole = null) {
    try {
      const notification = await notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Check permissions
      if (userId && userRole !== 'admin' && userRole !== 'staff') {
        if (notification.user_id.toString() !== userId.toString()) {
          throw new Error('Access denied');
        }
      }

      if (notification.status === 'read') {
        throw new Error('Notification is already marked as read');
      }

      const updatedNotification = await notificationRepository.markAsRead(notificationId);
      return this.formatNotificationResponse(updatedNotification);
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId, userId = null, userRole = null) {
    try {
      const notification = await notificationRepository.findById(notificationId);
      if (!notification) {
        throw new Error('Notification not found');
      }

      // Check permissions
      if (userId && userRole !== 'admin' && userRole !== 'staff') {
        if (notification.user_id.toString() !== userId.toString()) {
          throw new Error('Access denied');
        }
      }

      await notificationRepository.deleteById(notificationId);
      return { message: 'Notification deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Broadcast notification to multiple users
  async broadcastNotification(userIds, notificationData, createdById = null) {
    try {
      // Validate all users exist
      const users = await Promise.all(
        userIds.map(userId => userRepository.findById(userId))
      );

      const missingUsers = users.map((user, index) => user ? null : userIds[index]).filter(Boolean);
      if (missingUsers.length > 0) {
        throw new Error(`Users not found: ${missingUsers.join(', ')}`);
      }

      const notifications = await notificationRepository.createBroadcast(userIds, {
        ...notificationData,
        createdBy: createdById,
      });

      return {
        message: `Notification sent to ${notifications.length} users`,
        notificationCount: notifications.length,
        notifications: notifications.map(notification => this.formatNotificationResponse(notification)),
      };
    } catch (error) {
      throw error;
    }
  }

  // Broadcast to all users by role
  async broadcastToRole(roles, notificationData, createdById = null) {
    try {
      const users = await userRepository.findByRoles(roles);
      if (users.length === 0) {
        throw new Error(`No users found with roles: ${roles.join(', ')}`);
      }

      const userIds = users.map(user => user._id);
      return await this.broadcastNotification(userIds, notificationData, createdById);
    } catch (error) {
      throw error;
    }
  }

  // Get notification statistics for user
  async getUserNotificationStats(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const stats = await notificationRepository.getNotificationStats(userId);
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Get system-wide notification statistics (admin only)
  async getSystemNotificationStats() {
    try {
      const stats = await notificationRepository.getNotificationStats();
      return stats;
    } catch (error) {
      throw error;
    }
  }

  // Mark all user notifications as read
  async markAllAsRead(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const result = await notificationRepository.markAllAsReadByUserId(userId);
      return {
        message: `Marked ${result.modifiedCount} notifications as read`,
        modifiedCount: result.modifiedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  // Clean up expired notifications
  async cleanupExpiredNotifications() {
    try {
      const result = await notificationRepository.deleteExpired();
      return {
        message: `Deleted ${result.deletedCount} expired notifications`,
        deletedCount: result.deletedCount,
      };
    } catch (error) {
      throw error;
    }
  }

  // Create payment due notification
  async createPaymentDueNotification(tenantId, paymentInfo) {
    try {
      const tenant = await userRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const notificationData = {
        user_id: tenantId,
        title: 'Payment Due',
        message: `Your rent payment of ₱${paymentInfo.amount} is due on ${new Date(paymentInfo.dueDate).toLocaleDateString()}`,
        type: 'payment_due',
        metadata: {
          paymentId: paymentInfo.paymentId,
          amount: paymentInfo.amount,
          dueDate: paymentInfo.dueDate,
        },
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      throw error;
    }
  }

  // Create report update notification
  async createReportUpdateNotification(tenantId, reportInfo) {
    try {
      const tenant = await userRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const notificationData = {
        user_id: tenantId,
        title: 'Report Update',
        message: `Your report "${reportInfo.title}" has been updated to status: ${reportInfo.status}`,
        type: 'report_update',
        metadata: {
          reportId: reportInfo.reportId,
          status: reportInfo.status,
          title: reportInfo.title,
        },
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      };

      return await this.createNotification(notificationData);
    } catch (error) {
      throw error;
    }
  }

  // Format notification response
  formatNotificationResponse(notification) {
    if (!notification) return null;

    return {
      id: notification._id,
      userId: notification.user_id?._id || notification.user_id,
      user: notification.user_id?.username ? {
        id: notification.user_id._id,
        username: notification.user_id.username,
        email: notification.user_id.email,
        role: notification.user_id.role,
      } : undefined,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      status: notification.status,
      metadata: notification.metadata,
      expiresAt: notification.expiresAt,
      isExpired: notification.isExpired,
      createdBy: notification.createdBy?.username || null,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }
}

module.exports = new NotificationService();