import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
import type { CreateRoomRequest, Room } from '../../domain/entities/Room';

export class CreateRoomUseCase {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(roomData: CreateRoomRequest): Promise<Room> {
    try {
      // Validate room data
      this.validateRoomData(roomData);

      const response = await this.roomsRepository.createRoom(roomData);

      if (!response.success) {
        throw new Error(response.message || 'Failed to create room');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateRoomData(roomData: CreateRoomRequest): void {
    if (!roomData.roomNumber?.trim()) {
      throw new Error('Room number is required');
    }
    if (!roomData.roomType || !['single', 'double', 'shared', 'suite'].includes(roomData.roomType)) {
      throw new Error('Room type must be one of: single, double, shared, suite');
    }
    if (!roomData.capacity || roomData.capacity < 1) {
      throw new Error('Capacity must be at least 1');
    }
    if (roomData.monthlyRent < 0) {
      throw new Error('Monthly rent cannot be negative');
    }
    if (roomData.floor && roomData.floor < 0) {
      throw new Error('Floor cannot be negative');
    }
    if (roomData.area && roomData.area < 0) {
      throw new Error('Area cannot be negative');
    }
  }
}
