// Seed script for payment data
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

async function seedPayments() {
  try {
    console.log('🌱 Seeding payment data...');

    // Get or create admin user for recordedBy field
    let adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      adminUser = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'hashedpassword123',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created for payment recording');
    }

    // Get existing tenants and rooms
    const tenants = await Tenant.find({ tenantStatus: 'active' }).limit(5);
    const rooms = await Room.find({ status: 'occupied' }).limit(5);

    if (tenants.length === 0 || rooms.length === 0) {
      console.log('⚠️  No active tenants or occupied rooms found. Creating sample data...');
      
      // Create sample tenant if none exist
      if (tenants.length === 0) {
        const sampleUser = new User({
          username: 'tenant1',
          email: 'tenant1@example.com',
          password: 'hashedpassword123',
          role: 'tenant'
        });
        await sampleUser.save();

        const sampleTenant = new Tenant({
          userId: sampleUser._id,
          firstName: 'John',
          lastName: 'Doe',
          email: 'tenant1@example.com',
          phoneNumber: '+1234567890',
          dateOfBirth: new Date('1990-01-01'),
          idType: 'passport',
          idNumber: 'ABC123456',
          emergencyContact: {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phoneNumber: '+0987654321'
          },
          tenantStatus: 'active',
          roomNumber: '101'
        });
        await sampleTenant.save();
        tenants.push(sampleTenant);
      }

      // Create sample room if none exist
      if (rooms.length === 0) {
        const sampleRoom = new Room({
          roomNumber: '101',
          roomType: 'single',
          capacity: 1,
          monthlyRent: 2000,
          status: 'occupied',
          currentTenant: tenants[0]._id
        });
        await sampleRoom.save();
        rooms.push(sampleRoom);
      }
    }

    // Clear existing payments
    await Payment.deleteMany({});
    console.log('🗑️  Cleared existing payments');

    const samplePayments = [];

    // Create payments for each tenant-room pair
    for (let i = 0; i < Math.min(tenants.length, rooms.length); i++) {
      const tenant = tenants[i];
      const room = rooms[i];

      // Create pending rent payment (current month)
      samplePayments.push({
        tenant: tenant._id,
        room: room._id,
        amount: room.monthlyRent || 2000,
        paymentType: 'rent',
        paymentMethod: 'bank_transfer',
        status: 'pending',
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
        description: `Monthly rent - ${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        periodCovered: {
          startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        }
      });

      // Create overdue utility payment (last month)
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      samplePayments.push({
        tenant: tenant._id,
        room: room._id,
        amount: 150,
        paymentType: 'utility',
        paymentMethod: 'cash',
        status: 'overdue',
        dueDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 10),
        description: `Utility bill - ${lastMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        periodCovered: {
          startDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 1),
          endDate: new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0)
        }
      });

      // Create paid payment (previous month)
      const twoMonthsAgo = new Date();
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
      
      samplePayments.push({
        tenant: tenant._id,
        room: room._id,
        amount: room.monthlyRent || 2000,
        paymentType: 'rent',
        paymentMethod: 'bank_transfer',
        status: 'paid',
        dueDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 5),
        paymentDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 3),
        recordedBy: adminUser._id,
        description: `Monthly rent - ${twoMonthsAgo.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
        periodCovered: {
          startDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth(), 1),
          endDate: new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0)
        }
      });
    }

    // Insert payments
    await Payment.insertMany(samplePayments);
    console.log(`✅ Created ${samplePayments.length} sample payments`);

    // Update overdue status for payments past due date
    await Payment.updateOverduePayments();
    console.log('✅ Updated overdue payment statuses');

    console.log('\n📊 Payment Summary:');
    const stats = await Payment.getPaymentStatistics();
    console.log('- Total payments:', stats.totalPayments);
    console.log('- Paid payments:', stats.paidPayments);
    console.log('- Pending payments:', stats.pendingPayments);
    console.log('- Overdue payments:', stats.overduePayments);
    console.log('- Total amount:', `₱${stats.totalAmount}`);

    console.log('\n🎉 Payment seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedPayments();