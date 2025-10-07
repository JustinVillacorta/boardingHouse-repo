const roomRepository = require('../repositories/roomRepository');
const tenantRepository = require('../repositories/tenantRepository');

class RoomService {
  // Create new room
  async createRoom(roomData) {
    try {
      // Validate room number availability
      const isAvailable = await roomRepository.isRoomNumberAvailable(roomData.roomNumber);
      if (!isAvailable) {
        throw new Error('Room number already exists');
      }

      // Set default occupancy.max to capacity if not provided
      if (!roomData.occupancy) {
        roomData.occupancy = {};
      }
      if (!roomData.occupancy.max) {
        roomData.occupancy.max = roomData.capacity;
      }

      const room = await roomRepository.create(roomData);
      return this.formatRoomResponse(room);
    } catch (error) {
      throw error;
    }
  }

  // Get all rooms with filters and pagination
  async getAllRooms(options = {}) {
    try {
      const result = await roomRepository.findAll(options);
      
      return {
        rooms: result.rooms.map(room => this.formatRoomResponse(room)),
        pagination: result.pagination,
      };
    } catch (error) {
      throw error;
    }
  }

  // Get all rooms with tenant information for frontend
  async getAllRoomsWithTenants(options = {}) {
    try {
      const result = await roomRepository.findAllWithTenants(options);
      
      return {
        rooms: result.rooms,
        pagination: result.pagination,
        total: result.total
      };
    } catch (error) {
      throw error;
    }
  }

