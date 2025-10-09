// Type definitions for apiService
export interface ApiResponse<T = any> {
  data: T;
  status?: number;
  message?: string;
}

export interface ApiService {
  baseURL: string;
  
  getAuthToken(): string | null;
  
  request<T = any>(endpoint: string, options?: RequestInit & {
    headers?: Record<string, string>;
  }): Promise<ApiResponse<T>>;
  
  get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  
  post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  
  put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>>;
  
  delete<T = any>(endpoint: string): Promise<ApiResponse<T>>;
  
  // Authentication methods
  login(credentials: { email: string; password: string }): Promise<ApiResponse<any>>;
  logout(): Promise<ApiResponse<any>>;
  
  // Dashboard methods
  getDashboardStats(): Promise<ApiResponse<any>>;
  getOccupancyData(): Promise<ApiResponse<any>>;
  getPaymentStatistics(): Promise<ApiResponse<any>>;
  getTenantStatistics(): Promise<ApiResponse<any>>;
  getMaintenanceRequests(): Promise<ApiResponse<any>>;
  
  // Reports methods
  getReports(params?: Record<string, any>): Promise<ApiResponse<any>>;
  createReport(reportData: any): Promise<ApiResponse<any>>;
  updateReportStatus(id: string, statusData: any): Promise<ApiResponse<any>>;
  getReportStats(): Promise<ApiResponse<any>>;
}

declare const apiService: ApiService;
export default apiService;