const express = require('express');
const tenantController = require('../controllers/tenantController');
const { authenticate, requireAdmin, requireAdminOrStaff } = require('../middleware/auth');
const {
  validateTenantRegister,
  validateTenantCreate,
  validateTenantUpdate,
  validateTenantStatusUpdate,
} = require('../middleware/validation');

const router = express.Router();

// Public route for tenant registration
router.post('/register', validateTenantRegister, tenantController.registerTenant);

// All other tenant routes require authentication
router.use(authenticate);

// GET /api/tenants/me - Get current tenant's profile (tenant only)
router.get('/me', tenantController.getCurrentTenantProfile);

// GET /api/tenants/dashboard - Get tenant dashboard data (tenant only)
router.get('/dashboard', tenantController.getTenantDashboard);

// PUT /api/tenants/me - Update current tenant's profile (tenant only)
router.put('/me', validateTenantUpdate, tenantController.updateCurrentTenantProfile);

// GET /api/tenants/statistics - Get tenant statistics (admin/staff only)
router.get('/statistics', requireAdminOrStaff, tenantController.getTenantStatistics);

// GET /api/tenants/expiring-leases - Get tenants with expiring leases (admin/staff only)
router.get('/expiring-leases', requireAdminOrStaff, tenantController.getTenantsWithExpiringLeases);

// GET /api/tenants/by-status/:status - Get tenants by status (admin/staff only)
router.get('/by-status/:status', requireAdminOrStaff, tenantController.getTenantsByStatus);

// POST /api/tenants - Create tenant profile
router.post('/', validateTenantCreate, tenantController.createTenant);

// GET /api/tenants - Get all tenants (admin/staff only)
router.get('/', requireAdminOrStaff, tenantController.getAllTenants);

// GET /api/tenants/:id - Get specific tenant
router.get('/:id', tenantController.getTenantById);

// PUT /api/tenants/:id - Update tenant profile
router.put('/:id', validateTenantUpdate, tenantController.updateTenant);

// DELETE /api/tenants/:id - Delete tenant (admin only)
router.delete('/:id', requireAdmin, tenantController.deleteTenant);

// PUT /api/tenants/:id/status - Update tenant status (admin/staff only)
router.put('/:id/status', requireAdminOrStaff, validateTenantStatusUpdate, tenantController.updateTenantStatus);

module.exports = router;