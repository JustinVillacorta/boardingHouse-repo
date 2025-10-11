import type { ReportsRepository } from '../../domain/repositories/ReportsRepository';
import type { 
  Report, 
  CreateReportRequest, 
  UpdateReportStatusRequest, 
  ReportFilters, 
  ReportStatistics 
} from '../../domain/entities/Report';

// Create an interface for the API service to work with TypeScript
interface ApiServiceInterface {
  getReports(params?: Record<string, any>): Promise<{ data: any }>;
  getMyReports(params?: Record<string, any>): Promise<{ data: any }>;
  createReport(reportData: any): Promise<{ data: any }>;
  updateReportStatus(id: string, status: any): Promise<{ data: any }>;
  getReportStats(): Promise<{ data: any }>;
  request(endpoint: string, options?: any): Promise<{ data: any }>;
}

export class ReportsRepositoryImpl implements ReportsRepository {
  private apiService: ApiServiceInterface;

  constructor(apiService: ApiServiceInterface) {
    this.apiService = apiService;
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
    try {
      const params: Record<string, any> = {};
      
      if (filters?.status) params.status = filters.status;
      if (filters?.type) params.type = filters.type;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.search) params.search = filters.search;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await this.apiService.getReports(params);
      
      // Handle the backend response structure: { data: { reports: [...], pagination: {...} } }
      const responseData = response.data;
      const reports: Report[] = responseData.reports || [];
      const pagination = responseData.pagination;
      
      return {
        reports,
        pagination: pagination ? {
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          totalCount: pagination.totalReports,
          hasNextPage: pagination.hasNextPage,
          hasPrevPage: pagination.hasPrevPage,
        } : undefined
      };
    } catch (error) {
      console.error('Error fetching all reports:', error);
      throw new Error('Failed to fetch reports');
    }
  }

  async getMyReports(filters?: ReportFilters): Promise<Report[]> {
    try {
      const params: Record<string, any> = {};
      
      if (filters?.status) params.status = filters.status;
      if (filters?.type) params.type = filters.type;
      if (filters?.search) params.search = filters.search;
      if (filters?.page) params.page = filters.page;
      if (filters?.limit) params.limit = filters.limit;
      if (filters?.sortBy) params.sortBy = filters.sortBy;
      if (filters?.sortOrder) params.sortOrder = filters.sortOrder;

      const response = await this.apiService.getMyReports(params);
      
      // Debug: Log the response structure
      console.log('Tenant Reports API Response:', response);
      
      // Backend returns: { success: true, message: "...", data: { reports: [...], pagination: {...} } }
      const responseData = response.data;
      const reportsData = responseData?.reports || [];
      
      // Ensure we have an array
      if (!Array.isArray(reportsData)) {
        console.error('Expected array but got:', typeof reportsData, reportsData);
        return [];
      }
      
      // Map backend response to domain entities
      return reportsData.map((report: any) => ({
        _id: report._id,
        id: report._id,
        tenant: {
          _id: report.tenant?._id || 'unknown',
          userId: report.tenant?.userId || {
            _id: 'unknown',
            username: 'unknown',
            email: 'unknown@example.com',
            role: 'tenant',
            isActive: true
          },
          firstName: report.tenant?.firstName || 'Unknown',
          lastName: report.tenant?.lastName || 'User',
          phoneNumber: report.tenant?.phoneNumber || 'N/A',
          email: report.tenant?.email || 'unknown@example.com'
        },
        room: {
          _id: report.room?._id || 'unknown',
          roomNumber: report.room?.roomNumber || 'N/A',
          roomType: report.room?.roomType || 'Unknown',
          isAvailable: report.room?.isAvailable || false,
          occupancyRate: report.room?.occupancyRate || 0
        },
        type: report.type,
        title: report.title,
        description: report.description,
        status: report.status,
        submittedAt: report.submittedAt,
        updatedAt: report.updatedAt || report.submittedAt,
        daysSinceSubmission: report.daysSinceSubmission || 0
      }));
    } catch (error) {
      console.error('Error fetching my reports:', error);
      throw new Error('Failed to fetch your reports');
    }
  }

  async getReportById(id: string): Promise<Report> {
    try {
      const response = await this.apiService.request(`/reports/${id}`, {
        method: 'GET'
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching report by ID:', error);
      throw new Error('Failed to fetch report');
    }
  }

  async createReport(reportData: CreateReportRequest): Promise<Report> {
    try {
      const response = await this.apiService.createReport(reportData);
      return response.data;
    } catch (error) {
      console.error('Error creating report:', error);
      throw new Error('Failed to create report');
    }
  }

  async updateReportStatus(id: string, statusData: UpdateReportStatusRequest): Promise<Report> {
    try {
      // Use the specific status update endpoint
      const response = await this.apiService.updateReportStatus(id, statusData.status);
      return response.data;
    } catch (error) {
      console.error('Error updating report status:', error);
      throw new Error('Failed to update report status');
    }
  }

  async getReportStatistics(): Promise<ReportStatistics> {
    try {
      // Try to use the dashboard reports endpoint first
      try {
        const response = await this.apiService.getReportStats();
        
        // Transform the dashboard stats to match our interface
        if (response.data && response.data.byStatus) {
          return {
            total: response.data.total || 0,
            pending: response.data.byStatus.pending || 0,
            inProgress: response.data.byStatus.inProgress || response.data.byStatus['in-progress'] || 0,
            resolved: response.data.byStatus.resolved || 0,
            rejected: response.data.byStatus.rejected || 0,
            maintenance: response.data.byType?.maintenance || 0,
            complaint: response.data.byType?.complaint || 0,
            other: response.data.byType?.other || 0,
          };
        }
      } catch (dashboardError) {
        console.warn('Dashboard stats not available, calculating from reports data');
      }
      
      // Fallback: calculate statistics from the reports data
      const response = await this.apiService.getReports({});
      const responseData = response.data;
      const reports: Report[] = responseData.reports || [];
      
      const stats: ReportStatistics = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        inProgress: reports.filter(r => r.status === 'in-progress').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        rejected: reports.filter(r => r.status === 'rejected').length,
        maintenance: reports.filter(r => r.type === 'maintenance').length,
        complaint: reports.filter(r => r.type === 'complaint').length,
        other: reports.filter(r => r.type === 'other').length,
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching report statistics:', error);
      throw new Error('Failed to fetch report statistics');
    }
  }
}

// Export factory function
export const createReportsRepository = (apiService: ApiServiceInterface): ReportsRepository => {
  return new ReportsRepositoryImpl(apiService);
};