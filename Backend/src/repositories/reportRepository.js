const Report = require('../models/Report');

class ReportRepository {
  // Create new report
  async create(reportData) {
    try {
      const report = new Report(reportData);
      return await report.save();
    } catch (error) {
      throw error;
    }
  }

  // Find all reports with optional filters
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'submittedAt',
        sortOrder = 'desc',
        populate = true,
      } = options;

      const query = Report.find(filters);

      if (populate) {
        query
          .populate('tenant', 'firstName lastName phoneNumber email')
          .populate('room', 'roomNumber roomType floor');
      }

      // Apply sorting
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
      query.sort(sortOptions);

      // Apply pagination
      const skip = (page - 1) * limit;
      query.skip(skip).limit(parseInt(limit));

      const reports = await query.exec();

      // Get total count for pagination
      const totalCount = await Report.countDocuments(filters);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        reports,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalReports: totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Find report by ID
  async findById(id, populate = true) {
    try {
      const query = Report.findById(id);

      if (populate) {
        query
          .populate('tenant', 'firstName lastName phoneNumber email')
          .populate('room', 'roomNumber roomType floor');
      }

      return await query.exec();
    } catch (error) {
      throw error;
    }
  }

  // Find reports by tenant
  async findByTenant(tenantId, options = {}) {
    try {
      const filters = { tenant: tenantId };
      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  // Find reports by room
  async findByRoom(roomId, options = {}) {
    try {
      const filters = { room: roomId };
      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  // Find reports by status
  async findByStatus(status, options = {}) {
    try {
      const filters = { status };
      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  // Find reports by type
  async findByType(type, options = {}) {
    try {
      const filters = { type };
      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  // Update report by ID
  async updateById(id, updateData) {
    try {
      return await Report.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      })
        .populate('tenant', 'firstName lastName phoneNumber email')
        .populate('room', 'roomNumber roomType floor');
    } catch (error) {
      throw error;
    }
  }

  // Update report status
  async updateStatus(id, status) {
    try {
      return await this.updateById(id, { status });
    } catch (error) {
      throw error;
    }
  }

  // Delete report by ID
  async deleteById(id) {
    try {
      return await Report.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Get report count
  async getCount(filters = {}) {
    try {
      return await Report.countDocuments(filters);
    } catch (error) {
      throw error;
    }
  }

  // Search reports
  async search(searchTerm, options = {}) {
    try {
      const searchFilters = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
        ],
      };

      return await this.findAll(searchFilters, options);
    } catch (error) {
      throw error;
    }
  }

  // Get reports with date range
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const filters = {
        submittedAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };

      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  // Get report statistics
  async getStatistics() {
    try {
      const stats = await Report.aggregate([
        {
          $group: {
            _id: null,
            totalReports: { $sum: 1 },
            pendingReports: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            inProgressReports: {
              $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
            },
            resolvedReports: {
              $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
            },
            rejectedReports: {
              $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
            },
            maintenanceReports: {
              $sum: { $cond: [{ $eq: ['$type', 'maintenance'] }, 1, 0] }
            },
            complaintReports: {
              $sum: { $cond: [{ $eq: ['$type', 'complaint'] }, 1, 0] }
            },
            otherReports: {
              $sum: { $cond: [{ $eq: ['$type', 'other'] }, 1, 0] }
            }
          }
        }
      ]);

      return stats[0] || {
        totalReports: 0,
        pendingReports: 0,
        inProgressReports: 0,
        resolvedReports: 0,
        rejectedReports: 0,
        maintenanceReports: 0,
        complaintReports: 0,
        otherReports: 0
      };
    } catch (error) {
      throw error;
    }
  }

  // Check if report exists
  async exists(id) {
    try {
      const report = await Report.findById(id).select('_id');
      return !!report;
    } catch (error) {
      return false;
    }
  }

  // Get recent reports
  async getRecentReports(limit = 10) {
    try {
      return await Report.find()
        .populate('tenant', 'firstName lastName phoneNumber email')
        .populate('room', 'roomNumber roomType floor')
        .sort({ submittedAt: -1 })
        .limit(limit);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ReportRepository();