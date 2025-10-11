# Boarding House Management API Test

## Test the authentication and tenant management endpoints

> **📋 Postman Collection Available**: Import `Email_Verification_Test.postman_collection.json` for automated testing with pre-configured requests and variables.

### 1. Test server status
```bash
curl http://localhost:8000/api/health
```

### 2. Admin-Created Tenant Accounts with OTP Activation (NEW)

This is the new flow where admin creates complete tenant profiles and sends OTP for activation:

#### 2.1. Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin",
    "password": "Admin123"
  }'
```

#### 2.2. Admin Creates Tenant Profile (Complete Profile + OTP Email)
```bash
curl -X POST http://localhost:8000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "newtenant@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "1234567890",
    "dateOfBirth": "1990-01-01",
    "idType": "passport",
    "idNumber": "P123456789",
    "emergencyContact": {
      "name": "Jane Doe",
      "relationship": "Sister",
      "phoneNumber": "9876543210"
    },
    "roomNumber": "101",
    "monthlyRent": 500,
    "securityDeposit": 1000
  }'
```

**Response:**
- Creates user account (unverified)
- Creates tenant profile
- Generates 6-digit OTP
- Sends email with OTP and tenant details
- Returns user and tenant info

#### 2.3. Tenant Activates Account with OTP
```bash
curl -X POST http://localhost:8000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newtenant@example.com",
    "token": "123456",
    "password": "TenantPassword123",
    "confirmPassword": "TenantPassword123"
  }'
```

**Response:**
- Validates OTP
- Sets password (hashed)
- Activates account
- Returns JWT token for immediate login

#### 2.4. Tenant Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "newtenant@example.com",
    "password": "TenantPassword123"
  }'
```

#### 2.5. Resend Verification Email (Admin Only)
```bash
curl -X POST http://localhost:8000/api/auth/resend-verification/USER_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 3. Register users for testing (Legacy)
```bash
# Register admin user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@boardinghouse.com",
    "password": "Admin123",
    "role": "admin"
  }'

# Register staff user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "staff1",
    "email": "staff@boardinghouse.com",
    "password": "Staff123",
    "role": "staff"
  }'

# Register tenant user (NEW - combined user + tenant registration)
curl -X POST http://localhost:5000/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tenant1",
    "email": "tenant1@boardinghouse.com",
    "password": "Tenant123",
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
    "securityDeposit": 200
  }'
```

## Login with Different Formats

Now you can login using any of these formats:

### 1. Using username (your current format)
```json
{
    "username": "admin",
    "password": "Admin-123"
}
```

### 2. Using email
```json
{
    "email": "admin@example.com",
    "password": "Admin-123"
}
```

### 3. Using identifier (original format)
```json
{
    "identifier": "admin",
    "password": "Admin123"
}
```

### 4. Login as different users for testing
```bash
# Login as admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@boardinghouse.com",
    "password": "Admin123"
  }'

# Login as tenant
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "tenant1@boardinghouse.com",
    "password": "Tenant123"
  }'
```

## Tenant Management Tests

### 1. Register new tenant (creates both user account and tenant profile)
```bash
curl -X POST http://localhost:5000/api/tenants/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "tenant2",
    "email": "tenant2@boardinghouse.com",
    "password": "Tenant123",
    "firstName": "Alice",
    "lastName": "Smith",
    "phoneNumber": "+1234567892",
    "dateOfBirth": "1992-05-15",
    "idType": "drivers_license",
    "idNumber": "DL987654321",
    "emergencyContact": {
      "name": "Bob Smith",
      "relationship": "Brother",
      "phoneNumber": "+1234567893"
    },
    "roomNumber": "102",
    "monthlyRent": 550,
    "securityDeposit": 250
  }'
```

### 2. Create tenant profile for existing user (admin/staff only)
```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "EXISTING_USER_ID_HERE",
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
    "roomNumber": "103",
    "monthlyRent": 500,
    "securityDeposit": 200
  }'
```

### 3. Get all tenants (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/tenants \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With filters and pagination
curl -X GET "http://localhost:5000/api/tenants?status=active&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 4. Get specific tenant
```bash
curl -X GET http://localhost:5000/api/tenants/TENANT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 5. Get current tenant profile (as tenant)
```bash
curl -X GET http://localhost:5000/api/tenants/me \
  -H "Authorization: Bearer TENANT_TOKEN_HERE"
```

### 6. Update tenant profile
```bash
curl -X PUT http://localhost:5000/api/tenants/TENANT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyRent": 550,
    "roomNumber": "104"
  }'
```

### 7. Update current tenant profile (as tenant)
```bash
curl -X PUT http://localhost:5000/api/tenants/me \
  -H "Authorization: Bearer TENANT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567892",
    "emergencyContact": {
      "name": "Jane Doe Updated",
      "relationship": "Sister",
      "phoneNumber": "+1234567891"
    }
  }'
```

### 8. Update tenant status (admin/staff only)
```bash
curl -X PUT http://localhost:5000/api/tenants/TENANT_ID_HERE/status \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

### 9. Get tenant statistics (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/tenants/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 10. Get tenants with expiring leases (admin/staff only)
```bash
curl -X GET "http://localhost:5000/api/tenants/expiring-leases?days=30" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 11. Get tenants by status (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/tenants/by-status/active \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 12. Delete tenant (admin only)
```bash
curl -X DELETE http://localhost:5000/api/tenants/TENANT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Room Management Tests

### 1. Create room (admin/staff only)
```bash
curl -X POST http://localhost:5000/api/rooms \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "roomNumber": "101",
    "roomType": "single",
    "capacity": 1,
    "monthlyRent": 500,
    "description": "Cozy single room with window view",
    "amenities": ["WiFi", "Air Conditioning", "Private Bathroom"],
    "floor": 1,
    "area": 25
  }'
