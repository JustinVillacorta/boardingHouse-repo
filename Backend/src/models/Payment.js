const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  tenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: [true, 'Tenant reference is required'],
    index: true
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: [true, 'Room reference is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Payment amount must be positive']
  },
  paymentType: {
    type: String,
    enum: {
      values: ['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'],
      message: 'Payment type must be one of: rent, deposit, utility, maintenance, penalty, other'
    },
    required: [true, 'Payment type is required'],
    default: 'rent'
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet', 'money_order'],
      message: 'Payment method must be one of: cash, bank_transfer, check, credit_card, debit_card, digital_wallet, money_order'
    },
    required: [true, 'Payment method is required'],
    default: 'cash'
  },
  paymentDate: {
    type: Date,
    required: function() {
      return this.status === 'paid';
    },
    default: function() {
      return this.status === 'paid' ? Date.now : undefined;
    }
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  status: {
    type: String,
    enum: {
      values: ['paid', 'pending', 'overdue'],
      message: 'Status must be one of: paid, pending, overdue'
    },
    required: [true, 'Payment status is required'],
    default: 'pending',
    index: true
  },
  periodCovered: {
    startDate: {
      type: Date,
      required: function() {
        return this.paymentType === 'rent';
      }
    },
    endDate: {
      type: Date,
      required: function() {
        return this.paymentType === 'rent';
      }
    }
  },
  receiptNumber: {
    type: String,
    unique: true,
    sparse: true
  },
  transactionReference: {
    type: String,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.status === 'paid';
    },
    index: true
  },
  lateFee: {
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Late fee amount must be positive']
    },
    reason: {
      type: String,
      maxlength: [200, 'Late fee reason cannot exceed 200 characters']
    }
  },
  isLatePayment: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount including late fees
paymentSchema.virtual('totalAmount').get(function() {
  return this.amount + (this.lateFee?.amount || 0);
});

// Instance method to generate receipt number
paymentSchema.methods.generateReceiptNumber = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  
  this.receiptNumber = `RCP-${year}${month}${day}-${random}`;
  return this.receiptNumber;
};

// Instance method to mark payment as paid
paymentSchema.methods.markAsPaid = function(paymentDate = new Date(), recordedBy = null) {
  this.status = 'paid';
  this.paymentDate = paymentDate;
  if (recordedBy) {
    this.recordedBy = recordedBy;
  }
  
  // Check if payment is late
  if (this.paymentDate > this.dueDate) {
    this.isLatePayment = true;
  }
  
  // Generate receipt number if not exists
  if (!this.receiptNumber) {
    this.generateReceiptNumber();
  }
  
  return this.save();
};

// Instance method to mark payment as overdue
paymentSchema.methods.markAsOverdue = function() {
  if (this.status === 'pending' && new Date() > this.dueDate) {
    this.status = 'overdue';
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to get overdue payments
paymentSchema.statics.findOverduePayments = async function() {
  return await this.find({
    status: 'overdue'
  })
    .populate('tenant', 'firstName lastName email phoneNumber')
    .populate('room', 'roomNumber roomType')
    .populate('recordedBy', 'firstName lastName')
    .sort({ dueDate: 1 });
};

// Static method to get pending payments
paymentSchema.statics.findPendingPayments = async function() {
  return await this.find({
    status: 'pending'
  })
    .populate('tenant', 'firstName lastName email phoneNumber')
    .populate('room', 'roomNumber roomType')
    .sort({ dueDate: 1 });
};

// Static method to get late payments
paymentSchema.statics.findLatePayments = async function() {
  return await this.find({ 
    isLatePayment: true,
    status: 'paid' 
  })
    .populate('tenant', 'firstName lastName email phoneNumber')
    .populate('room', 'roomNumber roomType')
    .populate('recordedBy', 'firstName lastName')
    .sort({ paymentDate: -1 });
};

// Static method to update overdue payments
paymentSchema.statics.updateOverduePayments = async function() {
  const currentDate = new Date();
  const result = await this.updateMany(
    {
      status: 'pending',
      dueDate: { $lt: currentDate }
    },
    {
      $set: { status: 'overdue' }
    }
  );
  
  return result;
};

// Static method to get payment statistics
paymentSchema.statics.getPaymentStatistics = async function(filters = {}) {
  const pipeline = [
    { $match: filters },
    {
      $group: {
        _id: null,
        totalPayments: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalLateFees: { $sum: '$lateFee.amount' },
        paidPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
        },
        pendingPayments: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        overduePayments: {
          $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] }
        },
        latePaymentsCount: {
          $sum: { $cond: ['$isLatePayment', 1, 0] }
        },
        averageAmount: { $avg: '$amount' },
        maxAmount: { $max: '$amount' },
        minAmount: { $min: '$amount' }
      }
    }
  ];
  
  const result = await this.aggregate(pipeline);
  const stats = result[0] || {
    totalPayments: 0,
    totalAmount: 0,
    totalLateFees: 0,
    paidPayments: 0,
    pendingPayments: 0,
    overduePayments: 0,
    latePaymentsCount: 0,
    averageAmount: 0,
    maxAmount: 0,
    minAmount: 0
  };
  
  // Calculate additional metrics
  if (stats.totalPayments > 0) {
    stats.paidRate = ((stats.paidPayments / stats.totalPayments) * 100).toFixed(2);
    stats.overdueRate = ((stats.overduePayments / stats.totalPayments) * 100).toFixed(2);
  } else {
    stats.paidRate = 0;
    stats.overdueRate = 0;
  }
  
  return stats;
};

// Pre-save middleware
paymentSchema.pre('save', function(next) {
  // Generate receipt number for paid payments
  if (this.status === 'paid' && this.isNew && !this.receiptNumber) {
    this.generateReceiptNumber();
  }
  
  // Set late payment flag if payment was made after due date
  if (this.status === 'paid' && this.paymentDate > this.dueDate) {
    this.isLatePayment = true;
  }
  
  // Validate period covered for rent payments
  if (this.paymentType === 'rent') {
    if (!this.periodCovered.startDate || !this.periodCovered.endDate) {
      return next(new Error('Period covered is required for rent payments'));
    }
    
    if (this.periodCovered.startDate >= this.periodCovered.endDate) {
      return next(new Error('Period start date must be before end date'));
    }
  }
  
  next();
});

// Indexes for efficient queries
paymentSchema.index({ tenant: 1, dueDate: -1 });
paymentSchema.index({ room: 1, dueDate: -1 });
paymentSchema.index({ status: 1, dueDate: 1 });
paymentSchema.index({ paymentType: 1, status: 1 });
paymentSchema.index({ paymentDate: -1 });
paymentSchema.index({ dueDate: 1 });
paymentSchema.index({ isLatePayment: 1 });

module.exports = mongoose.model('Payment', paymentSchema);