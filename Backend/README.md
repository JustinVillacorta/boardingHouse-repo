# Boarding House Management System - Backend API

A robust Node.js backend API for the Boarding House Management System, built with Express.js and MongoDB, following MVC + Clean Architecture principles.

## 🏗️ Architecture

This project follows **MVC + Clean Architecture** principles:

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic
- **Repositories**: Handle data access and database operations
- **Models**: Define data structure and validation
- **Middleware**: Handle authentication, validation, and error handling
- **Utils**: Utility functions and helpers

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Admin, Staff, Tenant)
  - Password hashing with bcrypt
  - Account lockout after failed attempts
  - Rate limiting for security

- **Security**
  - Helmet.js for security headers
  - CORS configuration
  - Input validation and sanitization
  - Rate limiting
  - Password strength requirements

- **Error Handling**
  - Global error handler
  - Consistent error responses
  - Validation error handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   - Copy `.env.example` to `.env` (if you have one)
   - Update the environment variables in `.env`:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/boardinghouse_db
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   BCRYPT_SALT_ROUNDS=12
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

4. **Start MongoDB:**
   - Make sure MongoDB is running on your system
   - Default connection: `mongodb://localhost:27017/boardinghouse_db`

## 🏃‍♂️ Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000`

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Check server status

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)
- `PUT /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/validate-token` - Validate JWT token (authenticated)
- `GET /api/auth/users` - Get all users (admin only)

### Request Examples

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "AdminPass123",
  "role": "admin"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "identifier": "admin@example.com",
  "password": "AdminPass123"
}
```

#### Access Protected Route
```bash
GET /api/auth/profile
Authorization: Bearer your-jwt-token-here
```

## 🔐 Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer your-jwt-token-here
```

### User Roles
- **admin**: Full access to all features
- **staff**: Limited access to management features
- **tenant**: Access to personal information and requests

## 🗄️ Database Schema

### User Model
```javascript
{
  username: String (required, unique)
  email: String (required, unique)
  password: String (required, hashed)
  role: String (admin/staff/tenant)
  isActive: Boolean
  lastLogin: Date
  loginAttempts: Number
  lockUntil: Date
  createdAt: Date
  updatedAt: Date
}
```

## 🛡️ Security Features

- **Password Requirements**: Minimum 6 characters with uppercase, lowercase, and numbers
- **Account Lockout**: 5 failed attempts lock account for 2 hours
- **Rate Limiting**: 
  - General API: 100 requests per 15 minutes
  - Auth endpoints: 10 requests per 15 minutes
- **Input Validation**: All inputs are validated and sanitized
- **CORS**: Configured for frontend integration

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── models/
│   │   └── User.js
│   ├── repositories/
│   │   └── userRepository.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── index.js
│   ├── services/
│   │   └── authService.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── response.js
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

## 🧪 Testing

You can test the API endpoints using tools like:
- Postman
- Insomnia
- curl
- Thunder Client (VS Code extension)

## 🚀 Deployment

1. Set environment variables for production
2. Use a production MongoDB instance
3. Set `NODE_ENV=production`
4. Use a process manager like PM2

```bash
npm install -g pm2
pm2 start src/server.js --name "boarding-house-api"
```

## 📝 Next Steps

After setting up authentication, you can extend the API by adding:
- Tenant management endpoints
- Room management endpoints
- Payment tracking endpoints
- Maintenance request endpoints
- Notification system

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain clean architecture principles
3. Add proper error handling
4. Include input validation
5. Update documentation

## 📄 License

MIT License