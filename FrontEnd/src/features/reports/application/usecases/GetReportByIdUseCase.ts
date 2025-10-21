import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { Report } from '../../domain/entities/Report';

export class GetReportByIdUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string): Promise<Report> {
    if (!reportId?.trim()) {
      throw new Error('Report ID is required');
    }

    return await this.reportsRepository.getReportById(reportId);
  }
}