const { body } = require('express-validator');

// Validation rules for user registration
const validateRegister = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('role')
    .optional()
    .isIn(['admin', 'staff'])
    .withMessage('Role must be admin or staff. Use tenant registration endpoint for tenant accounts.'),
];

// Validation rules for user login
const validateLogin = [
  body()
    .custom((value, { req }) => {
      const { identifier, username, email } = req.body;
      
      // Check if at least one identifier is provided
      if (!identifier && !username && !email) {
        throw new Error('Email, username, or identifier is required');
      }
      
      return true;
    }),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation rules for profile update
const validateProfileUpdate = [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
];

// Validation rules for password change
const validatePasswordChange = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match new password');
      }
      return true;
    }),
];

// Validation rules for tenant registration (creates both user and tenant profile)
const validateTenantRegister = [
  // User account fields
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),

  // Tenant profile fields
  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  
  body('idType')
    .notEmpty()
    .withMessage('ID type is required')
    .isIn(['passport', 'drivers_license', 'national_id', 'other'])
    .withMessage('ID type must be passport, drivers_license, national_id, or other'),
  
  body('idNumber')
    .notEmpty()
    .withMessage('ID number is required')
    .isLength({ max: 50 })
    .withMessage('ID number must be less than 50 characters'),
  
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must be less than 100 characters'),
  
  body('emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required')
    .isLength({ max: 50 })
    .withMessage('Emergency contact relationship must be less than 50 characters'),
  
  body('emergencyContact.phoneNumber')
    .notEmpty()
    .withMessage('Emergency contact phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  // Optional fields
  body('roomNumber')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must be less than 10 characters'),
  
  body('leaseStartDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid lease start date'),
  
  body('leaseEndDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid lease end date'),
  
  body('monthlyRent')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  
  body('securityDeposit')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
];

// Validation rules for tenant creation
const validateTenantCreate = [
  // Email validation (required if userId not provided)
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail()
    .custom((value, { req }) => {
      if (!value && !req.body.userId) {
        throw new Error('Email is required when userId is not provided');
      }
      return true;
    }),

  // UserId validation (optional - will be created if not provided)
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),

  body('firstName')
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phoneNumber')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      const birthDate = new Date(value);
      const today = new Date();
      if (birthDate >= today) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  
  body('idType')
    .notEmpty()
    .withMessage('ID type is required')
    .isIn(['passport', 'drivers_license', 'national_id', 'other'])
    .withMessage('ID type must be passport, drivers_license, national_id, or other'),
  
  body('idNumber')
    .notEmpty()
    .withMessage('ID number is required')
    .isLength({ max: 50 })
    .withMessage('ID number must be less than 50 characters'),
  
  body('emergencyContact.name')
    .notEmpty()
    .withMessage('Emergency contact name is required')
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must be less than 100 characters'),
  
  body('emergencyContact.relationship')
    .notEmpty()
    .withMessage('Emergency contact relationship is required')
    .isLength({ max: 50 })
    .withMessage('Emergency contact relationship must be less than 50 characters'),
  
  body('emergencyContact.phoneNumber')
    .notEmpty()
    .withMessage('Emergency contact phone number is required')
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('roomNumber')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must be less than 10 characters'),
  
  body('leaseStartDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid lease start date'),
  
  body('leaseEndDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid lease end date'),
  
  body('monthlyRent')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  
  body('securityDeposit')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
];

// Validation rules for tenant update
const validateTenantUpdate = [
  body('firstName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('lastName')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom((value) => {
      if (value) {
        const birthDate = new Date(value);
        const today = new Date();
        if (birthDate >= today) {
          throw new Error('Date of birth must be in the past');
        }
      }
      return true;
    }),
  
  body('idType')
    .optional()
    .isIn(['passport', 'drivers_license', 'national_id', 'other'])
    .withMessage('ID type must be passport, drivers_license, national_id, or other'),
  
  body('idNumber')
    .optional()
    .isLength({ max: 50 })
    .withMessage('ID number must be less than 50 characters'),
  
  body('emergencyContact.name')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Emergency contact name must be less than 100 characters'),
  
  body('emergencyContact.relationship')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Emergency contact relationship must be less than 50 characters'),
  
  body('emergencyContact.phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
  
  body('roomNumber')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must be less than 10 characters'),
  
  body('leaseStartDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid lease start date'),
  
  body('leaseEndDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid lease end date'),
  
  body('monthlyRent')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  
  body('securityDeposit')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Security deposit must be a positive number'),
];

