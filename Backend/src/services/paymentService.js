const paymentRepository = require('../repositories/paymentRepository');
const tenantRepository = require('../repositories/tenantRepository');
const roomRepository = require('../repositories/roomRepository');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class PaymentService {
  /**
   * Create a new payment
   */
  async createPayment(paymentData, createdBy) {
    try {
      // Validate tenant exists and is active
      const tenant = await tenantRepository.findById(paymentData.tenant);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      if (tenant.tenantStatus !== 'active') {
        throw new Error('Cannot create payment for inactive tenant');
      }

      // Validate room exists and tenant is assigned to the room
      const room = await roomRepository.findById(paymentData.room);
      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.currentTenant || room.currentTenant.toString() !== tenant._id.toString()) {
        throw new Error('Tenant is not assigned to this room');
      }

      // Generate unique receipt number if payment is being marked as paid
      let receiptNumber = null;
      if (paymentData.status === 'paid') {
        receiptNumber = this.generateReceiptNumber();
      }

      // Calculate if payment is late if payment date is provided
      let isLatePayment = false;
      if (paymentData.paymentDate && paymentData.dueDate) {
        const dueDate = new Date(paymentData.dueDate);
        const paymentDate = new Date(paymentData.paymentDate);
        isLatePayment = paymentDate > dueDate;
      }

      const payment = {
        ...paymentData,
        receiptNumber,
        recordedBy: createdBy,
        isLatePayment,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newPayment = await paymentRepository.create(payment);
      
      // Populate the created payment
      return await paymentRepository.findById(newPayment._id);
    } catch (error) {
      throw new Error(`Failed to create payment: ${error.message}`);
    }
  }

  /**
   * Get all payments with filtering and pagination
   */
  async getAllPayments(filters, options) {
    try {
      const result = await paymentRepository.findAll(filters, options);
      
      return {
        payments: result.payments,
        pagination: result.pagination,
        total: result.pagination.totalCount
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payments: ${error.message}`);
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(id) {
    try {
      const payment = await paymentRepository.findById(id);
      
      if (!payment) {
        throw new Error('Payment not found');
      }

      return payment;
    } catch (error) {
      throw new Error(`Failed to retrieve payment: ${error.message}`);
    }
  }

  /**
   * Update payment
   */
  async updatePayment(id, updateData, updatedBy) {
    try {
      const existingPayment = await paymentRepository.findById(id);
      if (!existingPayment) {
        throw new Error('Payment not found');
      }

      // Validate that tenant exists if being updated
      if (updateData.tenant) {
        const tenant = await tenantRepository.findById(updateData.tenant);
        if (!tenant) {
          throw new Error('Tenant not found');
        }
      }

      // Validate that room exists if being updated
      if (updateData.room) {
        const room = await roomRepository.findById(updateData.room);
        if (!room) {
          throw new Error('Room not found');
        }
      }

      // Recalculate late payment status if dates are being updated
      if (updateData.paymentDate || updateData.dueDate) {
        const paymentDate = new Date(updateData.paymentDate || existingPayment.paymentDate);
        const dueDate = new Date(updateData.dueDate || existingPayment.dueDate);
        if (paymentDate && dueDate) {
          updateData.isLatePayment = paymentDate > dueDate;
        }
      }

      // Generate receipt number if marking as paid and doesn't have one
      if (updateData.status === 'paid' && !existingPayment.receiptNumber) {
        updateData.receiptNumber = this.generateReceiptNumber();
      }

      updateData.updatedAt = new Date();
      
      const updatedPayment = await paymentRepository.update(id, updateData);

      return updatedPayment;
    } catch (error) {
      throw new Error(`Failed to update payment: ${error.message}`);
    }
  }

  /**
   * Delete payment
   */
  async deletePayment(id) {
    try {
      const payment = await paymentRepository.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      await paymentRepository.delete(id);

      return true;
    } catch (error) {
      throw new Error(`Failed to delete payment: ${error.message}`);
    }
  }

  /**
   * Get payments by tenant
   */
  async getPaymentsByTenant(tenantId, options) {
    try {
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const result = await paymentRepository.findByTenant(tenantId, options);

      return {
        payments: result.payments,
        pagination: result.pagination,
        tenant: {
          id: tenant._id,
          name: `${tenant.firstName} ${tenant.lastName}`,
          roomNumber: tenant.roomNumber
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve tenant payments: ${error.message}`);
    }
  }

  /**
   * Get overdue payments
   */
  async getOverduePayments(options) {
    try {
      // First, update any pending payments that are now overdue
      await this.updateOverduePayments();

      const filters = { status: 'overdue' };
      if (options.tenantId) filters.tenantId = options.tenantId;
      if (options.roomId) filters.roomId = options.roomId;

      const result = await paymentRepository.findAll(filters, {
        page: options.page || 1,
        limit: options.limit || 10,
        sort: { dueDate: 1 }
      });

      return {
        payments: result.payments,
        pagination: result.pagination
      };
    } catch (error) {
      throw new Error(`Failed to retrieve overdue payments: ${error.message}`);
    }
  }

  /**
   * Get pending payments for a tenant
   */
  async getPendingPaymentsByTenant(tenantId) {
    try {
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const result = await paymentRepository.findAll(
        { tenantId, status: 'pending' },
        { sort: { dueDate: 1 } }
      );

      return {
        payments: result.payments,
        tenant: {
          id: tenant._id,
          name: `${tenant.firstName} ${tenant.lastName}`
        }
      };
    } catch (error) {
      throw new Error(`Failed to retrieve pending payments: ${error.message}`);
    }
  }

  /**
   * Mark payment as completed
   */
  async markPaymentCompleted(id, completedBy) {
    try {
      const payment = await paymentRepository.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status === 'paid') {
        throw new Error('Payment is already marked as paid');
      }

      const updateData = {
        status: 'paid',
        paymentDate: new Date(),
        recordedBy: completedBy,
        updatedAt: new Date()
      };

      // Check if payment is late
      if (new Date() > new Date(payment.dueDate)) {
        updateData.isLatePayment = true;
      }

      // Generate receipt number if not exists
      if (!payment.receiptNumber) {
        updateData.receiptNumber = this.generateReceiptNumber();
      }

      const updatedPayment = await paymentRepository.update(id, updateData);
      return updatedPayment;
    } catch (error) {
      throw new Error(`Failed to mark payment as completed: ${error.message}`);
    }
  }

  /**
   * Process refund
   */
  async processRefund(id, refundData, processedBy) {
    try {
      const payment = await paymentRepository.findById(id);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'paid') {
        throw new Error('Can only refund paid payments');
      }

      if (refundData.amount > payment.amount) {
        throw new Error('Refund amount cannot exceed payment amount');
      }

      const updateData = {
        status: 'refunded',
        refund: {
          amount: refundData.amount,
          reason: refundData.reason,
          processedBy,
          processedAt: new Date()
        },
        updatedAt: new Date()
      };

      const updatedPayment = await paymentRepository.update(id, updateData);
      return updatedPayment;
    } catch (error) {
      throw new Error(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Apply late fees to overdue payments
   */
  async applyLateFees(lateFeeAmount) {
    try {
      // First update overdue status
      await this.updateOverduePayments();

      // Get all overdue payments without late fees
      const overduePayments = await paymentRepository.findAll({
        status: 'overdue',
        'lateFee.amount': { $lte: 0 }
      });

      const updatedPayments = [];

      for (const payment of overduePayments.payments) {
        const daysLate = Math.ceil((new Date() - new Date(payment.dueDate)) / (1000 * 60 * 60 * 24));
        
        const lateFee = {
          amount: lateFeeAmount,
          reason: `Late payment fee - ${daysLate} days overdue`,
          appliedDate: new Date()
        };

        const updatedPayment = await paymentRepository.update(payment._id, {
          lateFee,
          updatedAt: new Date()
        });

        updatedPayments.push(updatedPayment);
      }

      return {
        appliedCount: updatedPayments.length,
        totalLateFees: updatedPayments.length * lateFeeAmount,
        payments: updatedPayments
      };
    } catch (error) {
      throw new Error(`Failed to apply late fees: ${error.message}`);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(filters) {
    try {
      const stats = await paymentRepository.getStatistics(filters);
      return stats;
    } catch (error) {
      throw new Error(`Failed to retrieve payment statistics: ${error.message}`);
    }
  }

  /**
   * Get payment history
   */
  async getPaymentHistory(startDate, endDate, options) {
    try {
      const history = await paymentRepository.getPaymentHistory(startDate, endDate, options);
      return history;
    } catch (error) {
      throw new Error(`Failed to retrieve payment history: ${error.message}`);
    }
  }

  /**
   * Search payments
   */
  async searchPayments(searchQuery, filters, options) {
    try {
      const result = await paymentRepository.searchPayments(searchQuery, filters);
      return {
        payments: result,
        total: result.length
      };
    } catch (error) {
      throw new Error(`Failed to search payments: ${error.message}`);
    }
  }

  /**
   * Generate PDF receipt
   */
  async generateReceiptPDF(paymentId) {
    try {
      const payment = await paymentRepository.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (payment.status !== 'paid') {
        throw new Error('Can only generate receipts for paid payments');
      }

      // Ensure receipts directory exists
      const receiptsDir = path.join(__dirname, '../../uploads/receipts');
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
      }

      const filename = `receipt-${payment.receiptNumber}.pdf`;
      const filepath = path.join(receiptsDir, filename);

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument();
          const stream = fs.createWriteStream(filepath);
          
          doc.pipe(stream);

          // Header
          doc.fontSize(20).text('PAYMENT RECEIPT', 50, 50);
          doc.fontSize(12).text(`Receipt #: ${payment.receiptNumber}`, 50, 80);
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 95);

          // Tenant Information
          doc.fontSize(14).text('Tenant Information:', 50, 130);
          doc.fontSize(10)
            .text(`Name: ${payment.tenant.firstName} ${payment.tenant.lastName}`, 50, 150)
            .text(`Email: ${payment.tenant.email}`, 50, 165)
            .text(`Phone: ${payment.tenant.phoneNumber}`, 50, 180);

          // Room Information
          doc.fontSize(14).text('Room Information:', 300, 130);
          doc.fontSize(10)
            .text(`Room Number: ${payment.room.roomNumber}`, 300, 150)
            .text(`Room Type: ${payment.room.roomType}`, 300, 165)
            .text(`Monthly Rent: ₱${payment.room.monthlyRent}`, 300, 180);

          // Payment Details
          doc.fontSize(14).text('Payment Details:', 50, 220);
          doc.fontSize(10)
            .text(`Payment Date: ${new Date(payment.paymentDate).toLocaleDateString()}`, 50, 240)
            .text(`Due Date: ${new Date(payment.dueDate).toLocaleDateString()}`, 50, 255)
            .text(`Payment Type: ${payment.paymentType}`, 50, 270)
            .text(`Payment Method: ${payment.paymentMethod}`, 50, 285)
            .text(`Amount: ₱${payment.amount.toFixed(2)}`, 50, 300);

          if (payment.lateFee && payment.lateFee.amount > 0) {
            doc.text(`Late Fee: ₱${payment.lateFee.amount.toFixed(2)}`, 50, 315);
            doc.text(`Total Amount: ₱${(payment.amount + payment.lateFee.amount).toFixed(2)}`, 50, 330);
          }

          if (payment.transactionReference) {
            doc.text(`Transaction Reference: ${payment.transactionReference}`, 50, 345);
          }

          if (payment.description) {
            doc.text(`Description: ${payment.description}`, 50, 360);
          }

          // Status
          const statusY = payment.lateFee && payment.lateFee.amount > 0 ? 380 : 345;
          if (payment.isLatePayment) {
            doc.fillColor('red').text('LATE PAYMENT', 50, statusY);
          } else {
            doc.fillColor('green').text('ON TIME PAYMENT', 50, statusY);
          }

          // Footer
          doc.fillColor('black')
            .fontSize(8)
            .text('This is a computer-generated receipt.', 50, 500)
            .text(`Generated on: ${new Date().toISOString()}`, 50, 515);

          doc.end();

          stream.on('finish', () => {
            resolve({
              filename,
              filepath,
              payment
            });
          });

          stream.on('error', reject);
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      throw new Error(`Failed to generate receipt: ${error.message}`);
    }
  }

  /**
   * Update overdue payments
   */
  async updateOverduePayments() {
    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0); // Start of today
      
      const result = await paymentRepository.findAll({
        status: 'pending',
        dueDate: { $lt: currentDate }
      });

      const updatePromises = result.payments.map(payment => 
        paymentRepository.update(payment._id, { 
          status: 'overdue',
          updatedAt: new Date()
        })
      );

      await Promise.all(updatePromises);

      return {
        updatedCount: result.payments.length
      };
    } catch (error) {
      throw new Error(`Failed to update overdue payments: ${error.message}`);
    }
  }

  /**
   * Generate unique receipt number
   */
  generateReceiptNumber() {
    const timestamp = Date.now();
    const random = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `RCP-${timestamp}-${random}`;
  }

  /**
   * Validate payment data
   */
  validatePaymentData(paymentData) {
    const errors = [];

    if (!paymentData.tenant) {
      errors.push('Tenant is required');
    }

    if (!paymentData.room) {
      errors.push('Room is required');
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      errors.push('Valid payment amount is required');
    }

    if (!paymentData.dueDate) {
      errors.push('Due date is required');
    }

    if (!paymentData.paymentType) {
      errors.push('Payment type is required');
    }

    if (!paymentData.paymentMethod) {
      errors.push('Payment method is required');
    }

    const validPaymentTypes = ['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'];
    if (paymentData.paymentType && !validPaymentTypes.includes(paymentData.paymentType)) {
      errors.push('Invalid payment type');
    }

    const validPaymentMethods = ['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order'];
    if (paymentData.paymentMethod && !validPaymentMethods.includes(paymentData.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    return errors;
  }

  /**
   * Get payments summary for dashboard
   */
  async getPaymentsSummary(filters = {}) {
    try {
      const [stats, recentPayments, overduePayments] = await Promise.all([
        paymentRepository.getStatistics(filters),
        paymentRepository.findAll({}, { limit: 5, sort: { paymentDate: -1 } }),
        this.getOverduePayments({ limit: 5 })
      ]);

      return {
        statistics: stats,
        recentPayments: recentPayments.payments,
        overduePayments: overduePayments.payments
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payments summary: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();