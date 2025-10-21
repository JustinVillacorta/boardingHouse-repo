// API Service for frontend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000/api';

// Type definitions for better type safety
interface RequestOptions {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
  credentials?: RequestCredentials;
}

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

interface LoginCredentials {
  identifier: string;
  password: string;
}

interface UserData {
  username: string;
  email: string;
  password: string;
  role: string;
}

interface TenantData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  dateOfBirth: string;
  idType: string;
  idNumber: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
  roomNumber: string;
  monthlyRent: number;
  securityDeposit: number;
}

interface RoomData {
  roomNumber: string;
  roomType: string;
  capacity: number;
  monthlyRent: number;
  description?: string;
  amenities?: string[];
  floor?: number;
  area?: number;
}

interface PaymentData {
  tenant: string;
  room: string;
  amount: number;
  paymentType: 'rent' | 'deposit' | 'utility' | 'maintenance' | 'penalty' | 'other';
  paymentMethod: 'cash' | 'bank_transfer' | 'check' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'money_order';
  status: 'pending' | 'paid' | 'overdue';
  dueDate: string;
  paymentDate?: string;
  periodCovered?: {
    startDate: string;
    endDate: string;
  };
  description?: string;
  transactionReference?: string;
  notes?: string;
}

interface ReportData {
  type: string;
  title: string;
  description: string;
  tenant?: string;
  room?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  // Helper method to make authenticated requests
  async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    // Debug: Log authentication info for rooms endpoint
    if (endpoint.includes('/rooms')) {
      console.log('=== API Request Debug (Rooms) ===');
      console.log('Endpoint:', endpoint);
      console.log('Full URL:', url);
      console.log('Token exists:', !!token);
      console.log('Token preview:', token ? token.substring(0, 20) + '...' : 'No token');
      console.log('===============================');
    }

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include', // Include credentials for CORS
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        // Handle 401 Unauthorized specifically
        if (response.status === 401) {
          // Only clear auth data if we're not on the validate-token endpoint
          // This prevents clearing auth during token validation
          if (!endpoint.includes('/validate-token')) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Redirect to login if not already on login page
            if (!window.location.pathname.includes('sign-in')) {
              window.location.href = '/sign-in';
            }
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      
      // Debug: Log response for rooms endpoint
      if (endpoint.includes('/rooms')) {
        console.log('=== API Response Debug (Rooms) ===');
        console.log('Response status:', response.status);
        console.log('Response data:', responseData);
        console.log('Response data type:', typeof responseData);
        console.log('Response data keys:', responseData ? Object.keys(responseData) : 'No data');
        console.log('================================');
      }
      
      return responseData;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    const result = await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    return result;
  }

  async getProfile(): Promise<ApiResponse> {
    return this.request('/auth/profile');
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse> {
    return this.request('/dashboard/stats');
  }

  async getOccupancyData(): Promise<ApiResponse> {
    return this.request('/dashboard/occupancy');
  }

  async getPaymentStats(): Promise<ApiResponse> {
    return this.request('/dashboard/payments');
  }

  async getReportStats(): Promise<ApiResponse> {
    return this.request('/dashboard/reports');
  }

  // Users methods (for frontend users management page)
  async getUsers(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/auth/users${queryString ? '?' + queryString : ''}`);
  }

  async registerUser(userData: UserData): Promise<ApiResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerTenant(tenantData: TenantData): Promise<ApiResponse> {
    return this.request('/tenants/register', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async getUserById(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: Partial<UserData>): Promise<ApiResponse> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string): Promise<ApiResponse> {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Rooms methods (for frontend rooms management page)
  async getRooms(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/rooms${queryString ? '?' + queryString : ''}`);
  }

  async getRoomById(id: string): Promise<ApiResponse> {
    return this.request(`/rooms/${id}`);
  }

