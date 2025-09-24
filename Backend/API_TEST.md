# Boarding House Management API Test

## Test the authentication and tenant management endpoints

### 1. Test server status
```bash
curl http://localhost:5000/api/health
```

### 2. Register users for testing
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