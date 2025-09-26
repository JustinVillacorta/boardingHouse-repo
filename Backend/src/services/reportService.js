const reportRepository = require('../repositories/reportRepository');
const tenantRepository = require('../repositories/tenantRepository');
const roomRepository = require('../repositories/roomRepository');

class ReportService {
  // Create new report
  async createReport(reportData, userId) {
    try {
      // If userId provided, find the associated tenant
      if (userId && !reportData.tenant) {
        const tenant = await tenantRepository.findByUserId(userId);
        if (tenant) {
          reportData.tenant = tenant._id;
          if (!reportData.room && tenant.roomNumber) {
            const room = await roomRepository.findByRoomNumber(tenant.roomNumber);
            if (room) {
              reportData.room = room._id;
            }
          }
        }
      }

      // Validate tenant and room exist
      if (reportData.tenant) {
        const tenant = await tenantRepository.findById(reportData.tenant);
        if (!tenant) {
          throw new Error('Tenant not found');
        }
      }

      if (reportData.room) {
        const room = await roomRepository.findById(reportData.room);
        if (!room) {
          throw new Error('Room not found');
        }
      }

      const report = await reportRepository.create(reportData);
      return await reportRepository.findById(report._id);
    } catch (error) {
      throw error;
    }
  }

  // Get all reports with filters
  async getAllReports(filters = {}, options = {}) {
    try {
      // Build filters object
      const queryFilters = { isActive: true };

      if (filters.status) {
        queryFilters.status = filters.status;
      }

      if (filters.reportType) {
        queryFilters.reportType = filters.reportType;
      }

      if (filters.priority) {
        queryFilters.priority = filters.priority;
      }

      if (filters.category) {
        queryFilters.category = filters.category;
      }

      if (filters.assignedTo) {
        queryFilters.assignedTo = filters.assignedTo;
      }

      if (filters.tenant) {
        queryFilters.tenant = filters.tenant;
      }

      if (filters.room) {
        queryFilters.room = filters.room;
      }

      if (filters.urgency) {
        queryFilters.urgency = filters.urgency;
      }

      // Date range filters
      if (filters.startDate || filters.endDate) {
        queryFilters.reportedDate = {};
        if (filters.startDate) {
          queryFilters.reportedDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          queryFilters.reportedDate.$lte = new Date(filters.endDate);
        }
      }

      // Overdue filter
      if (filters.overdue === 'true' || filters.overdue === true) {
        queryFilters.status = { $nin: ['resolved', 'closed', 'cancelled'] };
        queryFilters.expectedResolutionDate = { $lt: new Date() };
      }

      return await reportRepository.findAll(queryFilters, options);
    } catch (error) {
      throw error;
    }
  }

  // Get reports for current tenant
  async getMyReports(userId, filters = {}, options = {}) {
    try {
      // Find tenant by user ID
      const tenant = await tenantRepository.findByUserId(userId);
      if (!tenant) {
        throw new Error('Tenant profile not found');
      }

      return await reportRepository.findByTenant(tenant._id, {
        ...options,
        ...filters
      });
    } catch (error) {
      throw error;
    }
  }

  // Get report by ID
  async getReportById(id, userId = null, userRole = null) {
    try {
      const report = await reportRepository.findById(id);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check access permissions
      if (userId && userRole === 'tenant') {
        const tenant = await tenantRepository.findByUserId(userId);
        if (!tenant || report.tenant.toString() !== tenant._id.toString()) {
          throw new Error('Access denied');
        }
      }

      return report;
    } catch (error) {
      throw error;
    }
  }