  async createRoom(roomData: RoomData): Promise<ApiResponse> {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(id: string, roomData: Partial<RoomData>): Promise<ApiResponse> {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(id: string): Promise<ApiResponse> {
    return this.request(`/rooms/${id}`, { method: 'DELETE' });
  }

  // Payments methods (for frontend payment management page)
  async getPayments(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/payments${queryString ? '?' + queryString : ''}`;
    return this.request(endpoint);
  }

  async getPaymentById(id: string): Promise<ApiResponse> {
    return this.request(`/payments/${id}`);
  }

  async createPayment(paymentData: PaymentData): Promise<ApiResponse> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async updatePayment(id: string, paymentData: Partial<PaymentData>): Promise<ApiResponse> {
    return this.request(`/payments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(paymentData),
    });
  }

  async markPaymentCompleted(id: string): Promise<ApiResponse> {
    return this.request(`/payments/${id}/complete`, {
      method: 'PUT',
    });
  }

  async getPaymentsByTenant(tenantId: string, params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payments/tenant/${tenantId}${queryString ? '?' + queryString : ''}`);
  }

  async getOverduePayments(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payments/overdue${queryString ? '?' + queryString : ''}`);
  }

  async getMyPendingPayments(): Promise<ApiResponse> {
    return this.request('/payments/pending/me');
  }

  async downloadPaymentReceipt(id: string): Promise<Blob> {
    const token = this.getAuthToken();
    const response = await fetch(`${this.baseURL}/payments/${id}/receipt`, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to download receipt: ${response.statusText}`);
    }

    return response.blob();
  }

  async getPaymentStatistics(params: any = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payments/statistics${queryString ? '?' + queryString : ''}`);
  }

  async getPaymentHistory(startDate: string, endDate: string, params: any = {}): Promise<ApiResponse> {
    const allParams = { startDate, endDate, ...params };
    const queryString = new URLSearchParams(allParams).toString();
    return this.request(`/payments/history?${queryString}`);
  }

  async searchPayments(query: string, params: any = {}): Promise<ApiResponse> {
    const allParams = { query, ...params };
    const queryString = new URLSearchParams(allParams).toString();
    return this.request(`/payments/search?${queryString}`);
  }

  async applyLateFees(lateFeeAmount: number): Promise<ApiResponse> {
    return this.request('/payments/apply-late-fees', {
      method: 'POST',
      body: JSON.stringify({ lateFeeAmount }),
    });
  }

  // Tenants methods
  async getTenants(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tenants${queryString ? '?' + queryString : ''}`);
  }

  async getTenantById(id: string): Promise<ApiResponse> {
    return this.request(`/tenants/${id}`);
  }

  async createTenant(tenantData: Partial<TenantData>): Promise<ApiResponse> {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id: string, tenantData: Partial<TenantData>): Promise<ApiResponse> {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }

  // Tenant dashboard methods
  async getTenantDashboard(): Promise<ApiResponse> {
    return this.request('/tenants/dashboard');
  }

  // Reports methods
  async getReports(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports${queryString ? '?' + queryString : ''}`);
  }

  async getMyReports(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports/my${queryString ? '?' + queryString : ''}`);
  }

  async createReport(reportData: ReportData): Promise<ApiResponse> {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReportStatus(id: string, status: string): Promise<ApiResponse> {
    return this.request(`/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Notifications methods
  async getNotifications(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications${queryString ? '?' + queryString : ''}`);
  }

  async getAllNotifications(params: PaginationParams = {}): Promise<ApiResponse> {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/notifications/all${queryString ? '?' + queryString : ''}`);
  }

  async getNotificationById(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}`);
  }

  async createNotification(notificationData: any): Promise<ApiResponse> {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(notificationData),
    });
  }

  async markNotificationAsRead(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsAsRead(): Promise<ApiResponse> {
    return this.request('/notifications/mark-all-read', { method: 'PUT' });
  }

  async deleteNotification(id: string): Promise<ApiResponse> {
    return this.request(`/notifications/${id}`, { method: 'DELETE' });
  }

  async broadcastNotification(broadcastData: any): Promise<ApiResponse> {
    return this.request('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(broadcastData),
    });
  }

  async getNotificationStats(systemWide: boolean = false): Promise<ApiResponse> {
    const queryString = systemWide ? '?systemWide=true' : '';
    return this.request(`/notifications/stats${queryString}`);
  }

  async cleanupExpiredNotifications(): Promise<ApiResponse> {
    return this.request('/notifications/cleanup', { method: 'DELETE' });
  }
}

export default new ApiService();
