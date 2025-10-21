import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { User, UserFilters } from '../../domain/entities/User';

export class GetUsersUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute(filters?: UserFilters): Promise<User[]> {
    try {
      const response = await this.usersRepository.getUsers(filters);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch users');
      }

      // Filter out admin users and only return staff and tenant users
      return response.data.filter(user => 
        user.role === 'staff' || user.role === 'tenant'
      );
    } catch (error) {
      throw new Error(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
