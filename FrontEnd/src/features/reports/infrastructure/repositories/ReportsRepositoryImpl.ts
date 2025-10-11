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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Return static data for tenant reports
      const staticReports: Report[] = [
        {
          _id: "1",
          id: "1",
          tenant: {
            _id: "tenant1",
            userId: {
              _id: "user1",
              username: "gelo",
              email: "gelo@example.com",
              role: "tenant",
              isActive: true
            },
            firstName: "Gelo",
            lastName: "User",
            phoneNumber: "555-0101",
            email: "gelo@example.com"
          },
          room: {
            _id: "room1",
            roomNumber: "203",
            roomType: "Single Room",
            isAvailable: false,
            occupancyRate: 100
          },
          type: "maintenance",
          title: "Light Bulb",
          description: "Bedroom light bulb needs replacement",
          status: "pending",
          submittedAt: "2024-01-20T10:00:00Z",
          updatedAt: "2024-01-20T10:00:00Z",
          daysSinceSubmission: 5
        },
        {
          _id: "2",
          id: "2",
          tenant: {
            _id: "tenant1",
            userId: {
              _id: "user1",
              username: "gelo",
              email: "gelo@example.com",
              role: "tenant",
              isActive: true
            },
            firstName: "Gelo",
            lastName: "User",
            phoneNumber: "555-0101",
            email: "gelo@example.com"
          },
          room: {
            _id: "room1",
            roomNumber: "203",
            roomType: "Single Room",
            isAvailable: false,
            occupancyRate: 100
          },
          type: "maintenance",
          title: "Air Conditioning",
          description: "AC not cooling properly",
          status: "in-progress",
          submittedAt: "2024-01-15T14:30:00Z",
          updatedAt: "2024-01-18T09:15:00Z",
          daysSinceSubmission: 10
        },
        {
          _id: "3",
          id: "3",
          tenant: {
            _id: "tenant1",
            userId: {
              _id: "user1",
              username: "gelo",
              email: "gelo@example.com",
              role: "tenant",
              isActive: true
            },
            firstName: "Gelo",
            lastName: "User",
            phoneNumber: "555-0101",
            email: "gelo@example.com"
          },
          room: {
            _id: "room1",
            roomNumber: "203",
            roomType: "Single Room",
            isAvailable: false,
            occupancyRate: 100
          },
          type: "maintenance",
          title: "Leaky Faucet",
          description: "Bathroom faucet drips constantly",
          status: "resolved",
          submittedAt: "2024-01-10T08:00:00Z",
          updatedAt: "2024-01-12T16:45:00Z",
          daysSinceSubmission: 15
        },
        {
          _id: "4",
          id: "4",
          tenant: {
            _id: "tenant1",
            userId: {
              _id: "user1",
              username: "gelo",
              email: "gelo@example.com",
              role: "tenant",
              isActive: true
            },
            firstName: "Gelo",
            lastName: "User",
            phoneNumber: "555-0101",
            email: "gelo@example.com"
          },
          room: {
            _id: "room1",
            roomNumber: "203",
            roomType: "Single Room",
            isAvailable: false,
            occupancyRate: 100
          },
          type: "complaint",
          title: "Loud Noise On Next Room",
          description: "Noise complaint at room 382",
          status: "pending",
          submittedAt: "2024-01-20T22:00:00Z",
          updatedAt: "2024-01-20T22:00:00Z",
          daysSinceSubmission: 5
        }
      ];

      // Apply filters if provided
      let filteredReports = staticReports;
      
      if (filters?.status) {
        filteredReports = filteredReports.filter(report => report.status === filters.status);
      }
      
      if (filters?.type) {
        filteredReports = filteredReports.filter(report => report.type === filters.type);
      }
      
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredReports = filteredReports.filter(report => 
          report.title.toLowerCase().includes(searchTerm) ||
          report.description.toLowerCase().includes(searchTerm)
        );
      }

      return filteredReports;
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