const userRepository = require('../repositories/userRepository');
const { generateAccessToken } = require('../utils/jwt');

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const { username, email, password, role = 'admin' } = userData;

      // Check if user already exists
      const existingUserByEmail = await userRepository.findByEmail(email);
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }

      const existingUserByUsername = await userRepository.findByUsername(username);
      if (existingUserByUsername) {
        throw new Error('User with this username already exists');
      }

      // Create user
      const user = await userRepository.create({
        username,
        email,
        password,
        role,
      });

      // Generate token
      const token = generateAccessToken(user);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          createdAt: user.createdAt,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  // Login user
  async login(credentials) {
    try {
      const { identifier, password } = credentials; // identifier can be email or username

      // Find user by email or username
      const user = await userRepository.findByEmailOrUsername(identifier);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if account is locked
      if (user.isLocked) {
        throw new Error('Account is temporarily locked due to too many failed login attempts');
      }

      // Check if account is active
      if (!user.isActive) {
        throw new Error('Account has been deactivated');
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw new Error('Invalid credentials');
      }

      // Reset login attempts on successful login
      await user.resetLoginAttempts();

      // Generate token
      const token = generateAccessToken(user);

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
        },
        token,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile
  async getProfile(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Update user profile
  async updateProfile(userId, updateData) {
    try {
      const { username, email } = updateData;

      // Check if username is being updated and if it already exists
      if (username) {
        const existingUser = await userRepository.findByUsername(username);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new Error('Username already exists');
        }
      }

      // Check if email is being updated and if it already exists
      if (email) {
        const existingUser = await userRepository.findByEmail(email);
        if (existingUser && existingUser._id.toString() !== userId) {
          throw new Error('Email already exists');
        }
      }

      const updatedUser = await userRepository.update(userId, updateData);
      if (!updatedUser) {
        throw new Error('User not found');
      }

      return {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt,
      };
    } catch (error) {
      throw error;
    }
  }

  // Change password
  async changePassword(userId, passwordData) {
    try {
      const { currentPassword, newPassword } = passwordData;

      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await user.comparePassword(currentPassword);
      if (!isCurrentPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      // Update password
      const updatedUser = await userRepository.update(userId, {
        password: newPassword,
      });

      return {
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Validate token and get user
  async validateToken(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user || !user.isActive) {
        throw new Error('Invalid token or user not found');
      }

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all users (admin only)
  async getAllUsers() {
    try {
      const users = await userRepository.findAll();
      return users.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();