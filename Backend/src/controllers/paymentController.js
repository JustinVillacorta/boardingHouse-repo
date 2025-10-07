const paymentService = require('../services/paymentService');
const { validationResult } = require('express-validator');
const { sendResponse, sendError } = require('../utils/response');
const fs = require('fs');

class PaymentController {
  /**
   * Create a new payment
   * POST /api/payments
   */
  async createPayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const payment = await paymentService.createPayment(req.body, req.user.id);
      
      sendResponse(res, 'Payment created successfully', payment, 201);
    } catch (error) {
      console.error('Create payment error:', error);
      sendError(res, error.message, 400);
    }
  }

  /**
   * Get all payments with filters and pagination
   * GET /api/payments
   */
  async getAllPayments(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const {
        page = 1,
        limit = 10,
        sort = 'paymentDate',
        order = 'desc',
        tenantId,
        roomId,
        status,
        paymentType,
        paymentMethod,
        startDate,
        endDate,
        amountMin,
        amountMax,
        overdue
      } = req.query;

      const filters = {
        tenantId,
        roomId,
        status,
        paymentType,
        paymentMethod,
        startDate,
        endDate,
        amountMin,
        amountMax,
        overdue
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: order === 'desc' ? -1 : 1 }
      };

      const result = await paymentService.getAllPayments(filters, options);
      
      // Format for frontend compatibility
      const formattedPayments = result.payments.map(payment => ({
        id: payment._id,
        roomnumber: payment.room?.roomNumber || 'N/A',
        assignee: payment.tenant ? `${payment.tenant.firstName} ${payment.tenant.lastName}` : 'Unknown',
        status: payment.status === 'paid' ? 'Occupied' : 'More Info',
        dueDate: payment.dueDate.toISOString().split('T')[0],
        // Full payment details for detailed views
        amount: payment.amount,
        paymentType: payment.paymentType,
        paymentMethod: payment.paymentMethod,
        paymentDate: payment.paymentDate,
        receiptNumber: payment.receiptNumber,
        isLatePayment: payment.isLatePayment,
        tenant: payment.tenant,
        room: payment.room
      }));
      
      sendResponse(res, 'Payments retrieved successfully', {
        payments: formattedPayments,
        pagination: result.pagination,
        total: result.total
      });
    } catch (error) {
      console.error('Get all payments error:', error);
      sendError(res, error.message, 500);
    }
  }

  /**
   * Get specific payment by ID
   * GET /api/payments/:id
   */
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;
      const payment = await paymentService.getPaymentById(id);
      
      sendResponse(res, 'Payment retrieved successfully', { payment });
    } catch (error) {
      console.error('Get payment by ID error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Update payment
   * PUT /api/payments/:id
   */
  async updatePayment(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const updatedPayment = await paymentService.updatePayment(id, req.body, req.user.id);
      
      sendResponse(res, 'Payment updated successfully', { payment: updatedPayment });
    } catch (error) {
      console.error('Update payment error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Delete payment
   * DELETE /api/payments/:id
   */
  async deletePayment(req, res) {
    try {
      const { id } = req.params;
      await paymentService.deletePayment(id);
      
      sendResponse(res, 'Payment deleted successfully');
    } catch (error) {
      console.error('Delete payment error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Get payments by tenant ID
   * GET /api/payments/tenant/:tenantId
   */
  async getPaymentsByTenant(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { tenantId } = req.params;
      const {
        page = 1,
        limit = 10,
        sort = 'paymentDate',
        order = 'desc'
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: order === 'desc' ? -1 : 1 }
      };

      const result = await paymentService.getPaymentsByTenant(tenantId, options);
      
      sendResponse(res, 'Tenant payments retrieved successfully', result);
    } catch (error) {
      console.error('Get payments by tenant error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Get overdue payments
   * GET /api/payments/overdue
   */
  async getOverduePayments(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const {
        page = 1,
        limit = 10,
        tenantId,
        roomId
      } = req.query;

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        tenantId,
        roomId
      };

      const result = await paymentService.getOverduePayments(options);
      
      sendResponse(res, 'Overdue payments retrieved successfully', result);
    } catch (error) {
      console.error('Get overdue payments error:', error);
      sendError(res, error.message, 500);
    }
  }

  /**
   * Download payment receipt
   * GET /api/payments/:id/receipt
   */
  async downloadReceipt(req, res) {
    try {
      const { id } = req.params;
      
      // Check if receipt already exists
      const payment = await paymentService.getPaymentById(id);
      
      let receiptPath = payment.receiptPath;
      
      // Generate receipt if it doesn't exist
      if (!receiptPath || !fs.existsSync(receiptPath)) {
        const receiptInfo = await paymentService.generateReceiptPDF(id);
        receiptPath = receiptInfo.filepath;
      }

      // Send the PDF file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${payment.receiptNumber}.pdf"`);
      
      const stream = fs.createReadStream(receiptPath);
      stream.pipe(res);
    } catch (error) {
      console.error('Download receipt error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 500;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Process refund
   * POST /api/payments/:id/refund
   */
  async processRefund(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { id } = req.params;
      const refundData = req.body;
      
      const updatedPayment = await paymentService.processRefund(id, refundData, req.user.id);
      
      sendResponse(res, 'Refund processed successfully', { payment: updatedPayment });
    } catch (error) {
      console.error('Process refund error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Apply late fees to overdue payments
   * POST /api/payments/apply-late-fees
   */
  async applyLateFees(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const { lateFeeAmount = 50 } = req.body;
      
      const result = await paymentService.applyLateFees(parseFloat(lateFeeAmount));
      
      sendResponse(res, 'Late fees applied successfully', result);
    } catch (error) {
      console.error('Apply late fees error:', error);
      sendError(res, error.message, 500);
    }
  }

  /**
   * Get payment statistics
   * GET /api/payments/statistics
   */
  async getPaymentStatistics(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const {
        tenantId,
        roomId,
        paymentType,
        startDate,
        endDate
      } = req.query;

      const filters = {
        tenantId,
        roomId,
        paymentType,
        startDate,
        endDate
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const statistics = await paymentService.getPaymentStatistics(filters);
      
      sendResponse(res, 'Payment statistics retrieved successfully', { statistics });
    } catch (error) {
      console.error('Get payment statistics error:', error);
      sendError(res, error.message, 500);
    }
  }

  /**
   * Get payment history
   * GET /api/payments/history
   */
  async getPaymentHistory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const {
        startDate,
        endDate,
        tenantId,
        roomId,
        paymentType,
        groupBy = 'month'
      } = req.query;

      if (!startDate || !endDate) {
        return sendError(res, 'Start date and end date are required', 400);
      }

      const options = {
        tenantId,
        roomId,
        paymentType,
        groupBy
      };

      const history = await paymentService.getPaymentHistory(startDate, endDate, options);
      
      sendResponse(res, 'Payment history retrieved successfully', history);
    } catch (error) {
      console.error('Get payment history error:', error);
      sendError(res, error.message, 500);
    }
  }

  /**
   * Get pending payments for current tenant
   * GET /api/payments/pending/me
   */
  async getMyPendingPayments(req, res) {
    try {
      // This endpoint is for tenants to view their own pending payments
      if (req.user.role !== 'tenant') {
        return sendError(res, 'This endpoint is only for tenants', 403);
      }

      // Find tenant record for the current user
      const tenantRepository = require('../repositories/tenantRepository');
      const tenant = await tenantRepository.findByUserId(req.user.id);
      
      if (!tenant) {
        return sendError(res, 'Tenant profile not found', 404);
      }

      const result = await paymentService.getPendingPaymentsByTenant(tenant._id);
      
      sendResponse(res, 'Pending payments retrieved successfully', result);
    } catch (error) {
      console.error('Get my pending payments error:', error);
      sendError(res, error.message, 500);
    }
  }

  /**
   * Mark payment as completed
   * PUT /api/payments/:id/complete
   */
  async markPaymentCompleted(req, res) {
    try {
      const { id } = req.params;
      const completedPayment = await paymentService.markPaymentCompleted(id, req.user.id);
      
      sendResponse(res, 'Payment marked as completed successfully', { payment: completedPayment });
    } catch (error) {
      console.error('Mark payment completed error:', error);
      const statusCode = error.message.includes('not found') ? 404 : 400;
      sendError(res, error.message, statusCode);
    }
  }

  /**
   * Search payments
   * GET /api/payments/search
   */
  async searchPayments(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, errors.array());
      }

      const {
        query: searchQuery,
        page = 1,
        limit = 10,
        sort = 'paymentDate',
        order = 'desc',
        status,
        paymentType,
        startDate,
        endDate
      } = req.query;

      const filters = {
        status,
        paymentType,
        startDate,
        endDate
      };

      // Remove undefined values
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined) {
          delete filters[key];
        }
      });

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sort: { [sort]: order === 'desc' ? -1 : 1 }
      };

      const result = await paymentService.searchPayments(searchQuery, filters, options);
      
      sendResponse(res, 'Payment search completed successfully', result);
    } catch (error) {
      console.error('Search payments error:', error);
      sendError(res, error.message, 500);
    }
  }
}

module.exports = new PaymentController();