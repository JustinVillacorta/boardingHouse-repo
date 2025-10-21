import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
import type { Room, RoomFilters } from '../../domain/entities/Room';

export class GetRoomsUseCase {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(filters?: RoomFilters): Promise<{ rooms: Room[]; pagination?: any }> {
    try {
      const response = await this.roomsRepository.getRooms(filters);
      
      // Debug: Log the repository response in use case
      console.log('=== Use Case Debug ===');
      console.log('Repository response:', response);
      console.log('Response.rooms:', response.rooms);
      console.log('Response.pagination:', response.pagination);
      console.log('====================');
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch rooms');
      }

      return {
        rooms: response.rooms || [],
        pagination: response.pagination
      };
    } catch (error) {
      throw new Error(`Failed to get rooms: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
