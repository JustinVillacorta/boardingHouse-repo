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

// Comprehensive data sync
const comprehensiveSync = async () => {
  try {
    console.log('=== COMPREHENSIVE DATA SYNC ===');
    
    const db = mongoose.connection.db;
    
    // Get all tenants
    const tenants = await db.collection('tenants').find({}).toArray();
    console.log(`Total tenants: ${tenants.length}`);
    
    // Get all rooms with currentTenant
    const rooms = await db.collection('rooms').find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).toArray();
    console.log(`Total rooms with tenants: ${rooms.length}`);
    
    // Create a map of room number to tenant ID for quick lookup
    const roomToTenantMap = new Map();
    rooms.forEach(room => {
      roomToTenantMap.set(room.roomNumber, room.currentTenant);
    });
    
    console.log('\nRoom to Tenant mapping:');
    Array.from(roomToTenantMap.entries()).slice(0, 10).forEach(([roomNum, tenantId]) => {
      console.log(`Room ${roomNum} -> Tenant ${tenantId}`);
    });
    
    // Now sync tenant records
    let syncedCount = 0;
    let errorCount = 0;
    
    console.log('\n=== SYNCING TENANT RECORDS ===');
    
    for (const tenant of tenants) {
      try {
        // Find the room that has this tenant assigned
        const assignedRoom = rooms.find(room => 
          room.currentTenant && room.currentTenant.toString() === tenant.userId.toString()
        );
        
        if (assignedRoom) {
          // Check if tenant already has the correct room number
          if (tenant.roomNumber !== assignedRoom.roomNumber) {
            console.log(`Syncing tenant ${tenant.firstName} ${tenant.lastName}: ${tenant.roomNumber || 'null'} -> ${assignedRoom.roomNumber}`);
            
            await db.collection('tenants').updateOne(
              { _id: tenant._id },
              { $set: { roomNumber: assignedRoom.roomNumber } }
            );
            
            syncedCount++;
          } else {
            console.log(`Tenant ${tenant.firstName} ${tenant.lastName} already has correct room number: ${assignedRoom.roomNumber}`);
          }
        } else {
          // No room assigned to this tenant
          if (tenant.roomNumber && tenant.roomNumber !== null && tenant.roomNumber !== '') {
            console.log(`Tenant ${tenant.firstName} ${tenant.lastName} has room number ${tenant.roomNumber} but no room is assigned to them - clearing room number`);
            
            await db.collection('tenants').updateOne(
              { _id: tenant._id },
              { $set: { roomNumber: null } }
            );
            
            syncedCount++;
          }
        }
      } catch (error) {
        console.error(`Error syncing tenant ${tenant.firstName} ${tenant.lastName}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== SYNC COMPLETE ===');
    console.log(`Successfully synced: ${syncedCount} tenants`);
    console.log(`Errors: ${errorCount}`);
    
    // Verify the sync
    console.log('\n=== VERIFICATION ===');
    const updatedTenants = await db.collection('tenants').find({}).toArray();
    const tenantsWithRooms = updatedTenants.filter(t => t.roomNumber && t.roomNumber !== null && t.roomNumber !== '');
    console.log(`Tenants with room numbers after sync: ${tenantsWithRooms.length}`);
    
    tenantsWithRooms.slice(0, 10).forEach(tenant => {
      console.log(`Tenant ${tenant.firstName} ${tenant.lastName}: roomNumber=${tenant.roomNumber}`);
    });
    
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the comprehensive sync
if (require.main === module) {
  connectDB().then(() => {
    comprehensiveSync();
  });
}

module.exports = { comprehensiveSync };
