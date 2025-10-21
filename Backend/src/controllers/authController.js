const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendUnauthorized,
  sendServerError,
} = require('../utils/response');

class AuthController {
  // Register new user
  async register(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { username, email, password, role } = req.body;

      // Prevent tenant creation through auth endpoint
      if (role === 'tenant') {
        return sendError(res, 'Tenant accounts must be created through the tenant registration endpoint', 400);
      }

      const result = await authService.register({
        username,
        email,
        password,
        role,
      });

      return sendCreated(res, 'User registered successfully', result);
    } catch (error) {
      console.error('Register error:', error);
      
      if (error.message.includes('already exists')) {
        return sendError(res, error.message, 409);
      }
      
      return sendServerError(res, 'Registration failed');
    }
  }

  // Login user
  async login(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { email, password } = req.body;

      const result = await authService.login({ identifier: email, password });

      return sendSuccess(res, 'Login successful', result);
    } catch (error) {
      console.error('Login error:', error);
      
      if (
        error.message.includes('Invalid credentials') ||
        error.message.includes('Account is temporarily locked') ||
        error.message.includes('Account has been deactivated')  
      ) {
        return sendUnauthorized(res, error.message);
      }
      
      return sendServerError(res, 'Login failed');
    }
  }  // Get current user profile
  async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await authService.getProfile(userId);

      return sendSuccess(res, 'Profile retrieved successfully', user);
    } catch (error) {
      console.error('Get profile error:', error);
      
      if (error.message === 'User not found') {
        return sendError(res, error.message, 404);
      }
      
      return sendServerError(res, 'Failed to retrieve profile');
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const updateData = req.body;

      const updatedUser = await authService.updateProfile(userId, updateData);

      return sendSuccess(res, 'Profile updated successfully', updatedUser);
    } catch (error) {
      console.error('Update profile error:', error);
      
      if (
        error.message.includes('already exists') ||
        error.message === 'User not found'
      ) {
        return sendError(res, error.message, 409);
      }
      
      return sendServerError(res, 'Failed to update profile');
    }
  }

  // Change password
  async changePassword(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      const result = await authService.changePassword(userId, {
        currentPassword,
        newPassword,
      });

      return sendSuccess(res, result.message);
    } catch (error) {
      console.error('Change password error:', error);
      
      if (
        error.message === 'User not found' ||
        error.message === 'Current password is incorrect'
      ) {
        return sendError(res, error.message, 400);
      }
      
      return sendServerError(res, 'Failed to change password');
    }
  }

  // Logout (client-side token removal)
  async logout(req, res) {
    try {
      // Since we're using stateless JWT tokens, logout is primarily handled client-side
      // Here we can log the logout event or perform cleanup if needed
      
      return sendSuccess(res, 'Logout successful', {
        message: 'Please remove the token from client storage',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return sendServerError(res, 'Logout failed');
    }
  }

  // Validate token endpoint
  async validateToken(req, res) {
    try {
      // If we reach here, the authenticate middleware has already validated the token
      const user = req.user;

      return sendSuccess(res, 'Token is valid', user);
    } catch (error) {
      console.error('Validate token error:', error);
      return sendServerError(res, 'Token validation failed');
    }
  }

  // Get all users (admin gets all, staff gets only tenants)
  async getAllUsers(req, res) {
    try {
      let users;
      
      if (req.user.role === 'admin') {
        // Admin can see all users
        users = await authService.getAllUsers();
      } else if (req.user.role === 'staff') {
        // Staff can only see tenant users
        users = await authService.getUsersByRole('tenant');
      } else {
        return sendUnauthorized(res, 'Access denied. Admin or Staff role required.');
      }
      
      return sendSuccess(res, 'Users retrieved successfully', users);
    } catch (error) {
      console.error('Get all users error:', error);
      return sendServerError(res, 'Failed to retrieve users');
    }
  }
}

module.exports = new AuthController();