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

// Debug using direct database queries
const debugDirect = async () => {
  try {
    console.log('=== DIRECT DATABASE DEBUG ===');
    
    const db = mongoose.connection.db;
    
    // Get tenants collection
    const tenants = await db.collection('tenants').find({}).toArray();
    console.log(`Total tenants: ${tenants.length}`);
    
    // Show first 5 tenants
    console.log('\nFirst 5 tenants:');
    tenants.slice(0, 5).forEach(tenant => {
      console.log(`Tenant ${tenant.firstName} ${tenant.lastName}: userId=${tenant.userId}, roomNumber=${tenant.roomNumber}`);
    });
    
    // Get rooms collection
    const rooms = await db.collection('rooms').find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).toArray();
    
    console.log(`\nRooms with currentTenant: ${rooms.length}`);
    console.log('\nFirst 5 rooms with tenants:');
    rooms.slice(0, 5).forEach(room => {
      console.log(`Room ${room.roomNumber}: currentTenant=${room.currentTenant}`);
    });
    
    // Check if any tenant userIds match room currentTenant
    const tenantUserIds = tenants.map(t => t.userId.toString());
    const roomTenantIds = rooms.map(r => r.currentTenant.toString());
    
    console.log('\nTenant userIds:', tenantUserIds.slice(0, 5));
    console.log('Room currentTenant IDs:', roomTenantIds.slice(0, 5));
    
    const matchingIds = tenantUserIds.filter(id => roomTenantIds.includes(id));
    console.log(`\nMatching IDs: ${matchingIds.length}`);
    console.log('Matching IDs:', matchingIds.slice(0, 5));
    
    // Now let's sync the data
    if (matchingIds.length > 0) {
      console.log('\n=== SYNCING DATA ===');
      let syncedCount = 0;
      
      for (const room of rooms) {
        const tenant = tenants.find(t => t.userId.toString() === room.currentTenant.toString());
        if (tenant && tenant.roomNumber !== room.roomNumber) {
          console.log(`Syncing tenant ${tenant.firstName} ${tenant.lastName}: ${tenant.roomNumber || 'null'} -> ${room.roomNumber}`);
          
          await db.collection('tenants').updateOne(
            { _id: tenant._id },
            { $set: { roomNumber: room.roomNumber } }
          );
          
          syncedCount++;
        }
      }
      
      console.log(`Successfully synced: ${syncedCount} tenants`);
    }
    
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
    debugDirect();
  });
}

module.exports = { debugDirect };
