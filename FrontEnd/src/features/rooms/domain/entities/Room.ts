// Room Tenant interface (simplified)
export interface RoomTenant {
  tenant: {
    _id: string;
    name: string;
    email?: string;
    phoneNumber?: string;
  };
  assignedDate: string;
  rentAmount: number;
}

// Room Rental History Entry interface (simplified)
export interface RoomRentalHistoryEntry {
  tenant: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  rentAmount: number;
}

// Tenant assignment request interface (simplified)
export interface TenantAssignmentRequest {
  tenantId: string;
  rentAmount?: number;
}

// Multiple tenant assignment request interface
export interface MultiTenantAssignmentRequest {
  tenants: TenantAssignmentRequest[];
}

export interface Room {
  _id: string;
  roomNumber: string;
  roomType: 'single' | 'double' | 'triple' | 'quad' | 'suite' | 'studio';
  capacity: number;
  monthlyRent: number;
  securityDeposit?: number;
  description?: string;
  amenities: string[];
  floor?: number;
  area?: number;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | 'unavailable';
  isAvailable: boolean;
  // Legacy support for single tenant
  currentTenant?: {
    _id: string;
    name: string;
    leaseStartDate?: string;
    leaseEndDate?: string;
  } | null;
  // New multiple tenant support
  currentTenants?: RoomTenant[];
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
  rentalHistory?: RoomRentalHistoryEntry[];
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
  securityDeposit?: number;
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
  securityDeposit?: number;
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

// Room Tenant Summary interface (for API responses)
export interface RoomTenantSummary {
  tenantId: string;
  userId: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  assignedDate: string;
  endDate?: string;
  rentAmount: number;
  status: 'active' | 'inactive';
}

// Security Deposit related interfaces
export interface SecurityDepositSummary {
  tenantId: string;
  tenantName: string;
  amount: number;
  status: 'pending' | 'received' | 'refunded' | 'forfeited';
  receivedDate?: string;
  deductions?: SecurityDepositDeduction[];
  remainingAmount: number;
}

export interface SecurityDepositDeduction {
  id: string;
  description: string;
  amount: number;
  date: string;
  category: 'damage' | 'cleaning' | 'unpaid_rent' | 'other';
}

export interface SecurityDepositUpdateRequest {
  amount?: number;
  status?: 'pending' | 'received' | 'refunded' | 'forfeited';
  receivedDate?: string;
}

export interface SecurityDepositDeductionRequest {
  description: string;
  amount: number;
  category: 'damage' | 'cleaning' | 'unpaid_rent' | 'other';
}
