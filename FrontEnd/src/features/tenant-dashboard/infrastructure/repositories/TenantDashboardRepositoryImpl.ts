import type { TenantDashboardRepository } from '../../domain/repositories/TenantDashboardRepository';
import type { TenantDashboardData, QuickAction } from '../../domain/entities/TenantDashboard';
import apiService from '@/services/apiService';

export class TenantDashboardRepositoryImpl implements TenantDashboardRepository {
  async getDashboardData(): Promise<TenantDashboardData> {
    try {
      const response = await apiService.getTenantDashboard();
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch dashboard data');
      }

      // Transform the API response to match the TenantDashboardData interface
      const apiData = response.data;
      
      return {
        roomInfo: {
          roomNumber: apiData.roomInfo?.roomNumber || 'N/A',
          roomType: apiData.roomInfo?.roomType || 'N/A'
        },
        monthlyRent: apiData.monthlyRent || 0,
        nextPaymentDue: apiData.nextPaymentDue || 'N/A',
        daysRemaining: apiData.daysRemaining || 0,
        accountStatus: apiData.accountStatus || 'Unknown',
        recentActivity: apiData.recentActivity || []
      };
    } catch (error) {
      console.error('Error fetching tenant dashboard data:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    }
  }

  async getQuickActions(): Promise<QuickAction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      {
        id: "1",
        title: "Pay Rent",
        description: "Make your monthly rent payment",
        icon: "CreditCard",
        path: "/tenant/payments",
        variant: "primary"
      },
      {
        id: "2", 
        title: "Report Issue",
        description: "Submit a maintenance request",
        icon: "Wrench",
        path: "/tenant/reports",
        variant: "secondary"
      },
      {
        id: "3",
        title: "View Notifications",
        description: "Check your latest updates",
        icon: "Bell",
        path: "/tenant/notifications",
        variant: "secondary"
      },
      {
        id: "4",
        title: "Update Profile",
        description: "Manage your personal information",
        icon: "User",
        path: "/tenant/profile",
        variant: "secondary"
      }
    ];
  }
}