// Validation rules for updating tenant status
const validateTenantStatusUpdate = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['active', 'inactive', 'pending', 'terminated'])
    .withMessage('Status must be active, inactive, pending, or terminated'),
];

// Validation rules for room creation
const validateRoomCreate = [
  body('roomNumber')
    .notEmpty()
    .withMessage('Room number is required')
    .isLength({ max: 10 })
    .withMessage('Room number must be less than 10 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Room number can only contain letters, numbers, and hyphens'),
  
  body('roomType')
    .notEmpty()
    .withMessage('Room type is required')
    .isIn(['single', 'double', 'triple', 'quad', 'suite', 'studio'])
    .withMessage('Room type must be single, double, triple, quad, suite, or studio'),
  
  body('capacity')
    .notEmpty()
    .withMessage('Room capacity is required')
    .isInt({ min: 1, max: 10 })
    .withMessage('Room capacity must be between 1 and 10'),
  
  body('monthlyRent')
    .notEmpty()
    .withMessage('Monthly rent is required')
    .isNumeric({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each amenity must be less than 50 characters'),
  
  body('floor')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative integer'),
  
  body('area')
    .optional()
    .isNumeric({ min: 1 })
    .withMessage('Area must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Status must be available, occupied, maintenance, or reserved'),
];

// Validation rules for room update
const validateRoomUpdate = [
  body('roomNumber')
    .optional()
    .isLength({ max: 10 })
    .withMessage('Room number must be less than 10 characters')
    .matches(/^[a-zA-Z0-9-]+$/)
    .withMessage('Room number can only contain letters, numbers, and hyphens'),
  
  body('roomType')
    .optional()
    .isIn(['single', 'double', 'triple', 'quad', 'suite', 'studio'])
    .withMessage('Room type must be single, double, triple, quad, suite, or studio'),
  
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Room capacity must be between 1 and 10'),
  
  body('monthlyRent')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Monthly rent must be a positive number'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('amenities')
    .optional()
    .isArray()
    .withMessage('Amenities must be an array'),
  
  body('amenities.*')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Each amenity must be less than 50 characters'),
  
  body('floor')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Floor must be a non-negative integer'),
  
  body('area')
    .optional()
    .isNumeric({ min: 1 })
    .withMessage('Area must be a positive number'),
  
  body('status')
    .optional()
    .isIn(['available', 'occupied', 'maintenance', 'reserved'])
    .withMessage('Status must be available, occupied, maintenance, or reserved'),
];

// Validation rules for tenant assignment to room
const validateRoomTenantAssignment = [
  body('tenantId')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  
  body('rentAmount')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Rent amount must be a positive number'),
];

// Validation rules for tenant unassignment from room
const validateRoomTenantUnassignment = [
  body('tenantId')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
];

// Validation rules for room maintenance update
const validateRoomMaintenanceUpdate = [
  body('lastServiceDate')
    .optional()
    .isISO8601()
    .withMessage('Last service date must be a valid date'),
  
  body('nextServiceDate')
    .optional()
    .isISO8601()
    .withMessage('Next service date must be a valid date'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Maintenance notes must be less than 1000 characters'),
  
  body('status')
    .optional()
    .isIn(['maintenance', 'completed'])
    .withMessage('Maintenance status must be maintenance or completed'),
];

// Validation rules for payment creation
const validatePaymentCreate = [
  body('tenant')
    .notEmpty()
    .withMessage('Tenant ID is required')
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  
  body('room')
    .notEmpty()
    .withMessage('Room ID is required')
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  
  body('amount')
    .notEmpty()
    .withMessage('Payment amount is required')
    .isNumeric({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be rent, deposit, utility, maintenance, penalty, or other'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet'])
    .withMessage('Payment method must be cash, bank_transfer, check, credit_card, debit_card, or digital_wallet'),
  
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'partial'])
    .withMessage('Payment status must be pending, completed, failed, refunded, or partial'),
  
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  
  body('dueDate')
    .notEmpty()
    .withMessage('Due date is required')
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('periodCovered.startDate')
    .optional()
    .isISO8601()
    .withMessage('Period start date must be a valid date'),
  
  body('periodCovered.endDate')
    .optional()
    .isISO8601()
    .withMessage('Period end date must be a valid date'),
  
  body('transactionId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

// Validation rules for payment update
const validatePaymentUpdate = [
  body('amount')
    .optional()
    .isNumeric({ min: 0.01 })
    .withMessage('Payment amount must be greater than 0'),
  
  body('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be rent, deposit, utility, maintenance, penalty, or other'),
  
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet'])
    .withMessage('Payment method must be cash, bank_transfer, check, credit_card, debit_card, or digital_wallet'),
  
  body('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'partial'])
    .withMessage('Payment status must be pending, completed, failed, refunded, or partial'),
  
  body('paymentDate')
    .optional()
    .isISO8601()
    .withMessage('Payment date must be a valid date'),
  
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  
  body('periodCovered.startDate')
    .optional()
    .isISO8601()
    .withMessage('Period start date must be a valid date'),
  
  body('periodCovered.endDate')
    .optional()
    .isISO8601()
    .withMessage('Period end date must be a valid date'),
  
  body('transactionId')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Transaction ID must be less than 100 characters'),
  
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

// Validation rules for payment refund
const validatePaymentRefund = [
  body('amount')
    .notEmpty()
    .withMessage('Refund amount is required')
    .isNumeric({ min: 0.01 })
    .withMessage('Refund amount must be greater than 0'),
  
  body('reason')
    .notEmpty()
    .withMessage('Refund reason is required')
    .isLength({ max: 500 })
    .withMessage('Refund reason must be less than 500 characters'),
];

// Validation rules for applying late fees
const validateLateFeeApplication = [
  body('lateFeeAmount')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Late fee amount must be a positive number'),
];

// Validation rules for payment query parameters
const { query } = require('express-validator');

const validatePaymentQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['paymentDate', 'amount', 'dueDate', 'status', 'createdAt'])
    .withMessage('Sort field must be paymentDate, amount, dueDate, status, or createdAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  
  query('roomId')
    .optional()
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'partial'])
    .withMessage('Status must be pending, completed, failed, refunded, or partial'),
  
  query('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be rent, deposit, utility, maintenance, penalty, or other'),
  
  query('paymentMethod')
    .optional()
    .isIn(['cash', 'bank_transfer', 'check', 'credit_card', 'debit_card', 'digital_wallet'])
    .withMessage('Payment method must be cash, bank_transfer, check, credit_card, debit_card, or digital_wallet'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('amountMin')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Minimum amount must be a positive number'),
  
  query('amountMax')
    .optional()
    .isNumeric({ min: 0 })
    .withMessage('Maximum amount must be a positive number'),
  
  query('overdue')
    .optional()
    .isBoolean()
    .withMessage('Overdue must be a boolean value'),
];

// Validation rules for payment statistics query
const validatePaymentStatisticsQuery = [
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  
  query('roomId')
    .optional()
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  
  query('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be rent, deposit, utility, maintenance, penalty, or other'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

// Validation rules for payment history query
const validatePaymentHistoryQuery = [
  query('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  query('tenantId')
    .optional()
    .isMongoId()
    .withMessage('Tenant ID must be a valid MongoDB ObjectId'),
  
  query('roomId')
    .optional()
    .isMongoId()
    .withMessage('Room ID must be a valid MongoDB ObjectId'),
  
  query('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be rent, deposit, utility, maintenance, penalty, or other'),
  
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Group by must be day, week, or month'),
];

// Validation rules for payment search
const validatePaymentSearch = [
  query('query')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  query('sort')
    .optional()
    .isIn(['paymentDate', 'amount', 'dueDate', 'status', 'createdAt'])
    .withMessage('Sort field must be paymentDate, amount, dueDate, status, or createdAt'),
  
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Order must be asc or desc'),
  
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'partial'])
    .withMessage('Status must be pending, completed, failed, refunded, or partial'),
  
  query('paymentType')
    .optional()
    .isIn(['rent', 'deposit', 'utility', 'maintenance', 'penalty', 'other'])
    .withMessage('Payment type must be rent, deposit, utility, maintenance, penalty, or other'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
];

// Validation rules for report creation
const validateReportCreate = [
  body('tenant')
    .optional()
    .isMongoId()
    .withMessage('Tenant must be a valid MongoDB ObjectId'),
  
  body('room')
    .optional()
    .isMongoId()
    .withMessage('Room must be a valid MongoDB ObjectId'),
  
  body('type')
    .isIn(['maintenance', 'complaint', 'other'])
    .withMessage('Report type must be one of: maintenance, complaint, other'),
  
  body('title')
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
  
  body('description')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('roomNumber')
    .optional()
    .isString()
    .withMessage('Room number must be a string'),
];

// Validation rules for report update
const validateReportUpdate = [
  body('type')
    .optional()
    .isIn(['maintenance', 'complaint', 'other'])
    .withMessage('Report type must be one of: maintenance, complaint, other'),
  
  body('title')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters')
    .trim(),
  
  body('description')
    .optional()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be between 10 and 1000 characters')
    .trim(),
  
  body('status')
    .optional()
    .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Status must be one of: pending, in-progress, resolved, rejected'),
];

// Validation rules for report status update
const validateReportStatusUpdate = [
  body('status')
    .isIn(['pending', 'in-progress', 'resolved', 'rejected'])
    .withMessage('Status must be one of: pending, in-progress, resolved, rejected'),
];

// Validation rules for notification creation
const validateNotificationCreate = [
  body('user_id')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('User ID must be a valid MongoDB ObjectId'),
  
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters')
    .trim(),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters')
    .trim(),
  
  body('type')
    .isIn(['payment_due', 'report_update', 'system_alert', 'maintenance', 'announcement', 'lease_reminder', 'other'])
    .withMessage('Type must be one of: payment_due, report_update, system_alert, maintenance, announcement, lease_reminder, other'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date')
    .toDate(),
];

// Validation rules for notification broadcast
const validateNotificationBroadcast = [
  body()
    .custom((value, { req }) => {
      const { userIds, roles } = req.body;
      
      if (!userIds && !roles) {
        throw new Error('Either userIds or roles must be provided');
      }
      
      if (userIds && !Array.isArray(userIds)) {
        throw new Error('UserIds must be an array');
      }
      
      if (roles && !Array.isArray(roles)) {
        throw new Error('Roles must be an array');
      }
      
      return true;
    }),
  
  body('userIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each user ID must be a valid MongoDB ObjectId'),
  
  body('roles.*')
    .optional()
    .isIn(['admin', 'staff', 'tenant'])
    .withMessage('Each role must be one of: admin, staff, tenant'),
  
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters')
    .trim(),
  
  body('message')
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message must be less than 1000 characters')
    .trim(),
  
  body('type')
    .isIn(['payment_due', 'report_update', 'system_alert', 'maintenance', 'announcement', 'lease_reminder', 'other'])
    .withMessage('Type must be one of: payment_due, report_update, system_alert, maintenance, announcement, lease_reminder, other'),
  
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be one of: low, medium, high, urgent'),
  
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
  
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expires at must be a valid date')
    .toDate(),
];

// Validation rules for admin account creation
const validateAdminCreateAccount = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('role')
    .isIn(['staff', 'tenant'])
    .withMessage('Role must be staff or tenant'),
  
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
];

// Validation rules for account activation
const validateAccountActivation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('token')
    .isLength({ min: 6, max: 6 })
    .withMessage('Verification token must be exactly 6 characters')
    .matches(/^[0-9]+$/)
    .withMessage('Verification token must contain only numbers'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    }),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateTenantRegister,
  validateTenantCreate,
  validateTenantUpdate,
  validateTenantStatusUpdate,
  validateRoomCreate,
  validateRoomUpdate,
  validateRoomTenantAssignment,
  validateRoomTenantUnassignment,
  validateRoomMaintenanceUpdate,
  validatePaymentCreate,
  validatePaymentUpdate,
  validatePaymentRefund,
  validateLateFeeApplication,
  validatePaymentQuery,
  validatePaymentStatisticsQuery,
  validatePaymentHistoryQuery,
  validatePaymentSearch,
  // Report validations
  validateReportCreate,
  validateReportUpdate,
  validateReportStatusUpdate,
  // Notification validations
  validateNotificationCreate,
  validateNotificationBroadcast,
  // Email verification validations
  validateAdminCreateAccount,
  validateAccountActivation,
};