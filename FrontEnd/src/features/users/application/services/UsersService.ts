import { GetUsersUseCase } from '../usecases/GetUsersUseCase';
import { CreateUserUseCase } from '../usecases/CreateUserUseCase';
import { UsersRepository } from '../../domain/repositories/UsersRepository';
import { User, CreateUserRequest, CreateTenantRequest, UserFilters } from '../../domain/entities/User';

export class UsersService {
  private getUsersUseCase: GetUsersUseCase;
  private createUserUseCase: CreateUserUseCase;

  constructor(usersRepository: UsersRepository) {
    this.getUsersUseCase = new GetUsersUseCase(usersRepository);
    this.createUserUseCase = new CreateUserUseCase(usersRepository);
  }

  async getUsers(filters?: UserFilters): Promise<User[]> {
    return this.getUsersUseCase.execute(filters);
  }

  async createUser(userData: CreateUserRequest | CreateTenantRequest): Promise<User> {
    return this.createUserUseCase.execute(userData);
  }
}
