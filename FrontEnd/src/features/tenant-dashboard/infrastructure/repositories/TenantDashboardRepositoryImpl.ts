import type { TenantDashboardRepository } from '../../domain/repositories/TenantDashboardRepository';
import type { TenantDashboardData, QuickAction } from '../../domain/entities/TenantDashboard';

export class TenantDashboardRepositoryImpl implements TenantDashboardRepository {
  async getDashboardData(): Promise<TenantDashboardData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      roomInfo: { 
        roomNumber: "203", 
        roomType: "Single Room" 
      },
      monthlyRent: 3450,
      nextPaymentDue: "2024-02-01",
      daysRemaining: 4,
      accountStatus: "Active",
      recentActivity: [
        { 
          id: "1",
          type: "payment", 
          description: "₱3,450 rent payment for January", 
          status: "Paid", 
          time: "2 hours ago" 
        },
        { 
          id: "2",
          type: "maintenance", 
          description: "AC Repair Update", 
          status: "In Progress", 
          time: "14 hours ago" 
        },
        { 
          id: "3",
          type: "payment", 
          description: "Payment Due Soon", 
          status: "Pending", 
          time: "1 day ago" 
        }
      ]
    };
  }

  async getQuickActions(): Promise<QuickAction[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    return [
      {
        id: "1",
        title: "View Payment History",
        description: "Check your payment records",
        icon: "dollar-sign",
        path: "/tenant/payments",
        variant: "secondary"
      },
      {
        id: "2",
        title: "Submit Maintenance Request",
        description: "Report issues or request repairs",
        icon: "wrench",
        path: "/tenant/reports",
        variant: "secondary"
      },
      {
        id: "3",
        title: "Update Profile",
        description: "Manage your account information",
        icon: "user",
        path: "/tenant/profile",
        variant: "secondary"
      }
    ];
  }
}