```

### 2. Get all rooms
```bash
curl -X GET http://localhost:5000/api/rooms \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With filters and pagination
curl -X GET "http://localhost:5000/api/rooms?status=available&roomType=single&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 3. Get specific room
```bash
curl -X GET http://localhost:5000/api/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 4. Update room (admin/staff only)
```bash
curl -X PUT http://localhost:5000/api/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyRent": 550,
    "description": "Updated room description",
    "amenities": ["WiFi", "Air Conditioning", "Private Bathroom", "Mini Fridge"]
  }'
```

### 5. Delete room (admin/staff only)
```bash
curl -X DELETE http://localhost:5000/api/rooms/ROOM_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 6. Get available rooms
```bash
curl -X GET http://localhost:5000/api/rooms/available \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# With filters
curl -X GET "http://localhost:5000/api/rooms/available?roomType=double&maxRent=600" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 7. Assign tenant to room (admin/staff only)
```bash
curl -X POST http://localhost:5000/api/rooms/ROOM_ID_HERE/assign \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "TENANT_ID_HERE",
    "rentAmount": 500
  }'
```

### 8. Unassign tenant from room (admin/staff only)
```bash
curl -X POST http://localhost:5000/api/rooms/ROOM_ID_HERE/unassign \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "TENANT_ID_HERE"
  }'
