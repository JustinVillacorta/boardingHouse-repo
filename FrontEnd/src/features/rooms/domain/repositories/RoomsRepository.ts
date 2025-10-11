import type { 
  Room, 
  CreateRoomRequest, 
  UpdateRoomRequest, 
  RoomFilters, 
  RoomStatistics
} from '../entities/Room';

export interface RoomsRepository {
  getRooms(filters?: RoomFilters): Promise<{ success: boolean; data: { rooms: Room[]; pagination?: any }; message?: string }>;
  getRoomById(id: string): Promise<{ success: boolean; data: Room; message?: string }>;
  createRoom(roomData: CreateRoomRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  updateRoom(id: string, roomData: UpdateRoomRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  deleteRoom(id: string): Promise<{ success: boolean; message?: string }>;
  getRoomStatistics(): Promise<{ success: boolean; data: RoomStatistics; message?: string }>;
}
