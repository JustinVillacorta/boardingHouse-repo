const User = require('../models/User');

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
      return await User.findOne({ email }).select('+password');
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
      return await User.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });
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
}

module.exports = new UserRepository();