```

### 9. Get room statistics (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/rooms/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 10. Get room occupancy report (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/rooms/occupancy-report \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 11. Search rooms
```bash
curl -X GET "http://localhost:5000/api/rooms/search?q=single&minRent=400&maxRent=600" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 12. Get rooms by status (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/rooms/by-status/available \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 13. Get room rental history (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/rooms/ROOM_ID_HERE/history \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 14. Get rooms due for maintenance (admin/staff only)
```bash
curl -X GET "http://localhost:5000/api/rooms/maintenance/due?days=30" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 15. Update room maintenance (admin/staff only)
```bash
curl -X PUT http://localhost:5000/api/rooms/ROOM_ID_HERE/maintenance \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "lastServiceDate": "2025-09-20",
    "nextServiceDate": "2025-12-20",
    "notes": "AC unit serviced, all systems working properly",
    "status": "completed"
  }'
```

## Authentication Tests

### Test protected route (replace TOKEN with the token from login response)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test getting all users (admin only)
```bash
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test logout
```bash
curl -X POST http://localhost:5000/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Expected Responses

### Successful Registration:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "username": "admin",
      "email": "admin@boardinghouse.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Successful Login:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "...",
      "username": "admin",
      "email": "admin@boardinghouse.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Successful Tenant Registration:
```json
{
  "success": true,
  "message": "Tenant registered successfully",
  "data": {
    "user": {
      "id": "...",
      "username": "tenant1",
      "email": "tenant1@boardinghouse.com",
      "role": "tenant",
      "isActive": true,
      "createdAt": "2025-09-24T..."
    },
    "tenant": {
      "id": "...",
      "userId": {
        "_id": "...",
        "username": "tenant1",
        "email": "tenant1@boardinghouse.com",
        "role": "tenant"
      },
      "firstName": "John",
      "lastName": "Doe",
      "fullName": "John Doe",
      "phoneNumber": "+1234567890",
      "roomNumber": "101",
      "tenantStatus": "pending",
      "monthlyRent": 500,
      "createdAt": "2025-09-24T...",
      "updatedAt": "2025-09-24T..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Get All Tenants Response:
```json
{
  "success": true,
  "message": "Tenants retrieved successfully",
  "data": {
    "tenants": [
      {
        "id": "...",
        "firstName": "John",
        "lastName": "Doe",
        "fullName": "John Doe",
        "roomNumber": "101",
        "tenantStatus": "active",
        "monthlyRent": 500
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

## Expected Room Management Responses

### Successful Room Creation:
```json
{
  "success": true,
  "message": "Room created successfully",
  "data": {
    "room": {
      "id": "...",
      "roomNumber": "101",
      "roomType": "single",
      "capacity": 1,
      "monthlyRent": 500,
      "description": "Cozy single room with window view",
      "amenities": ["WiFi", "Air Conditioning", "Private Bathroom"],
      "floor": 1,
      "area": 25,
      "status": "available",
      "occupancy": {
        "current": 0,
        "max": 1
      },
      "isAvailable": true,
      "occupancyRate": 0,
      "createdAt": "2025-09-24T...",
      "updatedAt": "2025-09-24T..."
    }
  }
}
```

### Get All Rooms Response:
```json
{
  "success": true,
  "message": "Rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "...",
        "roomNumber": "101",
        "roomType": "single",
        "capacity": 1,
        "monthlyRent": 500,
        "status": "available",
        "isAvailable": true,
        "occupancyRate": 0,
        "currentTenant": null
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Room Statistics Response:
```json
{
  "success": true,
  "message": "Room statistics retrieved successfully",
  "data": {
    "statistics": {
      "overview": {
        "totalRooms": 10,
        "availableRooms": 7,
        "occupiedRooms": 2,
        "maintenanceRooms": 1,
        "reservedRooms": 0
      },
      "occupancy": {
        "totalCapacity": 15,
        "currentOccupancy": 3,
        "occupancyRate": 20,
        "availableSpots": 12
      },
      "financial": {
        "averageRent": 525,
        "totalRentValue": 5250,
        "potentialRevenue": 7875
      }
    }
  }
}
```

### Successful Tenant Assignment to Room:
```json
{
  "success": true,
  "message": "Tenant assigned to room successfully",
  "data": {
    "room": {
      "id": "...",
      "roomNumber": "101",
      "roomType": "single",
      "status": "occupied",
      "occupancy": {
        "current": 1,
        "max": 1
      },
      "currentTenant": {
        "id": "...",
        "name": "John Doe",
        "phoneNumber": "+1234567890",
        "email": "tenant1@boardinghouse.com"
      }
    }
  }
}
```

### Available Rooms Response:
```json
{
  "success": true,
  "message": "Available rooms retrieved successfully",
  "data": {
    "rooms": [
      {
        "id": "...",
        "roomNumber": "102",
        "roomType": "double",
        "capacity": 2,
        "monthlyRent": 700,
        "status": "available",
        "isAvailable": true,
        "occupancy": {
          "current": 0,
          "max": 2
        }
      }
    ],
    "count": 1
  }
}
```

## Payment Management Tests

### 1. Create payment record (admin/staff only)
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "TENANT_OBJECT_ID_HERE",
    "room": "ROOM_OBJECT_ID_HERE",
    "amount": 500,
    "paymentType": "rent",
    "paymentMethod": "bank_transfer",
    "dueDate": "2025-02-01",
    "status": "paid",
    "paymentDate": "2025-01-25",
    "periodCovered": {
      "startDate": "2025-01-01",
      "endDate": "2025-01-31"
    },
    "description": "Monthly rent for January 2025",
    "transactionId": "TXN123456"
  }'
```

### 2. Create due payment (pending payment record)
```bash
curl -X POST http://localhost:5000/api/payments \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "tenant": "TENANT_OBJECT_ID_HERE",
    "room": "ROOM_OBJECT_ID_HERE",
    "amount": 500,
    "paymentType": "rent",
    "paymentMethod": "bank_transfer",
    "dueDate": "2025-03-01",
    "status": "pending",
    "periodCovered": {
      "startDate": "2025-02-01",
      "endDate": "2025-02-28"
    },
    "description": "Monthly rent for February 2025"
  }'
```

### 3. Get all payments (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/payments \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With filters and pagination
curl -X GET "http://localhost:5000/api/payments?page=1&limit=10&status=paid&paymentType=rent&startDate=2025-01-01&endDate=2025-12-31" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:5000/api/payments?status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

curl -X GET "http://localhost:5000/api/payments?status=overdue" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 4. Get payments by tenant (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/payments/tenant/TENANT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With pagination and status filter
curl -X GET "http://localhost:5000/api/payments/tenant/TENANT_ID_HERE?page=1&limit=10&status=pending" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 5. Get specific payment
```bash
curl -X GET http://localhost:5000/api/payments/PAYMENT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Update payment status (admin/staff only)
```bash
curl -X PUT http://localhost:5000/api/payments/PAYMENT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid",
    "paymentDate": "2025-01-15",
    "transactionId": "TXN123456",
    "notes": "Payment received via bank transfer"
  }'
```

### 7. Mark payment as overdue (admin/staff only)
```bash
curl -X PUT http://localhost:5000/api/payments/PAYMENT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "overdue",
    "lateFee": {
      "amount": 50,
      "applied": true,
      "appliedDate": "2025-01-16"
    }
  }'
```

### 8. Delete payment (admin only)
```bash
curl -X DELETE http://localhost:5000/api/payments/PAYMENT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 9. Get overdue payments (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/payments/overdue \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With filters
curl -X GET "http://localhost:5000/api/payments/overdue?tenantId=TENANT_ID&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 10. Get pending payments (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/payments/pending \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With filters
curl -X GET "http://localhost:5000/api/payments/pending?tenantId=TENANT_ID&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 11. Download payment receipt (all authenticated users)
```bash
curl -X GET http://localhost:5000/api/payments/PAYMENT_ID_HERE/receipt \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --output receipt.pdf
```

### 12. Process refund (admin only)
```bash
curl -X POST http://localhost:5000/api/payments/PAYMENT_ID_HERE/refund \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "reason": "Overpayment refund"
  }'
```

### 13. Apply late fees to overdue payments (admin only)
```bash
curl -X POST http://localhost:5000/api/payments/apply-late-fees \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "lateFeeAmount": 50
  }'
```

### 14. Get payment statistics (admin/staff only)
```bash
curl -X GET http://localhost:5000/api/payments/statistics \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With filters
curl -X GET "http://localhost:5000/api/payments/statistics?startDate=2025-01-01&endDate=2025-12-31&paymentType=rent" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 15. Get payment history (admin/staff only)
```bash
curl -X GET "http://localhost:5000/api/payments/history?startDate=2025-01-01&endDate=2025-12-31&groupBy=month" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With additional filters
curl -X GET "http://localhost:5000/api/payments/history?startDate=2025-01-01&endDate=2025-12-31&tenantId=TENANT_ID&groupBy=week" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 16. Get my pending payments (tenant only)
```bash
curl -X GET http://localhost:5000/api/payments/pending/me \
  -H "Authorization: Bearer TENANT_TOKEN_HERE"
```

### 17. Get my overdue payments (tenant only)
```bash
curl -X GET http://localhost:5000/api/payments/overdue/me \
  -H "Authorization: Bearer TENANT_TOKEN_HERE"
```

### 18. Mark payment as completed (admin/staff only)
```bash
curl -X PUT http://localhost:5000/api/payments/PAYMENT_ID_HERE/complete \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "bank_transfer",
    "transactionId": "TXN789012",
    "notes": "Payment confirmed via bank transfer"
  }'
