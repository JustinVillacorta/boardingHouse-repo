const User = require('../models/User');
const bcrypt = require('bcrypt');
const config = require('../config/config');

class UserRepository {
  // Create a new user
  async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID
  async findById(id) {
    try {
      return await User.findById(id).select('+password');
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  async findByEmail(email) {
    try {
      return await User.findOne({ email }).select('+password +verificationToken +verificationTokenExpiry');
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  async findByUsername(username) {
    try {
      return await User.findOne({ username }).select('+password');
    } catch (error) {
      throw error;
    }
  }

  // Find user by email or username
  async findByEmailOrUsername(identifier) {
    try {
      return await User.findOne({
        $or: [{ email: identifier }, { username: identifier }],
      }).select('+password');
    } catch (error) {
      throw error;
    }
  }

  // Update user
  async update(id, updateData) {
    try {
      // If password is being updated, we need to use save() to trigger pre-save middleware
      if (updateData.password) {
        const user = await User.findById(id);
        if (!user) {
          throw new Error('User not found');
        }
        
        // Set the raw password - pre-save middleware will hash it
        user.password = updateData.password;
        user.isVerified = updateData.isVerified !== undefined ? updateData.isVerified : user.isVerified;
        user.isActive = updateData.isActive !== undefined ? updateData.isActive : user.isActive;
        
        // Mark password as modified to ensure pre-save middleware runs
        user.markModified('password');
        
        return await user.save();
      } else {
        // For non-password updates, use findByIdAndUpdate
        return await User.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });
      }
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  async delete(id) {
    try {
      return await User.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }

  // Check if email exists
  async emailExists(email) {
    try {
      const user = await User.findOne({ email });
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  // Check if username exists
  async usernameExists(username) {
    try {
      const user = await User.findOne({ username });
      return !!user;
    } catch (error) {
      throw error;
    }
  }

  // Get all users (for admin)
  async findAll() {
    try {
      return await User.find({});
    } catch (error) {
      throw error;
    }
  }

  // Find users by role
  async findByRole(role) {
    try {
      return await User.find({ role });
    } catch (error) {
      throw error;
    }
  }

  // Find users by multiple roles
  async findByRoles(roles) {
    try {
      return await User.find({ role: { $in: roles } });
    } catch (error) {
      throw error;
    }
  }

  // Find user by verification token
  async findByVerificationToken(token) {
    try {
      return await User.findOne({ 
        verificationToken: token,
        verificationTokenExpiry: { $gt: new Date() } // Token not expired
      }).select('+verificationToken +verificationTokenExpiry');
    } catch (error) {
      throw error;
    }
  }

  // Update user verification status
  async updateVerificationStatus(userId, isVerified, clearToken = true) {
    try {
      const updateData = { isVerified };
      if (clearToken) {
        updateData.verificationToken = undefined;
        updateData.verificationTokenExpiry = undefined;
      }
      
      // Use $unset to clear verification fields without overwriting other fields
      const unsetData = {};
      if (clearToken) {
        unsetData.verificationToken = 1;
        unsetData.verificationTokenExpiry = 1;
      }
      
      return await User.findByIdAndUpdate(userId, {
        $set: updateData,
        $unset: unsetData
      }, {
        new: true,
        runValidators: true,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserRepository();