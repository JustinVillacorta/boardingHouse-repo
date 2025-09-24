const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');
const {
  validatePaymentCreate,
  validatePaymentUpdate,
  validatePaymentRefund,
  validateLateFeeApplication,
  validatePaymentQuery,
  validatePaymentStatisticsQuery,
  validatePaymentHistoryQuery,
  validatePaymentSearch,
} = require('../middleware/validation');

// Create a new payment (admin/staff only)
router.post('/',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentCreate,
  paymentController.createPayment
);

// Get all payments with filters (admin/staff only)
router.get('/',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentQuery,
  paymentController.getAllPayments
);

// Get payment statistics (admin/staff only)
router.get('/statistics',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentStatisticsQuery,
  paymentController.getPaymentStatistics
);

// Get payment history (admin/staff only)
router.get('/history',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentHistoryQuery,
  paymentController.getPaymentHistory
);

// Search payments (admin/staff only)
router.get('/search',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentSearch,
  paymentController.searchPayments
);

// Get overdue payments (admin/staff only)
router.get('/overdue',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentQuery,
  paymentController.getOverduePayments
);

// Get current tenant's pending payments (tenant only)
router.get('/pending/me',
  authenticate,
  authorize(['tenant']),
  paymentController.getMyPendingPayments
);

// Get payments by tenant ID (admin/staff only)
router.get('/tenant/:tenantId',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentQuery,
  paymentController.getPaymentsByTenant
);

// Apply late fees to overdue payments (admin only)
router.post('/apply-late-fees',
  authenticate,
  authorize(['admin']),
  validateLateFeeApplication,
  paymentController.applyLateFees
);

// Get specific payment by ID
router.get('/:id',
  authenticate,
  authorize(['admin', 'staff', 'tenant']),
  paymentController.getPaymentById
);

// Update payment (admin/staff only)
router.put('/:id',
  authenticate,
  authorize(['admin', 'staff']),
  validatePaymentUpdate,
  paymentController.updatePayment
);

// Delete payment (admin only)
router.delete('/:id',
  authenticate,
  authorize(['admin']),
  paymentController.deletePayment
);

// Download payment receipt (all authenticated users)
router.get('/:id/receipt',
  authenticate,
  authorize(['admin', 'staff', 'tenant']),
  paymentController.downloadReceipt
);

// Process refund (admin only)
router.post('/:id/refund',
  authenticate,
  authorize(['admin']),
  validatePaymentRefund,
  paymentController.processRefund
);

// Mark payment as completed (admin/staff only)
router.put('/:id/complete',
  authenticate,
  authorize(['admin', 'staff']),
  paymentController.markPaymentCompleted
);

module.exports = router;