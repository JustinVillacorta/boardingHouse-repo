const { validationResult } = require('express-validator');
const tenantService = require('../services/tenantService');
const User = require('../models/User');
const Tenant = require('../models/Tenant');
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} = require('../utils/response');

class UserController {
  // GET /api/users - Get all users with role info (admin only)
  async getAllUsers(req, res) {
    try {
      // Check if user has permission
      if (req.user.role !== 'admin') {
        return sendUnauthorized(res, 'Access denied. Admin role required.');
      }

      const { status, role, search, page, limit } = req.query;
      
      let query = {};
      
      // Apply filters
      if (status) {
        query.isActive = status === 'active';
      }
      if (role) {
        query.role = role;
      }
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 50;
      const skip = (pageNum - 1) * limitNum;

      const [users, total] = await Promise.all([
        User.find(query)
          .select('-password')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .lean(),
        User.countDocuments(query)
      ]);

      // Get tenant data for users with tenant role
      const tenantUserIds = users.filter(user => user.role === 'tenant').map(user => user._id);
      const tenants = await Tenant.find({ userId: { $in: tenantUserIds } }).lean();
      
      // Create a map for quick lookup
      const tenantMap = new Map();
      tenants.forEach(tenant => {
        tenantMap.set(tenant.userId.toString(), tenant);
      });

      // Format response for frontend
      const formattedUsers = users.map(user => {
        const tenant = tenantMap.get(user._id.toString());
        
        return {
          _id: user._id,
          id: user._id,
          email: user.email,
          role: user.role,
          assignee: tenant ? `${tenant.firstName} ${tenant.lastName}` : user.username,
          status: user.isActive ? 'Active' : 'Inactive',
          dateStarted: user.createdAt.toISOString().split('T')[0],
          // Additional fields for detailed view
          username: user.username,
          lastLogin: user.lastLogin,
          isActive: user.isActive,
          createdAt: user.createdAt,
          tenant: tenant ? {
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            phoneNumber: tenant.phoneNumber,
            roomNumber: tenant.roomNumber,
            tenantStatus: tenant.tenantStatus
          } : null
        };
      });

      const pagination = {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      };

      return sendSuccess(res, 'Users retrieved successfully', {
        users: formattedUsers,
        pagination
      });
    } catch (error) {
      console.error('Get all users error:', error);
      return sendServerError(res, 'Failed to retrieve users');
    }
  }

  // GET /api/users/:id - Get specific user details
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      
      // Check if user has permission (admin can see all, others can only see themselves)
      if (req.user.role !== 'admin' && req.user.id !== id) {
        return sendUnauthorized(res, 'Access denied. You can only view your own profile.');
      }

      const user = await User.findById(id).select('-password').lean();
      if (!user) {
        return sendNotFound(res, 'User not found');
      }

      let tenant = null;
      if (user.role === 'tenant') {
        tenant = await Tenant.findOne({ userId: id }).lean();
      }

      const formattedUser = {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        // Include all tenant fields for edit form population
        ...(tenant && {
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          phoneNumber: tenant.phoneNumber,
          dateOfBirth: tenant.dateOfBirth,
          occupation: tenant.occupation,
          street: tenant.street,
          province: tenant.province,
          city: tenant.city,
          zipCode: tenant.zipCode,
          roomNumber: tenant.roomNumber,
          monthlyRent: tenant.monthlyRent,
          securityDeposit: tenant.securityDeposit,
          idType: tenant.idType,
          idNumber: tenant.idNumber,
          emergencyContact: tenant.emergencyContact,
          tenantStatus: tenant.tenantStatus,
          leaseStartDate: tenant.leaseStartDate,
          leaseEndDate: tenant.leaseEndDate
        }),
        tenant: tenant ? {
          id: tenant._id,
          firstName: tenant.firstName,
          lastName: tenant.lastName,
          phoneNumber: tenant.phoneNumber,
          roomNumber: tenant.roomNumber,
          tenantStatus: tenant.tenantStatus,
          leaseStartDate: tenant.leaseStartDate,
          leaseEndDate: tenant.leaseEndDate,
          monthlyRent: tenant.monthlyRent
        } : null
      };

