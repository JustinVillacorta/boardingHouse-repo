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

- **Tenant Management**
  - Complete tenant profile management
  - Personal information tracking
  - Emergency contact management
  - Lease and rental information
  - Room assignment and availability
  - Status tracking (active, inactive, pending, terminated)
  - Advanced search and filtering
  - Statistics and reporting

- **Room Management**
  - Complete room inventory management
  - Room type classification (single, double, shared, suite)
  - Capacity and amenity tracking
  - Rental pricing management
  - Occupancy tracking and reporting
  - Room assignment and availability
  - Maintenance scheduling and history
  - Advanced search and filtering capabilities
  - Room statistics and occupancy reports

- **Payment Management**
  - Payment record tracking (paid, pending, overdue)
  - Due payment monitoring and alerts
  - Multiple payment types (rent, deposit, utilities, maintenance, other)
  - Payment method tracking (cash, bank_transfer, check, card, other)
  - Receipt generation and management
  - Late fee calculation and application
  - Payment history and reporting
  - Overdue payment tracking
  - Refund processing capabilities
  - Comprehensive payment statistics

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

### Tenant Management Endpoints
- `POST /api/tenants` - Create tenant profile
- `GET /api/tenants` - Get all tenants (admin/staff only)
- `GET /api/tenants/:id` - Get specific tenant
- `PUT /api/tenants/:id` - Update tenant profile
- `DELETE /api/tenants/:id` - Delete tenant (admin only)
- `GET /api/tenants/me` - Get current tenant's profile
- `PUT /api/tenants/me` - Update current tenant's profile
- `GET /api/tenants/statistics` - Get tenant statistics (admin/staff only)
- `GET /api/tenants/expiring-leases` - Get tenants with expiring leases (admin/staff only)
- `GET /api/tenants/by-status/:status` - Get tenants by status (admin/staff only)
- `PUT /api/tenants/:id/status` - Update tenant status (admin/staff only)

### Room Management Endpoints
- `POST /api/rooms` - Create new room (admin/staff only)
- `GET /api/rooms` - Get all rooms (with filters and pagination)
- `GET /api/rooms/:id` - Get specific room
- `PUT /api/rooms/:id` - Update room (admin/staff only)
- `DELETE /api/rooms/:id` - Delete room (admin/staff only)
- `GET /api/rooms/available` - Get available rooms (with filters)
- `POST /api/rooms/:id/assign` - Assign tenant to room (admin/staff only)
- `POST /api/rooms/:id/unassign` - Unassign tenant from room (admin/staff only)
- `GET /api/rooms/statistics` - Get room statistics (admin/staff only)
- `GET /api/rooms/occupancy-report` - Get occupancy report (admin/staff only)
- `GET /api/rooms/search` - Search rooms (with filters)
- `GET /api/rooms/by-status/:status` - Get rooms by status (admin/staff only)
- `GET /api/rooms/:id/history` - Get room rental history (admin/staff only)
- `GET /api/rooms/maintenance/due` - Get rooms due for maintenance (admin/staff only)
- `PUT /api/rooms/:id/maintenance` - Update room maintenance (admin/staff only)

### Payment Management Endpoints
- `POST /api/payments` - Create payment record (admin/staff only)
- `GET /api/payments` - Get all payments (admin/staff only, with filters)
- `GET /api/payments/tenant/:tenantId` - Get payments by tenant (admin/staff only)
- `GET /api/payments/:id` - Get specific payment
- `PUT /api/payments/:id` - Update payment (admin/staff only)
- `DELETE /api/payments/:id` - Delete payment (admin only)
- `GET /api/payments/overdue` - Get overdue payments (admin/staff only)
- `GET /api/payments/:id/receipt` - Download payment receipt (PDF)
- `POST /api/payments/:id/refund` - Process refund (admin only)
- `POST /api/payments/apply-late-fees` - Apply late fees to overdue payments (admin only)
- `GET /api/payments/statistics` - Get payment statistics (admin/staff only)
- `GET /api/payments/history` - Get payment history (admin/staff only)
- `GET /api/payments/pending/me` - Get my pending payments (tenant only)
- `PUT /api/payments/:id/complete` - Mark payment as completed (admin/staff only)
- `GET /api/payments/search` - Search payments (admin/staff only)

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

#### Create Tenant Profile
```bash
POST /api/tenants
Authorization: Bearer your-jwt-token-here
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "idType": "passport",
  "idNumber": "P123456789",
  "emergencyContact": {
    "name": "Jane Doe",
    "relationship": "Sister",
    "phoneNumber": "+1234567891"
  },
  "roomNumber": "101",
  "monthlyRent": 500,
  "occupation": "Software Engineer"
}
```

