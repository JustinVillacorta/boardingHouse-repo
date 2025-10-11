#!/usr/bin/env node

/**
 * Quick script to get verification token from database
 * Usage: node get-verification-token.js <email>
 * Example: node get-verification-token.js dojese4018@bdnets.com
 */

const mongoose = require('mongoose');
const config = require('./src/config/config');

async function getVerificationToken(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Import User model
    const User = require('./src/models/User');

    // Find user by email
    const user = await User.findOne({ email })
      .select('+verificationToken +verificationTokenExpiry');

    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return;
    }

    if (!user.verificationToken) {
      console.log(`❌ No verification token found for ${email}`);
      console.log(`   User status: isVerified=${user.isVerified}, isActive=${user.isActive}`);
      return;
    }

    // Check if token is expired
    const now = new Date();
    const isExpired = user.verificationTokenExpiry && user.verificationTokenExpiry < now;

    console.log('\n=== VERIFICATION TOKEN ===');
    console.log(`Email: ${user.email}`);
    console.log(`Username: ${user.username}`);
    console.log(`Token: ${user.verificationToken}`);
    console.log(`Expires: ${user.verificationTokenExpiry}`);
    console.log(`Status: ${isExpired ? '❌ EXPIRED' : '✅ VALID'}`);
    console.log(`User ID: ${user._id}`);
    console.log('========================\n');

    if (isExpired) {
      console.log('⚠️  Token has expired. You may need to resend verification email.');
    } else {
      console.log('✅ Token is valid. You can use it to activate the account.');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.log('Usage: node get-verification-token.js <email>');
  console.log('Example: node get-verification-token.js dojese4018@bdnets.com');
  process.exit(1);
}

// Run the function
getVerificationToken(email);
