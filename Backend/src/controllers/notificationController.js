const { validationResult } = require('express-validator');
const notificationService = require('../services/notificationService');
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} = require('../utils/response');

class NotificationController {
  // POST /api/notifications - Create notification (admin/staff)
  async createNotification(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const notificationData = req.body;
      const createdBy = req.user.id;

      const notification = await notificationService.createNotification(notificationData, createdBy);
      return sendCreated(res, 'Notification created successfully', notification);
    } catch (error) {
      console.error('Create notification error:', error);
      
      if (error.message.includes('not found')) {
        return sendNotFound(res, error.message);
      }
      
      return sendServerError(res, 'Failed to create notification');
    }
  }

  // GET /api/notifications - Get user's notifications
  async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { status, type, priority, limit, skip, includeExpired } = req.query;

      const filters = {
        status,
        type,
        priority,
        limit,
        skip,
        includeExpired: includeExpired === 'true',
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const notifications = await notificationService.getUserNotifications(userId, filters);
      
      return sendSuccess(res, 'Notifications retrieved successfully', {
        notifications,
        total: notifications.length,
      });
    } catch (error) {
      console.error('Get user notifications error:', error);
      return sendServerError(res, 'Failed to retrieve notifications');
    }
  }

  // GET /api/notifications/all - Get all notifications (admin/staff only)
  async getAllNotifications(req, res) {
    try {
      const { userId, status, type, priority, limit, skip, search, includeExpired } = req.query;

      const filters = {
        userId,
        status,
        type,
        priority,
        limit,
        skip,
        search,
        includeExpired: includeExpired === 'true',
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

      const notifications = await notificationService.getAllNotifications(filters);
      
      return sendSuccess(res, 'All notifications retrieved successfully', {
        notifications,
        total: notifications.length,
      });
    } catch (error) {
      console.error('Get all notifications error:', error);
      return sendServerError(res, 'Failed to retrieve notifications');
    }
  }

  // GET /api/notifications/:id - Get specific notification
  async getNotificationById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const notification = await notificationService.getNotificationById(id, userId, userRole);
      return sendSuccess(res, 'Notification retrieved successfully', notification);
    } catch (error) {
      console.error('Get notification by ID error:', error);
      
      if (error.message === 'Notification not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendUnauthorized(res, error.message);
      }
      
      return sendServerError(res, 'Failed to retrieve notification');
    }
  }

  // PUT /api/notifications/:id/read - Mark notification as read
  async markNotificationAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const notification = await notificationService.markNotificationAsRead(id, userId, userRole);
      return sendSuccess(res, 'Notification marked as read', notification);
    } catch (error) {
      console.error('Mark notification as read error:', error);
      
      if (error.message === 'Notification not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendUnauthorized(res, error.message);
      }
      
      if (error.message.includes('already marked')) {
        return sendError(res, error.message, 400);
      }
      
      return sendServerError(res, 'Failed to mark notification as read');
    }
  }

  // DELETE /api/notifications/:id - Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await notificationService.deleteNotification(id, userId, userRole);
      return sendSuccess(res, result.message);
    } catch (error) {
      console.error('Delete notification error:', error);
      
      if (error.message === 'Notification not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendUnauthorized(res, error.message);
      }
      
      return sendServerError(res, 'Failed to delete notification');
    }
  }

  // POST /api/notifications/broadcast - Send notification to multiple users (admin)
  async broadcastNotification(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { userIds, roles, ...notificationData } = req.body;
      const createdBy = req.user.id;

      let result;
      
      if (userIds && userIds.length > 0) {
        // Broadcast to specific users
        result = await notificationService.broadcastNotification(userIds, notificationData, createdBy);
      } else if (roles && roles.length > 0) {
        // Broadcast to users by role
        result = await notificationService.broadcastToRole(roles, notificationData, createdBy);
      } else {
        return sendError(res, 'Either userIds or roles must be provided', 400);
      }

      return sendCreated(res, result.message, {
        notificationCount: result.notificationCount,
      });
    } catch (error) {
      console.error('Broadcast notification error:', error);
      
      if (error.message.includes('not found')) {
        return sendNotFound(res, error.message);
      }
      
      return sendServerError(res, 'Failed to broadcast notification');
    }
  }

  // GET /api/notifications/stats - Get notification statistics
  async getNotificationStats(req, res) {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;

      let stats;
      
      if (userRole === 'admin' || userRole === 'staff') {
        // Admin/staff can get system-wide stats
        const { systemWide } = req.query;
        if (systemWide === 'true') {
          stats = await notificationService.getSystemNotificationStats();
        } else {
          stats = await notificationService.getUserNotificationStats(userId);
        }
      } else {
        // Regular users get their own stats
        stats = await notificationService.getUserNotificationStats(userId);
      }

      return sendSuccess(res, 'Notification statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Get notification stats error:', error);
      return sendServerError(res, 'Failed to retrieve notification statistics');
    }
  }

  // PUT /api/notifications/mark-all-read - Mark all user notifications as read
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      const result = await notificationService.markAllAsRead(userId);
      return sendSuccess(res, result.message, {
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      return sendServerError(res, 'Failed to mark all notifications as read');
    }
  }

  // DELETE /api/notifications/cleanup - Clean up expired notifications (admin only)
  async cleanupExpiredNotifications(req, res) {
    try {
      const result = await notificationService.cleanupExpiredNotifications();
      return sendSuccess(res, result.message, {
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error('Cleanup expired notifications error:', error);
      return sendServerError(res, 'Failed to cleanup expired notifications');
    }
  }
}

module.exports = new NotificationController();