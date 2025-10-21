export interface RoomInfo {
  roomNumber: string;
  roomType: string;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'maintenance' | 'announcement';
  description: string;
  status: 'Paid' | 'In Progress' | 'Completed' | 'Pending';
  time: string;
}

export interface TenantDashboardData {
  roomInfo: RoomInfo;
  monthlyRent: number;
  nextPaymentDue: string;
  daysRemaining: number;
  accountStatus: 'Active' | 'Inactive' | 'Suspended';
  recentActivity: RecentActivity[];
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  variant: 'primary' | 'secondary';
}