```

### 19. Search payments (admin/staff only)
```bash
curl -X GET "http://localhost:5000/api/payments/search?query=TXN123&status=paid&paymentType=rent" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With pagination
curl -X GET "http://localhost:5000/api/payments/search?query=refund&page=1&limit=10&sort=paymentDate&order=desc" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Expected Payment Management Responses

### Successful Payment Creation:
```json
{
  "success": true,
  "message": "Payment created successfully",
  "data": {
    "id": "...",
    "tenant": {
      "_id": "...",
      "firstName": "John",
      "lastName": "Doe",
      "email": "tenant1@boardinghouse.com",
      "phoneNumber": "+1234567890"
    },
    "room": {
      "_id": "...",
      "roomNumber": "101",
      "roomType": "single",
      "monthlyRent": 500
    },
    "amount": 500,
    "paymentType": "rent",
    "paymentMethod": "bank_transfer",
    "status": "paid",
    "paymentDate": "2025-01-15T...",
    "dueDate": "2025-02-01T...",
    "periodCovered": {
      "startDate": "2025-01-01T...",
      "endDate": "2025-01-31T..."
    },
    "receiptNumber": "RCP-20250115-ABC123",
    "transactionId": "TXN123456",
    "description": "Monthly rent for January 2025",
    "isOverdue": false,
    "netAmount": 500,
    "totalAmount": 500,
    "lateFee": {
      "amount": 0,
      "applied": false
    },
    "refund": {
      "amount": 0
    },
    "createdAt": "2025-01-15T...",
    "updatedAt": "2025-01-15T..."
  }
}
```

### Get All Payments Response:
```json
{
  "success": true,
  "message": "Payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "...",
        "tenant": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "tenant1@boardinghouse.com"
        },
        "room": {
          "roomNumber": "101",
          "roomType": "single"
        },
        "amount": 500,
        "paymentType": "rent",
        "paymentMethod": "bank_transfer",
        "status": "paid",
        "paymentDate": "2025-01-15T...",
        "dueDate": "2025-02-01T...",
        "receiptNumber": "RCP-20250115-ABC123",
        "isOverdue": false,
        "netAmount": 500,
        "totalAmount": 500,
        "lateFee": {
          "amount": 0,
          "applied": false
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

### Payment Statistics Response:
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "data": {
    "statistics": {
      "overall": {
        "totalPayments": 25,
        "totalAmount": 12500,
        "totalLateFees": 150,
        "totalRefunded": 200,
        "paidPayments": 22,
        "pendingPayments": 2,
        "overduePayments": 1,
        "averageAmount": 500,
        "paymentRate": "88.00",
        "overdueRate": "4.00",
        "netRevenue": 12300
      },
      "currentMonth": {
        "totalPayments": 8,
        "totalAmount": 4000,
        "paidPayments": 7,
        "pendingPayments": 1
      },
      "byStatus": {
        "paid": 22,
        "pending": 2,
        "overdue": 1
      },
      "generatedAt": "2025-01-15T..."
    }
  }
}
```

### Overdue Payments Response:
```json
{
  "success": true,
  "message": "Overdue payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "...",
        "tenant": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "tenant1@boardinghouse.com"
        },
        "room": {
          "roomNumber": "102",
          "roomType": "double"
        },
        "amount": 600,
        "paymentType": "rent",
        "status": "overdue",
        "dueDate": "2024-12-01T...",
        "isOverdue": true,
        "daysOverdue": 45,
        "totalAmount": 650,
        "netAmount": 650,
        "lateFee": {
          "amount": 50,
          "applied": true,
          "appliedDate": "2024-12-16T..."
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalCount": 1
    },
    "totalOverdueAmount": 650
  }
}
```

### Payment History Response:
```json
{
  "success": true,
  "message": "Payment history retrieved successfully",
  "data": {
    "history": [
      {
        "_id": {
          "year": 2025,
          "month": 1
        },
        "totalPayments": 8,
        "totalAmount": 4000,
        "paidPayments": 7,
        "averageAmount": 500
      },
      {
        "_id": {
          "year": 2024,
          "month": 12
        },
        "totalPayments": 10,
        "totalAmount": 5000,
        "paidPayments": 9,
        "averageAmount": 500
      }
    ],
    "summary": {
      "totalAmount": 9000,
      "totalPayments": 18,
      "averagePerPeriod": 4500,
      "period": {
        "start": "2024-12-01",
        "end": "2025-01-31"
      }
    }
  }
}
```

