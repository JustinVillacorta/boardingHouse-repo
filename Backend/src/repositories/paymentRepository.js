const Payment = require('../models/Payment');
const mongoose = require('mongoose');

class PaymentRecordRepository {
  /**
   * Create a new payment record
   */
  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  /**
   * Get all payment records with pagination and filters
   */
  async findAll(filters = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { paymentDate: -1 },
      populate = true
    } = options;

    const query = this.buildQuery(filters);
    
    const skip = (page - 1) * limit;
    
    let paymentQuery = Payment.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (populate) {
      paymentQuery = paymentQuery
        .populate('tenant', 'firstName lastName email phoneNumber roomNumber')
        .populate('room', 'roomNumber roomType monthlyRent')
        .populate('recordedBy', 'firstName lastName email');
    }

    const [payments, totalCount] = await Promise.all([
      paymentQuery.exec(),
      Payment.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get payment record by ID
   */
  async findById(id, populate = true) {
    let query = Payment.findById(id);
    
    if (populate) {
      query = query
        .populate('tenant', 'firstName lastName email phoneNumber roomNumber')
        .populate('room', 'roomNumber roomType monthlyRent')
        .populate('recordedBy', 'firstName lastName email');
    }
    
    return await query.exec();
  }

  /**
   * Update payment record
   */
  async update(id, updateData) {
    const payment = await Payment.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: true 
      }
    ).populate([
      { path: 'tenant', select: 'firstName lastName email phoneNumber' },
      { path: 'room', select: 'roomNumber roomType monthlyRent' },
      { path: 'recordedBy', select: 'firstName lastName email' }
    ]);

    return payment;
  }

  /**
   * Delete payment record
   */
  async delete(id) {
    const payment = await Payment.findByIdAndDelete(id);
    return payment;
  }

  /**
   * Get payment records by tenant ID
   */
  async findByTenant(tenantId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { paymentDate: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      Payment.find({ tenant: tenantId })
        .populate('room', 'roomNumber roomType')
        .populate('recordedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ tenant: tenantId })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get payment records by room ID
   */
  async findByRoom(roomId, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { paymentDate: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      Payment.find({ room: roomId })
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('recordedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ room: roomId })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get late payment records
   */
  async findLatePayments(options = {}) {
    const {
      page = 1,
      limit = 10,
      tenantId = null,
      roomId = null
    } = options;

    const filters = {};
    if (tenantId) filters.tenant = tenantId;
    if (roomId) filters.room = roomId;

    const skip = (page - 1) * limit;

    const latePaymentQuery = {
      isLatePayment: true,
      ...filters
    };

    const [payments, totalCount] = await Promise.all([
      Payment.find(latePaymentQuery)
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('room', 'roomNumber roomType')
        .populate('recordedBy', 'firstName lastName')
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),
      Payment.countDocuments(latePaymentQuery)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Get payment statistics for record-keeping
   */
  async getStatistics(filters = {}) {
    const matchQuery = this.buildQuery(filters);
    
    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: null,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          totalLateFees: { $sum: '$lateFee.amount' },
          latePaymentsCount: {
            $sum: { $cond: ['$isLatePayment', 1, 0] }
          },
          averageAmount: { $avg: '$amount' },
          maxAmount: { $max: '$amount' },
          minAmount: { $min: '$amount' }
        }
      }
    ];

    const [stats] = await Payment.aggregate(pipeline);
    
    if (!stats) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        totalLateFees: 0,
        latePaymentsCount: 0,
        averageAmount: 0,
        maxAmount: 0,
        minAmount: 0
      };
    }

    // Calculate additional metrics
    stats.latePaymentRate = stats.totalPayments > 0 
      ? (stats.latePaymentsCount / stats.totalPayments * 100).toFixed(2) 
      : 0;
    
    stats.totalWithLateFees = stats.totalAmount + stats.totalLateFees;

    return stats;
  }

  /**
   * Get payment history for a specific period
   */
  async getPaymentHistory(startDate, endDate, options = {}) {
    const {
      tenantId = null,
      roomId = null,
      paymentType = null,
      groupBy = 'month' // month, week, day
    } = options;

    const matchQuery = {
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    };

    if (tenantId) matchQuery.tenant = mongoose.Types.ObjectId(tenantId);
    if (roomId) matchQuery.room = mongoose.Types.ObjectId(roomId);
    if (paymentType) matchQuery.paymentType = paymentType;

    let dateGrouping;
    switch (groupBy) {
      case 'day':
        dateGrouping = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' },
          day: { $dayOfMonth: '$paymentDate' }
        };
        break;
      case 'week':
        dateGrouping = {
          year: { $year: '$paymentDate' },
          week: { $week: '$paymentDate' }
        };
        break;
      case 'month':
      default:
        dateGrouping = {
          year: { $year: '$paymentDate' },
          month: { $month: '$paymentDate' }
        };
        break;
    }

    const pipeline = [
      { $match: matchQuery },
      {
        $group: {
          _id: dateGrouping,
          totalPayments: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          latePaymentsCount: {
            $sum: { $cond: ['$isLatePayment', 1, 0] }
          },
          averageAmount: { $avg: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ];

    return await Payment.aggregate(pipeline);
  }

  /**
   * Search payment records
   */
  async searchPayments(searchQuery, filters = {}) {
    const searchFilters = { ...filters };
    
    if (searchQuery) {
      searchFilters.$or = [
        { receiptNumber: new RegExp(searchQuery, 'i') },
        { transactionReference: new RegExp(searchQuery, 'i') },
        { description: new RegExp(searchQuery, 'i') },
        { notes: new RegExp(searchQuery, 'i') }
      ];
    }

    return await Payment.find(this.buildQuery(searchFilters))
      .populate('tenant', 'firstName lastName email phoneNumber')
      .populate('room', 'roomNumber roomType')
      .populate('recordedBy', 'firstName lastName')
      .sort({ paymentDate: -1 });
  }

  /**
   * Get payments by payment type
   */
  async findByPaymentType(paymentType, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { paymentDate: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [payments, totalCount] = await Promise.all([
      Payment.find({ paymentType })
        .populate('tenant', 'firstName lastName email phoneNumber')
        .populate('room', 'roomNumber roomType')
        .populate('recordedBy', 'firstName lastName')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Payment.countDocuments({ paymentType })
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      payments,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Build query object from filters
   */
  buildQuery(filters) {
    const query = {};

    if (filters.tenantId) {
      query.tenant = mongoose.Types.ObjectId(filters.tenantId);
    }

    if (filters.roomId) {
      query.room = mongoose.Types.ObjectId(filters.roomId);
    }

    if (filters.paymentType) {
      query.paymentType = filters.paymentType;
    }

    if (filters.paymentMethod) {
      query.paymentMethod = filters.paymentMethod;
    }

    if (filters.startDate || filters.endDate) {
      query.paymentDate = {};
      if (filters.startDate) {
        query.paymentDate.$gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        query.paymentDate.$lte = new Date(filters.endDate);
      }
    }

    if (filters.amountMin || filters.amountMax) {
      query.amount = {};
      if (filters.amountMin) {
        query.amount.$gte = parseFloat(filters.amountMin);
      }
      if (filters.amountMax) {
        query.amount.$lte = parseFloat(filters.amountMax);
      }
    }

    if (filters.isLatePayment === 'true' || filters.isLatePayment === true) {
      query.isLatePayment = true;
    }

    return query;
  }
}

module.exports = new PaymentRecordRepository();