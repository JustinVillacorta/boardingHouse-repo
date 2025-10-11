import { useState, useEffect } from 'react';
import { UsersService } from '../../application/services/UsersService';
import { UsersRepositoryImpl } from '../../infrastructure/repositories/UsersRepositoryImpl';
import { User, CreateUserRequest, CreateTenantRequest, UserFilters } from '../../domain/entities/User';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service with repository
  const usersService = new UsersService(new UsersRepositoryImpl());

  const fetchUsers = async (filters?: UserFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      const fetchedUsers = await usersService.getUsers(filters);
      setUsers(fetchedUsers);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const createUser = async (userData: CreateUserRequest | CreateTenantRequest): Promise<User> => {
    try {
      setError(null);
      const newUser = await usersService.createUser(userData);
      // Refresh the users list after successful creation
      await fetchUsers();
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    createUser,
    setError
  };
};
