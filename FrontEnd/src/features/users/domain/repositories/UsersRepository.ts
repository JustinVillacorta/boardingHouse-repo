import { User, CreateUserRequest, CreateTenantRequest, UserFilters } from '../entities/User';

export interface UsersRepository {
  getUsers(filters?: UserFilters): Promise<{ success: boolean; data: User[]; message?: string }>;
  createUser(userData: CreateUserRequest): Promise<{ success: boolean; data: User; message?: string }>;
  createTenant(tenantData: CreateTenantRequest): Promise<{ success: boolean; data: User; message?: string }>;
  getUserById(id: string): Promise<{ success: boolean; data: User; message?: string }>;
  updateUser(id: string, userData: Partial<User>): Promise<{ success: boolean; data: User; message?: string }>;
  deleteUser(id: string): Promise<{ success: boolean; message?: string }>;
}
