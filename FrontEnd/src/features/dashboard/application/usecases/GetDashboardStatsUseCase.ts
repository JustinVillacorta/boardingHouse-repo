import type { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import type { DashboardStats } from '../../domain/entities/DashboardStats';

export class GetDashboardStatsUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(): Promise<DashboardStats> {
    return await this.dashboardRepository.getDashboardStats();
  }
}