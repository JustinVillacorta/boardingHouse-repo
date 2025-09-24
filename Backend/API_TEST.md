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