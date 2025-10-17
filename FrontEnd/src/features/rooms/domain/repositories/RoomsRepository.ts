import type { 
  Room, 
  CreateRoomRequest, 
  UpdateRoomRequest, 
  RoomFilters, 
  RoomStatistics,
  MultiTenantAssignmentRequest,
  RoomTenantSummary,
  SecurityDepositSummary,
  SecurityDepositUpdateRequest,
  SecurityDepositDeductionRequest
} from '../entities/Room';

export interface RoomsRepository {
  getRooms(filters?: RoomFilters): Promise<{ success: boolean; data: { rooms: Room[]; pagination?: any }; message?: string }>;
  getRoomById(id: string): Promise<{ success: boolean; data: Room; message?: string }>;
  createRoom(roomData: CreateRoomRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  updateRoom(id: string, roomData: UpdateRoomRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  deleteRoom(id: string): Promise<{ success: boolean; message?: string }>;
  getRoomStatistics(): Promise<{ success: boolean; data: RoomStatistics; message?: string }>;
  
  // Multiple tenant management
  assignTenantsToRoom(roomId: string, tenants: MultiTenantAssignmentRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  removeTenantFromRoom(roomId: string, tenantId: string): Promise<{ success: boolean; data: Room; message?: string }>;
  getRoomTenants(roomId: string, includeInactive?: boolean): Promise<{ success: boolean; data: { tenants: RoomTenantSummary[] }; message?: string }>;
  
  // Security deposit management
  updateSecurityDeposit(roomId: string, tenantId: string, updates: SecurityDepositUpdateRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  addSecurityDepositDeduction(roomId: string, tenantId: string, deduction: SecurityDepositDeductionRequest): Promise<{ success: boolean; data: Room; message?: string }>;
  getRoomSecurityDeposits(roomId: string): Promise<{ success: boolean; data: { securityDeposits: SecurityDepositSummary[] }; message?: string }>;
}
