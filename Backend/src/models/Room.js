const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true,
    maxlength: [10, 'Room number cannot exceed 10 characters'],
  },
  
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: {
      values: ['single', 'double', 'triple', 'quad', 'suite', 'studio'],
      message: '{VALUE} is not a valid room type',
    },
    lowercase: true,
  },
  
  capacity: {
    type: Number,
    required: [true, 'Room capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10, 'Capacity cannot exceed 10'],
  },
  
  monthlyRent: {
    type: Number,
    required: [true, 'Monthly rent is required'],
    min: [0, 'Monthly rent cannot be negative'],
  },
  
  securityDeposit: {
    type: Number,
    default: 0,
    min: [0, 'Security deposit cannot be negative'],
    validate: {
      validator: function(value) {
        // Allow up to 2 decimal places
        return /^\d+(\.\d{1,2})?$/.test(value.toString());
      },
      message: 'Security deposit can have at most 2 decimal places'
    }
  },
  
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    trim: true,
  },
  
  amenities: [{
    type: String,
    trim: true,
  }],
  
  floor: {
    type: Number,
    min: [0, 'Floor cannot be negative'],
  },
  
  area: {
    type: Number,
    min: [1, 'Area must be positive'],
    // Area in square meters
  },
  
  status: {
    type: String,
    enum: {
      values: ['available', 'occupied', 'maintenance', 'reserved', 'unavailable'],
      message: '{VALUE} is not a valid room status',
    },
    default: 'available',
    lowercase: true,
  },
  
  // Current tenant assignment - Now supports multiple tenants
  currentTenants: [{
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: [0, 'Rent amount cannot be negative'],
    },
    securityDeposit: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Security deposit cannot be negative'],
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'forfeited'],
        default: 'pending',
      },
      datePaid: {
        type: Date,
      },
      dateRefunded: {
        type: Date,
      },
      refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
      },
      deductions: [{
        reason: {
          type: String,
          required: true,
          maxlength: [200, 'Deduction reason cannot exceed 200 characters'],
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Deduction amount cannot be negative'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    moveInDate: {
      type: Date,
      default: Date.now,
    },
    moveOutDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Keep legacy field for backward compatibility but mark as deprecated
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    // This field is deprecated - use currentTenants array instead
  },
  
  // Occupancy tracking
  occupancy: {
    current: {
      type: Number,
      default: 0,
      min: [0, 'Current occupancy cannot be negative'],
    },
    max: {
      type: Number,
      default: function() {
        return this.capacity;
      },
    },
  },
  
  // Maintenance information
  maintenance: {
    lastServiceDate: {
      type: Date,
    },
    nextServiceDate: {
      type: Date,
    },
    notes: {
      type: String,
      maxlength: [1000, 'Maintenance notes cannot exceed 1000 characters'],
    },
  },
  
  // Rental history - Enhanced with security deposit tracking
  rentalHistory: [{
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    rentAmount: {
      type: Number,
      required: true,
      min: [0, 'Rent amount cannot be negative'],
    },
    securityDeposit: {
      amount: {
        type: Number,
        default: 0,
        min: [0, 'Security deposit cannot be negative'],
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'refunded', 'forfeited'],
        default: 'pending',
      },
      datePaid: {
        type: Date,
      },
      dateRefunded: {
        type: Date,
      },
      refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
      },
      deductions: [{
        reason: {
          type: String,
          required: true,
          maxlength: [200, 'Deduction reason cannot exceed 200 characters'],
        },
        amount: {
          type: Number,
          required: true,
          min: [0, 'Deduction amount cannot be negative'],
        },
        date: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  }],
  
  // Photo URLs
  photos: [{
    url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: [100, 'Photo description cannot exceed 100 characters'],
    },
    isPrimary: {
      type: Boolean,
      default: false,
    },
  }],
  
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for availability status - Updated for multiple tenants
roomSchema.virtual('isAvailable').get(function() {
  const activeTenants = this.currentTenants ? this.currentTenants.filter(t => t.isActive).length : 0;
  return this.status === 'available' && activeTenants < this.capacity;
});

// Virtual for occupancy rate - Updated for multiple tenants
roomSchema.virtual('occupancyRate').get(function() {
  const activeTenants = this.currentTenants ? this.currentTenants.filter(t => t.isActive).length : 0;
  return this.capacity > 0 ? (activeTenants / this.capacity) * 100 : 0;
});

// Virtual for current occupancy count
roomSchema.virtual('currentOccupancy').get(function() {
  return this.currentTenants ? this.currentTenants.filter(t => t.isActive).length : 0;
});

// Virtual for total security deposits
roomSchema.virtual('totalSecurityDeposits').get(function() {
  if (!this.currentTenants) return 0;
  return this.currentTenants
    .filter(t => t.isActive)
    .reduce((total, tenant) => total + (tenant.securityDeposit.amount || 0), 0);
});

// Virtual for total monthly rent
roomSchema.virtual('totalMonthlyRent').get(function() {
  if (!this.currentTenants) return 0;
  return this.currentTenants
    .filter(t => t.isActive)
    .reduce((total, tenant) => total + (tenant.rentAmount || 0), 0);
});

// Virtual for primary photo
roomSchema.virtual('primaryPhoto').get(function() {
  if (!this.photos || !Array.isArray(this.photos)) return null;
  return this.photos.find(photo => photo.isPrimary) || this.photos[0] || null;
});

// Indexes for better query performance
// Note: roomNumber already has unique index from schema definition
roomSchema.index({ status: 1 });
roomSchema.index({ roomType: 1 });
roomSchema.index({ monthlyRent: 1 });
roomSchema.index({ capacity: 1 });
roomSchema.index({ floor: 1 });
roomSchema.index({ isActive: 1 });
roomSchema.index({ 'occupancy.current': 1, 'occupancy.max': 1 });

// Middleware to update occupancy and status when tenants change
roomSchema.pre('save', function(next) {
  // Ensure occupancy.max matches capacity if not explicitly set
  if (this.isModified('capacity') && !this.isModified('occupancy.max')) {
    this.occupancy.max = this.capacity;
  }
  
  // Update occupancy.current based on active tenants
  const activeTenants = this.currentTenants ? this.currentTenants.filter(t => t.isActive).length : 0;
  this.occupancy.current = activeTenants;
  
  // Auto-update status based on occupancy
  if (activeTenants >= this.capacity && this.status === 'available') {
    this.status = 'occupied';
  } else if (activeTenants === 0 && this.status === 'occupied') {
    this.status = 'available';
  }
  
  // Sync legacy currentTenant field for backward compatibility
  if (activeTenants > 0) {
    const primaryTenant = this.currentTenants.find(t => t.isActive);
    this.currentTenant = primaryTenant ? primaryTenant.tenant : null;
  } else {
    this.currentTenant = null;
  }
  
  next();
});

// Instance method to check if room can accommodate more tenants
roomSchema.methods.canAccommodate = function(additionalTenants = 1) {
  const activeTenants = this.currentTenants ? this.currentTenants.filter(t => t.isActive).length : 0;
  return (activeTenants + additionalTenants) <= this.capacity && 
         this.status !== 'maintenance' && 
         this.status !== 'unavailable';
};

// Instance method to assign tenant with security deposit
roomSchema.methods.assignTenant = function(tenantId, rentAmount, securityDepositAmount = 0) {
  if (!this.canAccommodate()) {
    throw new Error('Room is at full capacity');
  }
  
  // Initialize currentTenants array if it doesn't exist
  if (!this.currentTenants) {
    this.currentTenants = [];
  }
  
  // Check if tenant is already assigned to this room
  const existingTenant = this.currentTenants.find(
    t => t.tenant.toString() === tenantId.toString() && t.isActive
  );
  
  if (existingTenant) {
    throw new Error('Tenant is already assigned to this room');
  }
  
  // Add tenant to currentTenants
  const tenantAssignment = {
    tenant: tenantId,
    rentAmount: rentAmount || this.monthlyRent,
    securityDeposit: {
      amount: securityDepositAmount,
      status: securityDepositAmount > 0 ? 'pending' : 'paid',
      datePaid: securityDepositAmount === 0 ? new Date() : null,
    },
    moveInDate: new Date(),
    isActive: true,
  };
  
  this.currentTenants.push(tenantAssignment);
  
  // Add to rental history
  this.rentalHistory.push({
    tenant: tenantId,
    startDate: new Date(),
    rentAmount: rentAmount || this.monthlyRent,
    securityDeposit: {
      amount: securityDepositAmount,
      status: securityDepositAmount > 0 ? 'pending' : 'paid',
      datePaid: securityDepositAmount === 0 ? new Date() : null,
    },
    isActive: true,
  });
  
  return this.save();
};

// Instance method to unassign tenant
roomSchema.methods.unassignTenant = function(tenantId) {
  if (!this.currentTenants) {
    throw new Error('No tenants assigned to this room');
  }
  
  const tenantIndex = this.currentTenants.findIndex(
    t => t.tenant.toString() === tenantId.toString() && t.isActive
  );
  
  if (tenantIndex === -1) {
    throw new Error('Tenant is not assigned to this room');
  }
  
  // Mark tenant as inactive and set move out date
  this.currentTenants[tenantIndex].isActive = false;
  this.currentTenants[tenantIndex].moveOutDate = new Date();
  
  // Update rental history
  const currentRental = this.rentalHistory.find(
    history => history.tenant.toString() === tenantId.toString() && 
               history.isActive && 
               !history.endDate
  );
  
  if (currentRental) {
    currentRental.endDate = new Date();
    currentRental.isActive = false;
  }
  
  return this.save();
};

// Instance method to update security deposit status
roomSchema.methods.updateSecurityDeposit = function(tenantId, updates) {
  if (!this.currentTenants) {
    throw new Error('No tenants assigned to this room');
  }
  
  const tenant = this.currentTenants.find(
    t => t.tenant.toString() === tenantId.toString() && t.isActive
  );
  
  if (!tenant) {
    throw new Error('Tenant is not assigned to this room');
  }
  
  // Update security deposit information
  Object.assign(tenant.securityDeposit, updates);
  
  // Also update in rental history
  const currentRental = this.rentalHistory.find(
    history => history.tenant.toString() === tenantId.toString() && 
               history.isActive && 
               !history.endDate
  );
  
  if (currentRental) {
    Object.assign(currentRental.securityDeposit, updates);
  }
  
  return this.save();
};

// Instance method to add security deposit deduction
roomSchema.methods.addSecurityDepositDeduction = function(tenantId, reason, amount) {
  if (!this.currentTenants) {
    throw new Error('No tenants assigned to this room');
  }
  
  const tenant = this.currentTenants.find(
    t => t.tenant.toString() === tenantId.toString()
  );
  
  if (!tenant) {
    throw new Error('Tenant is not found in this room');
  }
  
  const deduction = {
    reason,
    amount,
    date: new Date(),
  };
  
  if (!tenant.securityDeposit.deductions) {
    tenant.securityDeposit.deductions = [];
  }
  
  tenant.securityDeposit.deductions.push(deduction);
  
  // Also update in rental history
  const rentalHistory = this.rentalHistory.find(
    history => history.tenant.toString() === tenantId.toString()
  );
  
  if (rentalHistory) {
    if (!rentalHistory.securityDeposit.deductions) {
      rentalHistory.securityDeposit.deductions = [];
    }
    rentalHistory.securityDeposit.deductions.push(deduction);
  }
  
  return this.save();
};

// Static method to find available rooms - Updated for multiple tenants
roomSchema.statics.findAvailable = function(options = {}) {
  const query = {
    isActive: true,
    status: 'available',
  };
  
  if (options.roomType) {
    query.roomType = options.roomType;
  }
  
  if (options.minCapacity) {
    query.capacity = { $gte: options.minCapacity };
  }
  
  if (options.maxRent) {
    query.monthlyRent = { $lte: options.maxRent };
  }
  
  if (options.floor !== undefined) {
    query.floor = options.floor;
  }
  
  return this.find(query)
    .populate('currentTenants.tenant', 'firstName lastName fullName phoneNumber')
    .populate('currentTenant', 'firstName lastName fullName phoneNumber'); // Keep for backward compatibility
};

// Static method to get room statistics - Updated for multiple tenants
roomSchema.statics.getStatistics = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $addFields: {
        activeTenantCount: {
          $size: {
            $filter: {
              input: { $ifNull: ['$currentTenants', []] },
              cond: { $eq: ['$$this.isActive', true] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        availableRooms: {
          $sum: {
            $cond: [
              { 
                $and: [
                  { $eq: ['$status', 'available'] },
                  { $lt: ['$activeTenantCount', '$capacity'] }
                ]
              },
              1,
              0
            ]
          }
        },
        occupiedRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'occupied'] },
              1,
              0
            ]
          }
        },
        maintenanceRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'maintenance'] },
              1,
              0
            ]
          }
        },
        reservedRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'reserved'] },
              1,
              0
            ]
          }
        },
        unavailableRooms: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'unavailable'] },
              1,
              0
            ]
          }
        },
        totalCapacity: { $sum: '$capacity' },
        currentOccupancy: { $sum: '$activeTenantCount' },
        averageRent: { $avg: '$monthlyRent' },
        totalRentValue: { $sum: '$monthlyRent' },
        totalSecurityDeposits: {
          $sum: {
            $reduce: {
              input: { $ifNull: ['$currentTenants', []] },
              initialValue: 0,
              in: {
                $add: [
                  '$$value',
                  {
                    $cond: [
                      { $eq: ['$$this.isActive', true] },
                      { $ifNull: ['$$this.securityDeposit.amount', 0] },
                      0
                    ]
                  }
                ]
              }
            }
          }
        },
      }
    },
    {
      $addFields: {
        occupancyRate: {
          $multiply: [
            { $divide: ['$currentOccupancy', '$totalCapacity'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Room', roomSchema);