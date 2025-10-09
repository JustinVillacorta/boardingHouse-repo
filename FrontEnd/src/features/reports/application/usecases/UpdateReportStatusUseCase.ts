import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { Report, ReportStatus, UpdateReportStatusRequest } from '../../domain/entities/Report';

export class UpdateReportStatusUseCase {
  constructor(private reportsRepository: ReportsRepository) {}

  async execute(reportId: string, status: ReportStatus): Promise<Report> {
    if (!reportId?.trim()) {
      throw new Error('Report ID is required');
    }

    if (!status) {
      throw new Error('Status is required');
    }

    // Validate status value
    const validStatuses: ReportStatus[] = ['pending', 'in-progress', 'resolved', 'rejected'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const statusData: UpdateReportStatusRequest = { status };
    return await this.reportsRepository.updateReportStatus(reportId, statusData);
  }
}