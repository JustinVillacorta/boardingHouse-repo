import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
import type { RoomStatistics } from '../../domain/entities/Room';

export class GetRoomStatisticsUseCase {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(): Promise<RoomStatistics> {
    try {
      const response = await this.roomsRepository.getRoomStatistics();

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch room statistics');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to get room statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
