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

// Sync tenant room assignments
const syncTenantRooms = async () => {
  try {
    console.log('=== Starting Tenant Room Sync ===');
    
    // Find all rooms with currentTenant assigned
    const roomsWithTenants = await Room.find({ 
      currentTenant: { $exists: true, $ne: null } 
    }).lean();
    
    console.log(`Found ${roomsWithTenants.length} rooms with assigned tenants`);
    
    let syncedCount = 0;
    let errorCount = 0;
    
    for (const room of roomsWithTenants) {
      try {
        // Find the tenant by userId (currentTenant field contains the tenant's userId)
        const tenant = await Tenant.findOne({ 
          userId: room.currentTenant 
        });
        
        if (tenant) {
          // Check if tenant already has the correct room number
          if (tenant.roomNumber !== room.roomNumber) {
            console.log(`Syncing tenant ${tenant.firstName} ${tenant.lastName}: ${tenant.roomNumber || 'null'} -> ${room.roomNumber}`);
            
            // Update tenant's room number
            await Tenant.updateOne(
              { _id: tenant._id },
              { roomNumber: room.roomNumber }
            );
            
            syncedCount++;
          } else {
            console.log(`Tenant ${tenant.firstName} ${tenant.lastName} already has correct room number: ${room.roomNumber}`);
          }
        } else {
          console.log(`Warning: No tenant found for room ${room.roomNumber} with tenant ID ${room.currentTenant}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error syncing room ${room.roomNumber}:`, error.message);
        errorCount++;
      }
    }
    
    console.log('=== Sync Complete ===');
    console.log(`Successfully synced: ${syncedCount} tenants`);
    console.log(`Errors: ${errorCount}`);
    
    // Also check for tenants with room numbers but no corresponding room assignment
    console.log('\n=== Checking for orphaned tenant room assignments ===');
    const tenantsWithRooms = await Tenant.find({ 
      roomNumber: { $exists: true, $ne: null, $ne: '' } 
    }).lean();
    
    let orphanedCount = 0;
    for (const tenant of tenantsWithRooms) {
      const room = await Room.findOne({ 
        roomNumber: tenant.roomNumber,
        currentTenant: tenant.userId 
      });
      
      if (!room) {
        console.log(`Warning: Tenant ${tenant.firstName} ${tenant.lastName} has room number ${tenant.roomNumber} but room is not assigned to them`);
        orphanedCount++;
      }
    }
    
    console.log(`Found ${orphanedCount} orphaned tenant room assignments`);
    
  } catch (error) {
    console.error('Sync error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

// Run the sync
if (require.main === module) {
  connectDB().then(() => {
    syncTenantRooms();
  });
}

module.exports = { syncTenantRooms };
