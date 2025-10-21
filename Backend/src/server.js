const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/database');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Connect to database
connectDB();

// Start server
const server = app.listen(config.PORT, () => {
  console.log(`
🚀 Server is running!
📍 Environment: ${config.NODE_ENV}
🌐 Port: ${config.PORT}
🔗 URL: http://localhost:${config.PORT}
📊 Health Check: http://localhost:${config.PORT}/api/health
🔐 API Documentation: http://localhost:${config.PORT}
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => {
    process.exit(1);
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});