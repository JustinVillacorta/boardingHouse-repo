const mongoose = require('mongoose');

const TenantSchema = new mongoose.Schema(
  {
    // Reference to User model - each tenant is also a user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    // Personal Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [50, 'First name must be less than 50 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [50, 'Last name must be less than 50 characters'],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [
        /^[\+]?[1-9][\d]{0,15}$/,
        'Please enter a valid phone number',
      ],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function(value) {
          return value < new Date();
        },
        message: 'Date of birth must be in the past',
      },
    },
    occupation: {
      type: String,
      trim: true,
      maxlength: [100, 'Occupation must be less than 100 characters'],
    },
    // Address Information
    street: {
      type: String,
      trim: true,
      maxlength: [100, 'Street address must be less than 100 characters'],
    },
    province: {
      type: String,
      trim: true,
      maxlength: [50, 'Province must be less than 50 characters'],
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City must be less than 50 characters'],
    },
    zipCode: {
      type: String,
      trim: true,
      maxlength: [10, 'Zip code must be less than 10 characters'],
    },
    // Identification
    idType: {
      type: String,
      enum: ['passport', 'drivers_license', 'national_id', 'other'],
      required: [true, 'ID type is required'],
    },
    idNumber: {
      type: String,
      required: [true, 'ID number is required'],
      trim: true,
      maxlength: [50, 'ID number must be less than 50 characters'],
    },
    // Emergency Contact
    emergencyContact: {
      name: {
        type: String,
        required: [true, 'Emergency contact name is required'],
        trim: true,
        maxlength: [100, 'Emergency contact name must be less than 100 characters'],
      },
      relationship: {
        type: String,
        required: [true, 'Emergency contact relationship is required'],
        trim: true,
        maxlength: [50, 'Relationship must be less than 50 characters'],
      },
      phoneNumber: {
        type: String,
        required: [true, 'Emergency contact phone number is required'],
        match: [
          /^[\+]?[1-9][\d]{0,15}$/,
          'Please enter a valid emergency contact phone number',
        ],
      },
    },
    // Rental Information
    roomNumber: {
      type: String,
      trim: true,
      maxlength: [10, 'Room number must be less than 10 characters'],
    },
    leaseStartDate: {
      type: Date,
    },
    leaseEndDate: {
      type: Date,
      validate: {
        validator: function(value) {
          return !value || !this.leaseStartDate || value > this.leaseStartDate;
        },
        message: 'Lease end date must be after lease start date',
      },
    },
    monthlyRent: {
      type: Number,
      min: [0, 'Monthly rent cannot be negative'],
    },
    securityDeposit: {
      type: Number,
      min: [0, 'Security deposit cannot be negative'],
    },
    // Status Information
    tenantStatus: {
      type: String,
      enum: ['active', 'inactive', 'pending', 'terminated'],
      default: 'active',
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Virtual for full name
TenantSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for age calculation
TenantSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Index for faster queries
// Note: userId already has unique index from schema definition
TenantSchema.index({ tenantStatus: 1 });
TenantSchema.index({ roomNumber: 1 });
TenantSchema.index({ firstName: 1, lastName: 1 });

// Populate user information by default
TenantSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'userId',
    select: 'username email role isActive lastLogin',
  });
  next();
});

module.exports = mongoose.model('Tenant', TenantSchema);