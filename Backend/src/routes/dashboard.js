const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate, requireAdminOrStaff } = require('../middleware/auth');

const router = express.Router();

// All dashboard routes require authentication and admin/staff role
router.use(authenticate);
router.use(requireAdminOrStaff);

// GET /api/dashboard/stats - Get dashboard statistics
router.get('/stats', dashboardController.getDashboardStats);

// GET /api/dashboard/occupancy - Get room occupancy data
router.get('/occupancy', dashboardController.getRoomOccupancyData);

// GET /api/dashboard/payments - Get payment statistics
router.get('/payments', dashboardController.getPaymentStatistics);

// GET /api/dashboard/reports - Get report statistics
router.get('/reports', dashboardController.getReportStatistics);

module.exports = router;