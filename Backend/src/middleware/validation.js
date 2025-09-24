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

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
  validateTenantRegister,
  validateTenantCreate,
  validateTenantUpdate,
  validateTenantStatusUpdate,
};