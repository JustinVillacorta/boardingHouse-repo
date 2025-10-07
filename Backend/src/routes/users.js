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
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('role')
    .optional()
    .isIn(['admin', 'staff', 'tenant'])
    .withMessage('Role must be admin, staff, or tenant'),
], userController.updateUser);

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;