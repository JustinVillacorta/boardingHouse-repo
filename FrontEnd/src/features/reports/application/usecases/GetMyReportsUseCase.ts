import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { Report, ReportFilters } from '../../domain/entities/Report';

export class GetMyReportsUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(filters?: ReportFilters): Promise<Report[]> {
    return await this.reportsRepository.getMyReports(filters);
  }
}