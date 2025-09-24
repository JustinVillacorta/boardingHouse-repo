const paymentRecordRepository = require('../repositories/paymentRepository');
const tenantRepository = require('../repositories/tenantRepository');
const roomRepository = require('../repositories/roomRepository');
const PDFDocument = require('pdfkit');
const crypto = require('crypto');

class PaymentRecordService {
  /**
   * Create a new payment record
   */
  async createPaymentRecord(paymentData, createdBy) {
    try {
      // Validate tenant exists and is active
      const tenant = await tenantRepository.findById(paymentData.tenant);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      if (tenant.tenantStatus !== 'active') {
        throw new Error('Cannot create payment record for inactive tenant');
      }

      // Validate room exists and tenant is assigned to the room
      const room = await roomRepository.findById(paymentData.room);
      if (!room) {
        throw new Error('Room not found');
      }

      if (!room.currentTenant || room.currentTenant.toString() !== tenant._id.toString()) {
        throw new Error('Tenant is not assigned to this room');
      }

      // Generate unique receipt number
      const receiptNumber = this.generateReceiptNumber();

      // Calculate if payment is late
      const dueDate = new Date(paymentData.dueDate);
      const paymentDate = new Date(paymentData.paymentDate);
      const isLatePayment = paymentDate > dueDate;
      
      // Calculate late fee if applicable
      let lateFee = { applied: false, amount: 0, reason: '' };
      if (isLatePayment && paymentData.lateFee && paymentData.lateFee.amount > 0) {
        const daysLate = Math.ceil((paymentDate - dueDate) / (1000 * 60 * 60 * 24));
        lateFee = {
          applied: true,
          amount: paymentData.lateFee.amount,
          reason: `Late payment fee - ${daysLate} days overdue`,
          appliedDate: new Date()
        };
      }

      const paymentRecord = {
        ...paymentData,
        receiptNumber,
        recordedBy: createdBy,
        isLatePayment,
        lateFee,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const newPaymentRecord = await paymentRecordRepository.create(paymentRecord);
      
      // Populate the created record
      return await paymentRecordRepository.findById(newPaymentRecord._id);
    } catch (error) {
      throw new Error(`Failed to create payment record: ${error.message}`);
    }
  }

  /**
   * Get all payment records with filtering and pagination
   */
  async getAllPaymentRecords(filters, options, userRole) {
    try {
      const result = await paymentRecordRepository.findAll(filters, options);
      
      return {
        success: true,
        data: result.payments,
        pagination: result.pagination,
        message: `Retrieved ${result.payments.length} payment records`
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment records: ${error.message}`);
    }
  }

  /**
   * Get payment record by ID
   */
  async getPaymentRecordById(id) {
    try {
      const paymentRecord = await paymentRecordRepository.findById(id);
      
      if (!paymentRecord) {
        throw new Error('Payment record not found');
      }

      return {
        success: true,
        data: paymentRecord,
        message: 'Payment record retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment record: ${error.message}`);
    }
  }

  /**
   * Update payment record
   */
  async updatePaymentRecord(id, updateData, updatedBy) {
    try {
      const existingRecord = await paymentRecordRepository.findById(id);
      if (!existingRecord) {
        throw new Error('Payment record not found');
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
        const paymentDate = new Date(updateData.paymentDate || existingRecord.paymentDate);
        const dueDate = new Date(updateData.dueDate || existingRecord.dueDate);
        updateData.isLatePayment = paymentDate > dueDate;
      }

      updateData.updatedAt = new Date();
      
      const updatedRecord = await paymentRecordRepository.update(id, updateData);

      return {
        success: true,
        data: updatedRecord,
        message: 'Payment record updated successfully'
      };
    } catch (error) {
      throw new Error(`Failed to update payment record: ${error.message}`);
    }
  }

  /**
   * Delete payment record
   */
  async deletePaymentRecord(id) {
    try {
      const paymentRecord = await paymentRecordRepository.findById(id);
      if (!paymentRecord) {
        throw new Error('Payment record not found');
      }

      await paymentRecordRepository.delete(id);

      return {
        success: true,
        message: 'Payment record deleted successfully'
      };
    } catch (error) {
      throw new Error(`Failed to delete payment record: ${error.message}`);
    }
  }

  /**
   * Get tenant payment records
   */
  async getTenantPaymentRecords(tenantId, options) {
    try {
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      const result = await paymentRecordRepository.findByTenant(tenantId, options);

      return {
        success: true,
        data: result.payments,
        pagination: result.pagination,
        tenant: {
          id: tenant._id,
          name: `${tenant.firstName} ${tenant.lastName}`,
          roomNumber: tenant.roomNumber
        },
        message: `Retrieved payment records for ${tenant.firstName} ${tenant.lastName}`
      };
    } catch (error) {
      throw new Error(`Failed to retrieve tenant payment records: ${error.message}`);
    }
  }

  /**
   * Get room payment records
   */
  async getRoomPaymentRecords(roomId, options) {
    try {
      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const result = await paymentRecordRepository.findByRoom(roomId, options);

      return {
        success: true,
        data: result.payments,
        pagination: result.pagination,
        room: {
          id: room._id,
          roomNumber: room.roomNumber,
          roomType: room.roomType
        },
        message: `Retrieved payment records for room ${room.roomNumber}`
      };
    } catch (error) {
      throw new Error(`Failed to retrieve room payment records: ${error.message}`);
    }
  }

  /**
   * Get late payment records
   */
  async getLatePaymentRecords(options) {
    try {
      const result = await paymentRecordRepository.findLatePayments(options);

      return {
        success: true,
        data: result.payments,
        pagination: result.pagination,
        message: `Retrieved ${result.payments.length} late payment records`
      };
    } catch (error) {
      throw new Error(`Failed to retrieve late payment records: ${error.message}`);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStatistics(filters) {
    try {
      const stats = await paymentRecordRepository.getStatistics(filters);

      return {
        success: true,
        data: stats,
        message: 'Payment statistics retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment statistics: ${error.message}`);
    }
  }

  /**
   * Get payment history for analytics
   */
  async getPaymentHistory(startDate, endDate, options) {
    try {
      const history = await paymentRecordRepository.getPaymentHistory(startDate, endDate, options);

      return {
        success: true,
        data: history,
        message: 'Payment history retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment history: ${error.message}`);
    }
  }

  /**
   * Search payment records
   */
  async searchPaymentRecords(searchQuery, filters) {
    try {
      const payments = await paymentRecordRepository.searchPayments(searchQuery, filters);

      return {
        success: true,
        data: payments,
        message: `Found ${payments.length} payment records matching search criteria`
      };
    } catch (error) {
      throw new Error(`Failed to search payment records: ${error.message}`);
    }
  }

  /**
   * Get payment records by type
   */
  async getPaymentRecordsByType(paymentType, options) {
    try {
      const result = await paymentRecordRepository.findByPaymentType(paymentType, options);

      return {
        success: true,
        data: result.payments,
        pagination: result.pagination,
        message: `Retrieved ${result.payments.length} ${paymentType} payment records`
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment records by type: ${error.message}`);
    }
  }

  /**
   * Generate PDF receipt for payment record
   */
  async generatePaymentReceipt(paymentId) {
    try {
      const paymentRecord = await paymentRecordRepository.findById(paymentId);
      if (!paymentRecord) {
        throw new Error('Payment record not found');
      }

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument();
          let buffers = [];

          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve({
              success: true,
              data: pdfData,
              filename: `receipt_${paymentRecord.receiptNumber}.pdf`,
              message: 'Receipt generated successfully'
            });
          });

          // Header
          doc.fontSize(20).text('PAYMENT RECEIPT', 50, 50);
          doc.fontSize(12).text(`Receipt #: ${paymentRecord.receiptNumber}`, 50, 80);
          doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 95);

          // Tenant Information
          doc.fontSize(14).text('Tenant Information:', 50, 130);
          doc.fontSize(10)
            .text(`Name: ${paymentRecord.tenant.firstName} ${paymentRecord.tenant.lastName}`, 50, 150)
            .text(`Email: ${paymentRecord.tenant.email}`, 50, 165)
            .text(`Phone: ${paymentRecord.tenant.phoneNumber}`, 50, 180);

          // Room Information
          doc.fontSize(14).text('Room Information:', 300, 130);
          doc.fontSize(10)
            .text(`Room Number: ${paymentRecord.room.roomNumber}`, 300, 150)
            .text(`Room Type: ${paymentRecord.room.roomType}`, 300, 165)
            .text(`Monthly Rent: $${paymentRecord.room.monthlyRent}`, 300, 180);

          // Payment Details
          doc.fontSize(14).text('Payment Details:', 50, 220);
          doc.fontSize(10)
            .text(`Payment Date: ${new Date(paymentRecord.paymentDate).toLocaleDateString()}`, 50, 240)
            .text(`Due Date: ${new Date(paymentRecord.dueDate).toLocaleDateString()}`, 50, 255)
            .text(`Payment Type: ${paymentRecord.paymentType}`, 50, 270)
            .text(`Payment Method: ${paymentRecord.paymentMethod}`, 50, 285)
            .text(`Amount: $${paymentRecord.amount.toFixed(2)}`, 50, 300);

          if (paymentRecord.lateFee.applied) {
            doc.text(`Late Fee: $${paymentRecord.lateFee.amount.toFixed(2)}`, 50, 315);
            doc.text(`Total Amount: $${(paymentRecord.amount + paymentRecord.lateFee.amount).toFixed(2)}`, 50, 330);
          }

          if (paymentRecord.transactionReference) {
            doc.text(`Transaction Reference: ${paymentRecord.transactionReference}`, 50, 345);
          }

          if (paymentRecord.description) {
            doc.text(`Description: ${paymentRecord.description}`, 50, 360);
          }

          // Status
          const statusY = paymentRecord.lateFee.applied ? 380 : 345;
          if (paymentRecord.isLatePayment) {
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
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      throw new Error(`Failed to generate receipt: ${error.message}`);
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
   * Validate payment record data
   */
  validatePaymentRecordData(paymentData) {
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

    if (!paymentData.paymentDate) {
      errors.push('Payment date is required');
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

    const validPaymentTypes = ['rent', 'deposit', 'utilities', 'maintenance', 'late_fee', 'other'];
    if (paymentData.paymentType && !validPaymentTypes.includes(paymentData.paymentType)) {
      errors.push('Invalid payment type');
    }

    const validPaymentMethods = ['cash', 'bank_transfer', 'check', 'credit_card', 'mobile_payment', 'other'];
    if (paymentData.paymentMethod && !validPaymentMethods.includes(paymentData.paymentMethod)) {
      errors.push('Invalid payment method');
    }

    return errors;
  }

  /**
   * Get payment records summary for dashboard
   */
  async getPaymentRecordsSummary(filters = {}) {
    try {
      const [stats, recentPayments, latePayments] = await Promise.all([
        paymentRecordRepository.getStatistics(filters),
        paymentRecordRepository.findAll({}, { limit: 5, sort: { paymentDate: -1 } }),
        paymentRecordRepository.findLatePayments({ limit: 5 })
      ]);

      return {
        success: true,
        data: {
          statistics: stats,
          recentPayments: recentPayments.payments,
          latePayments: latePayments.payments
        },
        message: 'Payment records summary retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to retrieve payment records summary: ${error.message}`);
    }
  }
}

module.exports = new PaymentRecordService();