#### Get All Tenants (Admin/Staff Only)
```bash
GET /api/tenants?status=active&page=1&limit=10
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

### Tenant Model
```javascript
{
  userId: ObjectId (ref: User, required, unique)
  firstName: String (required)
  lastName: String (required)
  phoneNumber: String (required)
  dateOfBirth: Date (required)
  idType: String (required, enum: passport/drivers_license/national_id/other)
  idNumber: String (required)
  emergencyContact: {
    name: String (required)
    relationship: String (required)
    phoneNumber: String (required)
  }
  roomNumber: String (optional)
  leaseStartDate: Date (optional)
  leaseEndDate: Date (optional)
  monthlyRent: Number (optional)
  securityDeposit: Number (optional)
  tenantStatus: String (enum: active/inactive/pending/terminated)
  createdAt: Date
  updatedAt: Date
}
```

### Room Model
```javascript
{
  roomNumber: String (required, unique)
  roomType: String (required, enum: single/double/shared/suite)
  capacity: Number (required, min: 1)
  monthlyRent: Number (required, min: 0)
  description: String (optional)
  amenities: [String] (optional)
  floor: Number (optional)
  area: Number (optional, in square meters)
  status: String (enum: available/occupied/maintenance/reserved, default: available)
  isAvailable: Boolean (virtual)
  currentTenants: [ObjectId] (ref: Tenant)
  maxOccupancy: Number (alias for capacity)
  occupancy: {
    current: Number (virtual)
    max: Number (virtual)
  }
  occupancyRate: Number (virtual, percentage)
  maintenanceInfo: {
    lastServiceDate: Date
    nextServiceDate: Date
    notes: String
    status: String (enum: scheduled/in_progress/completed/overdue)
  }
  rentalHistory: [{
    tenant: ObjectId (ref: Tenant)
    startDate: Date
    endDate: Date
    rentAmount: Number
  }]
  createdAt: Date
  updatedAt: Date
}
```

### Payment Model
```javascript
{
  tenant: ObjectId (ref: Tenant, required)
  room: ObjectId (ref: Room, optional)
  amount: Number (required, min: 0)
  paymentType: String (enum: rent/deposit/utilities/maintenance/other, required)
  paymentMethod: String (enum: cash/bank_transfer/check/card/other, required)
  status: String (enum: paid/pending/overdue, required, default: pending)
  paymentDate: Date (optional, when payment was made)
  dueDate: Date (required, when payment is due)
  periodCovered: {
    startDate: Date (optional)
    endDate: Date (optional)
  }
  receiptNumber: String (unique, auto-generated)
  transactionId: String (optional)
  description: String (optional)
  lateFee: {
    amount: Number (default: 0)
    applied: Boolean (default: false)
    appliedDate: Date
  }
  refund: {
    amount: Number (default: 0)
    reason: String
    processedBy: ObjectId (ref: User)
    processedDate: Date
  }
  notes: String (optional)
  createdBy: ObjectId (ref: User)
  updatedBy: ObjectId (ref: User)
  isOverdue: Boolean (virtual)
  netAmount: Number (virtual)
  totalAmount: Number (virtual)
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
│   │   ├── authController.js
│   │   ├── tenantController.js
│   │   ├── roomController.js
│   │   └── paymentController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Tenant.js
│   │   ├── Room.js
│   │   └── Payment.js
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── tenantRepository.js
│   │   ├── roomRepository.js
│   │   └── paymentRepository.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── tenants.js
│   │   ├── rooms.js
│   │   ├── payments.js
│   │   └── index.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── tenantService.js
│   │   ├── roomService.js
│   │   └── paymentService.js
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

Current implementation includes:
- ✅ Complete Authentication & Authorization system
- ✅ Complete Tenant Management system
- ✅ Complete Room Management system
- ✅ Complete Payment Management system with status tracking
- ✅ PDF Receipt generation
- ✅ Late fee management
- ✅ Refund processing
- ✅ Comprehensive statistics and reporting

Future enhancements to consider:
- Maintenance request system
- Notification system (email/SMS)
- File upload for documents
- Advanced reporting and analytics
- Email notifications for overdue payments
- Automated billing system
- Lease agreement management
- Inventory management

## 🤝 Contributing

1. Follow the existing code structure
2. Maintain clean architecture principles
3. Add proper error handling
4. Include input validation
5. Update documentation

## 📄 License

MIT License