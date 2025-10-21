import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { Report, ReportFilters } from '../../domain/entities/Report';

export class GetAllReportsUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(filters?: ReportFilters): Promise<{
    reports: Report[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    return await this.reportsRepository.getAllReports(filters);
  }
}