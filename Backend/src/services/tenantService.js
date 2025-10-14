const tenantRepository = require('../repositories/tenantRepository');
const userRepository = require('../repositories/userRepository');
const roomService = require('./roomService');
const paymentRepository = require('../repositories/paymentRepository');
const reportRepository = require('../repositories/reportRepository');
const { generateAccessToken } = require('../utils/jwt');

class TenantService {
  // Create new tenant with user account (combined registration)
  async registerTenant(tenantData) {
    try {
      const { username, email, password, firstName, lastName, phoneNumber, dateOfBirth, idType, idNumber, emergencyContact, roomNumber, leaseStartDate, leaseEndDate, monthlyRent, securityDeposit } = tenantData;

      // Check if user already exists
      const existingUserByEmail = await userRepository.findByEmail(email);
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }

      const existingUserByUsername = await userRepository.findByUsername(username);
      if (existingUserByUsername) {
        throw new Error('User with this username already exists');
      }

      // Create user account with tenant role
      const user = await userRepository.create({
        username,
        email,
        password,
        role: 'tenant',
      });

      // Create tenant profile (without roomNumber initially)
      const tenant = await tenantRepository.create({
        userId: user._id,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        idType,
        idNumber,
        emergencyContact,
        roomNumber: null, // Will be set after room assignment
        leaseStartDate,
        leaseEndDate,
        monthlyRent,
        securityDeposit,
      });

      // If room number is provided, assign tenant to room
      if (roomNumber) {
        try {
          // Find the room by room number
          const room = await roomService.getRoomByRoomNumber(roomNumber);
          if (!room) {
            throw new Error('Room not found');
          }

          // Check if room is available for assignment
          if (!room.isAvailable) {
            throw new Error('Room is not available for assignment');
          }

          // Assign tenant to room using the room service
          await roomService.assignTenantToRoom(room.id, tenant._id, monthlyRent);
          
          // Create initial payment for the tenant
          await this.createInitialPayment(tenant, room);
        } catch (error) {
          // If room assignment fails, clean up the created tenant and user
          await tenantRepository.delete(tenant._id);
          await userRepository.delete(user._id);
          throw error;
        }
      }

      // Generate token
      const token = generateAccessToken(user);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        tenant: this.formatTenantResponse(tenant),
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  // Create new tenant profile (requires existing user with tenant role)
  async createTenant(tenantData, userId = null) {
    try {
      // If userId is provided, use it; otherwise expect userId in tenantData
      const targetUserId = userId || tenantData.userId;
      
      if (!targetUserId) {
        throw new Error('User ID is required to create tenant profile');
      }

      // Verify user exists and has tenant role
      const user = await userRepository.findById(targetUserId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role !== 'tenant') {
        throw new Error('User must have tenant role to create tenant profile');
      }

      // Check if tenant profile already exists for this user
      const existingTenant = await tenantRepository.findByUserId(targetUserId);
      if (existingTenant) {
        throw new Error('Tenant profile already exists for this user');
      }

      // Create tenant profile (without roomNumber initially)
      const tenant = await tenantRepository.create({
        ...tenantData,
        userId: targetUserId,
        roomNumber: null, // Will be set after room assignment
      });

      // If room number is provided, assign tenant to room
      if (tenantData.roomNumber) {
        try {
          // Find the room by room number
          const room = await roomService.getRoomByRoomNumber(tenantData.roomNumber);
          if (!room) {
            throw new Error('Room not found');
          }

          // Check if room is available for assignment
          if (!room.isAvailable) {
            throw new Error('Room is not available for assignment');
          }

          // Assign tenant to room using the room service
          await roomService.assignTenantToRoom(room.id, tenant._id, tenantData.monthlyRent);
          
          // Create initial payment for the tenant
          await this.createInitialPayment(tenant, room);
        } catch (error) {
          // If room assignment fails, clean up the created tenant
          await tenantRepository.delete(tenant._id);
          throw error;
        }
      }

      return this.formatTenantResponse(tenant);
    } catch (error) {
      throw error;
    }
  }

  // Get all tenants (admin/staff only)
  async getAllTenants(filters = {}) {
    try {
      const tenants = await tenantRepository.findAll(filters);
      return tenants.map(tenant => this.formatTenantResponse(tenant));
    } catch (error) {
      throw error;
    }
  }

  // Get tenant by ID
  async getTenantById(tenantId) {
    try {
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      return this.formatTenantResponse(tenant);
    } catch (error) {
      throw error;
    }
  }

  // Get tenant by user ID
  async getTenantByUserId(userId) {
    try {
      const tenant = await tenantRepository.findByUserId(userId);
      if (!tenant) {
        throw new Error('Tenant profile not found');
      }

      return this.formatTenantResponse(tenant);
    } catch (error) {
      throw error;
    }
  }

  // Update tenant profile
  async updateTenant(tenantId, updateData, requestingUserId = null, requestingUserRole = null) {
    try {
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Authorization check - only admin/staff or the tenant themselves can update
      if (requestingUserId && requestingUserRole) {
        const canUpdate = 
          requestingUserRole === 'admin' || 
          requestingUserRole === 'staff' || 
          tenant.userId._id.toString() === requestingUserId;
        
        if (!canUpdate) {
          throw new Error('Not authorized to update this tenant profile');
        }
      }

      // Check room number availability if being updated
      if (updateData.roomNumber && updateData.roomNumber !== tenant.roomNumber) {
        const isRoomAvailable = await tenantRepository.isRoomNumberAvailable(
          updateData.roomNumber, 
          tenantId
        );
        if (!isRoomAvailable) {
          throw new Error('Room number is already occupied');
        }
      }

      // Validate lease dates if being updated
      if (updateData.leaseStartDate || updateData.leaseEndDate) {
        const startDate = updateData.leaseStartDate || tenant.leaseStartDate;
        const endDate = updateData.leaseEndDate || tenant.leaseEndDate;
        
        if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
          throw new Error('Lease end date must be after lease start date');
        }
      }

      const updatedTenant = await tenantRepository.update(tenantId, updateData);
      return this.formatTenantResponse(updatedTenant);
    } catch (error) {
      throw error;
    }
  }

