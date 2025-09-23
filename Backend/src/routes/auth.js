const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange,
} = require('../middleware/validation');

const router = express.Router();

// Public routes (no authentication required)
router.post('/register', authLimiter, validateRegister, authController.register);
router.post('/login', authLimiter, validateLogin, authController.login);

// Protected routes (authentication required)
router.use(authenticate); // All routes below require authentication

router.post('/logout', authController.logout);
router.get('/profile', authController.getProfile);
router.get('/me', authController.getProfile); // Alias for /profile
router.put('/profile', validateProfileUpdate, authController.updateProfile);
router.put('/change-password', validatePasswordChange, authController.changePassword);
router.get('/validate-token', authController.validateToken);

// Admin only routes
router.get('/users', requireAdmin, authController.getAllUsers);

module.exports = router;