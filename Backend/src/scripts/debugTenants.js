const mongoose = require('mongoose');
const Room = require('../models/Room');
const Tenant = require('../models/Tenant');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/boardinghouse_db');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Debug tenant data
const debugTenants = async () => {
  try {
    console.log('=== TENANT DEBUG ===');
    
    // Get all tenants without populate
    const allTenants = await Tenant.find({}).lean();
    console.log(`Total tenants: ${allTenants.length}`);
    
    // Show first 5 tenants
    console.log('\nFirst 5 tenants:');
    allTenants.slice(0, 5).forEach(tenant => {
      console.log(`Tenant ${tenant.firstName} ${tenant.lastName}: userId=${tenant.userId}, roomNumber=${tenant.roomNumber}`);
    });
    
    // Get rooms with tenants
    const roomsWithTenants = await Room.find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).lean();
    
    console.log(`\nRooms with currentTenant: ${roomsWithTenants.length}`);
    console.log('\nFirst 5 rooms with tenants:');
    roomsWithTenants.slice(0, 5).forEach(room => {
      console.log(`Room ${room.roomNumber}: currentTenant=${room.currentTenant}`);
    });
    
    // Check if any tenant userIds match room currentTenant
    const tenantUserIds = allTenants.map(t => t.userId.toString());
    const roomTenantIds = roomsWithTenants.map(r => r.currentTenant.toString());
    
    console.log('\nTenant userIds:', tenantUserIds.slice(0, 5));
    console.log('Room currentTenant IDs:', roomTenantIds.slice(0, 5));
    
    const matchingIds = tenantUserIds.filter(id => roomTenantIds.includes(id));
    console.log(`\nMatching IDs: ${matchingIds.length}`);
    console.log('Matching IDs:', matchingIds.slice(0, 5));
    
    console.log('\n=== END DEBUG ===');
    
  } catch (error) {
    console.error('Debug error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the debug
if (require.main === module) {
  connectDB().then(() => {
    debugTenants();
  });
}

module.exports = { debugTenants };
