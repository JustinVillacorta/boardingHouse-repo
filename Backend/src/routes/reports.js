const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticate, requireAdmin, requireAdminOrStaff } = require('../middleware/auth');
const {
  validateReportCreate,
  validateReportUpdate,
  validateReportStatusUpdate,
} = require('../middleware/validation');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// CRUD operations
router.post('/', validateReportCreate, reportController.createReport); // Create report (tenant)
router.get('/', requireAdminOrStaff, reportController.getAllReports); // Get all reports (admin/staff)
router.get('/my', reportController.getMyReports); // Get current tenant's reports
router.get('/:id', reportController.getReportById); // Get specific report
router.put('/:id', validateReportUpdate, requireAdminOrStaff, reportController.updateReport); // Update report (admin/staff)
router.delete('/:id', requireAdminOrStaff, reportController.deleteReport); // Delete report (admin/staff)
router.put('/:id/status', requireAdminOrStaff, validateReportStatusUpdate, reportController.updateReportStatus); // Update report status

module.exports = router;