const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

// GET /api/users - Get all users (admin only)
router.get('/', userController.getAllUsers);

// GET /api/users/statistics - Get user statistics (admin only)
router.get('/statistics', userController.getUserStatistics);

// GET /api/users/:id - Get specific user
router.get('/:id', userController.getUserById);

// PUT /api/users/:id - Update user (admin only)
router.put('/:id', [
  body('username')
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'tenant'])
    .withMessage('Role must be admin, staff, or tenant'),
  // Tenant-specific validations
  body('firstName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
  body('lastName')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name must be between 1 and 50 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
  body('phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Date of birth must be a valid date')
    .custom((value) => {
      if (new Date(value) >= new Date()) {
        throw new Error('Date of birth must be in the past');
      }
      return true;
    }),
  body('idType')
    .optional()
    .isIn(['passport', 'drivers_license', 'national_id', 'other'])
    .withMessage('ID type must be passport, drivers_license, national_id, or other'),
  body('idNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('ID number must be between 1 and 50 characters'),
  body('monthlyRent')
    .optional()
    .isNumeric()
    .withMessage('Monthly rent must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Monthly rent cannot be negative');
      }
      return true;
    }),
  body('securityDeposit')
    .optional()
    .isNumeric()
    .withMessage('Security deposit must be a number')
    .custom((value) => {
      if (parseFloat(value) < 0) {
        throw new Error('Security deposit cannot be negative');
      }
      return true;
    }),
  body('emergencyContact.name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Emergency contact name must be between 1 and 100 characters'),
  body('emergencyContact.relationship')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Emergency contact relationship must be between 1 and 50 characters'),
  body('emergencyContact.phoneNumber')
    .optional()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage('Please provide a valid emergency contact phone number'),
], userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;