### My Pending Payments Response (Tenant):
```json
{
  "success": true,
  "message": "Pending payments retrieved successfully",
  "data": {
    "payments": [
      {
        "id": "...",
        "room": {
          "roomNumber": "101",
          "roomType": "single",
          "monthlyRent": 500
        },
        "amount": 500,
        "paymentType": "rent",
        "status": "pending",
        "dueDate": "2025-02-01T...",
        "isOverdue": false,
        "totalAmount": 500,
        "netAmount": 500,
        "description": "Monthly rent for February 2025",
        "lateFee": {
          "amount": 0,
          "applied": false
        }
      }
    ],
    "totalPendingAmount": 500,
    "count": 1
  }
}
```

### Successful Refund Processing:
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "payment": {
      "id": "...",
      "amount": 500,
      "status": "paid",
      "refund": {
        "amount": 100,
        "reason": "Overpayment refund",
        "processedBy": {
          "firstName": "Admin",
          "lastName": "User"
        },
        "processedDate": "2025-01-15T..."
      },
      "netAmount": 400,
      "totalAmount": 500,
      "updatedAt": "2025-01-15T..."
    }
  }
}
```

## Report Management Tests

### 1. Create a report (tenant only - auto-detects tenant and room)
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TENANT_TOKEN_HERE" \
  -d '{
    "type": "complaint",
    "title": "Broken AC",
    "description": "The air conditioner in my room is not working properly."
  }'
```

### 2. Create a report with explicit tenant/room IDs (admin/staff only)
```bash
curl -X POST http://localhost:8000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -d '{
    "tenant": "TENANT_OBJECT_ID_HERE",
    "room": "ROOM_OBJECT_ID_HERE",
    "type": "maintenance",
    "title": "Leaking faucet",
    "description": "The bathroom faucet is leaking and needs repair."
  }'
```

### 3. Get all reports (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/reports \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# With filters and pagination
curl -X GET "http://localhost:8000/api/reports?status=pending&type=complaint&page=1&limit=10" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Filter by status
curl -X GET "http://localhost:8000/api/reports?status=in-progress" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"

# Filter by type
curl -X GET "http://localhost:8000/api/reports?type=maintenance" \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 4. Get my reports (tenant only)
```bash
curl -X GET http://localhost:8000/api/reports/my \
  -H "Authorization: Bearer TENANT_TOKEN_HERE"

# With status filter
curl -X GET "http://localhost:8000/api/reports/my?status=pending" \
  -H "Authorization: Bearer TENANT_TOKEN_HERE"
```

### 5. Get specific report
```bash
curl -X GET http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Update report status (admin/staff only)
```bash
curl -X PUT http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in-progress"
  }'
```

### 7. Update report with resolution (admin/staff only)
```bash
curl -X PUT http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "description": "Updated description: Issue has been resolved. AC unit was repaired and is now working properly."
  }'
```

### 8. Delete report (admin only)
```bash
curl -X DELETE http://localhost:8000/api/reports/REPORT_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Expected Report Management Responses

### Successful Report Creation (Tenant):
```json
{
  "success": true,
  "message": "Report created successfully",
  "timestamp": "2025-09-26T03:46:33.506Z",
  "data": {
    "_id": "68d60c998cf2064c72357f2f",
    "tenant": {
      "_id": "68d608733ab2e17811218a32",
      "userId": {
        "_id": "68d608733ab2e17811218a30",
        "username": "testtenant",
        "email": "testtenant@boardinghouse.com",
        "role": "tenant",
        "isActive": true
      },
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "+1234567890"
    },
    "room": {
      "_id": "68d608663ab2e17811218a2b",
      "roomNumber": "101",
      "roomType": "single",
      "isAvailable": false,
      "occupancyRate": 0,
      "primaryPhoto": null,
      "id": "68d608663ab2e17811218a2b"
    },
    "type": "complaint",
    "title": "Broken AC",
    "description": "The air conditioner in my room is not working properly.",
    "status": "pending",
    "submittedAt": "2025-09-26T03:46:33.502Z",
    "createdAt": "2025-09-26T03:46:33.502Z",
    "updatedAt": "2025-09-26T03:46:33.502Z",
    "__v": 0,
    "daysSinceSubmission": 1,
    "id": "68d60c998cf2064c72357f2f"
  }
}
```

### Get All Reports Response (Admin/Staff):
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": [
    {
      "_id": "68d60c998cf2064c72357f2f",
      "tenant": {
        "_id": "68d608733ab2e17811218a32",
        "firstName": "John",
        "lastName": "Doe",
        "phoneNumber": "+1234567890"
      },
      "room": {
        "_id": "68d608663ab2e17811218a2b",
        "roomNumber": "101",
        "roomType": "single"
      },
      "type": "complaint",
      "title": "Broken AC",
      "description": "The air conditioner in my room is not working properly.",
      "status": "pending",
      "submittedAt": "2025-09-26T03:46:33.502Z",
      "daysSinceSubmission": 1
    }
  ]
}
```

### Get My Reports Response (Tenant):
```json
{
  "success": true,
  "message": "Your reports retrieved successfully",
  "data": [
    {
      "_id": "68d60c998cf2064c72357f2f",
      "type": "complaint",
      "title": "Broken AC",
      "description": "The air conditioner in my room is not working properly.",
      "status": "pending",
      "submittedAt": "2025-09-26T03:46:33.502Z",
      "daysSinceSubmission": 1
    }
  ]
}
```

### Successful Report Update:
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "_id": "68d60c998cf2064c72357f2f",
    "tenant": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "room": {
      "roomNumber": "101",
      "roomType": "single"
    },
    "type": "complaint",
    "title": "Broken AC",
    "description": "Updated description: Issue has been resolved. AC unit was repaired and is now working properly.",
    "status": "resolved",
    "submittedAt": "2025-09-26T03:46:33.502Z",
    "updatedAt": "2025-09-26T04:15:22.123Z",
    "daysSinceSubmission": 1
  }
}
```

