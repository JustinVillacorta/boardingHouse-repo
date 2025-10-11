import type { TenantProfile, UpdateContactInfoRequest, UpdatePasswordRequest } from '../entities/TenantProfile';

export interface TenantProfileRepository {
  getTenantProfile(): Promise<TenantProfile>;
  updateContactInfo(contactInfo: UpdateContactInfoRequest): Promise<TenantProfile>;
  updatePassword(passwordData: UpdatePasswordRequest): Promise<void>;
}
