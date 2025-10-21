const express = require('express');
const roomController = require('../controllers/roomController');
const { authenticate, requireAdmin, requireAdminOrStaff } = require('../middleware/auth');
const {
  validateRoomCreate,
  validateRoomUpdate,
  validateRoomTenantAssignment,
  validateRoomTenantUnassignment,
  validateRoomMaintenanceUpdate,
} = require('../middleware/validation');

const router = express.Router();

// All room routes require authentication
router.use(authenticate);

// GET /api/rooms/statistics - Get room statistics (admin/staff only)
router.get('/statistics', requireAdminOrStaff, roomController.getRoomStatistics);

// GET /api/rooms/occupancy-report - Get room occupancy report (admin/staff only)
router.get('/occupancy-report', requireAdminOrStaff, roomController.getRoomOccupancyReport);

// GET /api/rooms/available - Get available rooms
router.get('/available', roomController.getAvailableRooms);

// GET /api/rooms/search - Search rooms
router.get('/search', roomController.searchRooms);

// GET /api/rooms/maintenance/due - Get rooms due for maintenance (admin/staff only)
router.get('/maintenance/due', requireAdminOrStaff, roomController.getRoomsDueForMaintenance);

// GET /api/rooms/by-status/:status - Get rooms by status (admin/staff only)
router.get('/by-status/:status', requireAdminOrStaff, roomController.getRoomsByStatus);

// POST /api/rooms - Create room (admin/staff only)
router.post('/', requireAdminOrStaff, validateRoomCreate, roomController.createRoom);

// GET /api/rooms - Get all rooms
router.get('/', roomController.getAllRooms);

// GET /api/rooms/:id/history - Get room rental history (admin/staff only)
router.get('/:id/history', requireAdminOrStaff, roomController.getRoomRentalHistory);

// PUT /api/rooms/:id/maintenance - Update room maintenance (admin/staff only)
router.put('/:id/maintenance', requireAdminOrStaff, validateRoomMaintenanceUpdate, roomController.updateRoomMaintenance);

// POST /api/rooms/:id/assign - Assign tenant to room (admin/staff only)
router.post('/:id/assign', requireAdminOrStaff, validateRoomTenantAssignment, roomController.assignTenantToRoom);

// POST /api/rooms/:id/unassign - Remove tenant from room (admin/staff only)
router.post('/:id/unassign', requireAdminOrStaff, validateRoomTenantUnassignment, roomController.unassignTenantFromRoom);

// GET /api/rooms/:id - Get specific room
router.get('/:id', roomController.getRoomById);

// PUT /api/rooms/:id - Update room (admin/staff only)
router.put('/:id', requireAdminOrStaff, validateRoomUpdate, roomController.updateRoom);

// DELETE /api/rooms/:id - Delete room (admin/staff only)
router.delete('/:id', requireAdminOrStaff, roomController.deleteRoom);

module.exports = router;