const userRepository = require('../repositories/userRepository');
const { generateAccessToken } = require('../utils/jwt');
const emailService = require('../utils/emailService');
const config = require('../config/config');

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
        // Admin accounts will be auto-verified by the pre-save hook
        // Staff/tenant accounts will need email verification
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

      // Check if account is verified (skip for admin accounts)
      if (!user.isVerified && user.role !== 'admin') {
        throw new Error('Account not verified. Please check your email for verification instructions.');
      }

      // Verify password
      console.log('=== LOGIN DEBUG ===');
      console.log('User email:', user.email);
      console.log('User has password:', !!user.password);
      console.log('Password length:', user.password ? user.password.length : 0);
      console.log('Input password:', password);
      
      const isPasswordValid = await user.comparePassword(password);
      console.log('Password valid:', isPasswordValid);
      console.log('==================');
      
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
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Create user account by admin (with email verification)
  async createUserAccountByAdmin(userData) {
    try {
      const { email, role, username } = userData;

      // Check if user already exists
      const existingUserByEmail = await userRepository.findByEmail(email);
      if (existingUserByEmail) {
        throw new Error('User with this email already exists');
      }

      // Generate username if not provided
      let finalUsername = username;
      if (!finalUsername) {
        const emailPrefix = email.split('@')[0];
        finalUsername = `${emailPrefix}_${Date.now().toString().slice(-4)}`;
      }

      // Check if generated username already exists
      const existingUserByUsername = await userRepository.findByUsername(finalUsername);
      if (existingUserByUsername) {
        finalUsername = `${finalUsername}_${Date.now().toString().slice(-4)}`;
      }

      // Generate verification token
      const verificationToken = emailService.generateVerificationToken();
      const verificationTokenExpiry = new Date(Date.now() + config.VERIFICATION_TOKEN_EXPIRY);

      // Create user with verification data
      const user = await userRepository.create({
        username: finalUsername,
        email,
        role,
        isActive: false, // Not active until verified
        isVerified: false,
        verificationToken,
        verificationTokenExpiry,
      });

      // Send verification email (non-blocking)
      emailService.sendVerificationEmail(email, verificationToken, role)
        .then(() => {
          console.log(`Verification email sent to ${email}`);
        })
        .catch((error) => {
          console.error(`Failed to send verification email to ${email}:`, error.message);
          console.log(`MANUAL VERIFICATION TOKEN for ${email}: ${verificationToken}`);
        });

      return {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          isVerified: user.isVerified,
          createdAt: user.createdAt,
        },
        message: 'Account created successfully. Check console for verification token if email fails.',
        verificationToken: verificationToken, // Include token in response for testing
      };
    } catch (error) {
      throw error;
    }
  }

    // Activate user account with verification token
    async activateUserAccount(email, token, password) {
      try {
        // Find user by email and verification token
        const user = await userRepository.findByEmail(email);
      
      if (!user) {
        throw new Error('User not found with this email address');
      }

      // Check if token matches and is not expired
      if (!user.verificationToken || user.verificationToken !== token) {
        throw new Error('Invalid verification token');
      }

      if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date()) {
        throw new Error('Verification token has expired');
      }

      // Update password and activate account using direct user.save() to ensure pre-save middleware is triggered
      const User = require('../models/User');
      const userToUpdate = await User.findById(user._id);
      if (!userToUpdate) {
        throw new Error('User not found');
      }
      
      userToUpdate.password = password;
      userToUpdate.isVerified = true;
      userToUpdate.isActive = true;
      userToUpdate.markModified('password');
      
      const tempUser = await userToUpdate.save();

      // Clear verification token
      await userRepository.updateVerificationStatus(user._id, true, true);

      // Generate token for immediate login
      const accessToken = generateAccessToken(tempUser);

      return {
        user: {
          id: tempUser._id,
          username: tempUser.username,
          email: tempUser.email,
          role: tempUser.role,
          isActive: tempUser.isActive,
          isVerified: tempUser.isVerified,
        },
        token: accessToken,
        message: 'Account activated successfully',
      };
    } catch (error) {
      throw error;
    }
  }

  // Resend verification email
  async resendVerification(userId) {
    try {
      const user = await userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (user.isVerified) {
        throw new Error('User account is already verified');
      }

      // Generate new verification token
      const verificationToken = emailService.generateVerificationToken();
      const verificationTokenExpiry = new Date(Date.now() + config.VERIFICATION_TOKEN_EXPIRY);

      // Update user with new token
      await userRepository.update(userId, {
        verificationToken,
        verificationTokenExpiry,
      });

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken, user.role);

      return {
        message: 'Verification email sent successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();