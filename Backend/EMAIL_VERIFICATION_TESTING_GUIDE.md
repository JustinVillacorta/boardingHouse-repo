# Email Verification Testing Guide

## Overview
This guide covers testing the complete email verification flow for admin-created tenant accounts in the Boarding House Management System. The new streamlined flow allows admins to create complete tenant profiles in one step, with automatic OTP generation and email sending.

## Prerequisites
- Backend server running at `http://localhost:8000`
- MongoDB connected
- Email service configured (Gmail with App Password)

## New Streamlined Flow Benefits

The updated tenant creation process offers several advantages:

1. **One-Step Creation**: Admin creates complete tenant profile in a single API call
2. **Automatic User Account**: System automatically creates user account linked to tenant profile
3. **OTP Email**: 6-digit verification code sent automatically with tenant details
4. **Immediate Activation**: Tenant can activate and login immediately after receiving OTP
5. **Complete Data**: All tenant information (room, rent, emergency contacts) set upfront
6. **Admin Control**: Full control over tenant data and room assignments

## Testing Methods

### Method 1: Postman Collection (Recommended)
1. Import the `Email_Verification_Test.postman_collection.json` file into Postman
2. Update the `tenantEmail` variable to your test email
3. Run the collection in sequence

### Method 2: Manual cURL Testing
Follow the step-by-step cURL commands below.

### Method 3: Database Token Retrieval
Use the helper script to get verification tokens from the database.

---

## Step-by-Step Testing

### Step 1: Health Check
```bash
curl -X GET http://localhost:8000/api/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-10-10T15:55:35.192Z",
  "environment": "development"
}
```

### Step 2: Admin Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "admin@boardinghouse.com",
    "password": "Admin123"
  }'
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "68d60064d57f95479202e6b6",
      "username": "admin",
      "email": "admin@boardinghouse.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```
**Save the token for subsequent requests!**

### Step 3: Create Complete Tenant Profile (Admin)
```bash
curl -X POST http://localhost:8000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "testtenant@example.com",
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
**Expected Response:**
```json
{
  "success": true,
  "message": "Tenant profile created successfully. Check console for verification token if email fails.",
  "data": {
    "user": {
      "id": "68e92ca53e47cdc68fc824ab",
      "username": "testtenant_1334",
      "email": "testtenant@example.com",
      "role": "tenant",
      "isActive": false,
      "isVerified": false
    },
    "tenant": {
      "id": "68e92ca53e47cdc68fc824ab",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "1234567890",
      "roomNumber": "101",
      "monthlyRent": 500,
      "securityDeposit": 1000,
      "tenantStatus": "active"
    }
  }
}
```

### Step 4: Get Verification Token
**Option A: Check Server Logs**
Look in your server terminal for:
- `Verification email sent successfully: <message-id>`
- `Verification email sent to testtenant@example.com`
- `FALLBACK: Verification token for testtenant@example.com: XXXXXX`

**Option B: Check Email Inbox**
Check the email inbox at `testtenant@example.com` for the verification email.

**Option C: Database Query**
```bash
cd Backend
node get-verification-token.js testtenant@example.com
```

### Step 5: Activate Tenant Account
```bash
curl -X POST http://localhost:8000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testtenant@example.com",
    "token": "123456",
    "password": "TenantPassword123",
    "confirmPassword": "TenantPassword123"
  }'
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Account activated successfully",
  "data": {
    "user": {
      "id": "68e92ca53e47cdc68fc824ab",
      "username": "testtenant_1334",
      "email": "testtenant@example.com",
      "role": "tenant",
      "isActive": true,
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 6: Tenant Login
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "testtenant@example.com",
    "password": "TenantPassword123"
  }'
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "68e92ca53e47cdc68fc824ab",
      "username": "testtenant_1334",
      "email": "testtenant@example.com",
      "role": "tenant",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Step 7: Verify Tenant Profile
```bash
curl -X GET http://localhost:8000/api/tenants/profile \
  -H "Authorization: Bearer TENANT_TOKEN"
```

---

## Testing Different Scenarios

### Test Staff Account Creation
```bash
curl -X POST http://localhost:8000/api/auth/create-account \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "staff@example.com",
    "role": "staff"
  }'
```

### Test Complete Tenant Creation with Different Data
```bash
curl -X POST http://localhost:8000/api/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "tenant2@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phoneNumber": "9876543210",
    "dateOfBirth": "1995-05-15",
    "idType": "drivers_license",
    "idNumber": "DL987654321",
    "emergencyContact": {
      "name": "Bob Smith",
      "relationship": "Brother",
      "phoneNumber": "1234567890"
    },
    "roomNumber": "102",
    "monthlyRent": 600,
    "securityDeposit": 1200
  }'
```

### Test Resend Verification
```bash
curl -X POST http://localhost:8000/api/auth/resend-verification/USER_ID \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Invalid Token
```bash
curl -X POST http://localhost:8000/api/auth/activate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "000000",
    "password": "Test123",
    "confirmPassword": "Test123"
  }'
```
**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid or expired verification token"
}
```

---

## Troubleshooting

### Email Not Sending
1. Check server logs for email service errors
2. Verify Gmail App Password is correct
3. Check `.env` file configuration
4. Look for fallback token in console logs

### Login Issues After Activation
1. Verify password meets requirements (6+ chars, uppercase, lowercase, number)
2. Check if account is actually activated (isActive: true, isVerified: true)
3. Try logging in with username instead of email

### Token Not Found
1. Check if token has expired (24-hour expiry)
2. Use the database query script to get current token
3. Resend verification email if needed

### Profile Creation Issues
1. Ensure all required tenant fields are provided (firstName, lastName, email, etc.)
2. Check if room number is available
3. Validate email format and uniqueness
4. Verify emergency contact information is complete
5. Check if monthlyRent and securityDeposit are valid numbers

---

## Expected Server Logs

When everything works correctly, you should see:
```
🚀 Server is running!
📍 Environment: development
🌐 Port: 8000
MongoDB Connected: localhost
Email service is ready to send messages

POST /api/auth/login 200 311.556 ms - 529
POST /api/tenants 201 14.651 ms - 343
Verification email sent successfully: <message-id>
Verification email sent to testtenant@example.com
POST /api/auth/activate 200 9.414 ms - 543
POST /api/auth/login 200 4.607 ms - 529
GET /api/tenants/profile 200 12.345 ms - 456
```

---

## Files Created
- `Email_Verification_Test.postman_collection.json` - Postman collection
- `get-verification-token.js` - Database token retrieval script
- `EMAIL_VERIFICATION_TESTING_GUIDE.md` - This guide
