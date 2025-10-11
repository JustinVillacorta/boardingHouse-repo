const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.EMAIL_HOST,
        port: config.EMAIL_PORT,
        secure: config.EMAIL_PORT === 465, // true for 465, false for other ports
        auth: {
          user: config.EMAIL_USER,
          pass: config.EMAIL_PASSWORD,
        },
      });

      // Verify connection configuration
      this.transporter.verify((error, success) => {
        if (error) {
          console.error('Email service configuration error:', error);
        } else {
          console.log('Email service is ready to send messages');
        }
      });
    } catch (error) {
      console.error('Failed to initialize email service:', error);
    }
  }

  // Generate a 6-digit verification token
  generateVerificationToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send verification email
  async sendVerificationEmail(email, token, role, tenantDetails = null) {
    try {
      if (!this.transporter) {
        console.warn('Email service not initialized - skipping email send');
        console.log(`VERIFICATION TOKEN for ${email}: ${token}`);
        return { messageId: 'mock-email-id' };
      }

      const roleDisplayName = role === 'staff' ? 'Staff Member' : 'Tenant';
      const subject = `Account Verification - Boarding House Management System`;
      
      const htmlContent = this.getVerificationEmailTemplate(token, roleDisplayName, tenantDetails);
      const textContent = this.getVerificationEmailTextTemplate(token, roleDisplayName, tenantDetails);

      const mailOptions = {
        from: config.EMAIL_FROM,
        to: email,
        subject: subject,
        text: textContent,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Verification email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Failed to send verification email:', error);
      console.log(`FALLBACK: Verification token for ${email}: ${token}`);
      // Don't throw error - just log the token for testing
      return { messageId: 'mock-email-id', error: error.message };
    }
  }

  // HTML email template
  getVerificationEmailTemplate(token, roleDisplayName, tenantDetails = null) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Account Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            background-color: #2c3e50;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .token-box {
            background-color: #e9ecef;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          .token {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
          }
          .instructions {
            background-color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            color: #6c757d;
            font-size: 14px;
          }
          .warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Boarding House Management System</h1>
          <h2>Account Verification Required</h2>
        </div>
        
        <div class="content">
          <p>Hello${tenantDetails ? ` ${tenantDetails.firstName}` : ''},</p>
          
          <p>Welcome to the Boarding House Management System! Your account has been created as a <strong>${roleDisplayName}</strong>.</p>
          
          ${tenantDetails ? `
          <div class="instructions">
            <h3>Your Room Assignment:</h3>
            <ul>
              <li><strong>Room Number:</strong> ${tenantDetails.roomNumber || 'TBD'}</li>
              <li><strong>Monthly Rent:</strong> $${tenantDetails.monthlyRent || 'TBD'}</li>
            </ul>
          </div>
          ` : ''}
          
          <p>To activate your account and set your password, please use the verification token below:</p>
          
          <div class="token-box">
            <div class="token">${token}</div>
          </div>
          
          <div class="instructions">
            <h3>How to activate your account:</h3>
            <ol>
              <li>Go to the account activation page</li>
              <li>Enter your email address</li>
              <li>Enter the verification token: <strong>${token}</strong></li>
              <li>Create a secure password for your account</li>
              <li>Click "Activate Account"</li>
            </ol>
          </div>
          
          <div class="warning">
            <strong>Important:</strong> This verification token will expire in 24 hours. If you don't activate your account within this time, please contact your administrator to resend the verification email.
          </div>
          
          <p>If you did not expect this email, please contact your administrator immediately.</p>
        </div>
        
        <div class="footer">
          <p>This is an automated message from the Boarding House Management System.</p>
          <p>Please do not reply to this email.</p>
        </div>
      </body>
      </html>
    `;
  }

  // Plain text email template
  getVerificationEmailTextTemplate(token, roleDisplayName, tenantDetails = null) {
    return `
Boarding House Management System - Account Verification

Hello${tenantDetails ? ` ${tenantDetails.firstName}` : ''},

Welcome to the Boarding House Management System! Your account has been created as a ${roleDisplayName}.

${tenantDetails ? `
Your Room Assignment:
- Room Number: ${tenantDetails.roomNumber || 'TBD'}
- Monthly Rent: $${tenantDetails.monthlyRent || 'TBD'}

` : ''}To activate your account and set your password, please use the verification token below:

VERIFICATION TOKEN: ${token}

How to activate your account:
1. Go to the account activation page
2. Enter your email address
3. Enter the verification token: ${token}
4. Create a secure password for your account
5. Click "Activate Account"

IMPORTANT: This verification token will expire in 24 hours. If you don't activate your account within this time, please contact your administrator to resend the verification email.

If you did not expect this email, please contact your administrator immediately.

---
This is an automated message from the Boarding House Management System.
Please do not reply to this email.
    `;
  }

  // Test email configuration
  async testEmailConfiguration() {
    try {
      if (!this.transporter) {
        throw new Error('Email service not initialized');
      }

      const testResult = await this.transporter.verify();
      return testResult;
    } catch (error) {
      console.error('Email configuration test failed:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
