import type { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import type { DashboardStats } from '../../domain/entities/DashboardStats';
import type { RoomOccupancy } from '../../domain/entities/RoomOccupancy';
import type { PaymentStatistics } from '../../domain/entities/PaymentStatistics';
import type { ReportStatistics } from '../../domain/entities/ReportStatistics';

// Create an interface for the API service to work with TypeScript
interface ApiServiceInterface {
  getDashboardStats(): Promise<{ data: DashboardStats }>;
  getOccupancyData(): Promise<{ data: RoomOccupancy }>;
  getPaymentStats(): Promise<{ data: PaymentStatistics }>;
  getReportStats(): Promise<{ data: ReportStatistics }>;
}

export class DashboardRepositoryImpl implements DashboardRepository {
  private apiService: ApiServiceInterface;

  constructor(apiService: ApiServiceInterface) {
    this.apiService = apiService;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await this.apiService.getDashboardStats();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      throw new Error('Failed to fetch dashboard statistics');
    }
  }

  async getRoomOccupancyData(): Promise<RoomOccupancy> {
    try {
      const response = await this.apiService.getOccupancyData();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch room occupancy data:', error);
      throw new Error('Failed to fetch room occupancy data');
    }
  }

  async getPaymentStatistics(): Promise<PaymentStatistics> {
    try {
      const response = await this.apiService.getPaymentStats();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch payment statistics:', error);
      throw new Error('Failed to fetch payment statistics');
    }
  }

  async getReportStatistics(): Promise<ReportStatistics> {
    try {
      const response = await this.apiService.getReportStats();
      return response.data;
    } catch (error) {
      console.error('Failed to fetch report statistics:', error);
      throw new Error('Failed to fetch report statistics');
    }
  }
}

// We'll export a factory function instead of a singleton
export const createDashboardRepository = (apiService: ApiServiceInterface): DashboardRepository => {
  return new DashboardRepositoryImpl(apiService);
};