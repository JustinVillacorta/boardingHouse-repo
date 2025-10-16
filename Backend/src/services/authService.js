const userRepository = require('../repositories/userRepository');
const { generateAccessToken } = require('../utils/jwt');
const Tenant = require('../models/Tenant');
const Room = require('../models/Room');

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
      
      // Get tenant data for users with tenant role
      const tenantUserIds = users.filter(user => user.role === 'tenant').map(user => user._id);
      const tenants = await Tenant.find({ userId: { $in: tenantUserIds } }).lean();
      
      // Debug logging for tenant data
      console.log('=== DEBUG: getAllUsers ===');
      console.log('Total users:', users.length);
      console.log('Tenant user IDs:', tenantUserIds);
      console.log('Total tenants found:', tenants.length);
      tenants.forEach(tenant => {
        console.log(`Tenant ${tenant.firstName} ${tenant.lastName}: roomNumber = ${tenant.roomNumber}`);
      });
      console.log('========================');
      
      // Create a map for quick lookup
      const tenantMap = new Map();
      tenants.forEach(tenant => {
        // Debug each tenant's userId
        console.log('Processing tenant:', tenant.firstName, tenant.lastName);
        console.log('tenant.userId:', tenant.userId);
        console.log('tenant.userId type:', typeof tenant.userId);
        console.log('tenant.userId toString:', tenant.userId ? tenant.userId.toString() : 'null');
        
        // Handle both ObjectId and populated User object cases
        let userIdString = null;
        if (tenant.userId) {
          if (typeof tenant.userId === 'object' && tenant.userId._id) {
            // If userId is a populated User object, use the _id
            userIdString = tenant.userId._id.toString();
            console.log('Using populated User object _id:', userIdString);
          } else {
            // If userId is an ObjectId, convert to string
            userIdString = tenant.userId.toString();
            console.log('Using ObjectId toString:', userIdString);
          }
        }
        if (userIdString) {
          tenantMap.set(userIdString, tenant);
          console.log('Added to map with key:', userIdString);
        } else {
          console.log('Skipped tenant - no userId');
        }
      });
      
      // Debug logging for tenantMap
      console.log('=== TENANT MAP DEBUG ===');
      console.log('Total tenants in map:', tenantMap.size);
      console.log('Tenant map keys:', Array.from(tenantMap.keys()).slice(0, 5));
      console.log('Looking for user ID:', '68f091e8e4ae2765eeffb313');
      console.log('Found in map:', tenantMap.has('68f091e8e4ae2765eeffb313'));
      console.log('========================');

      // Fetch room details for assigned rooms
      const roomNumbers = tenants
        .filter(t => t.roomNumber && t.roomNumber !== null && t.roomNumber !== '')
        .map(t => t.roomNumber);
        
      const rooms = await Room.find({ roomNumber: { $in: roomNumbers } }).lean();
      const roomMap = new Map(rooms.map(r => [r.roomNumber, r]));

      // Format response for frontend
      return users.map(user => {
        const tenant = tenantMap.get(user._id.toString());
        const room = tenant?.roomNumber && tenant.roomNumber !== null && tenant.roomNumber !== '' ? roomMap.get(tenant.roomNumber) : null;
        
        // Debug logging for jerie user
        if (user.username === 'jerie') {
          console.log('=== JERIE BACKEND DEBUG ===');
          console.log('User _id:', user._id);
          console.log('User _id toString:', user._id.toString());
          console.log('Tenant found:', !!tenant);
          console.log('Tenant:', tenant);
          console.log('Room found:', !!room);
          console.log('Room:', room);
          console.log('===========================');
        }
        
        return {
          id: user._id,
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          tenant: tenant ? {
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            phoneNumber: tenant.phoneNumber,
            roomNumber: tenant.roomNumber,
            tenantStatus: tenant.tenantStatus,
            monthlyRent: tenant.monthlyRent,
            room: room ? {
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              status: room.status,
              monthlyRent: room.monthlyRent,
              capacity: room.capacity
            } : null
          } : null
        };
      });
    } catch (error) {
      throw error;
    }
  }

  // Get users by role
  async getUsersByRole(role) {
    try {
      const users = await userRepository.findByRole(role);
      
      // Get tenant data for users with tenant role
      const tenantUserIds = users.filter(user => user.role === 'tenant').map(user => user._id);
      const tenants = await Tenant.find({ userId: { $in: tenantUserIds } }).lean();
      
      // Create a map for quick lookup
      const tenantMap = new Map();
      tenants.forEach(tenant => {
        // Debug each tenant's userId
        console.log('Processing tenant:', tenant.firstName, tenant.lastName);
        console.log('tenant.userId:', tenant.userId);
        console.log('tenant.userId type:', typeof tenant.userId);
        console.log('tenant.userId toString:', tenant.userId ? tenant.userId.toString() : 'null');
        
        // Handle both ObjectId and populated User object cases
        let userIdString = null;
        if (tenant.userId) {
          if (typeof tenant.userId === 'object' && tenant.userId._id) {
            // If userId is a populated User object, use the _id
            userIdString = tenant.userId._id.toString();
            console.log('Using populated User object _id:', userIdString);
          } else {
            // If userId is an ObjectId, convert to string
            userIdString = tenant.userId.toString();
            console.log('Using ObjectId toString:', userIdString);
          }
        }
        if (userIdString) {
          tenantMap.set(userIdString, tenant);
          console.log('Added to map with key:', userIdString);
        } else {
          console.log('Skipped tenant - no userId');
        }
      });
      
      // Debug logging for tenantMap
      console.log('=== TENANT MAP DEBUG ===');
      console.log('Total tenants in map:', tenantMap.size);
      console.log('Tenant map keys:', Array.from(tenantMap.keys()).slice(0, 5));
      console.log('Looking for user ID:', '68f091e8e4ae2765eeffb313');
      console.log('Found in map:', tenantMap.has('68f091e8e4ae2765eeffb313'));
      console.log('========================');

      // Fetch room details for assigned rooms
      const roomNumbers = tenants
        .filter(t => t.roomNumber && t.roomNumber !== null && t.roomNumber !== '')
        .map(t => t.roomNumber);
        
      const rooms = await Room.find({ roomNumber: { $in: roomNumbers } }).lean();
      const roomMap = new Map(rooms.map(r => [r.roomNumber, r]));

      // Format response for frontend
      return users.map(user => {
        const tenant = tenantMap.get(user._id.toString());
        const room = tenant?.roomNumber && tenant.roomNumber !== null && tenant.roomNumber !== '' ? roomMap.get(tenant.roomNumber) : null;
        
        // Debug logging for jerie user
        if (user.username === 'jerie') {
          console.log('=== JERIE BACKEND DEBUG ===');
          console.log('User _id:', user._id);
          console.log('User _id toString:', user._id.toString());
          console.log('Tenant found:', !!tenant);
          console.log('Tenant:', tenant);
          console.log('Room found:', !!room);
          console.log('Room:', room);
          console.log('===========================');
        }
        
        return {
          id: user._id,
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          tenant: tenant ? {
            firstName: tenant.firstName,
            lastName: tenant.lastName,
            phoneNumber: tenant.phoneNumber,
            roomNumber: tenant.roomNumber,
            tenantStatus: tenant.tenantStatus,
            monthlyRent: tenant.monthlyRent,
            room: room ? {
              roomNumber: room.roomNumber,
              roomType: room.roomType,
              status: room.status,
              monthlyRent: room.monthlyRent,
              capacity: room.capacity
            } : null
          } : null
        };
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthService();