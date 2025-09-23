# Authentication System Test

## Test the authentication endpoints

### 1. Test server status
```bash
curl http://localhost:5000/api/health
```

### 2. Register a new admin user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@boardinghouse.com",
    "password": "admin123",
    "role": "admin"
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
    "password": "Admin-123"
}
```

### 4. Test protected route (replace TOKEN with the token from login response)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Test getting all users (admin only)
```bash
curl -X GET http://localhost:5000/api/auth/users \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 6. Test logout
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