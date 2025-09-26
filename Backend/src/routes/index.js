const express = require('express');
const authRoutes = require('./auth');
const tenantRoutes = require('./tenants');
const roomRoutes = require('./rooms');
const paymentRoutes = require('./payments');
const reportRoutes = require('./reports');

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/tenants', tenantRoutes);
router.use('/rooms', roomRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);

module.exports = router;