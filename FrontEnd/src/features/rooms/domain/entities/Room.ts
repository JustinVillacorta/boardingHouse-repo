export interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'suite' | 'studio';
  capacity: number;
  monthlyRent: number;
  description?: string;
  amenities: string[];
  floor?: number;
  area?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
  isAvailable: boolean;
  currentTenant?: {
    _id: string;
    name: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
  } | null;
  occupancy: {
    current: number;
    max: number;
  };
  occupancyRate: number;
  maintenance?: {
    lastServiceDate?: string;
    nextServiceDate?: string;
    notes?: string;
  };
  rentalHistory?: {
    tenant: string;
    startDate: string;
    endDate: string;
    rentAmount: number;
  }[];
  photos?: {
    url: string;
    description?: string;
    isPrimary?: boolean;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomRequest {
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'suite' | 'studio';
  capacity: number;
  monthlyRent: number;
  description?: string;
  amenities?: string[];
  floor?: number;
  area?: number;
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
}

export interface UpdateRoomRequest {
  roomNumber?: string;
  roomType?: 'single' | 'double' | 'triple' | 'quad' | 'suite' | 'studio';
  capacity?: number;
  monthlyRent?: number;
  description?: string;
  amenities?: string[];
  floor?: number;
  area?: number;
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
}

export interface RoomFilters {
  status?: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
  roomType?: 'single' | 'double' | 'triple' | 'quad' | 'suite' | 'studio';
  minRent?: number;
  maxRent?: number;
  floor?: number;
  page?: number;
  limit?: number;
  search?: string;
}

export interface RoomStatistics {
  overview: {
    totalRooms: number;
    availableRooms: number;
    occupiedRooms: number;
    maintenanceRooms: number;
    reservedRooms: number;
    unavailableRooms: number;
  };
  occupancy: {
    totalCapacity: number;
    currentOccupancy: number;
    occupancyRate: number;
    availableSpots: number;
  };
  financial: {
    averageRent: number;
    totalRentValue: number;
    potentialRevenue: number;
  };
}
