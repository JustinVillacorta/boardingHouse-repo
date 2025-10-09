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
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:4173',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175',
      'http://127.0.0.1:4173',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Origin not allowed by CORS:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

app.use(cors(corsOptions));

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
      },
      users: {
        getAllUsers: 'GET /api/users (admin only)',
        getUserById: 'GET /api/users/:id',
        updateUser: 'PUT /api/users/:id (admin only)',
        deleteUser: 'DELETE /api/users/:id (admin only)',
        getStatistics: 'GET /api/users/statistics (admin only)',
      },
      tenants: {
        getAllTenants: 'GET /api/tenants (admin/staff)',
        getTenantById: 'GET /api/tenants/:id',
        createTenant: 'POST /api/tenants',
        updateTenant: 'PUT /api/tenants/:id',
        getTenantProfile: 'GET /api/tenants/me (tenant)',
        updateProfile: 'PUT /api/tenants/me (tenant)',
      },
      rooms: {
        getAllRooms: 'GET /api/rooms',
        getRoomById: 'GET /api/rooms/:id',
        createRoom: 'POST /api/rooms (admin/staff)',
        updateRoom: 'PUT /api/rooms/:id (admin/staff)',
        deleteRoom: 'DELETE /api/rooms/:id (admin/staff)',
        getAvailableRooms: 'GET /api/rooms/available',
        getRoomStatistics: 'GET /api/rooms/statistics (admin/staff)',
      },
      payments: {
        getAllPayments: 'GET /api/payments',
        getPaymentById: 'GET /api/payments/:id',
        createPayment: 'POST /api/payments',
        updatePayment: 'PUT /api/payments/:id',
        markAsPaid: 'POST /api/payments/:id/pay',
        getOverduePayments: 'GET /api/payments/overdue (admin/staff)',
      },
      dashboard: {
        getStats: 'GET /api/dashboard/stats (admin/staff)',
        getOccupancy: 'GET /api/dashboard/occupancy (admin/staff)',
        getPaymentStats: 'GET /api/dashboard/payments (admin/staff)',
        getReportStats: 'GET /api/dashboard/reports (admin/staff)',
      },
      reports: {
        createReport: 'POST /api/reports',
        getAllReports: 'GET /api/reports (admin/staff)',
        getMyReports: 'GET /api/reports/my',
        getReportById: 'GET /api/reports/:id',
        updateReport: 'PUT /api/reports/:id',
        deleteReport: 'DELETE /api/reports/:id (admin/staff)',
        updateStatus: 'PUT /api/reports/:id/status (admin/staff)',
        getStatistics: 'GET /api/reports/statistics (admin/staff)',
      },
      notifications: {
        getAllNotifications: 'GET /api/notifications',
        markAsRead: 'PUT /api/notifications/:id/read',
        deleteNotification: 'DELETE /api/notifications/:id',
      }
    }
  });
});

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;