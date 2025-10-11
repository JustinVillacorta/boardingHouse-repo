# Email Verification Feature

This document describes the email verification system for admin-created accounts in the Boarding House Management System.

## Overview

The system allows administrators to create staff and tenant accounts that require email verification before activation. Users receive an email with a 6-digit verification token and must enter this token along with their chosen password to activate their account.

## Features

- **Admin Account Creation**: Admins can create staff/tenant accounts without passwords
- **Email Verification**: 6-digit numeric tokens sent via email
- **Token Expiration**: Tokens expire after 24 hours
- **Account Activation**: Users set their password during activation
- **Resend Verification**: Admins can resend verification emails
- **Secure Login**: Only verified accounts can log in

## API Endpoints

### 1. Create User Account (Admin Only)
```
POST /api/auth/create-account
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "staff", // or "tenant"
  "username": "optional_username" // auto-generated if not provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created successfully. Verification email sent.",
  "data": {
    "id": "user_id",
    "username": "generated_username",
    "email": "user@example.com",
    "role": "staff",
    "isActive": false,
    "isVerified": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Activate Account (Public)
```
POST /api/auth/activate
Content-Type: application/json

{
  "token": "123456",
  "password": "SecurePassword123",
  "confirmPassword": "SecurePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account activated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "generated_username",
      "email": "user@example.com",
      "role": "staff",
      "isActive": true,
      "isVerified": true
    },
    "token": "jwt_access_token"
  }
}
```

### 3. Resend Verification Email (Admin Only)
```
POST /api/auth/resend-verification/:userId
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Verification email sent successfully"
}
```

## Environment Variables

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=Boarding House <noreply@boardinghouse.com>
VERIFICATION_TOKEN_EXPIRY=86400000
```

## Email Configuration

### Gmail Setup
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use the app password in `EMAIL_PASSWORD`

### Other SMTP Providers
Update the `EMAIL_HOST`, `EMAIL_PORT`, and authentication details as needed for your provider.

## Database Changes

The User model now includes:
- `isVerified`: Boolean (default: false)
- `verificationToken`: String (6-digit token)
- `verificationTokenExpiry`: Date (24 hours from creation)

## Security Features

- **Token Expiration**: 24-hour token lifetime
- **Password Requirements**: Strong password validation
- **Email Validation**: Proper email format validation
- **Rate Limiting**: Applied to all endpoints
- **Admin Authorization**: Only admins can create accounts and resend verification

## Error Handling

Common error responses:

- **400**: Invalid token, validation errors
- **401**: Unauthorized (admin-only endpoints)
- **409**: Email already exists
- **500**: Server errors (email sending failures)

## Testing Flow

1. Admin creates account via `POST /api/auth/create-account`
2. User receives email with 6-digit token
3. User activates account via `POST /api/auth/activate`
4. User can now login normally

## Troubleshooting

### Email Not Sending
- Check SMTP configuration
- Verify email credentials
- Check firewall/network restrictions
- Review email service logs

### Token Issues
- Tokens expire after 24 hours
- Use resend verification endpoint for new tokens
- Check token format (6 digits only)

### Account Activation Fails
- Verify token is correct and not expired
- Check password meets requirements
- Ensure account exists and is not already verified
