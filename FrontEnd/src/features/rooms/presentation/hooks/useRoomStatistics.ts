import { useState } from 'react';
import { RoomsService } from '../../application/services/RoomsService';
import { RoomsRepositoryImpl } from '../../infrastructure/repositories/RoomsRepositoryImpl';
import type { RoomStatistics } from '../../domain/entities/Room';

export const useRoomStatistics = () => {
  const [statistics, setStatistics] = useState<RoomStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize service with repository
  const roomsService = new RoomsService(new RoomsRepositoryImpl());

  const getRoomStatistics = async (): Promise<RoomStatistics> => {
    try {
      setIsLoading(true);
      setError(null);
      const stats = await roomsService.getRoomStatistics();
      setStatistics(stats);
      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to get room statistics';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    statistics,
    isLoading,
    error,
    getRoomStatistics,
    setError
  };
};