  // Update report
  async updateReport(id, updateData, userId = null, userRole = null) {
    try {
      const report = await reportRepository.findById(id, false);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check permissions
      if (userRole === 'tenant') {
        const tenant = await tenantRepository.findByUserId(userId);
        if (!tenant || report.tenant.toString() !== tenant._id.toString()) {
          throw new Error('Access denied');
        }
        
        // Tenants can only update certain fields
        const allowedFields = ['description', 'priority', 'urgency'];
        const filteredUpdateData = {};
        allowedFields.forEach(field => {
          if (updateData[field] !== undefined) {
            filteredUpdateData[field] = updateData[field];
          }
        });
        updateData = filteredUpdateData;
      }

      // Validate room if being updated
      if (updateData.room) {
        const room = await roomRepository.findById(updateData.room);
        if (!room) {
          throw new Error('Room not found');
        }
      }

      return await reportRepository.updateById(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  // Update report status
  async updateReportStatus(id, status, userId, comment = null) {
    try {
      const report = await reportRepository.findById(id, false);
      if (!report) {
        throw new Error('Report not found');
      }

      return await reportRepository.updateStatus(id, status, userId, comment);
    } catch (error) {
      throw error;
    }
  }

  // Assign report to user
  async assignReport(id, assignedToUserId, assignedBy) {
    try {
      const report = await reportRepository.findById(id, false);
      if (!report) {
        throw new Error('Report not found');
      }

      return await reportRepository.assignTo(id, assignedToUserId, assignedBy);
    } catch (error) {
      throw error;
    }
  }

  // Add comment to report
  async addComment(id, userId, comment, isInternal = false, userRole = null) {
    try {
      const report = await reportRepository.findById(id, false);
      if (!report) {
        throw new Error('Report not found');
      }

      // Check permissions for tenant users
      if (userRole === 'tenant') {
        const tenant = await tenantRepository.findByUserId(userId);
        if (!tenant || report.tenant.toString() !== tenant._id.toString()) {
          throw new Error('Access denied');
        }
        // Tenants cannot add internal comments
        isInternal = false;
      }

      return await reportRepository.addComment(id, userId, comment, isInternal);
    } catch (error) {
      throw error;
    }
  }

  // Delete report
  async deleteReport(id, userRole = null) {
    try {
      const report = await reportRepository.findById(id, false);
      if (!report) {
        throw new Error('Report not found');
      }

      // Only admin and staff can delete reports
      if (userRole === 'tenant') {
        throw new Error('Access denied');
      }

      return await reportRepository.delete(id);
    } catch (error) {
      throw error;
    }
  }

  // Get overdue reports
  async getOverdueReports(options = {}) {
    try {
      return await reportRepository.findOverdue(options);
    } catch (error) {
      throw error;
    }
  }

  // Get reports by status
  async getReportsByStatus(status, options = {}) {
    try {
      return await reportRepository.findByStatus(status, options);
    } catch (error) {
      throw error;
    }
  }

  // Get reports assigned to user
  async getAssignedReports(userId, options = {}) {
    try {
      return await reportRepository.findByAssignedUser(userId, options);
    } catch (error) {
      throw error;
    }
  }

  // Search reports
  async searchReports(searchQuery, options = {}) {
    try {
      if (!searchQuery || searchQuery.trim() === '') {
        return await this.getAllReports({}, options);
      }

      return await reportRepository.search(searchQuery.trim(), options);
    } catch (error) {
      throw error;
    }
  }

  // Get report statistics
  async getReportStatistics(filters = {}) {
    try {
      // Build filters for statistics
      const queryFilters = {};

      if (filters.reportType) {
        queryFilters.reportType = filters.reportType;
      }

      if (filters.tenant) {
        queryFilters.tenant = filters.tenant;
      }

      if (filters.room) {
        queryFilters.room = filters.room;
      }

      if (filters.assignedTo) {
        queryFilters.assignedTo = filters.assignedTo;
      }

      // Date range filters
      if (filters.startDate || filters.endDate) {
        queryFilters.reportedDate = {};
        if (filters.startDate) {
          queryFilters.reportedDate.$gte = new Date(filters.startDate);
        }
        if (filters.endDate) {
          queryFilters.reportedDate.$lte = new Date(filters.endDate);
        }
      }

      return await reportRepository.getStatistics(queryFilters);
    } catch (error) {
      throw error;
    }
  }

  // Get dashboard summary
  async getDashboardSummary() {
    try {
      return await reportRepository.getDashboardSummary();
    } catch (error) {
      throw error;
    }
  }

  // Update overdue reports (background job)
  async updateOverdueReports() {
    try {
      return await reportRepository.updateOverdueReports();
    } catch (error) {
      throw error;
    }
  }

  // Get reports by date range
  async getReportsByDateRange(startDate, endDate, options = {}) {
    try {
      return await reportRepository.findByDateRange(startDate, endDate, options);
    } catch (error) {
      throw error;
    }
  }

  // Mark report as resolved
  async markAsResolved(id, resolutionData, resolvedBy) {
    try {
      const report = await reportRepository.findById(id, false);
      if (!report) {
        throw new Error('Report not found');
      }

      const updateData = {
        status: 'resolved',
        actualResolutionDate: new Date(),
        'resolution.description': resolutionData.description,
        'resolution.resolvedBy': resolvedBy,
        'resolution.resolutionDate': new Date(),
        'resolution.cost': resolutionData.cost || 0,
        'resolution.vendor': resolutionData.vendor
      };

      if (resolutionData.followUpRequired) {
        updateData.followUpRequired = true;
        updateData.followUpDate = resolutionData.followUpDate;
      }

      return await reportRepository.updateById(id, updateData);
    } catch (error) {
      throw error;
    }
  }

  // Bulk update reports
  async bulkUpdateReports(reportIds, updateData, userId) {
    try {
      const results = [];
      
      for (const reportId of reportIds) {
        try {
          const result = await this.updateReport(reportId, updateData, userId, 'admin');
          results.push({ id: reportId, success: true, data: result });
        } catch (error) {
          results.push({ id: reportId, success: false, error: error.message });
        }
      }
      
      return results;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReportService();