// Type definitions for apiService
export interface ApiResponse<T = any> {
  success: boolean;
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
  getProfile(): Promise<ApiResponse<any>>;
  
  // Dashboard methods
  getDashboardStats(): Promise<ApiResponse<any>>;
  getOccupancyData(): Promise<ApiResponse<any>>;
  getPaymentStats(): Promise<ApiResponse<any>>;
  getReportStats(): Promise<ApiResponse<any>>;
  
  // Users methods
  getUsers(params?: Record<string, any>): Promise<ApiResponse<any>>;
  registerUser(userData: any): Promise<ApiResponse<any>>;
  registerTenant(tenantData: any): Promise<ApiResponse<any>>;
  getUserById(id: string): Promise<ApiResponse<any>>;
  updateUser(id: string, userData: any): Promise<ApiResponse<any>>;
  deleteUser(id: string): Promise<ApiResponse<any>>;
  
  // Rooms methods
  getRooms(params?: Record<string, any>): Promise<ApiResponse<any>>;
  getRoomById(id: string): Promise<ApiResponse<any>>;
  createRoom(roomData: any): Promise<ApiResponse<any>>;
  updateRoom(id: string, roomData: any): Promise<ApiResponse<any>>;
  deleteRoom(id: string): Promise<ApiResponse<any>>;
  
  // Payments methods
  getPayments(params?: Record<string, any>): Promise<ApiResponse<any>>;
  getPaymentById(id: string): Promise<ApiResponse<any>>;
  createPayment(paymentData: any): Promise<ApiResponse<any>>;
  markPaymentAsPaid(id: string, paymentData: any): Promise<ApiResponse<any>>;
  
  // Tenants methods
  getTenants(params?: Record<string, any>): Promise<ApiResponse<any>>;
  getTenantById(id: string): Promise<ApiResponse<any>>;
  createTenant(tenantData: any): Promise<ApiResponse<any>>;
  updateTenant(id: string, tenantData: any): Promise<ApiResponse<any>>;
  
  // Reports methods
  getReports(params?: Record<string, any>): Promise<ApiResponse<any>>;
  createReport(reportData: any): Promise<ApiResponse<any>>;
  updateReportStatus(id: string, status: string): Promise<ApiResponse<any>>;
  
  // Notifications methods
  getNotifications(): Promise<ApiResponse<any>>;
  markNotificationAsRead(id: string): Promise<ApiResponse<any>>;
}

declare const apiService: ApiService;
export default apiService;