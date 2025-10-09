export interface TenantStats {
  total: number;
  active: number;
  inactive: number;
  expiringLeases: number;
}

export interface RoomStats {
  total: number;
  occupied: number;
  available: number;
  maintenance: number;
  occupancyRate: number;
}

export interface PaymentStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  totalAmount: number;
  thisMonthAmount: number;
}

export interface ReportStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface NotificationSummary {
  type: string;
  status: string;
  priority: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: NotificationSummary[];
}

export interface DashboardStats {
  tenants: TenantStats;
  rooms: RoomStats;
  payments: PaymentStats;
  reports: ReportStats;
  notifications: NotificationStats;
  lastUpdated: string;
}