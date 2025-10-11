const Room = require('../models/Room');

class RoomRepository {
  // Create new room
  async create(roomData) {
    try {
      const room = new Room(roomData);
      await room.save();
      return room;
    } catch (error) {
      if (error.code === 11000) {
        throw new Error('Room number already exists');
      }
      throw error;
    }
  }

  // Find room by ID
  async findById(id) {
    return Room.findById(id)
      .populate('currentTenant', 'firstName lastName fullName phoneNumber email')
      .populate('rentalHistory.tenant', 'firstName lastName fullName');
  }

  // Find room by room number
  async findByRoomNumber(roomNumber) {
    return Room.findOne({ roomNumber, isActive: true })
      .populate('currentTenant', 'firstName lastName fullName phoneNumber email');
  }

  // Get all rooms with tenant information
  async findAllWithTenants(options = {}) {
    const {
      page = 1,
      limit = 50,
      sortBy = 'roomNumber',
      sortOrder = 'asc',
      status,
      roomType,
      floor,
      minCapacity,
      maxCapacity,
      minRent,
      maxRent,
      isAvailable,
    } = options;

    // Build query
    const query = { isActive: true };

    if (status) query.status = status;
    if (roomType) query.roomType = roomType;
    if (floor !== undefined) query.floor = floor;
    if (minCapacity) query.capacity = { ...query.capacity, $gte: minCapacity };
    if (maxCapacity) query.capacity = { ...query.capacity, $lte: maxCapacity };
    if (minRent) query.monthlyRent = { ...query.monthlyRent, $gte: minRent };
    if (maxRent) query.monthlyRent = { ...query.monthlyRent, $lte: maxRent };

    if (isAvailable !== undefined) {
      if (isAvailable) {
        query.status = 'available';
      } else {
        query.status = { $ne: 'available' };
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute aggregation to join with tenant data
    const pipeline = [
      { $match: query },
      {
        $lookup: {
          from: 'tenants',
          localField: 'roomNumber',
          foreignField: 'roomNumber',
          as: 'tenantData'
        }
      },
      {
        $addFields: {
          tenant: {
            $cond: {
              if: { $gt: [{ $size: '$tenantData' }, 0] },
              then: {
                $let: {
                  vars: { tenant: { $arrayElemAt: ['$tenantData', 0] } },
                  in: {
                    id: '$$tenant._id',
                    name: { $concat: ['$$tenant.firstName', ' ', '$$tenant.lastName'] },
                    phoneNumber: '$$tenant.phoneNumber',
                    leaseStartDate: '$$tenant.leaseStartDate',
                    leaseEndDate: '$$tenant.leaseEndDate',
                    tenantStatus: '$$tenant.tenantStatus'
                  }
                }
              },
              else: null
            }
          }
        }
      },
      { $unset: 'tenantData' },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit }
    ];

    const [rooms, totalCount] = await Promise.all([
      Room.aggregate(pipeline),
      Room.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return {
      rooms,
      total: totalCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  // Get all rooms with optional filters and pagination (original method)
  async findAll(options = {}) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'roomNumber',
      sortOrder = 'asc',
      status,
      roomType,
      floor,
      minCapacity,
      maxCapacity,
      minRent,
      maxRent,
      isAvailable,
      currentTenant,
    } = options;

    // Build query
    const query = { isActive: true };

    if (status) query.status = status;
    if (roomType) query.roomType = roomType;
    if (floor !== undefined) query.floor = floor;
    if (minCapacity) query.capacity = { ...query.capacity, $gte: minCapacity };
    if (maxCapacity) query.capacity = { ...query.capacity, $lte: maxCapacity };
    if (minRent) query.monthlyRent = { ...query.monthlyRent, $gte: minRent };
    if (maxRent) query.monthlyRent = { ...query.monthlyRent, $lte: maxRent };
    if (currentTenant) query.currentTenant = currentTenant;

    // Filter for available rooms
    if (isAvailable === true) {
      query.status = 'available';
      query.$expr = { $lt: ['$occupancy.current', '$occupancy.max'] };
    } else if (isAvailable === false) {
      query.$or = [
        { status: { $ne: 'available' } },
        { $expr: { $gte: ['$occupancy.current', '$occupancy.max'] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value
    const skip = (page - 1) * limit;

    // Execute query
    const [rooms, totalCount] = await Promise.all([
      Room.find(query)
        .populate('currentTenant', 'firstName lastName fullName phoneNumber')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Room.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return {
      rooms,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit,
      },
    };
  }

  // Get available rooms
  async findAvailable(options = {}) {
    return Room.findAvailable(options);
  }

  // Update room by ID
  async updateById(id, updateData) {
    return Room.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('currentTenant', 'firstName lastName fullName phoneNumber email');
  }

  // Delete room by ID (soft delete)
  async deleteById(id) {
    return Room.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
  }

  // Hard delete room by ID
  async hardDeleteById(id) {
    return Room.findByIdAndDelete(id);
  }

  // Check if room number is available
  async isRoomNumberAvailable(roomNumber, excludeId = null) {
    const query = { roomNumber, isActive: true };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const existingRoom = await Room.findOne(query);
    return !existingRoom;
  }

  // Assign tenant to room
  async assignTenant(roomId, tenantId, rentAmount) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    if (!room.canAccommodate()) {
      throw new Error('Room is at full capacity or under maintenance');
    }

    return room.assignTenant(tenantId, rentAmount);
  }

  // Unassign tenant from room
  async unassignTenant(roomId, tenantId) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new Error('Room not found');
    }

    return room.unassignTenant(tenantId);
  }

  // Get room statistics
  async getStatistics() {
    const stats = await Room.getStatistics();
    return stats[0] || {
      totalRooms: 0,
      availableRooms: 0,
      occupiedRooms: 0,
      maintenanceRooms: 0,
      totalCapacity: 0,
      currentOccupancy: 0,
      occupancyRate: 0,
      averageRent: 0,
      totalRentValue: 0,
    };
  }

  // Get rooms by status
  async findByStatus(status) {
    return Room.find({ status, isActive: true })
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ roomNumber: 1 });
  }

  // Get rooms by type
  async findByType(roomType) {
    return Room.find({ roomType, isActive: true })
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ roomNumber: 1 });
  }

  // Get rooms by floor
  async findByFloor(floor) {
    return Room.find({ floor, isActive: true })
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ roomNumber: 1 });
  }

  // Get rooms with capacity range
  async findByCapacityRange(minCapacity, maxCapacity) {
    const query = { isActive: true };
    if (minCapacity !== undefined) query.capacity = { $gte: minCapacity };
    if (maxCapacity !== undefined) {
      query.capacity = { ...query.capacity, $lte: maxCapacity };
    }

    return Room.find(query)
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ capacity: 1, roomNumber: 1 });
  }

  // Get rooms with rent range
  async findByRentRange(minRent, maxRent) {
    const query = { isActive: true };
    if (minRent !== undefined) query.monthlyRent = { $gte: minRent };
    if (maxRent !== undefined) {
      query.monthlyRent = { ...query.monthlyRent, $lte: maxRent };
    }

    return Room.find(query)
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ monthlyRent: 1, roomNumber: 1 });
  }

  // Get rooms due for maintenance
  async findDueForMaintenance(daysAhead = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return Room.find({
      isActive: true,
      'maintenance.nextServiceDate': { $lte: futureDate },
    })
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ 'maintenance.nextServiceDate': 1 });
  }

  // Search rooms by multiple criteria
  async search(searchCriteria) {
    const {
      query = '',
      status,
      roomType,
      minRent,
      maxRent,
      minCapacity,
      maxCapacity,
      floor,
      amenities,
      isAvailable,
    } = searchCriteria;

    const mongoQuery = { isActive: true };

    // Text search in room number and description
    if (query) {
      mongoQuery.$or = [
        { roomNumber: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    // Apply filters
    if (status) mongoQuery.status = status;
    if (roomType) mongoQuery.roomType = roomType;
    if (minRent || maxRent) {
      mongoQuery.monthlyRent = {};
      if (minRent) mongoQuery.monthlyRent.$gte = minRent;
      if (maxRent) mongoQuery.monthlyRent.$lte = maxRent;
    }
    if (minCapacity || maxCapacity) {
      mongoQuery.capacity = {};
      if (minCapacity) mongoQuery.capacity.$gte = minCapacity;
      if (maxCapacity) mongoQuery.capacity.$lte = maxCapacity;
    }
    if (floor !== undefined) mongoQuery.floor = floor;
    if (amenities && amenities.length > 0) {
      mongoQuery.amenities = { $in: amenities };
    }

    // Filter for availability
    if (isAvailable === true) {
      mongoQuery.status = 'available';
      mongoQuery.$expr = { $lt: ['$occupancy.current', '$occupancy.max'] };
    } else if (isAvailable === false) {
      mongoQuery.$or = [
        { status: { $ne: 'available' } },
        { $expr: { $gte: ['$occupancy.current', '$occupancy.max'] } }
      ];
    }

    return Room.find(mongoQuery)
      .populate('currentTenant', 'firstName lastName fullName phoneNumber')
      .sort({ roomNumber: 1 });
  }

  // Get rental history for a room
  async getRentalHistory(roomId) {
    const room = await Room.findById(roomId)
      .populate('rentalHistory.tenant', 'firstName lastName fullName phoneNumber email')
      .select('roomNumber rentalHistory');
    
    if (!room) {
      throw new Error('Room not found');
    }

    return room.rentalHistory.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  }

  // Bulk update rooms
  async bulkUpdate(filter, updateData) {
    return Room.updateMany(filter, updateData);
  }

  // Get room occupancy report
  async getOccupancyReport() {
    return Room.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$roomType',
          totalRooms: { $sum: 1 },
          totalCapacity: { $sum: '$capacity' },
          currentOccupancy: { $sum: '$occupancy.current' },
          availableRooms: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$status', 'available'] },
                    { $lt: ['$occupancy.current', '$occupancy.max'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          averageRent: { $avg: '$monthlyRent' },
          totalRentValue: { $sum: '$monthlyRent' },
        }
      },
      {
        $addFields: {
          occupancyRate: {
            $multiply: [
              { $divide: ['$currentOccupancy', '$totalCapacity'] },
              100
            ]
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);
  }
}

module.exports = new RoomRepository();