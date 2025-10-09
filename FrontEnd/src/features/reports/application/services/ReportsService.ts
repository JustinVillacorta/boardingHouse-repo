import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { 
  Report, 
  CreateReportRequest, 
  ReportFilters, 
  ReportStatistics,
  UpdateReportStatusRequest
} from '../../domain/entities/Report';
import {
  CreateReportUseCase,
  GetAllReportsUseCase,
  GetReportByIdUseCase,
  GetMyReportsUseCase,
  UpdateReportStatusUseCase,
  GetReportStatisticsUseCase
} from '../usecases';

export class ReportsService {
  private createReportUseCase: CreateReportUseCase;
  private getAllReportsUseCase: GetAllReportsUseCase;
  private getReportByIdUseCase: GetReportByIdUseCase;
  private getMyReportsUseCase: GetMyReportsUseCase;
  private updateReportStatusUseCase: UpdateReportStatusUseCase;
  private getReportStatisticsUseCase: GetReportStatisticsUseCase;

  constructor(reportsRepository: ReportsRepository) {
    this.createReportUseCase = new CreateReportUseCase(reportsRepository);
    this.getAllReportsUseCase = new GetAllReportsUseCase(reportsRepository);
    this.getReportByIdUseCase = new GetReportByIdUseCase(reportsRepository);
    this.getMyReportsUseCase = new GetMyReportsUseCase(reportsRepository);
    this.updateReportStatusUseCase = new UpdateReportStatusUseCase(reportsRepository);
    this.getReportStatisticsUseCase = new GetReportStatisticsUseCase(reportsRepository);
  }

  async getAllReports(filters?: ReportFilters): Promise<{
    reports: Report[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }> {
    return await this.getAllReportsUseCase.execute(filters);
  }

  async getMyReports(filters?: ReportFilters): Promise<Report[]> {
    return await this.getMyReportsUseCase.execute(filters);
  }

  async getReportById(id: string): Promise<Report> {
    return await this.getReportByIdUseCase.execute(id);
  }

  async createReport(reportData: CreateReportRequest): Promise<Report> {
    return await this.createReportUseCase.execute(reportData);
  }

  async updateReportStatus(id: string, status: UpdateReportStatusRequest['status']): Promise<Report> {
    return await this.updateReportStatusUseCase.execute(id, status);
  }

  async getReportStatistics(): Promise<ReportStatistics> {
    return await this.getReportStatisticsUseCase.execute();
  }
}