import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
import { GetRoomsUseCase } from '../usecases/GetRoomsUseCase';
import { CreateRoomUseCase } from '../usecases/CreateRoomUseCase';
import { UpdateRoomUseCase } from '../usecases/UpdateRoomUseCase';
import { DeleteRoomUseCase } from '../usecases/DeleteRoomUseCase';
import { GetRoomStatisticsUseCase } from '../usecases/GetRoomStatisticsUseCase';
import type { 
  Room, 
  CreateRoomRequest, 
  UpdateRoomRequest,
  RoomFilters, 
  RoomStatistics
} from '../../domain/entities/Room';

export class RoomsService {
  private getRoomsUseCase: GetRoomsUseCase;
  private createRoomUseCase: CreateRoomUseCase;
  private updateRoomUseCase: UpdateRoomUseCase;
  private deleteRoomUseCase: DeleteRoomUseCase;
  private getRoomStatisticsUseCase: GetRoomStatisticsUseCase;

  constructor(roomsRepository: RoomsRepository) {
    this.getRoomsUseCase = new GetRoomsUseCase(roomsRepository);
    this.createRoomUseCase = new CreateRoomUseCase(roomsRepository);
    this.updateRoomUseCase = new UpdateRoomUseCase(roomsRepository);
    this.deleteRoomUseCase = new DeleteRoomUseCase(roomsRepository);
    this.getRoomStatisticsUseCase = new GetRoomStatisticsUseCase(roomsRepository);
  }

  async getRooms(filters?: RoomFilters): Promise<{ rooms: Room[]; pagination?: any }> {
    return this.getRoomsUseCase.execute(filters);
  }

  async createRoom(roomData: CreateRoomRequest): Promise<Room> {
    return this.createRoomUseCase.execute(roomData);
  }

  async updateRoom(id: string, roomData: UpdateRoomRequest): Promise<Room> {
    return this.updateRoomUseCase.execute(id, roomData);
  }

  async deleteRoom(id: string): Promise<void> {
    return this.deleteRoomUseCase.execute(id);
  }

  async getRoomStatistics(): Promise<RoomStatistics> {
    return this.getRoomStatisticsUseCase.execute();
  }
}
