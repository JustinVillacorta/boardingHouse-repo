const Notification = require('../models/Notification');
const mongoose = require('mongoose');

class NotificationRepository {
  // Create a new notification
  async create(notificationData) {
    try {
      const notification = new Notification(notificationData);
      return await notification.save();
    } catch (error) {
      throw error;
    }
  }

  // Find notification by ID
  async findById(id) {
    try {
      return await Notification.findById(id).populate('user_id', 'username email role').populate('createdBy', 'username');
    } catch (error) {
      throw error;
    }
  }

  // Find all notifications for a user
  async findByUserId(userId, filters = {}) {
    try {
      let query = { user_id: userId };
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }

      // Exclude expired notifications unless specifically requested
      if (!filters.includeExpired) {
        query.$or = [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ];
      }

      let queryBuilder = Notification.find(query)
        .populate('user_id', 'username email role')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });

      // Apply pagination if provided
      if (filters.limit) {
        queryBuilder = queryBuilder.limit(parseInt(filters.limit));
      }
      
      if (filters.skip) {
        queryBuilder = queryBuilder.skip(parseInt(filters.skip));
      }

      return await queryBuilder;
    } catch (error) {
      throw error;
    }
  }

  // Find all notifications with filters
  async findAll(filters = {}) {
    try {
      let query = {};
      
      // Apply filters
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }

      if (filters.userId) {
        query.user_id = filters.userId;
      }

      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { message: { $regex: filters.search, $options: 'i' } },
        ];
      }

      // Exclude expired notifications unless specifically requested
      if (!filters.includeExpired) {
        query.$or = [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ];
      }

      let queryBuilder = Notification.find(query)
        .populate('user_id', 'username email role')
        .populate('createdBy', 'username')
        .sort({ createdAt: -1 });

      // Apply pagination if provided
      if (filters.limit) {
        queryBuilder = queryBuilder.limit(parseInt(filters.limit));
      }
      
      if (filters.skip) {
        queryBuilder = queryBuilder.skip(parseInt(filters.skip));
      }

      return await queryBuilder;
    } catch (error) {
      throw error;
    }
  }

  // Update notification
  async updateById(id, updateData) {
    try {
      return await Notification.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      }).populate('user_id', 'username email role').populate('createdBy', 'username');
    } catch (error) {
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(id) {
    try {
      return await Notification.findByIdAndUpdate(
        id, 
        { status: 'read' }, 
        { new: true }
      ).populate('user_id', 'username email role').populate('createdBy', 'username');
    } catch (error) {
      throw error;
    }
  }

  // Mark multiple notifications as read
  async markMultipleAsRead(ids) {
    try {
      return await Notification.updateMany(
        { _id: { $in: ids } },
        { status: 'read' }
      );
    } catch (error) {
      throw error;
    }
  }

  // Mark all user notifications as read
  async markAllAsReadByUserId(userId) {
    try {
      return await Notification.updateMany(
        { user_id: userId, status: 'unread' },
        { status: 'read' }
      );
    } catch (error) {
      throw error;
    }
  }

  // Delete notification
  async deleteById(id) {
    try {
      return await Notification.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete multiple notifications
  async deleteMultiple(ids) {
    try {
      return await Notification.deleteMany({ _id: { $in: ids } });
    } catch (error) {
      throw error;
    }
  }

  // Count notifications for a user
  async countByUserId(userId, filters = {}) {
    try {
      let query = { user_id: userId };
      
      if (filters.status) {
        query.status = filters.status;
      }
      
      if (filters.type) {
        query.type = filters.type;
      }

      // Exclude expired notifications unless specifically requested
      if (!filters.includeExpired) {
        query.$or = [
          { expiresAt: null },
          { expiresAt: { $gt: new Date() } }
        ];
      }

      return await Notification.countDocuments(query);
    } catch (error) {
      throw error;
    }
  }

  // Get notification statistics
  async getNotificationStats(userId = null) {
    try {
      const matchStage = userId ? { user_id: new mongoose.Types.ObjectId(userId) } : {};
      
      // Exclude expired notifications
      matchStage.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];

      const stats = await Notification.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            unread: { $sum: { $cond: [{ $eq: ['$status', 'unread'] }, 1, 0] } },
            read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
            byType: {
              $push: {
                type: '$type',
                status: '$status'
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            total: 1,
            unread: 1,
            read: 1,
            byType: 1
          }
        }
      ]);

      return stats[0] || { total: 0, unread: 0, read: 0, byType: [] };
    } catch (error) {
      throw error;
    }
  }

  // Create broadcast notifications for multiple users
  async createBroadcast(userIds, notificationData) {
    try {
      const notifications = userIds.map(userId => ({
        ...notificationData,
        user_id: userId
      }));
      
      return await Notification.insertMany(notifications);
    } catch (error) {
      throw error;
    }
  }

  // Delete expired notifications
  async deleteExpired() {
    try {
      return await Notification.deleteMany({
        expiresAt: { $lte: new Date() }
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new NotificationRepository();