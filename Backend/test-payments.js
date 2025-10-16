// Test script for payments API
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boarding-house', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Payment = require('./src/models/Payment');
const Tenant = require('./src/models/Tenant');
const Room = require('./src/models/Room');
const User = require('./src/models/User');

async function testPayments() {
  try {
    console.log('🧪 Testing Payment System...');

    // Create test user first (required for tenant)
    let testUser = await User.findOne({ email: 'testuser@example.com' });
    if (!testUser) {
      testUser = new User({
        username: 'testuser123',
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        password: 'hashedpassword123', // This should be hashed in real scenario
        role: 'tenant',
        isActive: true
      });
      await testUser.save();
      console.log('✅ Test user created');
    } else {
      console.log('✅ Test user found');
    }

    // Create test tenant if not exists
    let testTenant = await Tenant.findOne({ userId: testUser._id });
    if (!testTenant) {
      testTenant = new Tenant({
        userId: testUser._id,
        firstName: 'Test',
        lastName: 'Tenant',
        phoneNumber: '+1234567890',
        dateOfBirth: new Date('1990-01-01'),
        idType: 'passport',
        idNumber: 'TEST123456',
        emergencyContact: {
          name: 'Emergency Contact',
          relationship: 'Family',
          phoneNumber: '+1987654321' // Fixed phone number format
        },
        tenantStatus: 'active'
      });
      await testTenant.save();
      console.log('✅ Test tenant created');
    } else {
      console.log('✅ Test tenant found');
    }

    // Create test room if not exists
    let testRoom = await Room.findOne({ roomNumber: 'TEST-101' });
    if (!testRoom) {
      testRoom = new Room({
        roomNumber: 'TEST-101',
        roomType: 'single',
        capacity: 1,
        monthlyRent: 2000,
        status: 'occupied',
        currentTenant: testTenant._id
      });
      await testRoom.save();
      console.log('✅ Test room created');
    } else {
      console.log('✅ Test room found');
    }

    // Create test payment
    const testPayment = new Payment({
      tenant: testTenant._id,
      room: testRoom._id,
      amount: 2000,
      paymentType: 'rent',
      paymentMethod: 'bank_transfer',
      status: 'pending',
      dueDate: new Date('2024-12-01'),
      description: 'Monthly rent for December 2024',
      periodCovered: {
        startDate: new Date('2024-12-01'),
        endDate: new Date('2024-12-31')
      }
    });

    await testPayment.save();
    console.log('✅ Test payment created:', testPayment._id);

    // Test payment methods
    console.log('\n📊 Testing Payment Methods...');

    // Mark as paid
    await testPayment.markAsPaid(new Date(), testTenant._id);
    console.log('✅ Payment marked as paid');

    // Test overdue payments
    const overduePayment = new Payment({
      tenant: testTenant._id,
      room: testRoom._id,
      amount: 1500,
      paymentType: 'utility',
      paymentMethod: 'cash',
      status: 'pending',
      dueDate: new Date('2024-10-01'), // Past date to make it overdue
      description: 'Utility bill for October 2024'
    });

    await overduePayment.save();
    console.log('✅ Overdue payment created');

    // Update overdue payments
    await Payment.updateOverduePayments();
    const updatedOverdue = await Payment.findById(overduePayment._id);
    console.log('✅ Overdue status updated:', updatedOverdue.status);

    // Test payment statistics
    const stats = await Payment.getPaymentStatistics();
    console.log('📈 Payment Statistics:', stats);

    // Clean up test data
    await Payment.deleteMany({ tenant: testTenant._id });
    await Room.findByIdAndDelete(testRoom._id);
    await Tenant.findByIdAndDelete(testTenant._id);
    console.log('🧹 Test data cleaned up');

    console.log('\n✅ All payment tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
testPayments();