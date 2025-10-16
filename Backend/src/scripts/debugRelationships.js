const mongoose = require('mongoose');

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

// Debug the relationship between Users, Tenants, and Rooms
const debugRelationships = async () => {
  try {
    console.log('=== RELATIONSHIP DEBUG ===');
    
    const db = mongoose.connection.db;
    
    // Get all users
    const users = await db.collection('users').find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    // Get all tenants
    const tenants = await db.collection('tenants').find({}).toArray();
    console.log(`Total tenants: ${tenants.length}`);
    
    // Get all rooms
    const rooms = await db.collection('rooms').find({}).toArray();
    console.log(`Total rooms: ${rooms.length}`);
    
    // Show first 5 users
    console.log('\nFirst 5 users:');
    users.slice(0, 5).forEach(user => {
      console.log(`User ${user.username}: _id=${user._id}, role=${user.role}`);
    });
    
    // Show first 5 tenants
    console.log('\nFirst 5 tenants:');
    tenants.slice(0, 5).forEach(tenant => {
      console.log(`Tenant ${tenant.firstName} ${tenant.lastName}: _id=${tenant._id}, userId=${tenant.userId}`);
    });
    
    // Show first 5 rooms
    console.log('\nFirst 5 rooms:');
    rooms.slice(0, 5).forEach(room => {
      console.log(`Room ${room.roomNumber}: _id=${room._id}, currentTenant=${room.currentTenant}`);
    });
    
    // Check if tenant userIds match user _ids
    const tenantUserIds = tenants.map(t => t.userId.toString());
    const userIds = users.map(u => u._id.toString());
    
    console.log('\nTenant userIds:', tenantUserIds.slice(0, 5));
    console.log('User _ids:', userIds.slice(0, 5));
    
    const matchingUserIds = tenantUserIds.filter(id => userIds.includes(id));
    console.log(`Matching tenant userIds with user _ids: ${matchingUserIds.length}`);
    
    // Check if room currentTenant matches any user _id
    const roomTenantIds = rooms.map(r => r.currentTenant?.toString()).filter(Boolean);
    const matchingRoomTenants = roomTenantIds.filter(id => userIds.includes(id));
    console.log(`Matching room currentTenant with user _ids: ${matchingRoomTenants.length}`);
    
    // Check if room currentTenant matches any tenant userId
    const matchingRoomTenantUserIds = roomTenantIds.filter(id => tenantUserIds.includes(id));
    console.log(`Matching room currentTenant with tenant userId: ${matchingRoomTenantUserIds.length}`);
    
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
    debugRelationships();
  });
}

module.exports = { debugRelationships };
