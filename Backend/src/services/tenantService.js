const tenantRepository = require('../repositories/tenantRepository');
const userRepository = require('../repositories/userRepository');
const { generateAccessToken } = require('../utils/jwt');
const emailService = require('../utils/emailService');
const config = require('../config/config');

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

      // Check if room number is available (if provided)
      if (roomNumber) {
        const isRoomAvailable = await tenantRepository.isRoomNumberAvailable(roomNumber);
        if (!isRoomAvailable) {
          throw new Error('Room number is already occupied');
        }
      }

      // Create user account with tenant role
      const user = await userRepository.create({
        username,
        email,
        password,
        role: 'tenant',
      });

      // Create tenant profile
      const tenant = await tenantRepository.create({
        userId: user._id,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        idType,
        idNumber,
        emergencyContact,
        roomNumber,
        leaseStartDate,
        leaseEndDate,
        monthlyRent,
        securityDeposit,
      });

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

  // Create new tenant profile (creates user account + tenant profile with OTP)
  async createTenant(tenantData, userId = null) {
    try {
      const { email, firstName, lastName, phoneNumber, dateOfBirth, idType, idNumber, emergencyContact, roomNumber, monthlyRent, securityDeposit } = tenantData;
      
      // If userId is provided, use it; otherwise create new user account
      let targetUserId = userId;
      let user;
      
      console.log('createTenant called with userId:', userId, 'email:', email);
      console.log('targetUserId is null/undefined:', targetUserId === null || targetUserId === undefined);
      
      // If we have an email but no valid userId, create new user
      if (email && !targetUserId) {
        // Check if user already exists
        const existingUserByEmail = await userRepository.findByEmail(email);
        if (existingUserByEmail) {
          throw new Error('User with this email already exists');
        }

        // Generate username from email
        const emailPrefix = email.split('@')[0];
        let username = `${emailPrefix}_${Date.now().toString().slice(-4)}`;
        
        // Check if generated username already exists
        const existingUserByUsername = await userRepository.findByUsername(username);
        if (existingUserByUsername) {
          username = `${username}_${Date.now().toString().slice(-4)}`;
        }

        // Generate verification token
        const verificationToken = emailService.generateVerificationToken();
        const verificationTokenExpiry = new Date(Date.now() + config.VERIFICATION_TOKEN_EXPIRY);

        // Create user account (unverified)
        user = await userRepository.create({
          username,
          email,
          role: 'tenant',
          isActive: false,
          isVerified: false,
          verificationToken,
          verificationTokenExpiry,
        });
        
        targetUserId = user._id;
      } else {
        // Verify existing user exists and has tenant role
        user = await userRepository.findById(targetUserId);
        if (!user) {
          throw new Error('User not found');
        }

        if (user.role !== 'tenant') {
          throw new Error('User must have tenant role to create tenant profile');
        }
      }

      // Check if tenant profile already exists for this user
      const existingTenant = await tenantRepository.findByUserId(targetUserId);
      if (existingTenant) {
        throw new Error('Tenant profile already exists for this user');
      }

      // Check if room number is available (if provided)
      if (roomNumber) {
        const isRoomAvailable = await tenantRepository.isRoomNumberAvailable(roomNumber);
        if (!isRoomAvailable) {
          throw new Error('Room number is already occupied');
        }
      }

      // Create tenant profile
      const tenant = await tenantRepository.create({
        userId: targetUserId,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth,
        idType,
        idNumber,
        emergencyContact,
        roomNumber,
        monthlyRent,
        securityDeposit,
      });

      // Send verification email (only if we created a new user)
      if (!userId) {
        emailService.sendVerificationEmail(email, user.verificationToken, 'tenant', {
          firstName,
          roomNumber,
          monthlyRent
        })
          .then(() => {
            console.log(`Verification email sent to ${email}`);
          })
          .catch((error) => {
            console.error(`Failed to send verification email to ${email}:`, error.message);
            console.log(`MANUAL VERIFICATION TOKEN for ${email}: ${user.verificationToken}`);
          });
      }

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        tenant: this.formatTenantResponse(tenant),
        message: userId ? 'Tenant profile created successfully' : 'Tenant created successfully. Activation email sent to ' + email
      };
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