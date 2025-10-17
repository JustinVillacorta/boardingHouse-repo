const { validationResult } = require('express-validator');
const roomService = require('../services/roomService');
const {
  sendSuccess,
  sendError,
  sendCreated,
  sendNotFound,
  sendUnauthorized,
  sendServerError,
} = require('../utils/response');

class RoomController {
  // POST /api/rooms - Create room (admin/staff)
  async createRoom(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const roomData = req.body;
      const room = await roomService.createRoom(roomData);

      return sendCreated(res, 'Room created successfully', { room });
    } catch (error) {
      console.error('Create room error:', error);

      if (error.message.includes('already exists')) {
        return sendError(res, error.message, 409);
      }

      return sendServerError(res, 'Failed to create room');
    }
  }

  // GET /api/rooms - Get all rooms with tenant information
  async getAllRooms(req, res) {
    try {
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 50,
        sortBy: req.query.sortBy || 'roomNumber',
        sortOrder: req.query.sortOrder || 'asc',
        status: req.query.status,
        roomType: req.query.roomType,
        floor: req.query.floor ? parseInt(req.query.floor) : undefined,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity) : undefined,
        minRent: req.query.minRent ? parseFloat(req.query.minRent) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent) : undefined,
        isAvailable: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      };

      const result = await roomService.getAllRoomsWithTenants(options);
      
      // Format for frontend compatibility
      const formattedRooms = result.rooms.map(room => ({
        id: room._id,
        roomnumber: room.roomNumber,
        roomtype: room.roomType.charAt(0).toUpperCase() + room.roomType.slice(1),
        price: room.monthlyRent.toFixed(2),
        assignee: room.tenant ? room.tenant.name : 'Vacant',
        status: room.status === 'available' ? 'Vacant' : 'Occupied',
        dateStarted: room.tenant ? room.tenant.leaseStartDate?.toISOString().split('T')[0] : room.createdAt.toISOString().split('T')[0],
        // Full room details for detailed views
        capacity: room.capacity,
        floor: room.floor,
        amenities: room.amenities,
        description: room.description,
        tenant: room.tenant,
        createdAt: room.createdAt,
        updatedAt: room.updatedAt
      }));

      return sendSuccess(res, 'Rooms retrieved successfully', {
        rooms: formattedRooms,
        pagination: result.pagination,
        total: result.total
      });
    } catch (error) {
      console.error('Get all rooms error:', error);
      return sendServerError(res, 'Failed to retrieve rooms');
    }
  }

  // GET /api/rooms/:id - Get specific room
  async getRoomById(req, res) {
    try {
      const { id } = req.params;
      const room = await roomService.getRoomById(id);

      if (!room) {
        return sendNotFound(res, 'Room not found');
      }

      return sendSuccess(res, 'Room retrieved successfully', { room });
    } catch (error) {
      console.error('Get room by ID error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to retrieve room');
    }
  }

  // PUT /api/rooms/:id - Update room (admin/staff)
  async updateRoom(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const room = await roomService.updateRoom(id, updateData);
      return sendSuccess(res, 'Room updated successfully', { room });
    } catch (error) {
      console.error('Update room error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      if (error.message.includes('already exists')) {
        return sendError(res, error.message, 409);
      }

      return sendServerError(res, 'Failed to update room');
    }
  }

  // DELETE /api/rooms/:id - Delete room (admin/staff)
  async deleteRoom(req, res) {
    try {
      const { id } = req.params;
      const result = await roomService.deleteRoom(id);

      return sendSuccess(res, result.message);
    } catch (error) {
      console.error('Delete room error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      if (error.message.includes('Cannot delete room')) {
        return sendError(res, error.message, 400);
      }

      return sendServerError(res, 'Failed to delete room');
    }
  }

  // GET /api/rooms/available - Get available rooms
  async getAvailableRooms(req, res) {
    try {
      const options = {
        roomType: req.query.roomType,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent) : undefined,
        floor: req.query.floor ? parseInt(req.query.floor) : undefined,
      };

      const rooms = await roomService.getAvailableRooms(options);
      return sendSuccess(res, 'Available rooms retrieved successfully', { 
        rooms,
        count: rooms.length 
      });
    } catch (error) {
      console.error('Get available rooms error:', error);
      return sendServerError(res, 'Failed to retrieve available rooms');
    }
  }

  // POST /api/rooms/:id/assign - Assign tenant to room (admin/staff)
  async assignTenantToRoom(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id: roomId } = req.params;
      const { tenantId, rentAmount } = req.body;

      const result = await roomService.assignTenantToRoom(roomId, tenantId, rentAmount);
      return sendSuccess(res, result.message, { room: result.room });
    } catch (error) {
      console.error('Assign tenant to room error:', error);

      if (error.message.includes('not found')) {
        return sendNotFound(res, error.message);
      }

      if (
        error.message.includes('already assigned') ||
        error.message.includes('full capacity') ||
        error.message.includes('maintenance')
      ) {
        return sendError(res, error.message, 400);
      }

      return sendServerError(res, 'Failed to assign tenant to room');
    }
  }

  // POST /api/rooms/:id/unassign - Remove tenant from room (admin/staff)
  async unassignTenantFromRoom(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id: roomId } = req.params;
      const { tenantId } = req.body;

      const result = await roomService.unassignTenantFromRoom(roomId, tenantId);
      return sendSuccess(res, result.message, { room: result.room });
    } catch (error) {
      console.error('Unassign tenant from room error:', error);

      if (error.message.includes('not found')) {
        return sendNotFound(res, error.message);
      }

      if (error.message.includes('not currently assigned')) {
        return sendError(res, error.message, 400);
      }

      return sendServerError(res, 'Failed to unassign tenant from room');
    }
  }

  // GET /api/rooms/statistics - Get room statistics (admin/staff)
  async getRoomStatistics(req, res) {
    try {
      const statistics = await roomService.getRoomStatistics();
      return sendSuccess(res, 'Room statistics retrieved successfully', { statistics });
    } catch (error) {
      console.error('Get room statistics error:', error);
      return sendServerError(res, 'Failed to retrieve room statistics');
    }
  }

  // GET /api/rooms/occupancy-report - Get room occupancy report (admin/staff)
  async getRoomOccupancyReport(req, res) {
    try {
      const report = await roomService.getRoomOccupancyReport();
      return sendSuccess(res, 'Room occupancy report retrieved successfully', { 
        report,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Get room occupancy report error:', error);
      return sendServerError(res, 'Failed to retrieve room occupancy report');
    }
  }

  // GET /api/rooms/search - Search rooms
  async searchRooms(req, res) {
    try {
      const searchCriteria = {
        query: req.query.q || req.query.query,
        status: req.query.status,
        roomType: req.query.roomType,
        minRent: req.query.minRent ? parseFloat(req.query.minRent) : undefined,
        maxRent: req.query.maxRent ? parseFloat(req.query.maxRent) : undefined,
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity) : undefined,
        floor: req.query.floor ? parseInt(req.query.floor) : undefined,
        amenities: req.query.amenities ? req.query.amenities.split(',') : undefined,
        isAvailable: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      };

      const rooms = await roomService.searchRooms(searchCriteria);
      return sendSuccess(res, 'Room search completed successfully', { 
        rooms,
        count: rooms.length,
        searchCriteria: Object.fromEntries(
          Object.entries(searchCriteria).filter(([_, value]) => value !== undefined)
        )
      });
    } catch (error) {
      console.error('Search rooms error:', error);
      return sendServerError(res, 'Failed to search rooms');
    }
  }

  // GET /api/rooms/by-status/:status - Get rooms by status (admin/staff)
  async getRoomsByStatus(req, res) {
    try {
      const { status } = req.params;
      const rooms = await roomService.getRoomsByStatus(status);

      return sendSuccess(res, `Rooms with status '${status}' retrieved successfully`, { 
        rooms,
        status,
        count: rooms.length 
      });
    } catch (error) {
      console.error('Get rooms by status error:', error);

      if (error.message === 'Invalid room status') {
        return sendError(res, error.message, 400);
      }

      return sendServerError(res, 'Failed to retrieve rooms by status');
    }
  }

  // GET /api/rooms/:id/history - Get room rental history (admin/staff)
  async getRoomRentalHistory(req, res) {
    try {
      const { id } = req.params;
      const history = await roomService.getRoomRentalHistory(id);

      return sendSuccess(res, 'Room rental history retrieved successfully', { 
        roomId: id,
        history,
        count: history.length 
      });
    } catch (error) {
      console.error('Get room rental history error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to retrieve room rental history');
    }
  }

  // GET /api/rooms/maintenance/due - Get rooms due for maintenance (admin/staff)
  async getRoomsDueForMaintenance(req, res) {
    try {
      const daysAhead = req.query.days ? parseInt(req.query.days) : 30;
      const rooms = await roomService.getRoomsDueForMaintenance(daysAhead);

      return sendSuccess(res, `Rooms due for maintenance in next ${daysAhead} days retrieved successfully`, { 
        rooms,
        daysAhead,
        count: rooms.length 
      });
    } catch (error) {
      console.error('Get rooms due for maintenance error:', error);
      return sendServerError(res, 'Failed to retrieve rooms due for maintenance');
    }
  }

  // PUT /api/rooms/:id/maintenance - Update room maintenance (admin/staff)
  async updateRoomMaintenance(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const maintenanceData = req.body;

      const room = await roomService.updateRoomMaintenance(id, maintenanceData);
      return sendSuccess(res, 'Room maintenance updated successfully', { room });
    } catch (error) {
      console.error('Update room maintenance error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to update room maintenance');
    }
  }

  // POST /api/rooms/:id/tenants - Assign multiple tenants to room (admin/staff)
  async assignTenantsToRoom(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id } = req.params;
      const { tenants } = req.body; // Array of tenant assignments

      const room = await roomService.assignMultipleTenantsToRoom(id, tenants);
      return sendSuccess(res, 'Tenants assigned to room successfully', { room });
    } catch (error) {
      console.error('Assign tenants to room error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      if (error.message.includes('capacity') || error.message.includes('already assigned')) {
        return sendError(res, error.message, 409);
      }

      return sendServerError(res, 'Failed to assign tenants to room');
    }
  }

  // DELETE /api/rooms/:id/tenants/:tenantId - Remove tenant from room (admin/staff)
  async removeTenantFromRoom(req, res) {
    try {
      const { id, tenantId } = req.params;

      const room = await roomService.removeTenantFromRoom(id, tenantId);
      return sendSuccess(res, 'Tenant removed from room successfully', { room });
    } catch (error) {
      console.error('Remove tenant from room error:', error);

      if (error.message === 'Room not found' || error.message.includes('not assigned')) {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to remove tenant from room');
    }
  }

  // PUT /api/rooms/:id/tenants/:tenantId/security-deposit - Update security deposit (admin/staff)
  async updateSecurityDeposit(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id, tenantId } = req.params;
      const securityDepositUpdates = req.body;

      const room = await roomService.updateSecurityDeposit(id, tenantId, securityDepositUpdates);
      return sendSuccess(res, 'Security deposit updated successfully', { room });
    } catch (error) {
      console.error('Update security deposit error:', error);

      if (error.message === 'Room not found' || error.message.includes('not assigned')) {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to update security deposit');
    }
  }

  // POST /api/rooms/:id/tenants/:tenantId/security-deposit/deductions - Add security deposit deduction (admin/staff)
  async addSecurityDepositDeduction(req, res) {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return sendError(res, 'Validation failed', 400, {
          errors: errors.array(),
        });
      }

      const { id, tenantId } = req.params;
      const { reason, amount } = req.body;

      const room = await roomService.addSecurityDepositDeduction(id, tenantId, reason, amount);
      return sendSuccess(res, 'Security deposit deduction added successfully', { room });
    } catch (error) {
      console.error('Add security deposit deduction error:', error);

      if (error.message === 'Room not found' || error.message.includes('not found')) {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to add security deposit deduction');
    }
  }

  // GET /api/rooms/:id/tenants - Get all tenants in a room (admin/staff)
  async getRoomTenants(req, res) {
    try {
      const { id } = req.params;
      const includeInactive = req.query.includeInactive === 'true';

      const tenants = await roomService.getRoomTenants(id, includeInactive);
      return sendSuccess(res, 'Room tenants retrieved successfully', { tenants });
    } catch (error) {
      console.error('Get room tenants error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to retrieve room tenants');
    }
  }

  // GET /api/rooms/:id/security-deposits - Get security deposits summary for room (admin/staff)
  async getRoomSecurityDeposits(req, res) {
    try {
      const { id } = req.params;

      const securityDeposits = await roomService.getRoomSecurityDeposits(id);
      return sendSuccess(res, 'Room security deposits retrieved successfully', { securityDeposits });
    } catch (error) {
      console.error('Get room security deposits error:', error);

      if (error.message === 'Room not found') {
        return sendNotFound(res, error.message);
      }

      return sendServerError(res, 'Failed to retrieve room security deposits');
    }
  }
}

module.exports = new RoomController();