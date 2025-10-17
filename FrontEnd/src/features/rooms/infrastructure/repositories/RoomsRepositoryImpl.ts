import type { RoomsRepository } from '../../domain/repositories/RoomsRepository';
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
} from '../../domain/entities/Room';
import apiService from '../../../../services/apiService';

export class RoomsRepositoryImpl implements RoomsRepository {
  async getRooms(filters?: RoomFilters): Promise<{ success: boolean; data: { rooms: Room[]; pagination?: any }; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.roomType) params.append('roomType', filters.roomType);
      if (filters?.minRent) params.append('minRent', filters.minRent.toString());
      if (filters?.maxRent) params.append('maxRent', filters.maxRent.toString());
      if (filters?.floor) params.append('floor', filters.floor.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());
      if (filters?.search) params.append('search', filters.search);

      const response = await (apiService as any).getRooms(filters);
      
      // Debug: Log the actual API response structure
      console.log('=== API Response Debug ===');
      console.log('Full response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No response');
      console.log('Response.success:', response?.success);
      console.log('Response.data:', response?.data);
      console.log('Response.data?.rooms:', response?.data?.rooms);
      console.log('Response.message:', response?.message);
      console.log('========================');
      
      // Handle different response structures
      if (!response) {
        throw new Error('No response from server');
      }
      
      if (!response.success) {
        throw new Error(response.message || 'API request failed');
      }
      
      // Handle case where data might be directly in response instead of response.data
      let rooms = [];
      let pagination = undefined;
      
      if (response.data?.rooms) {
        // Standard structure: { success: true, data: { rooms: [...], pagination: {...} } }
        rooms = response.data.rooms;
        pagination = response.data.pagination;
        console.log('Using response.data.rooms structure');
      } else if (response.rooms) {
        // Alternative structure: { success: true, rooms: [...], pagination: {...} }
        rooms = response.rooms;
        pagination = response.pagination;
        console.log('Using response.rooms structure');
      } else if (Array.isArray(response)) {
        // Direct array response: [...]
        rooms = response;
        console.log('Using direct array response');
      } else {
        console.error('Unexpected response structure:', response);
        throw new Error('Unexpected response structure from server');
      }
      
      console.log('Final rooms array:', rooms);
      console.log('Final pagination:', pagination);
      
      return {
        success: response.success,
        rooms: rooms,
        pagination: pagination,
        message: response.message
      } as any;
    } catch (error) {
      return {
        success: false,
        rooms: [],
        pagination: undefined,
        message: error instanceof Error ? error.message : 'Failed to fetch rooms'
      } as any;
    }
  }

  async getRoomById(id: string): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await (apiService as any).getRoomById(id);
      
      return {
        success: response.success || false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to get room'
      };
    }
  }

  async createRoom(roomData: CreateRoomRequest): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await (apiService as any).createRoom(roomData);
      
      return {
        success: response.success || false,
        data: response.data?.room || response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to create room'
      };
    }
  }

  async updateRoom(id: string, roomData: UpdateRoomRequest): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await (apiService as any).updateRoom(id, roomData);
      
      return {
        success: response.success || false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to update room'
      };
    }
  }

  async deleteRoom(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await (apiService as any).deleteRoom(id);
      
      return {
        success: response.success || false,
        message: response.message
      } as any;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete room'
      };
    }
  }

  async getRoomStatistics(): Promise<{ success: boolean; data: RoomStatistics; message?: string }> {
    try {
      const response = await apiService.request('/rooms/statistics');
      
      return {
        success: (response as any).success || false,
        data: (response as any).data?.statistics || (response as any).data,
        message: (response as any).message
      } as any;
    } catch (error) {
      return {
        success: false,
        data: {} as RoomStatistics,
        message: error instanceof Error ? error.message : 'Failed to get room statistics'
      } as any;
    }
  }

  // Multiple tenant management methods
  async assignTenantsToRoom(roomId: string, tenants: MultiTenantAssignmentRequest): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await apiService.request(`/rooms/${roomId}/tenants`, {
        method: 'POST',
        body: JSON.stringify(tenants)
      });
      
      return {
        success: (response as any).success || false,
        data: (response as any).data?.room || (response as any).data,
        message: (response as any).message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to assign tenants to room'
      };
    }
  }

  async removeTenantFromRoom(roomId: string, tenantId: string): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await apiService.request(`/rooms/${roomId}/tenants/${tenantId}`, {
        method: 'DELETE'
      });
      
      return {
        success: (response as any).success || false,
        data: (response as any).data?.room || (response as any).data,
        message: (response as any).message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to remove tenant from room'
      };
    }
  }

  async getRoomTenants(roomId: string, includeInactive = false): Promise<{ success: boolean; data: { tenants: RoomTenantSummary[] }; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (includeInactive) params.append('includeInactive', 'true');
      
      const url = `/rooms/${roomId}/tenants${params.toString() ? `?${params.toString()}` : ''}`;
      const response = await apiService.request(url);
      
      return {
        success: (response as any).success || false,
        data: { tenants: (response as any).data?.tenants || [] },
        message: (response as any).message
      };
    } catch (error) {
      return {
        success: false,
        data: { tenants: [] },
        message: error instanceof Error ? error.message : 'Failed to get room tenants'
      };
    }
  }

  // Security deposit management methods
  async updateSecurityDeposit(roomId: string, tenantId: string, updates: SecurityDepositUpdateRequest): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await apiService.request(`/rooms/${roomId}/tenants/${tenantId}/security-deposit`, {
        method: 'PUT',
        body: JSON.stringify(updates)
      });
      
      return {
        success: (response as any).success || false,
        data: (response as any).data?.room || (response as any).data,
        message: (response as any).message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to update security deposit'
      };
    }
  }

  async addSecurityDepositDeduction(roomId: string, tenantId: string, deduction: SecurityDepositDeductionRequest): Promise<{ success: boolean; data: Room; message?: string }> {
    try {
      const response = await apiService.request(`/rooms/${roomId}/tenants/${tenantId}/security-deposit/deductions`, {
        method: 'POST',
        body: JSON.stringify(deduction)
      });
      
      return {
        success: (response as any).success || false,
        data: (response as any).data?.room || (response as any).data,
        message: (response as any).message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as Room,
        message: error instanceof Error ? error.message : 'Failed to add security deposit deduction'
      };
    }
  }

  async getRoomSecurityDeposits(roomId: string): Promise<{ success: boolean; data: { securityDeposits: SecurityDepositSummary[] }; message?: string }> {
    try {
      const response = await apiService.request(`/rooms/${roomId}/security-deposits`);
      
      return {
        success: (response as any).success || false,
        data: { securityDeposits: (response as any).data?.securityDeposits || [] },
        message: (response as any).message
      };
    } catch (error) {
      return {
        success: false,
        data: { securityDeposits: [] },
        message: error instanceof Error ? error.message : 'Failed to get security deposits'
      };
    }
  }
}
