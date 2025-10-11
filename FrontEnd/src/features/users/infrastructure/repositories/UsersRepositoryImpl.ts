import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { User, CreateUserRequest, CreateTenantRequest, UserFilters } from '../../domain/entities/User';
import apiService from '../../../../services/apiService';

export class UsersRepositoryImpl implements UsersRepository {
  async getUsers(filters?: UserFilters): Promise<{ success: boolean; data: User[]; message?: string }> {
    try {
      const params = new URLSearchParams();
      if (filters?.role) params.append('role', filters.role);
      if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
      if (filters?.page) params.append('page', filters.page.toString());
      if (filters?.limit) params.append('limit', filters.limit.toString());

      const queryString = params.toString();
      const response = await apiService.getUsers(queryString ? `?${queryString}` : '');
      
      return {
        success: response.success || false,
        data: response.data || [],
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  async createUser(userData: CreateUserRequest): Promise<{ success: boolean; data: User; message?: string }> {
    try {
      const response = await apiService.registerUser(userData);
      
      return {
        success: response.success || false,
        data: response.data?.user || response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as User,
        message: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  }

  async createTenant(tenantData: CreateTenantRequest): Promise<{ success: boolean; data: User; message?: string }> {
    try {
      const response = await apiService.registerTenant(tenantData);
      
      return {
        success: response.success || false,
        data: response.data?.user || response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as User,
        message: error instanceof Error ? error.message : 'Failed to create tenant'
      };
    }
  }

  async getUserById(id: string): Promise<{ success: boolean; data: User; message?: string }> {
    try {
      const response = await apiService.getUserById(id);
      
      return {
        success: response.success || false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as User,
        message: error instanceof Error ? error.message : 'Failed to get user'
      };
    }
  }

  async updateUser(id: string, userData: Partial<User>): Promise<{ success: boolean; data: User; message?: string }> {
    try {
      const response = await apiService.updateUser(id, userData);
      
      return {
        success: response.success || false,
        data: response.data,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        data: {} as User,
        message: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  }

  async deleteUser(id: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await apiService.deleteUser(id);
      
      return {
        success: response.success || false,
        message: response.message
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }
}
