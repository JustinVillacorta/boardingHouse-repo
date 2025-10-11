import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';

export class DeleteRoomUseCase {
  constructor(private roomsRepository: RoomsRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const response = await this.roomsRepository.deleteRoom(id);

      if (!response.success) {
        throw new Error(response.message || 'Failed to delete room');
      }
    } catch (error) {
      throw new Error(`Failed to delete room: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