### Successful Report Deletion:
```json
{
  "success": true,
  "message": "Report deleted successfully"
}
```

### Report Validation Errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "type": "field",
        "msg": "Type is required",
        "path": "type",
        "location": "body"
      },
      {
        "type": "field",
        "msg": "Title is required",
        "path": "title",
        "location": "body"
      },
      {
        "type": "field",
        "msg": "Description is required",
        "path": "description",
        "location": "body"
      }
    ]
  }
}
```

### Report Type Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "type": "field",
        "value": "invalid_type",
        "msg": "Type must be one of: complaint, maintenance, suggestion, emergency",
        "path": "type",
        "location": "body"
      }
    ]
  }
}
```

### Report Status Validation Error:
```json
{
  "success": false,
  "message": "Validation failed",
  "data": {
    "errors": [
      {
        "type": "field",
        "value": "invalid_status",
        "msg": "Status must be one of: pending, in-progress, resolved, rejected",
        "path": "status",
        "location": "body"
      }
    ]
  }
}
```

### Unauthorized Access Error:
```json
{
  "success": false,
  "message": "Access token is required",
  "timestamp": "2025-09-26T03:47:20.986Z"
}
```

### Insufficient Permissions Error:
```json
{
  "success": false,
  "message": "Insufficient permissions",
  "timestamp": "2025-09-26T03:50:15.886Z"
}
```

### Report Not Found Error:
```json
{
  "success": false,
  "message": "Report not found",
  "timestamp": "2025-09-26T04:00:00.000Z"
}
```

## Report Testing Notes

### Authentication Requirements:
- **Tenant Role**: Can create reports (auto-detects their tenant/room), view their own reports only
- **Staff Role**: Can view all reports, update report status, cannot delete reports
- **Admin Role**: Full access - view all reports, update status, delete reports, create reports for any tenant/room

### Report Types:
- `complaint` - General complaints about room or facility issues
- `maintenance` - Maintenance requests for repairs or improvements  
- `suggestion` - Suggestions for improvements
- `emergency` - Emergency issues requiring immediate attention

### Report Statuses:
- `pending` - New report, awaiting review (default status)
- `in-progress` - Report is being worked on
- `resolved` - Issue has been resolved
- `rejected` - Report was rejected or deemed invalid

### Auto-Detection Logic:
- When tenants create reports, the system automatically:
  1. Finds their tenant profile based on the JWT token
  2. Finds their assigned room from the tenant profile
  3. Creates the report with these associations
- Admin/staff can manually specify tenant and room IDs when creating reports

### Virtual Fields:
- `daysSinceSubmission` - Calculated field showing days since report was submitted
- Populated tenant and room details in responses for better context

## Notification Management Tests

### 1. Create notification (admin/staff only)
```bash
curl -X POST http://localhost:8000/api/notifications \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_due",
    "title": "Rent Payment Due",
    "message": "Your monthly rent payment of $500 is due on March 1st, 2025.",
    "user_id": "TENANT_USER_ID_HERE",
    "priority": "high",
    "expiresAt": "2025-03-10T00:00:00.000Z",
    "metadata": {
      "paymentAmount": 500,
      "dueDate": "2025-03-01",
      "roomNumber": "101"
    }
  }'
```

### 2. Create system alert notification for specific user
```bash
curl -X POST http://localhost:8000/api/notifications \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system_alert",
    "title": "Maintenance Schedule",
    "message": "Building maintenance will be conducted on Sunday from 9 AM to 5 PM. Water supply may be interrupted.",
    "user_id": "TENANT_USER_ID_HERE",
    "priority": "medium",
    "expiresAt": "2025-03-15T17:00:00.000Z"
  }'
```

### 3. Get user's notifications (all authenticated users)
```bash
curl -X GET http://localhost:8000/api/notifications \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

### 3a. Get all notifications (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/notifications/all \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 3b. Get notification statistics
```bash
curl -X GET http://localhost:8000/api/notifications/stats \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```



### 4. Get specific notification
```bash
curl -X GET http://localhost:8000/api/notifications/NOTIFICATION_ID_HERE \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

### 5. Mark notification as read
```bash
curl -X PUT http://localhost:8000/api/notifications/NOTIFICATION_ID_HERE/read \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```

### 6. Mark all notifications as read
```bash
curl -X PUT http://localhost:8000/api/notifications/mark-all-read \
  -H "Authorization: Bearer USER_TOKEN_HERE"
```



### 7. Delete notification
```bash
curl -X DELETE http://localhost:8000/api/notifications/NOTIFICATION_ID_HERE \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 8. Broadcast notification to all users (admin only)
```bash
curl -X POST http://localhost:8000/api/notifications/broadcast \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "announcement",
    "title": "Building Announcement",
    "message": "The building will have scheduled maintenance this weekend. Please plan accordingly.",
    "priority": "medium",
    "expiresAt": "2025-03-20T00:00:00.000Z"
  }'
