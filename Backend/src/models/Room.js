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
      values: ['available', 'occupied', 'maintenance', 'reserved'],
      message: '{VALUE} is not a valid room status',
    },
    default: 'available',
    lowercase: true,
  },
  
  // Current tenant assignment
  currentTenant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
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
  
  // Rental history
  rentalHistory: [{
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
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

// Virtual for availability status
roomSchema.virtual('isAvailable').get(function() {
  return this.status === 'available' && this.occupancy.current < this.occupancy.max;
});

// Virtual for occupancy rate
roomSchema.virtual('occupancyRate').get(function() {
  return this.occupancy.max > 0 ? (this.occupancy.current / this.occupancy.max) * 100 : 0;
});

// Virtual for primary photo
roomSchema.virtual('primaryPhoto').get(function() {
  return this.photos.find(photo => photo.isPrimary) || this.photos[0];
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

// Middleware to update occupancy when tenant is assigned/unassigned
roomSchema.pre('save', function(next) {
  // Ensure occupancy.max matches capacity if not explicitly set
  if (this.isModified('capacity') && !this.isModified('occupancy.max')) {
    this.occupancy.max = this.capacity;
  }
  
  // Auto-update status based on occupancy
  if (this.occupancy.current >= this.occupancy.max && this.status === 'available') {
    this.status = 'occupied';
  } else if (this.occupancy.current === 0 && this.status === 'occupied') {
    this.status = 'available';
  }
  
  next();
});

// Instance method to check if room can accommodate more tenants
roomSchema.methods.canAccommodate = function(additionalTenants = 1) {
  return (this.occupancy.current + additionalTenants) <= this.occupancy.max && this.status !== 'maintenance';
};

// Instance method to assign tenant
roomSchema.methods.assignTenant = function(tenantId, rentAmount) {
  if (!this.canAccommodate()) {
    throw new Error('Room is at full capacity');
  }
  
  this.currentTenant = tenantId;
  this.occupancy.current += 1;
  
  // Add to rental history
  this.rentalHistory.push({
    tenant: tenantId,
    startDate: new Date(),
    rentAmount: rentAmount || this.monthlyRent,
  });
  
  return this.save();
};

// Instance method to unassign tenant
roomSchema.methods.unassignTenant = function(tenantId) {
  if (this.currentTenant && this.currentTenant.toString() === tenantId.toString()) {
    this.currentTenant = null;
    this.occupancy.current = Math.max(0, this.occupancy.current - 1);
    
    // Update rental history
    const currentRental = this.rentalHistory.find(
      history => history.tenant.toString() === tenantId.toString() && !history.endDate
    );
    if (currentRental) {
      currentRental.endDate = new Date();
    }
  }
  
  return this.save();
};

// Static method to find available rooms
roomSchema.statics.findAvailable = function(options = {}) {
  const query = {
    isActive: true,
    status: 'available',
    $expr: { $lt: ['$occupancy.current', '$occupancy.max'] },
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
  
  return this.find(query).populate('currentTenant', 'firstName lastName fullName phoneNumber');
};

// Static method to get room statistics
roomSchema.statics.getStatistics = function() {
  return this.aggregate([
    { $match: { isActive: true } },
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
                  { $lt: ['$occupancy.current', '$occupancy.max'] }
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
        totalCapacity: { $sum: '$capacity' },
        currentOccupancy: { $sum: '$occupancy.current' },
        averageRent: { $avg: '$monthlyRent' },
        totalRentValue: { $sum: '$monthlyRent' },
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