  // Update tenant by user ID (for current tenant profile updates)
  async updateTenantByUserId(userId, updateData) {
    try {
      const tenant = await tenantRepository.findByUserId(userId);
      if (!tenant) {
        throw new Error('Tenant profile not found');
      }

      return await this.updateTenant(tenant._id, updateData, userId, 'tenant');
    } catch (error) {
      throw error;
    }
  }

  // Delete tenant
  async deleteTenant(tenantId, requestingUserRole = null) {
    try {
      // Only admin can delete tenant profiles
      if (requestingUserRole && requestingUserRole !== 'admin') {
        throw new Error('Only administrators can delete tenant profiles');
      }

      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      await tenantRepository.delete(tenantId);
      
      return {
        message: 'Tenant profile deleted successfully',
        deletedTenant: this.formatTenantResponse(tenant),
      };
    } catch (error) {
      throw error;
    }
  }

  // Get tenant statistics (admin/staff only)
  async getTenantStatistics() {
    try {
      return await tenantRepository.getStatistics();
    } catch (error) {
      throw error;
    }
  }

  // Search tenants with pagination
  async searchTenants(searchOptions) {
    try {
      const result = await tenantRepository.searchWithPagination(searchOptions);
      
      return {
        tenants: result.tenants.map(tenant => this.formatTenantResponse(tenant)),
        pagination: result.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get tenants with expiring leases
  async getTenantsWithExpiringLeases(days = 30) {
    try {
      const tenants = await tenantRepository.findWithExpiringLeases(days);
      return tenants.map(tenant => this.formatTenantResponse(tenant));
    } catch (error) {
      throw error;
    }
  }

  // Get tenants by status
  async getTenantsByStatus(status) {
    try {
      const tenants = await tenantRepository.findByStatus(status);
      return tenants.map(tenant => this.formatTenantResponse(tenant));
    } catch (error) {
      throw error;
    }
  }

  // Update tenant status
  async updateTenantStatus(tenantId, status, requestingUserRole = null) {
    try {
      // Only admin/staff can update tenant status
      if (requestingUserRole && !['admin', 'staff'].includes(requestingUserRole)) {
        throw new Error('Only administrators and staff can update tenant status');
      }

      const validStatuses = ['active', 'inactive', 'pending', 'terminated'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid tenant status');
      }

      const updatedTenant = await tenantRepository.update(tenantId, { tenantStatus: status });
      if (!updatedTenant) {
        throw new Error('Tenant not found');
      }

      return this.formatTenantResponse(updatedTenant);
    } catch (error) {
      throw error;
    }
  }

  // Format tenant response (remove sensitive info and format data)
  formatTenantResponse(tenant) {
    if (!tenant) return null;

    const formatted = {
      id: tenant._id,
      userId: tenant.userId,
      firstName: tenant.firstName,
      lastName: tenant.lastName,
      fullName: tenant.fullName,
      phoneNumber: tenant.phoneNumber,
      dateOfBirth: tenant.dateOfBirth,
      age: tenant.age,
      idType: tenant.idType,
      idNumber: tenant.idNumber,
      emergencyContact: tenant.emergencyContact,
      roomNumber: tenant.roomNumber,
      leaseStartDate: tenant.leaseStartDate,
      leaseEndDate: tenant.leaseEndDate,
      monthlyRent: tenant.monthlyRent,
      securityDeposit: tenant.securityDeposit,
      tenantStatus: tenant.tenantStatus,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };

    return formatted;
  }

  // Helper method to create initial rent payment
  async createInitialPayment(tenant, room) {
    try {
      const Payment = require('../models/Payment');
      
      // Calculate first payment due date based on lease start
      const leaseStart = new Date(tenant.leaseStartDate || Date.now());
      const firstDueDate = new Date(leaseStart);
      firstDueDate.setMonth(firstDueDate.getMonth() + 1); // Due 1 month after lease starts
      
      const periodEnd = new Date(leaseStart);
      periodEnd.setMonth(periodEnd.getMonth() + 1);
      periodEnd.setDate(periodEnd.getDate() - 1);
      
      // Create first rent payment record
      const paymentData = {
        tenant: tenant._id,
        room: room._id || room.id,
        amount: tenant.monthlyRent,
        paymentType: 'rent',
        paymentMethod: 'cash', // Default, tenant can change later
        dueDate: firstDueDate,
        status: 'pending',
        periodCovered: {
          startDate: leaseStart,
          endDate: periodEnd
        },
        description: 'Monthly rent - First payment'
      };
      
      await paymentRepository.create(paymentData);
      console.log('Initial payment created for tenant:', tenant._id);
    } catch (error) {
      console.error('Error creating initial payment:', error);
      // Don't throw - payment creation shouldn't block tenant registration
    }
  }

  // Get tenant dashboard data
  async getTenantDashboardData(userId) {
    try {
      // Get tenant profile by userId
      const tenant = await tenantRepository.findByUserId(userId);
      if (!tenant) {
        throw new Error('Tenant profile not found');
      }

      // Get room details if tenant has a room
      let roomInfo = { roomNumber: 'N/A', roomType: 'N/A' };
      let monthlyRent = 0;
      
      if (tenant.roomNumber) {
        try {
          const room = await roomService.getRoomByRoomNumber(tenant.roomNumber);
          if (room) {
            roomInfo = {
              roomNumber: room.roomNumber,
              roomType: room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1)
            };
            monthlyRent = room.monthlyRent || tenant.monthlyRent || 0;
          }
        } catch (error) {
          console.warn('Could not fetch room details:', error.message);
          roomInfo = { roomNumber: tenant.roomNumber, roomType: 'Unknown' };
          monthlyRent = tenant.monthlyRent || 0;
        }
      }

      // Get next payment due (pending or overdue payments)
      const nextPayment = await paymentRepository.findNextDuePaymentByTenant(tenant._id);

      let nextPaymentDue = 'N/A';
      let daysRemaining = 0;

      if (nextPayment) {
        nextPaymentDue = new Date(nextPayment.dueDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        
        const today = new Date();
        const dueDate = new Date(nextPayment.dueDate);
        daysRemaining = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
      }

      // Get recent activity (last 3 payments and reports)
      const [recentPayments, recentReports] = await Promise.all([
        paymentRepository.findByTenant(tenant._id, { page: 1, limit: 3, sort: { paymentDate: -1 } }),
        reportRepository.findByTenant(tenant._id, { page: 1, limit: 3, sort: { submittedAt: -1 } })
      ]);

      const recentActivity = [];

      // Add recent payments
      if (recentPayments.payments) {
        recentPayments.payments.forEach(payment => {
          recentActivity.push({
            id: payment._id.toString(),
            type: 'payment',
            description: `₱${payment.amount.toLocaleString()} ${payment.paymentType} payment`,
            status: payment.status === 'paid' ? 'Paid' : 
                   payment.status === 'overdue' ? 'Overdue' : 'Pending',
            time: this.getTimeAgo(payment.paymentDate || payment.createdAt)
          });
        });
      }

      // Add recent reports
      if (recentReports.reports) {
        recentReports.reports.forEach(report => {
          recentActivity.push({
            id: report._id.toString(),
            type: 'maintenance',
            description: report.title,
            status: report.status === 'resolved' ? 'Completed' :
                   report.status === 'in-progress' ? 'In Progress' :
                   report.status === 'rejected' ? 'Rejected' : 'Pending',
            time: this.getTimeAgo(report.submittedAt)
          });
        });
      }

      // Sort by time (most recent first) and limit to 3
      recentActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
      recentActivity.splice(3);

      // Map tenant status to account status
      const accountStatusMap = {
        'active': 'Active',
        'inactive': 'Inactive',
        'pending': 'Pending',
        'terminated': 'Suspended'
      };

      return {
        roomInfo,
        monthlyRent,
        nextPaymentDue,
        daysRemaining,
        accountStatus: accountStatusMap[tenant.tenantStatus] || 'Unknown',
        recentActivity
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper method to get time ago string
  getTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return past.toLocaleDateString();
  }

  // Validate tenant data
  validateTenantData(data, isUpdate = false) {
    const errors = [];

    // Required fields for creation
    if (!isUpdate) {
      if (!data.firstName) errors.push('First name is required');
      if (!data.lastName) errors.push('Last name is required');
      if (!data.phoneNumber) errors.push('Phone number is required');
      if (!data.dateOfBirth) errors.push('Date of birth is required');
      if (!data.idType) errors.push('ID type is required');
      if (!data.idNumber) errors.push('ID number is required');
      if (!data.emergencyContact || !data.emergencyContact.name) {
        errors.push('Emergency contact information is required');
      }
    }

    // Date validations
    if (data.dateOfBirth && new Date(data.dateOfBirth) >= new Date()) {
      errors.push('Date of birth must be in the past');
    }

    if (data.leaseStartDate && data.leaseEndDate) {
      if (new Date(data.leaseEndDate) <= new Date(data.leaseStartDate)) {
        errors.push('Lease end date must be after lease start date');
      }
    }

    // Numeric validations
    if (data.monthlyRent !== undefined && data.monthlyRent < 0) {
      errors.push('Monthly rent cannot be negative');
    }

    if (data.securityDeposit !== undefined && data.securityDeposit < 0) {
      errors.push('Security deposit cannot be negative');
    }

    if (data.monthlyIncome !== undefined && data.monthlyIncome < 0) {
      errors.push('Monthly income cannot be negative');
    }

    return errors;
  }
}

module.exports = new TenantService();