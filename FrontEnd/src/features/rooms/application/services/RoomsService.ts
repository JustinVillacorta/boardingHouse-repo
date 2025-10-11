import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
import { GetRoomsUseCase } from '../usecases/GetRoomsUseCase';
import { CreateRoomUseCase } from '../usecases/CreateRoomUseCase';
import { DeleteRoomUseCase } from '../usecases/DeleteRoomUseCase';
import { GetRoomStatisticsUseCase } from '../usecases/GetRoomStatisticsUseCase';
import type { 
  Room, 
  CreateRoomRequest, 
  RoomFilters, 
  RoomStatistics
} from '../../domain/entities/Room';

export class RoomsService {
  private getRoomsUseCase: GetRoomsUseCase;
  private createRoomUseCase: CreateRoomUseCase;
  private deleteRoomUseCase: DeleteRoomUseCase;
  private getRoomStatisticsUseCase: GetRoomStatisticsUseCase;

  constructor(roomsRepository: RoomsRepository) {
    this.getRoomsUseCase = new GetRoomsUseCase(roomsRepository);
    this.createRoomUseCase = new CreateRoomUseCase(roomsRepository);
    this.deleteRoomUseCase = new DeleteRoomUseCase(roomsRepository);
    this.getRoomStatisticsUseCase = new GetRoomStatisticsUseCase(roomsRepository);
  }

  async getRooms(filters?: RoomFilters): Promise<{ rooms: Room[]; pagination?: any }> {
    return this.getRoomsUseCase.execute(filters);
  }

  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    return this.createRoomUseCase.execute(roomData);
  }

  async deleteRoom(id: string): Promise<void> {
    return this.deleteRoomUseCase.execute(id);
  }

  async getRoomStatistics(): Promise<RoomStatistics> {
    return this.getRoomStatisticsUseCase.execute();
  }
}
