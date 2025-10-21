import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { ReportStatistics } from '../../domain/entities/Report';

export class GetReportStatisticsUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(): Promise<ReportStatistics> {
    return await this.reportsRepository.getReportStatistics();
  }
}