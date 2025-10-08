const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

const DB_NAME = 'boardmate';  
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const FULL_CONNECTION_STRING = `${MONGO_URI}/${DB_NAME}`;

console.log(`📍 Database Name: ${DB_NAME}`);

mongoose.connect(FULL_CONNECTION_STRING, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log(`✅ Connected to Database: ${mongoose.connection.db.databaseName}`);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
  });

// Counter Schema for auto-incrementing IDs
const CounterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

// Function to get next sequence number
const getNextSequence = async (sequenceName) => {
  try {
    const sequenceDocument = await Counter.findByIdAndUpdate(
      sequenceName,
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );
    console.log(`🔢 Generated ID: ${sequenceDocument.sequence_value} for sequence: ${sequenceName}`);
    return sequenceDocument.sequence_value;
  } catch (error) {
    console.error('❌ Error generating sequence:', error);
    throw error;
  }
};

// ✅ ROOM MANAGEMENT SCHEMA - ADD AVAILABILITY STATUS FIELD
const RoomManagementSchema = new mongoose.Schema({
  id: { 
    type: Number, 
    unique: true,
    required: true
  },
  rooms: {
    type: String,
    required: true
  },
  name: { 
    type: String,
    required: true
  },
  rent: { 
    type: String,
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Single', 'Double', 'Triple'],
    default: 'Single'
  },
  availabilityStatus: {    // NEW: Availability status field
    type: String,
    required: true,
    enum: ['Vacant', 'Occupied'],
    default: 'Vacant'
  },
  startDate: { 
    type: String,
    required: true
  },
  endDate: { 
    type: String,
    required: true
  },
  hasVehicle: { 
    type: Boolean,
    default: false
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

// CONNECTION TO ROOMS_MANAGEMENT COLLECTION
const RoomManagement = mongoose.model('RoomManagement', RoomManagementSchema, 'rooms_management');

console.log('✅ Model created: RoomManagement -> Collection: rooms_management');

// GET ALL ROOMS FROM BOARDMATE.ROOMS_MANAGEMENT
app.get('/api/rooms', async (req, res) => {
  try {
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📁 Collection: rooms_management`);
    
    const rooms = await RoomManagement.find().sort({ id: 1 });
    
    console.log(`📊 Found ${rooms.length} rooms in boardmate.rooms_management`);
    if (rooms.length > 0) {
      console.log('📋 Sample room:', {
        id: rooms[0].id,
        name: rooms[0].name,
        rooms: rooms[0].rooms,
        roomType: rooms[0].roomType
      });
    }
    
    res.json({
      success: true,
      count: rooms.length,
      data: rooms,
      database: mongoose.connection.db.databaseName,
      collection: 'rooms_management',
      connectionInfo: {
        database: mongoose.connection.db.databaseName,
        collection: 'rooms_management',
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    });
  } catch (error) {
    console.error('❌ Error fetching from boardmate.rooms_management:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms from boardmate database',
      error: error.message,
      database: mongoose.connection.db?.databaseName || 'Unknown',
      collection: 'rooms_management'
    });
  }
});

// ✅ ADD ROOM TO BOARDMATE.ROOMS_MANAGEMENT
app.post('/api/add-hello', async (req, res) => {
  try {
    console.log('🚀 === ADDING ROOM TO BOARDMATE.ROOMS_MANAGEMENT ===');
    console.log(`📊 Current Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📁 Target Collection: rooms_management`);
    console.log('📥 Received data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const { roomAssignment, tenantName, monthlyRent, roomType, availabilityStatus, leaseStartDate, leaseEndDate } = req.body;
    
    if (!roomAssignment || !tenantName || !monthlyRent || !leaseStartDate || !leaseEndDate) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        required: ['roomAssignment', 'tenantName', 'monthlyRent', 'leaseStartDate', 'leaseEndDate'],
        received: req.body
      });
    }
    
    // Get next incrementing ID
    console.log('🔢 Generating next ID for rooms_management...');
    const nextId = await getNextSequence('room_management_id');
    
    // Create room data for boardmate.rooms_management
    const roomData = {
      id: nextId,
      rooms: roomAssignment,
      name: tenantName,
      rent: monthlyRent,
      roomType: roomType || 'Single',
      availabilityStatus: availabilityStatus || 'Vacant',  // NEW: Include availability status
      startDate: leaseStartDate,
      endDate: leaseEndDate,
      hasVehicle: req.body.hasVehicle || false,
      timestamp: new Date()
    };
    
    console.log('💾 Saving to boardmate.rooms_management:', JSON.stringify(roomData, null, 2));
    
    // Save to boardmate.rooms_management collection
    const newRoom = new RoomManagement(roomData);
    const savedRoom = await newRoom.save();
    
    console.log('✅ === ROOM SAVED SUCCESSFULLY ===');
    console.log('✅ Room Details:', {
      id: savedRoom.id,
      name: savedRoom.name,
      rooms: savedRoom.rooms,
      roomType: savedRoom.roomType,
      availabilityStatus: savedRoom.availabilityStatus  // NEW: Log availability status
    });
    
    // Verify save by counting documents in boardmate.rooms_management
    const totalCount = await RoomManagement.countDocuments();
    console.log(`Total rooms in boardmate.rooms_management: ${totalCount}`);
    
    res.json({
      success: true,
      message: `Room assignment created successfully in boardmate.rooms_management for ${savedRoom.name}!`,
      data: {
        id: savedRoom.id,
        rooms: savedRoom.rooms,
        name: savedRoom.name,
        rent: savedRoom.rent,
        roomType: savedRoom.roomType,
        availabilityStatus: savedRoom.availabilityStatus,  // NEW: Include in response
        startDate: savedRoom.startDate,
        endDate: savedRoom.endDate,
        hasVehicle: savedRoom.hasVehicle
      },
      database: mongoose.connection.db.databaseName,
      collection: 'rooms_management',
      totalDocuments: totalCount,
      connectionInfo: {
        database: mongoose.connection.db.databaseName,
        collection: 'rooms_management',
        host: mongoose.connection.host,
        port: mongoose.connection.port
      }
    });
    
  } catch (error) {
    console.error('❌ === FAILED TO SAVE TO BOARDMATE.ROOMS_MANAGEMENT ===');
    console.error('❌ Error details:', error);
    console.error('❌ Stack trace:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to save room to boardmate.rooms_management',
      error: error.message,
      database: mongoose.connection.db?.databaseName || 'Unknown',
      collection: 'rooms_management'
    });
  }
});

// ✅ DATABASE STATUS ENDPOINT FOR BOARDMATE
app.get('/api/boardmate-db', async (req, res) => {
  try {
    console.log('🔍 === CHECKING BOARDMATE DATABASE STATUS ===');
    
    const count = await RoomManagement.countDocuments();
    const allRooms = await RoomManagement.find().sort({ id: 1 }).limit(5);
    
    const status = {
      success: true,
      database: mongoose.connection.db.databaseName,
      collection: 'rooms_management',
      documentCount: count,
      recentRooms: allRooms,
      connectionStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
      connectionDetails: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        databaseName: mongoose.connection.db.databaseName,
        readyState: mongoose.connection.readyState,
        readyStateText: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState]
      }
    };
    
    res.json(status);
  } catch (error) {
    console.error('❌ Error checking boardmate database:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: mongoose.connection.db?.databaseName || 'Unknown',
      collection: 'rooms_management',
      connectionStatus: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
  }
});

// ✅ RESET BOARDMATE.ROOMS_MANAGEMENT (FOR TESTING)
app.post('/api/reset-counter', async (req, res) => {
  try {
    console.log('🔄 === RESETTING BOARDMATE.ROOMS_MANAGEMENT ===');
    
    await Counter.deleteMany({});
    await RoomManagement.deleteMany({});
    
    console.log('✅ Reset completed for boardmate.rooms_management');
    
    res.json({
      success: true,
      message: `boardmate.rooms_management reset successfully!`,
      database: mongoose.connection.db.databaseName,
      collection: 'rooms_management'
    });
  } catch (error) {
    console.error('❌ Error resetting boardmate.rooms_management:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      database: mongoose.connection.db?.databaseName || 'Unknown',
      collection: 'rooms_management'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BoardingHouse API connected to boardmate.rooms_management',
    database: mongoose.connection.db?.databaseName || 'boardmate',
    collection: 'rooms_management',
    connectionString: FULL_CONNECTION_STRING,
    endpoints: {
      'GET /api/aws': 'Get all rooms from boardmate.rooms_management',
      'POST /api/add-hello': 'Add room to boardmate.rooms_management',
      'GET /api/boardmate-db': 'Check boardmate database status',
      'POST /api/reset-counter': 'Reset boardmate.rooms_management'
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log('🚀 === SERVER STARTED ===');
  console.log(`🚀 Backend server running at http://localhost:${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎯 Database: ${DB_NAME}`);
  console.log(`📁 Collection: rooms_management`);
  console.log(`🔗 Full Connection: ${FULL_CONNECTION_STRING}`);
  console.log('📋 Visit http://localhost:5000 for API info');
  console.log('📋 Visit http://localhost:5000/api/boardmate-db for database status');
});

