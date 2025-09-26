const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: {
      values: ['maintenance', 'complaint', 'other'],
      message: 'Report type must be one of: maintenance, complaint, other'
    },
    required: [true, 'Report type is required'],
    default: 'maintenance',
    index: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'resolved', 'rejected'],
      message: 'Status must be one of: pending, in-progress, resolved, rejected'
    },
    required: [true, 'Status is required'],
    default: 'pending',
    index: true
  },
  submittedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
reportSchema.index({ tenant: 1, submittedAt: -1 });
reportSchema.index({ room: 1, submittedAt: -1 });
reportSchema.index({ status: 1, submittedAt: -1 });
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ submittedAt: -1 });

// Virtual for time since submission
reportSchema.virtual('daysSinceSubmission').get(function() {
  if (!this.submittedAt) return 0;
  const now = new Date();
  const diffTime = Math.abs(now - this.submittedAt);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Static method to get report statistics
reportSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalReports: { $sum: 1 },
        pendingReports: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgressReports: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        resolvedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        rejectedReports: {
          $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
        },
        maintenanceReports: {
          $sum: { $cond: [{ $eq: ['$type', 'maintenance'] }, 1, 0] }
        },
        complaintReports: {
          $sum: { $cond: [{ $eq: ['$type', 'complaint'] }, 1, 0] }
        },
        otherReports: {
          $sum: { $cond: [{ $eq: ['$type', 'other'] }, 1, 0] }
        }
      }
    },
    {
      $addFields: {
        pendingPercentage: {
          $multiply: [
            { $divide: ['$pendingReports', { $max: ['$totalReports', 1] }] },
            100
          ]
        },
        resolvedPercentage: {
          $multiply: [
            { $divide: ['$resolvedReports', { $max: ['$totalReports', 1] }] },
            100
          ]
        }
      }
    }
  ]);
};

// Static method to find reports by tenant
reportSchema.statics.findByTenant = function(tenantId, options = {}) {
  const query = { tenant: tenantId };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.type) {
    query.type = options.type;
  }
  
  return this.find(query)
    .populate('tenant', 'firstName lastName phoneNumber')
    .populate('room', 'roomNumber roomType')
    .sort({ submittedAt: -1 });
};

// Instance method to update status
reportSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  return this.save();
};

module.exports = mongoose.model('Report', reportSchema);