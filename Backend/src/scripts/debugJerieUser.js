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

// Debug specific user "jerie"
const debugJerieUser = async () => {
  try {
    console.log('=== DEBUG JERIE USER ===');
    
    const db = mongoose.connection.db;
    
    // Find user "jerie"
    const user = await db.collection('users').findOne({ username: 'jerie' });
    console.log('User jerie:', user);
    
    if (user) {
      // Find tenant with this userId
      const tenant = await db.collection('tenants').findOne({ userId: user._id });
      console.log('Tenant for jerie:', tenant);
      
      if (tenant) {
        // Find room with this roomNumber
        const room = await db.collection('rooms').findOne({ roomNumber: tenant.roomNumber });
        console.log('Room for jerie:', room);
        
        // Check if room has currentTenant set
        if (room && room.currentTenant) {
          console.log('Room currentTenant:', room.currentTenant);
          console.log('Matches user _id:', room.currentTenant.toString() === user._id.toString());
        }
      }
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
    debugJerieUser();
  });
}

module.exports = { debugJerieUser };
