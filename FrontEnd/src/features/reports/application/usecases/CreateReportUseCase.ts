import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { CreateReportRequest, Report } from '../../domain/entities/Report';

export class CreateReportUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportData: CreateReportRequest): Promise<Report> {
    // Validate required fields
    if (!reportData.title?.trim()) {
      throw new Error('Title is required');
    }
    
    if (!reportData.description?.trim()) {
      throw new Error('Description is required');
    }
    
    if (!reportData.type) {
      throw new Error('Report type is required');
    }

    return await this.reportsRepository.createReport(reportData);
  }
}