```

### 9. Broadcast notification to specific roles (admin only)
```bash
curl -X POST http://localhost:8000/api/notifications/broadcast \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system_alert",
    "title": "Staff Meeting Reminder",
    "message": "Monthly staff meeting scheduled for tomorrow at 2 PM in the conference room.",
    "roles": ["staff"],
    "priority": "medium",
    "expiresAt": "2025-03-05T14:00:00.000Z"
  }'
```





## Expected Notification Management Responses

### Successful Notification Creation:
```json
{
  "success": true,
  "message": "Notification created successfully",
  "timestamp": "2025-09-27T06:26:31.339Z",
  "data": {
    "id": "68d783970b08c2b49595afe7",
    "userId": "68d608733ab2e17811218a30",
    "title": "October Rent Reminder",
    "message": "Your monthly rent of $500 is due on October 1st, 2025.",
    "type": "payment_due",
    "status": "unread",
    "priority": "high",
    "metadata": {},
    "expiresAt": null,
    "isExpired": null,
    "createdBy": null,
    "createdAt": "2025-09-27T06:26:31.338Z",
    "updatedAt": "2025-09-27T06:26:31.338Z"
  }
}
```

### Get User Notifications Response:
```json
{
  "success": true,
  "message": "Notifications retrieved successfully",
  "timestamp": "2025-09-27T06:27:19.556Z",
  "data": {
    "notifications": [
      {
        "id": "68d783ab0b08c2b49595afeb",
        "userId": "68d61bc22817372ddff4bcee",
        "user": {
          "id": "68d61bc22817372ddff4bcee",
          "username": "gago",
          "email": "gago@email.com",
          "role": "tenant"
        },
        "title": "Scheduled Maintenance",
        "message": "Building maintenance will be performed on Sunday from 9 AM to 5 PM.",
        "type": "system_alert",
        "status": "unread",
        "priority": "medium",
        "metadata": {},
        "expiresAt": "2025-10-15T17:00:00.000Z",
        "isExpired": false,
        "createdBy": "admin",
        "createdAt": "2025-09-27T06:26:51.909Z",
        "updatedAt": "2025-09-27T06:26:51.909Z"
      }
    ],
    "total": 2
  }
}
```

### Successful Broadcast Response:
```json
{
  "success": true,
  "message": "Notification broadcast successfully",
  "timestamp": "2025-09-27T03:45:30.789Z",
  "data": {
    "notification": {
      "_id": "650f1a2b3c4d5e6f78901235",
      "type": "announcement",
      "title": "Building Announcement",
      "message": "The building will have scheduled maintenance this weekend. Please plan accordingly.",
      "priority": "medium",
      "expiresAt": "2025-03-20T00:00:00.000Z"
    },
    "broadcastStats": {
      "totalRecipients": 25,
      "successfulDeliveries": 25,
      "failedDeliveries": 0,
      "targetRoles": ["tenant", "staff"],
      "broadcastAt": "2025-09-27T03:45:30.789Z"
    }
  }
}
```

### Notification Statistics Response:
```json
{
  "success": true,
  "message": "Notification statistics retrieved successfully",
  "timestamp": "2025-09-27T06:29:32.674Z",
  "data": {
    "total": 1,
    "unread": 1,
    "read": 0,
    "byType": [
      {
        "type": "system_alert",
        "status": "unread",
        "priority": "high"
      }
    ]
  }
}
```



## Dashboard Analytics Tests

### 1. Get dashboard overview statistics (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/dashboard/stats \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 2. Get room occupancy data (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/dashboard/occupancy \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 3. Get payment statistics (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/dashboard/payments \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 4. Get report statistics (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/dashboard/reports \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 5. Get tenant statistics (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/dashboard/tenants \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

### 6. Get room statistics (admin/staff only)
```bash
curl -X GET http://localhost:8000/api/dashboard/rooms \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Expected Dashboard Analytics Responses

