const { validationResult } = require('express-validator');
const tenantService = require('../services/tenantService');
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} = require('../utils/response');

class TenantController {
  // POST /api/tenants/register - Register new tenant (creates both user account and tenant profile)
  async registerTenant(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const tenantData = req.body;
      const result = await tenantService.registerTenant(tenantData);

      return sendCreated(res, 'Tenant registered successfully', result);
    } catch (error) {
      console.error('Register tenant error:', error);
      
      if (
        error.message.includes('already exists') ||
        error.message.includes('already occupied')
      ) {
        return sendError(res, error.message, 409);
      }
      
      return sendServerError(res, 'Failed to register tenant');
    }
  }

  // POST /api/tenants - Create tenant profile
  async createTenant(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const tenantData = req.body;
      const requestingUser = req.user;

      // If admin/staff is creating for another user, use the provided userId
      // If tenant is creating their own profile, use their own userId
      let targetUserId = tenantData.userId;
      
      if (!targetUserId || requestingUser.role === 'tenant') {
        targetUserId = requestingUser.id;
      }

      const tenant = await tenantService.createTenant(tenantData, targetUserId);

      return sendCreated(res, 'Tenant profile created successfully', tenant);
    } catch (error) {
      console.error('Create tenant error:', error);
      
      if (
        error.message.includes('already exists') ||
        error.message.includes('not found') ||
        error.message.includes('must have tenant role') ||
        error.message.includes('already occupied')
      ) {
        return sendError(res, error.message, 400);
      }
      
      return sendServerError(res, 'Failed to create tenant profile');
    }
  }

  // GET /api/tenants - Get all tenants (admin/staff only)
  async getAllTenants(req, res) {
    try {
      const { status, search, roomNumber, page, limit, sortBy, sortOrder } = req.query;
      
      // Check if user has permission
      if (!['admin', 'staff'].includes(req.user.role)) {
        return sendUnauthorized(res, 'Access denied. Admin or staff role required.');
      }

      let tenants;
      
      // If pagination parameters are provided, use searchWithPagination
      if (page || limit) {
        const searchOptions = {
          search,
          status,
          page: parseInt(page) || 1,
          limit: parseInt(limit) || 10,
          sortBy: sortBy || 'createdAt',
          sortOrder: sortOrder || 'desc'
        };
        
        const result = await tenantService.searchTenants(searchOptions);
        
        return sendSuccess(res, 'Tenants retrieved successfully', {
          tenants: result.tenants,
          pagination: result.pagination
        });
      } else {
        // Simple filtering
        const filters = {};
        if (status) filters.status = status;
        if (search) filters.search = search;
        if (roomNumber) filters.roomNumber = roomNumber;
        
        tenants = await tenantService.getAllTenants(filters);
        
        return sendSuccess(res, 'Tenants retrieved successfully', tenants);
      }
    } catch (error) {
      console.error('Get all tenants error:', error);
      return sendServerError(res, 'Failed to retrieve tenants');
    }
  }

  // GET /api/tenants/:id - Get specific tenant
  async getTenantById(req, res) {
    try {
      const { id } = req.params;
      const requestingUser = req.user;

      const tenant = await tenantService.getTenantById(id);
      
      // Authorization check - admin/staff can view any tenant, tenants can only view their own
      if (requestingUser.role === 'tenant') {
        if (tenant.userId._id.toString() !== requestingUser.id) {
          return sendUnauthorized(res, 'Access denied. You can only view your own profile.');
        }
      }

      return sendSuccess(res, 'Tenant retrieved successfully', tenant);
    } catch (error) {
      console.error('Get tenant by ID error:', error);
      
      if (error.message === 'Tenant not found') {
        return sendNotFound(res, error.message);
      }
      
      return sendServerError(res, 'Failed to retrieve tenant');
    }
  }

  // PUT /api/tenants/:id - Update tenant profile
  async updateTenant(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const updateData = req.body;
      const requestingUser = req.user;

      const updatedTenant = await tenantService.updateTenant(
        id, 
        updateData, 
        requestingUser.id, 
        requestingUser.role
      );

      return sendSuccess(res, 'Tenant profile updated successfully', updatedTenant);
    } catch (error) {
      console.error('Update tenant error:', error);
      
      if (
        error.message.includes('not found') ||
        error.message.includes('Not authorized') ||
        error.message.includes('already occupied') ||
        error.message.includes('must be after')
      ) {
        return sendError(res, error.message, 400);
      }
      
      return sendServerError(res, 'Failed to update tenant profile');
    }
  }

  // DELETE /api/tenants/:id - Delete tenant (admin only)
  async deleteTenant(req, res) {
    try {
      const { id } = req.params;
      const requestingUser = req.user;

      const result = await tenantService.deleteTenant(id, requestingUser.role);

      return sendSuccess(res, result.message, result.deletedTenant);
    } catch (error) {
      console.error('Delete tenant error:', error);
      
      if (error.message.includes('not found')) {
        return sendNotFound(res, error.message);
      }
      
      if (error.message.includes('Only administrators')) {
        return sendUnauthorized(res, error.message);
      }
      
      return sendServerError(res, 'Failed to delete tenant');
    }
  }

  // GET /api/tenants/me - Get current tenant's profile
  async getCurrentTenantProfile(req, res) {
    try {
      const userId = req.user.id;

      // Verify user has tenant role
      if (req.user.role !== 'tenant') {
        return sendError(res, 'Only tenants can access this endpoint', 403);
      }

      const tenant = await tenantService.getTenantByUserId(userId);

      return sendSuccess(res, 'Tenant profile retrieved successfully', tenant);
    } catch (error) {
      console.error('Get current tenant profile error:', error);
      
      if (error.message === 'Tenant profile not found') {
        return sendNotFound(res, 'Tenant profile not found. Please create your profile first.');
      }
      
      return sendServerError(res, 'Failed to retrieve tenant profile');
    }
  }

  // PUT /api/tenants/me - Update current tenant's profile
  async updateCurrentTenantProfile(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const updateData = req.body;

      // Verify user has tenant role
      if (req.user.role !== 'tenant') {
        return sendError(res, 'Only tenants can access this endpoint', 403);
      }

      const updatedTenant = await tenantService.updateTenantByUserId(userId, updateData);

      return sendSuccess(res, 'Tenant profile updated successfully', updatedTenant);
    } catch (error) {
      console.error('Update current tenant profile error:', error);
      
      if (
        error.message.includes('not found') ||
        error.message.includes('already occupied') ||
        error.message.includes('must be after')
      ) {
        return sendError(res, error.message, 400);
      }
      
      return sendServerError(res, 'Failed to update tenant profile');
    }
  }

  // GET /api/tenants/statistics - Get tenant statistics (admin/staff only)
  async getTenantStatistics(req, res) {
    try {
      // Check if user has permission
      if (!['admin', 'staff'].includes(req.user.role)) {
        return sendUnauthorized(res, 'Access denied. Admin or staff role required.');
      }

      const statistics = await tenantService.getTenantStatistics();

      return sendSuccess(res, 'Tenant statistics retrieved successfully', statistics);
    } catch (error) {
      console.error('Get tenant statistics error:', error);
      return sendServerError(res, 'Failed to retrieve tenant statistics');
    }
  }

  // GET /api/tenants/expiring-leases - Get tenants with expiring leases (admin/staff only)
  async getTenantsWithExpiringLeases(req, res) {
    try {
      // Check if user has permission
      if (!['admin', 'staff'].includes(req.user.role)) {
        return sendUnauthorized(res, 'Access denied. Admin or staff role required.');
      }

      const { days } = req.query;
      const daysToExpiry = parseInt(days) || 30;

      const tenants = await tenantService.getTenantsWithExpiringLeases(daysToExpiry);

      return sendSuccess(res, 'Tenants with expiring leases retrieved successfully', {
        tenants,
        daysToExpiry,
        count: tenants.length
      });
    } catch (error) {
      console.error('Get tenants with expiring leases error:', error);
      return sendServerError(res, 'Failed to retrieve tenants with expiring leases');
    }
  }

  // GET /api/tenants/by-status/:status - Get tenants by status (admin/staff only)
  async getTenantsByStatus(req, res) {
    try {
      // Check if user has permission
      if (!['admin', 'staff'].includes(req.user.role)) {
        return sendUnauthorized(res, 'Access denied. Admin or staff role required.');
      }

      const { status } = req.params;
      const validStatuses = ['active', 'inactive', 'pending', 'terminated'];
      
      if (!validStatuses.includes(status)) {
        return sendError(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '), 400);
      }

      const tenants = await tenantService.getTenantsByStatus(status);

      return sendSuccess(res, `Tenants with status '${status}' retrieved successfully`, tenants);
    } catch (error) {
      console.error('Get tenants by status error:', error);
      return sendServerError(res, 'Failed to retrieve tenants by status');
    }
  }

  // PUT /api/tenants/:id/status - Update tenant status (admin/staff only)
  async updateTenantStatus(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { status } = req.body;
      const requestingUser = req.user;

      const updatedTenant = await tenantService.updateTenantStatus(id, status, requestingUser.role);

      return sendSuccess(res, 'Tenant status updated successfully', updatedTenant);
    } catch (error) {
      console.error('Update tenant status error:', error);
      
      if (
        error.message.includes('not found') ||
        error.message.includes('Invalid tenant status')
      ) {
        return sendError(res, error.message, 400);
      }
      
      if (error.message.includes('Only administrators')) {
        return sendUnauthorized(res, error.message);
      }
      
      return sendServerError(res, 'Failed to update tenant status');
    }
  }
}

module.exports = new TenantController();