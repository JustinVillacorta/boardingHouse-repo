const dashboardService = require('../services/dashboardService');
const {
  sendSuccess,
  sendError,
  sendServerError,
} = require('../utils/response');

class DashboardController {
  // GET /api/dashboard/stats - Get dashboard statistics
  async getDashboardStats(req, res) {
    try {
      const stats = await dashboardService.getDashboardStats();
      return sendSuccess(res, 'Dashboard statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      return sendServerError(res, 'Failed to retrieve dashboard statistics');
    }
  }

  // GET /api/dashboard/occupancy - Get room occupancy data
  async getRoomOccupancyData(req, res) {
    try {
      const occupancyData = await dashboardService.getRoomOccupancyData();
      return sendSuccess(res, 'Room occupancy data retrieved successfully', occupancyData);
    } catch (error) {
      console.error('Get room occupancy data error:', error);
      return sendServerError(res, 'Failed to retrieve room occupancy data');
    }
  }

  // GET /api/dashboard/payments - Get payment statistics
  async getPaymentStatistics(req, res) {
    try {
      const paymentStats = await dashboardService.getPaymentStatistics();
      return sendSuccess(res, 'Payment statistics retrieved successfully', paymentStats);
    } catch (error) {
      console.error('Get payment statistics error:', error);
      return sendServerError(res, 'Failed to retrieve payment statistics');
    }
  }

  // GET /api/dashboard/reports - Get report statistics
  async getReportStatistics(req, res) {
    try {
      const reportStats = await dashboardService.getReportStatistics();
      return sendSuccess(res, 'Report statistics retrieved successfully', reportStats);
    } catch (error) {
      console.error('Get report statistics error:', error);
      return sendServerError(res, 'Failed to retrieve report statistics');
    }
  }
}

module.exports = new DashboardController();