  // Get room by ID
  async getRoomById(roomId) {
    try {
      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }
      return this.formatRoomResponse(room);
    } catch (error) {
      throw error;
    }
  }

  // Update room
  async updateRoom(roomId, updateData) {
    try {
      // Check if room exists
      const existingRoom = await roomRepository.findById(roomId);
      if (!existingRoom) {
        throw new Error('Room not found');
      }

      // If updating room number, check availability
      if (updateData.roomNumber && updateData.roomNumber !== existingRoom.roomNumber) {
        const isAvailable = await roomRepository.isRoomNumberAvailable(updateData.roomNumber, roomId);
        if (!isAvailable) {
          throw new Error('Room number already exists');
        }
      }

      // Update occupancy.max if capacity is being updated
      if (updateData.capacity && !updateData.occupancy?.max) {
        updateData.occupancy = { 
          ...existingRoom.occupancy?.toObject(), 
          max: updateData.capacity 
        };
      }

      const room = await roomRepository.updateById(roomId, updateData);
      return this.formatRoomResponse(room);
    } catch (error) {
      throw error;
    }
  }

  // Delete room (soft delete)
  async deleteRoom(roomId) {
    try {
      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Check if room has current tenants
      if (room.currentTenant) {
        throw new Error('Cannot delete room with current tenant. Please unassign tenant first.');
      }

      await roomRepository.deleteById(roomId);
      return { message: 'Room deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get available rooms
  async getAvailableRooms(options = {}) {
    try {
      const rooms = await roomRepository.findAvailable(options);
      return rooms.map(room => this.formatRoomResponse(room));
    } catch (error) {
      throw error;
    }
  }

  // Assign tenant to room
  async assignTenantToRoom(roomId, tenantId, rentAmount) {
    try {
      // Validate room exists
      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Validate tenant exists
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check if tenant is already assigned to a room
      const tenantCurrentRoom = await roomRepository.findAll({ 
        currentTenant: tenantId,
        status: 'occupied',
        page: 1,
        limit: 1 
      });
      
      if (tenantCurrentRoom.rooms.length > 0) {
        throw new Error('Tenant is already assigned to another room');
      }

      // Check room availability
      if (!room.canAccommodate()) {
        throw new Error('Room is at full capacity or under maintenance');
      }

      // Assign tenant to room
      await roomRepository.assignTenant(roomId, tenantId, rentAmount);

      // Update tenant's room information
      await tenantRepository.updateById(tenantId, { 
        roomNumber: room.roomNumber,
        monthlyRent: rentAmount || room.monthlyRent,
        tenantStatus: 'active'
      });

      // Return updated room info
      const updatedRoom = await roomRepository.findById(roomId);
      return {
        room: this.formatRoomResponse(updatedRoom),
        message: 'Tenant assigned to room successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Unassign tenant from room
  async unassignTenantFromRoom(roomId, tenantId) {
    try {
      // Validate room exists
      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      // Validate tenant exists
      const tenant = await tenantRepository.findById(tenantId);
      if (!tenant) {
        throw new Error('Tenant not found');
      }

      // Check if tenant is currently in this room
      if (!room.currentTenant || room.currentTenant.toString() !== tenantId) {
        throw new Error('Tenant is not currently assigned to this room');
      }

      // Unassign tenant from room
      await roomRepository.unassignTenant(roomId, tenantId);

      // Update tenant's room information
      await tenantRepository.updateById(tenantId, { 
        roomNumber: null,
        tenantStatus: 'inactive'
      });

      // Return updated room info
      const updatedRoom = await roomRepository.findById(roomId);
      return {
        room: this.formatRoomResponse(updatedRoom),
        message: 'Tenant unassigned from room successfully'
      };
    } catch (error) {
      throw error;
    }
  }

  // Get room statistics
  async getRoomStatistics() {
    try {
      const stats = await roomRepository.getStatistics();
      return {
        overview: {
          totalRooms: stats.totalRooms,
          availableRooms: stats.availableRooms,
          occupiedRooms: stats.occupiedRooms,
          maintenanceRooms: stats.maintenanceRooms,
          reservedRooms: stats.totalRooms - stats.availableRooms - stats.occupiedRooms - stats.maintenanceRooms,
        },
        occupancy: {
          totalCapacity: stats.totalCapacity,
          currentOccupancy: stats.currentOccupancy,
          occupancyRate: Math.round(stats.occupancyRate * 100) / 100,
          availableSpots: stats.totalCapacity - stats.currentOccupancy,
        },
        financial: {
          averageRent: Math.round(stats.averageRent * 100) / 100,
          totalRentValue: stats.totalRentValue,
          potentialRevenue: stats.totalCapacity * stats.averageRent,
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Get room occupancy report
  async getRoomOccupancyReport() {
    try {
      const report = await roomRepository.getOccupancyReport();
      return report.map(typeData => ({
        roomType: typeData._id,
        totalRooms: typeData.totalRooms,
        totalCapacity: typeData.totalCapacity,
        currentOccupancy: typeData.currentOccupancy,
        availableRooms: typeData.availableRooms,
        occupancyRate: Math.round(typeData.occupancyRate * 100) / 100,
        averageRent: Math.round(typeData.averageRent * 100) / 100,
        totalRentValue: typeData.totalRentValue,
      }));
    } catch (error) {
      throw error;
    }
  }

  // Search rooms
  async searchRooms(searchCriteria) {
    try {
      const rooms = await roomRepository.search(searchCriteria);
      return rooms.map(room => this.formatRoomResponse(room));
    } catch (error) {
      throw error;
    }
  }

  // Get rooms by status
  async getRoomsByStatus(status) {
    try {
      const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
      if (!validStatuses.includes(status)) {
        throw new Error('Invalid room status');
      }

      const rooms = await roomRepository.findByStatus(status);
      return rooms.map(room => this.formatRoomResponse(room));
    } catch (error) {
      throw error;
    }
  }

  // Get rooms due for maintenance
  async getRoomsDueForMaintenance(daysAhead = 30) {
    try {
      const rooms = await roomRepository.findDueForMaintenance(daysAhead);
      return rooms.map(room => this.formatRoomResponse(room));
    } catch (error) {
      throw error;
    }
  }

  // Get room rental history
  async getRoomRentalHistory(roomId) {
    try {
      const history = await roomRepository.getRentalHistory(roomId);
      return history.map(record => ({
        tenant: {
          id: record.tenant._id,
          name: record.tenant.fullName,
          phoneNumber: record.tenant.phoneNumber,
          email: record.tenant.email,
        },
        startDate: record.startDate,
        endDate: record.endDate,
        rentAmount: record.rentAmount,
        duration: record.endDate 
          ? Math.ceil((record.endDate - record.startDate) / (1000 * 60 * 60 * 24))
          : Math.ceil((new Date() - record.startDate) / (1000 * 60 * 60 * 24)),
      }));
    } catch (error) {
      throw error;
    }
  }

  // Update room maintenance status
  async updateRoomMaintenance(roomId, maintenanceData) {
    try {
      const room = await roomRepository.findById(roomId);
      if (!room) {
        throw new Error('Room not found');
      }

      const updateData = {
        maintenance: {
          ...room.maintenance?.toObject(),
          ...maintenanceData
        }
      };

      // If setting maintenance status, update room status
      if (maintenanceData.status === 'maintenance') {
        updateData.status = 'maintenance';
      } else if (maintenanceData.status === 'completed' && room.status === 'maintenance') {
        // Set to available if no current tenants, otherwise occupied
        updateData.status = room.occupancy.current > 0 ? 'occupied' : 'available';
      }

      const updatedRoom = await roomRepository.updateById(roomId, updateData);
      return this.formatRoomResponse(updatedRoom);
    } catch (error) {
      throw error;
    }
  }

  // Format room response (remove sensitive data)
  formatRoomResponse(room) {
    if (!room) return null;

    const formattedRoom = {
      id: room._id,
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      monthlyRent: room.monthlyRent,
      description: room.description,
      amenities: room.amenities,
      floor: room.floor,
      area: room.area,
      status: room.status,
      occupancy: {
        current: room.occupancy?.current || 0,
        max: room.occupancy?.max || room.capacity,
      },
      isAvailable: room.isAvailable,
      occupancyRate: Math.round(room.occupancyRate * 100) / 100,
      primaryPhoto: room.primaryPhoto,
      photos: room.photos,
      maintenance: room.maintenance,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    };

    // Include current tenant info if populated
    if (room.currentTenant) {
      formattedRoom.currentTenant = {
        id: room.currentTenant._id,
        name: room.currentTenant.fullName,
        phoneNumber: room.currentTenant.phoneNumber,
        email: room.currentTenant.email,
      };
    }

    return formattedRoom;
  }

  // Helper method to validate room data
  validateRoomData(roomData) {
    const errors = [];

    if (!roomData.roomNumber) {
      errors.push('Room number is required');
    }

    if (!roomData.roomType) {
      errors.push('Room type is required');
    }

    if (!roomData.capacity || roomData.capacity < 1) {
      errors.push('Room capacity must be at least 1');
    }

    if (!roomData.monthlyRent || roomData.monthlyRent < 0) {
      errors.push('Monthly rent must be a positive number');
    }

    const validRoomTypes = ['single', 'double', 'triple', 'quad', 'suite', 'studio'];
    if (roomData.roomType && !validRoomTypes.includes(roomData.roomType)) {
      errors.push('Invalid room type');
    }

    const validStatuses = ['available', 'occupied', 'maintenance', 'reserved'];
    if (roomData.status && !validStatuses.includes(roomData.status)) {
      errors.push('Invalid room status');
    }

    return errors;
  }
}

module.exports = new RoomService();