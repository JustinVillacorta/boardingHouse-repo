const { validationResult } = require('express-validator');
const reportService = require('../services/reportService');
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendServerError,
} = require('../utils/response');

class ReportController {
  // Create new report
  async createReport(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const report = await reportService.createReport(req.body, userId);

      return sendCreated(res, 'Report created successfully', report);
    } catch (error) {
      console.error('Create report error:', error);
      
      if (error.message.includes('not found')) {
        return sendError(res, error.message, 404);
      }
      
      return sendServerError(res, 'Failed to create report');
    }
  }

  // Get all reports
  async getAllReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'reportedDate',
        sortOrder = 'desc',
        status,
        reportType,
        priority,
        category,
        urgency,
        assignedTo,
        tenant,
        room,
        startDate,
        endDate,
        overdue,
        search,
      } = req.query;

      const filters = {
        status,
        reportType,
        priority,
        category,
        urgency,
        assignedTo,
        tenant,
        room,
        startDate,
        endDate,
        overdue,
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      let result;
      if (search) {
        result = await reportService.searchReports(search, options);
      } else {
        result = await reportService.getAllReports(filters, options);
      }

      return sendSuccess(res, 'Reports retrieved successfully', result);
    } catch (error) {
      console.error('Get reports error:', error);
      return sendServerError(res, 'Failed to retrieve reports');
    }
  }

  // Get current tenant's reports
  async getMyReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'reportedDate',
        sortOrder = 'desc',
        status,
        reportType,
        priority,
        category,
      } = req.query;

      const filters = { status, reportType, priority, category };
      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await reportService.getMyReports(req.user.id, filters, options);

      return sendSuccess(res, 'Your reports retrieved successfully', result);
    } catch (error) {
      console.error('Get my reports error:', error);
      
      if (error.message === 'Tenant profile not found') {
        return sendError(res, error.message, 404);
      }
      
      return sendServerError(res, 'Failed to retrieve your reports');
    }
  }

  // Get specific report by ID
  async getReportById(req, res) {
    try {
      const { id } = req.params;
      const { id: userId, role } = req.user;

      const report = await reportService.getReportById(id, userId, role);

      if (!report) {
        return sendNotFound(res, 'Report not found');
      }

      return sendSuccess(res, 'Report retrieved successfully', report);
    } catch (error) {
      console.error('Get report by ID error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendError(res, error.message, 403);
      }
      
      return sendServerError(res, 'Failed to retrieve report');
    }
  }

  // Update report
  async updateReport(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { id: userId, role } = req.user;

      const report = await reportService.updateReport(id, req.body, userId, role);

      return sendSuccess(res, 'Report updated successfully', report);
    } catch (error) {
      console.error('Update report error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendError(res, error.message, 403);
      }
      
      if (error.message.includes('not found')) {
        return sendError(res, error.message, 404);
      }
      
      return sendServerError(res, 'Failed to update report');
    }
  }

  // Update report status
  async updateReportStatus(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { status, comment } = req.body;
      const userId = req.user.id;

      const report = await reportService.updateReportStatus(id, status, userId, comment);

      return sendSuccess(res, 'Report status updated successfully', report);
    } catch (error) {
      console.error('Update report status error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      return sendServerError(res, 'Failed to update report status');
    }
  }

  // Delete report
  async deleteReport(req, res) {
    try {
      const { id } = req.params;
      const { role } = req.user;

      await reportService.deleteReport(id, role);

      return sendSuccess(res, 'Report deleted successfully');
    } catch (error) {
      console.error('Delete report error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendError(res, error.message, 403);
      }
      
      return sendServerError(res, 'Failed to delete report');
    }
  }

  // Assign report to user
  async assignReport(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { assignedTo } = req.body;
      const assignedBy = req.user.id;

      const report = await reportService.assignReport(id, assignedTo, assignedBy);

      return sendSuccess(res, 'Report assigned successfully', report);
    } catch (error) {
      console.error('Assign report error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      return sendServerError(res, 'Failed to assign report');
    }
  }

  // Add comment to report
  async addComment(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { comment, isInternal = false } = req.body;
      const { id: userId, role } = req.user;

      const report = await reportService.addComment(id, userId, comment, isInternal, role);

      return sendSuccess(res, 'Comment added successfully', report);
    } catch (error) {
      console.error('Add comment error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      if (error.message === 'Access denied') {
        return sendError(res, error.message, 403);
      }
      
      return sendServerError(res, 'Failed to add comment');
    }
  }

  // Get overdue reports
  async getOverdueReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'expectedResolutionDate',
        sortOrder = 'asc',
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await reportService.getOverdueReports(options);

      return sendSuccess(res, 'Overdue reports retrieved successfully', result);
    } catch (error) {
      console.error('Get overdue reports error:', error);
      return sendServerError(res, 'Failed to retrieve overdue reports');
    }
  }

  // Get reports by status
  async getReportsByStatus(req, res) {
    try {
      const { status } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = 'reportedDate',
        sortOrder = 'desc',
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await reportService.getReportsByStatus(status, options);

      return sendSuccess(res, `Reports with status '${status}' retrieved successfully`, result);
    } catch (error) {
      console.error('Get reports by status error:', error);
      return sendServerError(res, 'Failed to retrieve reports by status');
    }
  }

  // Get assigned reports
  async getAssignedReports(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'reportedDate',
        sortOrder = 'desc',
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder,
      };

      const result = await reportService.getAssignedReports(req.user.id, options);

      return sendSuccess(res, 'Assigned reports retrieved successfully', result);
    } catch (error) {
      console.error('Get assigned reports error:', error);
      return sendServerError(res, 'Failed to retrieve assigned reports');
    }
  }

  // Get report statistics
  async getReportStatistics(req, res) {
    try {
      const {
        reportType,
        tenant,
        room,
        assignedTo,
        startDate,
        endDate,
      } = req.query;

      const filters = {
        reportType,
        tenant,
        room,
        assignedTo,
        startDate,
        endDate,
      };

      const statistics = await reportService.getReportStatistics(filters);

      return sendSuccess(res, 'Report statistics retrieved successfully', statistics);
    } catch (error) {
      console.error('Get report statistics error:', error);
      return sendServerError(res, 'Failed to retrieve report statistics');
    }
  }

  // Get dashboard summary
  async getDashboardSummary(req, res) {
    try {
      const summary = await reportService.getDashboardSummary();

      return sendSuccess(res, 'Dashboard summary retrieved successfully', summary);
    } catch (error) {
      console.error('Get dashboard summary error:', error);
      return sendServerError(res, 'Failed to retrieve dashboard summary');
    }
  }

  // Mark report as resolved
  async markAsResolved(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const resolutionData = req.body;
      const resolvedBy = req.user.id;

      const report = await reportService.markAsResolved(id, resolutionData, resolvedBy);

      return sendSuccess(res, 'Report marked as resolved successfully', report);
    } catch (error) {
      console.error('Mark as resolved error:', error);
      
      if (error.message === 'Report not found') {
        return sendNotFound(res, error.message);
      }
      
      return sendServerError(res, 'Failed to mark report as resolved');
    }
  }

  // Bulk update reports
  async bulkUpdateReports(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { reportIds, updateData } = req.body;
      const userId = req.user.id;

      const results = await reportService.bulkUpdateReports(reportIds, updateData, userId);

      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      return sendSuccess(res, `Bulk update completed. ${successCount} successful, ${failureCount} failed.`, {
        results,
        summary: {
          total: results.length,
          successful: successCount,
          failed: failureCount
        }
      });
    } catch (error) {
      console.error('Bulk update reports error:', error);
      return sendServerError(res, 'Failed to bulk update reports');
    }
  }
}

module.exports = new ReportController();