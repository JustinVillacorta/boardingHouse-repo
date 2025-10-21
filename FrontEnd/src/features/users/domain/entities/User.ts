export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'staff' | 'tenant';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'staff' | 'tenant';
}

export interface CreateTenantRequest extends CreateUserRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  roomNumber?: string;
  monthlyRent?: number;
  securityDeposit?: number;
  occupation?: string;
  street?: string;
  province?: string;
  city?: string;
  zipCode?: string;
}

export interface UserFilters {
  role?: 'staff' | 'tenant';
  isActive?: boolean;
  page?: number;
  limit?: number;
}
