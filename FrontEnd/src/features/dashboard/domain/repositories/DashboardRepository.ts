import type { DashboardStats } from '../entities/DashboardStats';
import type { RoomOccupancy } from '../entities/RoomOccupancy';
import type { PaymentStatistics } from '../entities/PaymentStatistics';
import type { ReportStatistics } from '../entities/ReportStatistics';

export interface DashboardRepository {
  getDashboardStats(): Promise<DashboardStats>;
  getRoomOccupancyData(): Promise<RoomOccupancy>;
  getPaymentStatistics(): Promise<PaymentStatistics>;
  getReportStatistics(): Promise<ReportStatistics>;
}