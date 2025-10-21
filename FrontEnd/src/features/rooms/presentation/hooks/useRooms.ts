import { useState, useCallback, useRef } from 'react';
import { RoomsService } from '../../application/services/RoomsService';
import { RoomsRepositoryImpl } from '../../infrastructure/repositories/RoomsRepositoryImpl';
import type { 
  Room, 
  CreateRoomRequest, 
  UpdateRoomRequest,
  RoomFilters
} from '../../domain/entities/Room';

export const useRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to store service instance to prevent recreation
  const roomsServiceRef = useRef<RoomsService | null>(null);
  if (!roomsServiceRef.current) {
    roomsServiceRef.current = new RoomsService(new RoomsRepositoryImpl());
  }
  const roomsService = roomsServiceRef.current;

  const fetchRooms = useCallback(async (filters?: RoomFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Check if user is authenticated before making API call
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view rooms');
        setRooms([]);
        return;
      }
      
      const result = await roomsService.getRooms(filters);
      
      // Handle case where no rooms are returned or result is malformed
      if (!result || !result.rooms) {
        console.error('Invalid response structure:', result);
        setError('Invalid response from server');
        setRooms([]);
        return;
      }
      
      if (result.rooms.length === 0) {
        setRooms([]);
        return;
      }
      
      // Transform backend response to match frontend expectations
      const transformedRooms = result.rooms.map((room: any) => {
        const isOccupied = room.status?.toLowerCase() === 'occupied';
        const isVacant = room.status?.toLowerCase() === 'vacant';
        
        return {
          _id: room.id || room._id,
          roomNumber: room.roomnumber || room.roomNumber || 'N/A',
          roomType: (room.roomtype || room.roomType || 'single').toLowerCase(),
          capacity: room.capacity || 1,
          monthlyRent: parseFloat(room.price || room.monthlyRent || 0),
          description: room.description || '',
          amenities: room.amenities || [],
          floor: room.floor || 0,
          area: room.area || 0,
          status: (isOccupied ? 'occupied' : 'available') as 'occupied' | 'available' | 'maintenance' | 'reserved' | 'unavailable',
          occupancy: {
            current: isOccupied ? 1 : 0,
            max: room.capacity || 1
          },
          occupancyRate: isOccupied ? 
                        (1 / (room.capacity || 1)) * 100 : 0,
          isAvailable: isVacant,
          isActive: room.isActive !== false, // Default to true if not specified
          currentTenants: isOccupied && room.assignee ? [room.assignee] : [],
          createdAt: room.createdAt,
          updatedAt: room.updatedAt
        };
      });
      
      setRooms(transformedRooms);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch rooms');
    } finally {
      setIsLoading(false);
    }
  }, [roomsService]);

  const createRoom = useCallback(async (roomData: CreateRoomRequest): Promise<Room> => {
    try {
      setError(null);
      const newRoom = await roomsService.createRoom(roomData);
      // Refresh the rooms list after successful creation
      await fetchRooms();
      return newRoom;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [roomsService, fetchRooms]);

  const updateRoom = useCallback(async (id: string, roomData: UpdateRoomRequest): Promise<Room> => {
    try {
      setError(null);
      const updatedRoom = await roomsService.updateRoom(id, roomData);
      // Refresh the rooms list after successful update
      await fetchRooms();
      return updatedRoom;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [roomsService, fetchRooms]);

  const deleteRoom = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await roomsService.deleteRoom(id);
      // Refresh the rooms list after successful deletion
      await fetchRooms();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [roomsService, fetchRooms]);

  return {
    rooms,
    isLoading,
    error,
    fetchRooms,
    createRoom,
    updateRoom,
    deleteRoom,
    setError
  };
};
