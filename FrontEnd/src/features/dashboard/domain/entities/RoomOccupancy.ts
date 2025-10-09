export interface RoomType {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
}

export interface Tenant {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface RoomDetail {
  roomId: string;
  roomNumber: string;
  roomType: string;
  capacity: number;
  status: 'available' | 'occupied' | 'maintenance';
  monthlyRent: number;
  tenant?: Tenant;
  createdAt: string;
  updatedAt: string;
}

export interface RoomOccupancy {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  roomTypes: Record<string, RoomType>;
  roomDetails: RoomDetail[];
}