const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT token
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE,
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

// Generate access token for user
const generateAccessToken = (user) => {
  return generateToken({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
};

module.exports = {
  generateToken,
  verifyToken,
  generateAccessToken,
};