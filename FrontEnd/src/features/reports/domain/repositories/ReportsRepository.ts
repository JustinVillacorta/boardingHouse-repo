import type { 
  Report, 
  CreateReportRequest, 
  UpdateReportStatusRequest, 
  ReportFilters, 
  ReportStatistics 
} from '../entities/Report';

export interface ReportsRepository {
  getAllReports(filters?: ReportFilters): Promise<{
    reports: Report[];
    pagination?: {
      currentPage: number;
      totalPages: number;
      totalCount: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>;
  
  getMyReports(filters?: ReportFilters): Promise<Report[]>;
  
  getReportById(id: string): Promise<Report>;
  
  createReport(reportData: CreateReportRequest): Promise<Report>;
  
  updateReportStatus(id: string, statusData: UpdateReportStatusRequest): Promise<Report>;
  
  getReportStatistics(): Promise<ReportStatistics>;
}