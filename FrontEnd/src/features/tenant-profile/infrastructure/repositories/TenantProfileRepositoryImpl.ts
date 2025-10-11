import type { TenantProfileRepository } from '../../domain/repositories/TenantProfileRepository';
import type { TenantProfile, UpdateContactInfoRequest, UpdatePasswordRequest } from '../../domain/entities/TenantProfile';

export class TenantProfileRepositoryImpl implements TenantProfileRepository {
  async getTenantProfile(): Promise<TenantProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      contactInfo: {
        fullName: "Gelo User",
        email: "gelo@example.com",
        phoneNumber: "555-0101",
        emergencyContact: "555-0102"
      },
      tenancyInfo: {
        roomNumber: "203",
        roomType: "Single Room",
        monthlyRent: 3450,
        leaseStartDate: "2024-12-31",
        accountStatus: "Active"
      }
    };
  }

  async updateContactInfo(contactInfo: UpdateContactInfoRequest): Promise<TenantProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real implementation, this would make an API call to update the contact info
    console.log('Updating contact info:', contactInfo);

    // Return updated profile (in real implementation, this would come from the API)
    return {
      contactInfo: {
        fullName: contactInfo.fullName || "Gelo User",
        email: contactInfo.email || "gelo@example.com",
        phoneNumber: contactInfo.phoneNumber || "555-0101",
        emergencyContact: contactInfo.emergencyContact || "555-0102"
      },
      tenancyInfo: {
        roomNumber: "203",
        roomType: "Single Room",
        monthlyRent: 3450,
        leaseStartDate: "2024-12-31",
        accountStatus: "Active"
      }
    };
  }

  async updatePassword(passwordData: UpdatePasswordRequest): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    // In a real implementation, this would make an API call to update the password
    console.log('Updating password for user');
  }
}
