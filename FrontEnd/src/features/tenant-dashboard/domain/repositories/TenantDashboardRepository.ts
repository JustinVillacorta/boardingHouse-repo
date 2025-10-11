import type { TenantDashboardData, QuickAction } from '../entities/TenantDashboard';

export interface TenantDashboardRepository {
  getDashboardData(): Promise<TenantDashboardData>;
  getQuickActions(): Promise<QuickAction[]>;
}
