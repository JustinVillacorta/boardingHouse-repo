export interface ContactInfo {
  fullName: string;
  email: string;
  phoneNumber: string;
  emergencyContact: string;
}

export interface TenancyInfo {
  roomNumber: string;
  roomType: string;
  monthlyRent: number;
  leaseStartDate: string;
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
}

export interface TenantProfile {
  contactInfo: ContactInfo;
  tenancyInfo: TenancyInfo;
}

export interface UpdateContactInfoRequest {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  emergencyContact?: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
