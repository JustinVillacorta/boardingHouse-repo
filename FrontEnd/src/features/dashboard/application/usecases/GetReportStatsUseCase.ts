import type { DashboardRepository } from '../../domain/repositories/DashboardRepository';
import type { ReportStatistics } from '../../domain/entities/ReportStatistics';

export class GetReportStatsUseCase {
  constructor(private dashboardRepository: DashboardRepository) {}

  async execute(): Promise<ReportStatistics> {
    return await this.dashboardRepository.getReportStatistics();
  }
}