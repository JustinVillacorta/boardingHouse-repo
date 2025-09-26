const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const routes = require('./routes');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Request logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rate limiting
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Boarding House Management API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile',
        updateProfile: 'PUT /api/auth/profile',
        changePassword: 'PUT /api/auth/change-password',
        validateToken: 'GET /api/auth/validate-token',
        getAllUsers: 'GET /api/auth/users (admin only)',
      },
      reports: {
        createReport: 'POST /api/reports',
        getAllReports: 'GET /api/reports (admin/staff)',
        getMyReports: 'GET /api/reports/my',
        getReportById: 'GET /api/reports/:id',
        updateReport: 'PUT /api/reports/:id',
        deleteReport: 'DELETE /api/reports/:id (admin/staff)',
        updateStatus: 'PUT /api/reports/:id/status (admin/staff)',
        assignReport: 'PUT /api/reports/:id/assign (admin/staff)',
        addComment: 'POST /api/reports/:id/comments',
        markResolved: 'POST /api/reports/:id/resolve (admin/staff)',
        getOverdue: 'GET /api/reports/overdue (admin/staff)',
        getStatistics: 'GET /api/reports/statistics (admin/staff)',
        bulkUpdate: 'PUT /api/reports/bulk/update (admin)',
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;