### Dashboard Overview Statistics:
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "timestamp": "2025-09-27T03:40:40.838Z",
  "data": {
    "tenants": {
      "total": 5,
      "active": 5,
      "inactive": 0,
      "expiringLeases": 0
    },
    "rooms": {
      "total": 4,
      "occupied": 1,
      "available": 3,
      "maintenance": 0,
      "occupancyRate": 25
    },
    "payments": {
      "total": 0,
      "paid": 0,
      "pending": 0,
      "overdue": 0,
      "totalAmount": 0,
      "thisMonthAmount": 0
    },
    "reports": {
      "total": 12,
      "pending": 11,
      "inProgress": 0,
      "resolved": 1,
      "rejected": 0
    },
    "notifications": {
      "total": 5,
      "unread": 4,
      "read": 1,
      "byType": [
        {
          "type": "system_alert",
          "status": "read",
          "priority": "medium"
        },
        {
          "type": "system_alert",
          "status": "unread",
          "priority": "high"
        }
      ]
    },
    "lastUpdated": "2025-09-27T03:40:40.838Z"
  }
}
```

### Room Occupancy Data:
```json
{
  "success": true,
  "message": "Room occupancy data retrieved successfully",
  "timestamp": "2025-09-27T03:40:50.028Z",
  "data": {
    "totalRooms": 4,
    "occupiedRooms": 1,
    "availableRooms": 3,
    "maintenanceRooms": 0,
    "occupancyRate": 25,
    "roomTypes": {
      "single": {
        "total": 4,
        "occupied": 1,
        "available": 3,
        "maintenance": 0
      }
    },
    "roomDetails": [
      {
        "roomId": "68d608663ab2e17811218a2b",
        "roomNumber": "101",
        "roomType": "single",
        "capacity": 1,
        "status": "available",
        "monthlyRent": 500,
        "tenant": {
          "id": "68d608733ab2e17811218a32",
          "name": "John Doe",
          "phoneNumber": "+1234567890"
        },
        "createdAt": "2025-09-26T03:28:38.537Z",
        "updatedAt": "2025-09-26T03:28:38.537Z"
      }
    ]
  }
}
```

### Payment Statistics:
```json
{
  "success": true,
  "message": "Payment statistics retrieved successfully",
  "timestamp": "2025-09-27T03:40:24.760Z",
  "data": {
    "total": {
      "count": 0,
      "amount": 0
    },
    "thisMonth": {
      "count": 0,
      "amount": 0
    },
    "lastMonth": {
      "count": 0,
      "amount": 0
    },
    "thisYear": {
      "count": 0,
      "amount": 0
    },
    "byStatus": {
      "paid": {
        "count": 0,
        "amount": 0
      },
      "pending": {
        "count": 0,
        "amount": 0
      },
      "overdue": {
        "count": 0,
        "amount": 0
      }
    },
    "byMethod": {},
    "monthlyTrends": [
      {
        "month": "Oct 2024",
        "count": 0,
        "amount": 0,
        "paid": 0,
        "pending": 0,
        "overdue": 0
      },
      {
        "month": "Nov 2024",
        "count": 0,
        "amount": 0,
        "paid": 0,
        "pending": 0,
        "overdue": 0
      }
    ],
    "overduePayments": []
  }
}
```

### Report Statistics:
```json
{
  "success": true,
  "message": "Report statistics retrieved successfully",
  "timestamp": "2025-09-27T03:40:59.677Z",
  "data": {
    "total": 12,
    "thisMonth": 12,
    "byStatus": {
      "pending": 11,
      "in-progress": 0,
      "resolved": 1,
      "rejected": 0
    },
    "byType": {
      "maintenance": 10,
      "complaint": 2,
      "other": 0
    },
    "averageResolutionTime": 0,
    "priorityBreakdown": [],
    "recentReports": [
      {
        "id": "68d60c6c8cf2064c72357f22",
        "title": "Fixed virtual error test",
        "type": "maintenance",
        "status": "pending",
        "submittedAt": "2025-09-26T03:45:48.350Z",
        "tenantId": "68d608733ab2e17811218a32"
      }
    ],
    "monthlyTrends": [
      {
        "month": "Apr 2025",
        "total": 0,
        "pending": 0,
        "inProgress": 0,
        "resolved": 0,
        "rejected": 0
      },
      {
        "month": "Sep 2025",
        "total": 12,
        "pending": 11,
        "inProgress": 0,
        "resolved": 1,
        "rejected": 0
      }
    ]
  }
}
```

## Notification Testing Notes

### Authentication Requirements:
- **Tenant Role**: Can view their own notifications, mark as read
- **Staff Role**: Can create notifications, view all notifications, cannot delete
- **Admin Role**: Full access - create, view, delete, broadcast notifications

### Notification Types:
- `payment_due` - Payment due reminders
- `system_alert` - System-wide alerts and maintenance notices
- `announcement` - General announcements
- `report_update` - Updates on submitted reports
- `maintenance_alert` - Maintenance-related notifications

### Notification Priorities:
- `urgent` - Critical notifications requiring immediate attention
- `high` - Important notifications
- `medium` - Normal priority notifications
- `low` - Informational notifications

### Notification Statuses:
- `unread` - New notification (default)
- `read` - User has viewed the notification

### API Endpoints Summary:
- `POST /api/notifications` - Create notification (requires `user_id`, not `recipients`)
- `GET /api/notifications` - Get user's own notifications
- `GET /api/notifications/all` - Get all notifications (admin/staff only)
- `GET /api/notifications/stats` - Get notification statistics
- `GET /api/notifications/:id` - Get specific notification
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/mark-all-read` - Mark all user notifications as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/broadcast` - Broadcast to multiple users (use `roles` array)

### Broadcast Notification Rules:
- Use `roles: ["tenant"]` to target all tenant users
- Use `roles: ["staff"]` to target all staff users
- Use `roles: ["admin"]` to target all admin users
- Use `userIds: ["id1", "id2"]` to target specific users
- Admin role required for broadcast functionality

### Field Requirements:
- Individual notifications: `user_id` (single user ID)
- Broadcast notifications: `roles` (array of role names) or `userIds` (array of user IDs)
- All notifications: `type`, `title`, `message`, `priority`
- Optional: `expiresAt`, `metadata` object for additional data

### Dashboard Testing Notes

### Authentication Requirements:
- **Admin/Staff Role**: Full access to all dashboard analytics
- **Tenant Role**: No access to dashboard endpoints

### Available Analytics:
- **Overview Stats**: General statistics across all entities
- **Room Occupancy**: Detailed room occupancy data with tenant information
- **Payment Stats**: Payment analytics with trends and status breakdown
- **Report Stats**: Report analytics with status and type breakdown
- **Tenant Stats**: Tenant-specific analytics
- **Room Stats**: Room-specific analytics

### Data Visualization Ready:
All dashboard endpoints return data in formats suitable for:
- Charts and graphs (monthly trends, status breakdowns)
- KPI displays (totals, percentages, rates)
- Detailed tables (room details, recent reports)
- Progress indicators (occupancy rates, payment rates)