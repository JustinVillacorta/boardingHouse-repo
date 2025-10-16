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

// Debug database state
const debugDatabase = async () => {
  try {
    console.log('=== DATABASE DEBUG ===');
    
    // Check all rooms
    const allRooms = await Room.find({}).lean();
    console.log(`Total rooms: ${allRooms.length}`);
    
    // Show first 5 rooms
    console.log('\nFirst 5 rooms:');
    allRooms.slice(0, 5).forEach(room => {
      console.log(`Room ${room.roomNumber}: status=${room.status}, currentTenant=${room.currentTenant}, occupancy=${room.occupancy?.current}/${room.occupancy?.max}`);
    });
    
    // Check rooms with currentTenant
    const roomsWithTenants = await Room.find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).lean();
    console.log(`\nRooms with currentTenant: ${roomsWithTenants.length}`);
    
    // Check all tenants
    const allTenants = await Tenant.find({}).lean();
    console.log(`Total tenants: ${allTenants.length}`);
    
    // Show first 5 tenants
    console.log('\nFirst 5 tenants:');
    allTenants.slice(0, 5).forEach(tenant => {
      console.log(`Tenant ${tenant.firstName} ${tenant.lastName}: userId=${tenant.userId}, roomNumber=${tenant.roomNumber}`);
    });
    
    // Check tenants with room numbers
    const tenantsWithRooms = await Tenant.find({ 
      roomNumber: { $exists: true, $ne: null, $ne: '' } 
    }).lean();
    console.log(`\nTenants with room numbers: ${tenantsWithRooms.length}`);
    
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
    debugDatabase();
  });
}

module.exports = { debugDatabase };
