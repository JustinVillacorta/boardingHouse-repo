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

// Fix existing room assignments
const fixRoomAssignments = async () => {
  try {
    console.log('=== FIXING ROOM ASSIGNMENTS ===');
    
    const db = mongoose.connection.db;
    
    // Get all tenants
    const tenants = await db.collection('tenants').find({}).toArray();
    console.log(`Total tenants: ${tenants.length}`);
    
    // Get all rooms with currentTenant
    const rooms = await db.collection('rooms').find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).toArray();
    console.log(`Total rooms with tenants: ${rooms.length}`);
    
    // Create a map of tenant _id to userId for quick lookup
    const tenantIdToUserIdMap = new Map();
    tenants.forEach(tenant => {
      tenantIdToUserIdMap.set(tenant._id.toString(), tenant.userId.toString());
    });
    
    console.log('\nTenant ID to User ID mapping:');
    Array.from(tenantIdToUserIdMap.entries()).slice(0, 5).forEach(([tenantId, userId]) => {
      console.log(`Tenant ${tenantId} -> User ${userId}`);
    });
    
    // Fix room assignments
    let fixedCount = 0;
    let errorCount = 0;
    
    console.log('\n=== FIXING ROOM RECORDS ===');
    
    for (const room of rooms) {
      try {
        const currentTenantId = room.currentTenant.toString();
        
        // Check if this currentTenant ID is a tenant _id
        if (tenantIdToUserIdMap.has(currentTenantId)) {
          const correctUserId = tenantIdToUserIdMap.get(currentTenantId);
          
          console.log(`Fixing room ${room.roomNumber}: ${currentTenantId} -> ${correctUserId}`);
          
          await db.collection('rooms').updateOne(
            { _id: room._id },
            { $set: { currentTenant: new mongoose.Types.ObjectId(correctUserId) } }
          );
          
          fixedCount++;
        } else {
          console.log(`Room ${room.roomNumber} has invalid currentTenant: ${currentTenantId} - clearing assignment`);
          
          await db.collection('rooms').updateOne(
            { _id: room._id },
            { $set: { currentTenant: null, 'occupancy.current': 0 } }
          );
          
          fixedCount++;
        }
      } catch (error) {
        console.error(`Error fixing room ${room.roomNumber}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('\n=== FIX COMPLETE ===');
    console.log(`Successfully fixed: ${fixedCount} rooms`);
    console.log(`Errors: ${errorCount}`);
    
    // Verify the fix
    console.log('\n=== VERIFICATION ===');
    const updatedRooms = await db.collection('rooms').find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).toArray();
    
    console.log(`Rooms with currentTenant after fix: ${updatedRooms.length}`);
    
    // Check if currentTenant IDs now match user IDs
    const users = await db.collection('users').find({}).toArray();
    const userIds = users.map(u => u._id.toString());
    
    let validAssignments = 0;
    for (const room of updatedRooms) {
      if (userIds.includes(room.currentTenant.toString())) {
        validAssignments++;
      }
    }
    
    console.log(`Valid room assignments (currentTenant matches user _id): ${validAssignments}`);
    
    // Now sync tenant room numbers
    console.log('\n=== SYNCING TENANT ROOM NUMBERS ===');
    let syncedTenants = 0;
    
    for (const room of updatedRooms) {
      const tenant = tenants.find(t => t.userId.toString() === room.currentTenant.toString());
      if (tenant && tenant.roomNumber !== room.roomNumber) {
        console.log(`Syncing tenant ${tenant.firstName} ${tenant.lastName}: ${tenant.roomNumber || 'null'} -> ${room.roomNumber}`);
        
        await db.collection('tenants').updateOne(
          { _id: tenant._id },
          { $set: { roomNumber: room.roomNumber } }
        );
        
        syncedTenants++;
      }
    }
    
    console.log(`Synced ${syncedTenants} tenant room numbers`);
    
  } catch (error) {
    console.error('Fix error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the fix
if (require.main === module) {
  connectDB().then(() => {
    fixRoomAssignments();
  });
}

module.exports = { fixRoomAssignments };
