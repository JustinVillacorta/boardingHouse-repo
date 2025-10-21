const Tenant = require('../models/Tenant');
const User = require('../models/User');

class TenantRepository {
  // Create a new tenant
  async create(tenantData) {
    try {
      const tenant = new Tenant(tenantData);
      return await tenant.save();
    } catch (error) {
      throw error;
    }
  }

  // Find tenant by ID
  async findById(id) {
    try {
      return await Tenant.findById(id);
    } catch (error) {
      throw error;
    }
  }

  // Find tenant by user ID
  async findByUserId(userId) {
    try {
      return await Tenant.findOne({ userId });
    } catch (error) {
      throw error;
    }
  }

  // Find all tenants
  async findAll(filters = {}) {
    try {
      let query = {};
      
      // Apply filters
      if (filters.status) {
        query.tenantStatus = filters.status;
      }
      
      if (filters.roomNumber) {
        query.roomNumber = filters.roomNumber;
      }
      
      if (filters.search) {
        query.$or = [
          { firstName: { $regex: filters.search, $options: 'i' } },
          { lastName: { $regex: filters.search, $options: 'i' } },
          { roomNumber: { $regex: filters.search, $options: 'i' } },
        ];
      }

      return await Tenant.find(query).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Update tenant
  async update(id, updateData) {
    try {
      return await Tenant.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // Update tenant by user ID
  async updateByUserId(userId, updateData) {
    try {
      return await Tenant.findOneAndUpdate({ userId }, updateData, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }

  // Delete tenant
  async delete(id) {
    try {
      return await Tenant.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete tenant by user ID
  async deleteByUserId(userId) {
    try {
      return await Tenant.findOneAndDelete({ userId });
    } catch (error) {
      throw error;
    }
  }

  // Check if tenant exists by user ID
  async existsByUserId(userId) {
    try {
      const tenant = await Tenant.findOne({ userId });
      return !!tenant;
    } catch (error) {
      throw error;
    }
  }

  // Check if room number is available
  async isRoomNumberAvailable(roomNumber, excludeTenantId = null) {
    try {
      const query = { 
        roomNumber,
        tenantStatus: { $in: ['active', 'pending'] }
      };
      
      if (excludeTenantId) {
        query._id = { $ne: excludeTenantId };
      }
      
      const tenant = await Tenant.findOne(query);
      return !tenant;
    } catch (error) {
      throw error;
    }
  }

  // Find tenants by status
  async findByStatus(status) {
    try {
      return await Tenant.find({ tenantStatus: status }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Find tenants with expiring leases (within specified days)
  async findWithExpiringLeases(days = 30) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);
      
      return await Tenant.find({
        leaseEndDate: {
          $lte: futureDate,
          $gte: new Date()
        },
        tenantStatus: 'active'
      }).sort({ leaseEndDate: 1 });
    } catch (error) {
      throw error;
    }
  }

  // Get tenant statistics
  async getStatistics() {
    try {
      const stats = await Tenant.aggregate([
        {
          $group: {
            _id: '$tenantStatus',
            count: { $sum: 1 }
          }
        }
      ]);

      const totalTenants = await Tenant.countDocuments();
      const occupiedRooms = await Tenant.countDocuments({ 
        roomNumber: { $exists: true, $ne: null, $ne: '' },
        tenantStatus: { $in: ['active', 'pending'] }
      });

      return {
        totalTenants,
        occupiedRooms,
        statusBreakdown: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };
    } catch (error) {
      throw error;
    }
  }

  // Find tenants by date range
  async findByDateRange(startDate, endDate) {
    try {
      return await Tenant.find({
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      }).sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Search tenants with pagination
  async searchWithPagination(searchOptions = {}) {
    try {
      const {
        search = '',
        status = '',
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = searchOptions;

      let query = {};
      
      if (search) {
        query.$or = [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { roomNumber: { $regex: search, $options: 'i' } },
          { 'userId.email': { $regex: search, $options: 'i' } },
          { 'userId.username': { $regex: search, $options: 'i' } }
        ];
      }
      
      if (status) {
        query.tenantStatus = status;
      }

      const skip = (page - 1) * limit;
      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const tenants = await Tenant.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);

      const totalCount = await Tenant.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);

      return {
        tenants,
        pagination: {
          currentPage: page,
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new TenantRepository();