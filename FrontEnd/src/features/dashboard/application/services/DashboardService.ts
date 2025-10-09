import type { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import type { DashboardStats } from '../../domain/entities/DashboardStats';
import type { RoomOccupancy } from '../../domain/entities/RoomOccupancy';
import type { PaymentStatistics } from '../../domain/entities/PaymentStatistics';
import type { ReportStatistics } from '../../domain/entities/ReportStatistics';

import { GetDashboardStatsUseCase } from '../usecases/GetDashboardStatsUseCase';
import { GetOccupancyDataUseCase } from '../usecases/GetOccupancyDataUseCase';
import { GetPaymentStatsUseCase } from '../usecases/GetPaymentStatsUseCase';
import { GetReportStatsUseCase } from '../usecases/GetReportStatsUseCase';

export class DashboardService {
  private getDashboardStatsUseCase: GetDashboardStatsUseCase;
  private getOccupancyDataUseCase: GetOccupancyDataUseCase;
  private getPaymentStatsUseCase: GetPaymentStatsUseCase;
  private getReportStatsUseCase: GetReportStatsUseCase;

  constructor(dashboardRepository: DashboardRepository) {
    this.getDashboardStatsUseCase = new GetDashboardStatsUseCase(dashboardRepository);
    this.getOccupancyDataUseCase = new GetOccupancyDataUseCase(dashboardRepository);
    this.getPaymentStatsUseCase = new GetPaymentStatsUseCase(dashboardRepository);
    this.getReportStatsUseCase = new GetReportStatsUseCase(dashboardRepository);
  }

  async getDashboardStats(): Promise<DashboardStats> {
    return await this.getDashboardStatsUseCase.execute();
  }

  async getRoomOccupancyData(): Promise<RoomOccupancy> {
    return await this.getOccupancyDataUseCase.execute();
  }

  async getPaymentStatistics(): Promise<PaymentStatistics> {
    return await this.getPaymentStatsUseCase.execute();
  }

  async getReportStatistics(): Promise<ReportStatistics> {
    return await this.getReportStatsUseCase.execute();
  }

  // Aggregate method to get all dashboard data at once
  async getAllDashboardData() {
    try {
      const [stats, occupancy, payments, reports] = await Promise.all([
        this.getDashboardStats(),
        this.getRoomOccupancyData(),
        this.getPaymentStatistics(),
        this.getReportStatistics(),
      ]);

      return { stats, occupancy, payments, reports };
    } catch (error) {
      console.error('Failed to fetch all dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
}