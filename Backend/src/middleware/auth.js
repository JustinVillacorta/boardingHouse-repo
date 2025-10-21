const { verifyToken } = require('../utils/jwt');
const authService = require('../services/authService');
const { sendUnauthorized, sendForbidden } = require('../utils/response');

// Middleware to authenticate JWT token
const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'Access token is required');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = verifyToken(token);
    
    // Validate user still exists and is active
    const user = await authService.validateToken(decoded.id);
    
    // Add user info to request
    req.user = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return sendUnauthorized(res, 'Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      return sendUnauthorized(res, 'Token has expired');
    } else {
      return sendUnauthorized(res, error.message || 'Authentication failed');
    }
  }
};

// Middleware to authorize user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return sendForbidden(res, 'Insufficient permissions');
    }

    next();
  };
};

// Middleware to check if user is admin
const requireAdmin = authorize('admin');

// Middleware to check if user is admin or staff
const requireAdminOrStaff = authorize('admin', 'staff');

// Middleware to check if user is accessing their own resource or is admin/staff
const requireOwnershipOrStaff = (req, res, next) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required');
  }

  const userId = req.params.userId || req.params.id;
  const isOwner = req.user.id.toString() === userId.toString();
  const isStaff = ['admin', 'staff'].includes(req.user.role);

  console.log('=== OWNERSHIP CHECK DEBUG ===');
  console.log('req.user.id:', req.user.id);
  console.log('req.user.id type:', typeof req.user.id);
  console.log('userId:', userId);
  console.log('userId type:', typeof userId);
  console.log('isOwner:', isOwner);
  console.log('isStaff:', isStaff);
  console.log('req.user.role:', req.user.role);
  console.log('=============================');

  if (!isOwner && !isStaff) {
    console.log('Access denied - not owner and not staff');
    return sendForbidden(res, 'Access denied');
  }

  console.log('Access granted - calling next()');
  next();
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    const user = await authService.validateToken(decoded.id);
    
    req.user = user;
    next();
  } catch (error) {
    // Continue without authentication
    next();
  }
};

module.exports = {
  authenticate,
  authorize,
  requireAdmin,
  requireAdminOrStaff,
  requireOwnershipOrStaff,
  optionalAuth,
};