      return sendSuccess(res, 'User retrieved successfully', formattedUser);
    } catch (error) {
      console.error('Get user by ID error:', error);
      return sendServerError(res, 'Failed to retrieve user');
    }
  }

  // PUT /api/users/:id - Update user and tenant information (admin only)
  async updateUser(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      if (req.user.role !== 'admin') {
        return sendUnauthorized(res, 'Access denied. Admin role required.');
      }

      const { id } = req.params;
      const { 
        username, 
        email, 
        isActive, 
        role,
        // Tenant-specific fields
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        occupation,
        street,
        province,
        city,
        zipCode,
        roomNumber,
        monthlyRent,
        securityDeposit,
        idType,
        idNumber,
        emergencyContact
      } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return sendNotFound(res, 'User not found');
      }

      // Update user fields if provided
      if (username && username !== user.username) {
        // Check if username already exists
        const existingUser = await User.findOne({ username, _id: { $ne: id } });
        if (existingUser) {
          return sendError(res, 'Username already exists', 400);
        }
        user.username = username;
      }
      
      if (email && email !== user.email) {
        // Check if email already exists
        const existingUser = await User.findOne({ email, _id: { $ne: id } });
        if (existingUser) {
          return sendError(res, 'Email already exists', 400);
        }
        user.email = email;
      }

      if (typeof isActive === 'boolean') {
        user.isActive = isActive;
      }
      
      const oldRole = user.role;
      if (role && ['admin', 'staff', 'tenant'].includes(role)) {
        user.role = role;
      }

      await user.save();

      // Handle tenant-specific updates
      let tenant = null;
      
      if (user.role === 'tenant') {
        // Find existing tenant record
        tenant = await Tenant.findOne({ userId: id });
        
        // If user role changed to tenant and no tenant record exists, create one
        if (!tenant && oldRole !== 'tenant') {
          // Create tenant record with minimal required fields
          tenant = new Tenant({
            userId: id,
            firstName: firstName || 'Unknown',
            lastName: lastName || 'User',
            phoneNumber: phoneNumber || '0000000000',
            dateOfBirth: dateOfBirth || new Date('1990-01-01'),
            idType: idType || 'other',
            idNumber: idNumber || 'TEMP-ID',
            emergencyContact: emergencyContact || {
              name: 'Emergency Contact',
              relationship: 'Unknown',
              phoneNumber: '0000000000'
            }
          });
        }
        
        // Update tenant fields if tenant record exists or was just created
        if (tenant) {
          if (firstName) tenant.firstName = firstName;
          if (lastName) tenant.lastName = lastName;
          if (phoneNumber) tenant.phoneNumber = phoneNumber;
          if (dateOfBirth) tenant.dateOfBirth = new Date(dateOfBirth);
          if (occupation) tenant.occupation = occupation;
          if (street) tenant.street = street;
          if (province) tenant.province = province;
          if (city) tenant.city = city;
          if (zipCode) tenant.zipCode = zipCode;
          if (roomNumber) tenant.roomNumber = roomNumber;
          if (monthlyRent) tenant.monthlyRent = parseFloat(monthlyRent);
          if (securityDeposit) tenant.securityDeposit = parseFloat(securityDeposit);
          if (idType) tenant.idType = idType;
          if (idNumber) tenant.idNumber = idNumber;
          if (emergencyContact) tenant.emergencyContact = emergencyContact;
          
          await tenant.save();
        }
      } else if (oldRole === 'tenant' && user.role !== 'tenant') {
        // If role changed from tenant to something else, optionally keep or remove tenant record
        // For now, we'll keep the tenant record for data integrity
        tenant = await Tenant.findOne({ userId: id }).lean();
      }

      // Get updated tenant data
      if (user.role === 'tenant') {
        tenant = await Tenant.findOne({ userId: id }).lean();
      }

      const formattedUser = {
        _id: user._id,
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        tenant: tenant
      };

      return sendSuccess(res, 'User updated successfully', formattedUser);
    } catch (error) {
      console.error('Update user error:', error);
      return sendServerError(res, 'Failed to update user');
    }
  }

  // DELETE /api/users/:id - Delete user (admin only)
  async deleteUser(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return sendUnauthorized(res, 'Access denied. Admin role required.');
      }

      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (req.user.id === id) {
        return sendError(res, 'You cannot delete your own account', 400);
      }

      const user = await User.findById(id);
      if (!user) {
        return sendNotFound(res, 'User not found');
      }

      // If user is a tenant, delete tenant profile first
      if (user.role === 'tenant') {
        await Tenant.findOneAndDelete({ userId: id });
      }

      await User.findByIdAndDelete(id);

      return sendSuccess(res, 'User deleted successfully', { id });
    } catch (error) {
      console.error('Delete user error:', error);
      return sendServerError(res, 'Failed to delete user');
    }
  }

  // GET /api/users/statistics - Get user statistics (admin only)
  async getUserStatistics(req, res) {
    try {
      if (req.user.role !== 'admin') {
        return sendUnauthorized(res, 'Access denied. Admin role required.');
      }

      const [userStats, tenantStats] = await Promise.all([
        User.aggregate([
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              active: { $sum: { $cond: ['$isActive', 1, 0] } },
              inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
              adminCount: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
              staffCount: { $sum: { $cond: [{ $eq: ['$role', 'staff'] }, 1, 0] } },
              tenantCount: { $sum: { $cond: [{ $eq: ['$role', 'tenant'] }, 1, 0] } }
            }
          }
        ]),
        Tenant.aggregate([
          {
            $group: {
              _id: null,
              activeTenants: { $sum: { $cond: [{ $eq: ['$tenantStatus', 'active'] }, 1, 0] } },
              inactiveTenants: { $sum: { $cond: [{ $eq: ['$tenantStatus', 'inactive'] }, 1, 0] } },
              pendingTenants: { $sum: { $cond: [{ $eq: ['$tenantStatus', 'pending'] }, 1, 0] } },
              terminatedTenants: { $sum: { $cond: [{ $eq: ['$tenantStatus', 'terminated'] }, 1, 0] } }
            }
          }
        ])
      ]);

      const stats = {
        users: userStats[0] || {
          total: 0,
          active: 0,
          inactive: 0,
          adminCount: 0,
          staffCount: 0,
          tenantCount: 0
        },
        tenants: tenantStats[0] || {
          activeTenants: 0,
          inactiveTenants: 0,
          pendingTenants: 0,
          terminatedTenants: 0
        }
      };

      return sendSuccess(res, 'User statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Get user statistics error:', error);
      return sendServerError(res, 'Failed to retrieve user statistics');
    }
  }
}

module.exports = new UserController();