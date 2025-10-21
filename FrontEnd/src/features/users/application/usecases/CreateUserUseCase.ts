import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { CreateUserRequest, CreateTenantRequest, User } from '../../domain/entities/User';

export class CreateUserUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(userData: CreateUserRequest | CreateTenantRequest): Promise<User> {
    try {
      // Validate common fields
      this.validateCommonFields(userData);

      let response;
      
      if (userData.role === 'tenant') {
        // Validate tenant-specific fields
        this.validateTenantFields(userData as CreateTenantRequest);
        response = await this.usersRepository.createTenant(userData as CreateTenantRequest);
      } else {
        response = await this.usersRepository.createUser(userData);
      }

      if (!response.success) {
        throw new Error(response.message || 'Failed to create user');
      }

      return response.data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private validateCommonFields(userData: CreateUserRequest): void {
    if (!userData.username?.trim()) {
      throw new Error('Username is required');
    }
    if (!userData.email?.trim()) {
      throw new Error('Email is required');
    }
    if (!userData.password) {
      throw new Error('Password is required');
    }
    if (userData.password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    if (!userData.role || !['staff', 'tenant'].includes(userData.role)) {
      throw new Error('Role must be either staff or tenant');
    }
  }

  private validateTenantFields(userData: CreateTenantRequest): void {
    if (!userData.firstName?.trim()) {
      throw new Error('First name is required');
    }
    if (!userData.lastName?.trim()) {
      throw new Error('Last name is required');
    }
    if (!userData.phoneNumber?.trim()) {
      throw new Error('Phone number is required');
    }
    if (!userData.dateOfBirth) {
      throw new Error('Date of birth is required');
    }
    if (!userData.idNumber?.trim()) {
      throw new Error('ID number is required');
    }
    if (!userData.emergencyContact?.name?.trim()) {
      throw new Error('Emergency contact name is required');
    }
    if (!userData.emergencyContact?.phoneNumber?.trim()) {
      throw new Error('Emergency contact phone is required');
    }
  }
}
