import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
import type { UpdateRoomRequest, Room } from '../../domain/entities/Room';

export class UpdateRoomUseCase {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(id: string, roomData: UpdateRoomRequest): Promise<Room> {
    try {
      // Validate room ID
      if (!id?.trim()) {
        throw new Error('Room ID is required');
      }

      // Validate room data
      this.validateRoomData(roomData);

      const response = await this.roomsRepository.updateRoom(id, roomData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to update room');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to update room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateRoomData(roomData: UpdateRoomRequest): void {
    if (roomData.roomNumber !== undefined && !roomData.roomNumber?.trim()) {
      throw new Error('Room number cannot be empty');
    }
    if (roomData.roomType !== undefined && !['single', 'double', 'triple', 'quad', 'suite', 'studio'].includes(roomData.roomType)) {
      throw new Error('Room type must be one of: single, double, triple, quad, suite, studio');
    }
    if (roomData.status !== undefined && !['available', 'occupied', 'maintenance', 'reserved', 'unavailable'].includes(roomData.status)) {
      throw new Error('Status must be one of: available, occupied, maintenance, reserved, unavailable');
    }
    if (roomData.capacity !== undefined && roomData.capacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
    if (roomData.monthlyRent !== undefined && roomData.monthlyRent < 0) {
      throw new Error('Monthly rent cannot be negative');
    }
    if (roomData.floor !== undefined && roomData.floor < 0) {
      throw new Error('Floor cannot be negative');
    }
    if (roomData.area !== undefined && roomData.area < 0) {
      throw new Error('Area cannot be negative');
    }
  }
}