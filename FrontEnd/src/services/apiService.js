// API Service for frontend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method to get auth token
  getAuthToken() {
    return localStorage.getItem('token');
  }

  // Helper method to make authenticated requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getAuthToken();

    const config = {
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
          // Token might be expired, clear auth data
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Redirect to login if not already on login page
          if (!window.location.pathname.includes('sign-in')) {
            window.location.href = '/sign-in';
          }
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    const result = await this.request('/auth/logout', { method: 'POST' });
    localStorage.removeItem('token');
    return result;
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // Dashboard methods
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getOccupancyData() {
    return this.request('/dashboard/occupancy');
  }

  async getPaymentStats() {
    return this.request('/dashboard/payments');
  }

  async getReportStats() {
    return this.request('/dashboard/reports');
  }

  // Users methods (for frontend users management page)
  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/auth/users${queryString ? '?' + queryString : ''}`);
  }

  async registerUser(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async registerTenant(tenantData) {
    return this.request('/tenants/register', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async getUserById(id) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id, userData) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Rooms methods (for frontend rooms management page)
  async getRooms(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/rooms${queryString ? '?' + queryString : ''}`);
  }

  async getRoomById(id) {
    return this.request(`/rooms/${id}`);
  }

  async createRoom(roomData) {
    return this.request('/rooms', {
      method: 'POST',
      body: JSON.stringify(roomData),
    });
  }

  async updateRoom(id, roomData) {
    return this.request(`/rooms/${id}`, {
      method: 'PUT',
      body: JSON.stringify(roomData),
    });
  }

  async deleteRoom(id) {
    return this.request(`/rooms/${id}`, { method: 'DELETE' });
  }

  // Payments methods (for frontend payment management page)
  async getPayments(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/payments${queryString ? '?' + queryString : ''}`);
  }

  async getPaymentById(id) {
    return this.request(`/payments/${id}`);
  }

  async createPayment(paymentData) {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async markPaymentAsPaid(id, paymentData) {
    return this.request(`/payments/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  // Tenants methods
  async getTenants(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/tenants${queryString ? '?' + queryString : ''}`);
  }

  async getTenantById(id) {
    return this.request(`/tenants/${id}`);
  }

  async createTenant(tenantData) {
    return this.request('/tenants', {
      method: 'POST',
      body: JSON.stringify(tenantData),
    });
  }

  async updateTenant(id, tenantData) {
    return this.request(`/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tenantData),
    });
  }

  // Reports methods
  async getReports(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/reports${queryString ? '?' + queryString : ''}`);
  }

  async createReport(reportData) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateReportStatus(id, status) {
    return this.request(`/reports/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Notifications methods
  async getNotifications() {
    return this.request('/notifications');
  }

  async markNotificationAsRead(id) {
    return this.request(`/notifications/${id}/read`, { method: 'PUT' });
  }
}

export default new ApiService();