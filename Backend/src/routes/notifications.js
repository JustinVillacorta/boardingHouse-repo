const express = require('express');
const notificationController = require('../controllers/notificationController');
const { authenticate, requireAdmin, requireAdminOrStaff } = require('../middleware/auth');
const { 
  validateNotificationCreate, 
  validateNotificationBroadcast 
} = require('../middleware/validation');

const router = express.Router();

// All notification routes require authentication
router.use(authenticate);

// GET /api/notifications/stats - Get notification statistics
router.get('/stats', notificationController.getNotificationStats);

// GET /api/notifications/all - Get all notifications (admin/staff only)
router.get('/all', requireAdminOrStaff, notificationController.getAllNotifications);

// PUT /api/notifications/mark-all-read - Mark all user notifications as read
router.put('/mark-all-read', notificationController.markAllNotificationsAsRead);

// DELETE /api/notifications/cleanup - Clean up expired notifications (admin only)
router.delete('/cleanup', requireAdmin, notificationController.cleanupExpiredNotifications);

// POST /api/notifications/broadcast - Send notification to multiple users (admin)
router.post('/broadcast', requireAdmin, validateNotificationBroadcast, notificationController.broadcastNotification);

// POST /api/notifications - Create notification (admin/staff)
router.post('/', requireAdminOrStaff, validateNotificationCreate, notificationController.createNotification);

// GET /api/notifications - Get user's notifications
router.get('/', notificationController.getUserNotifications);

// GET /api/notifications/:id - Get specific notification
router.get('/:id', notificationController.getNotificationById);

// PUT /api/notifications/:id/read - Mark notification as read
router.put('/:id/read', notificationController.markNotificationAsRead);

// DELETE /api/notifications/:id - Delete notification
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;