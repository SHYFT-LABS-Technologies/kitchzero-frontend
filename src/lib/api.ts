import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.response?.data);
    
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('Attempting token refresh...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);
          
          // Retry original request
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/auth/login', credentials),

  logout: (refreshToken?: string) =>
    api.post('/auth/logout', { refreshToken }),

  me: () => api.get('/auth/me'),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
};

export const adminAPI = {
  // Users
  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/users', { params }),

  createUser: (userData: any) =>
    api.post('/admin/users', userData),

  updateUser: (userId: string, userData: any) =>
    api.put(`/admin/users/${userId}`, userData),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),

  resetUserPassword: (userId: string) =>
    api.post(`/admin/users/${userId}/reset-password`),

  // Tenants
  getTenants: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/tenants', { params }),

  createTenant: (tenantData: any) =>
    api.post('/admin/tenants', tenantData),

  getTenant: (tenantId: string) =>
    api.get(`/admin/tenants/${tenantId}`),

  updateTenant: (tenantId: string, tenantData: any) =>
    api.put(`/admin/tenants/${tenantId}`, tenantData),

  deleteTenant: (tenantId: string) =>
    api.delete(`/admin/tenants/${tenantId}`),
};

export const tenantAPI = {
  getInfo: () => api.get('/tenant/info'),

  getUsers: (params?: { page?: number; limit?: number }) =>
    api.get('/tenant/users', { params }),

  // Branches
  getBranches: (params?: { page?: number; limit?: number }) =>
    api.get('/tenant/branches', { params }),

  createBranch: (branchData: any) =>
    api.post('/tenant/branches', branchData),

  getBranch: (branchId: string) =>
    api.get(`/tenant/branches/${branchId}`),

  updateBranch: (branchId: string, branchData: any) =>
    api.put(`/tenant/branches/${branchId}`, branchData),

  deleteBranch: (branchId: string) =>
    api.delete(`/tenant/branches/${branchId}`),

  createBranchAdmin: (branchId: string, userData: any) =>
    api.post(`/tenant/branches/${branchId}/admins`, userData),
};

export const systemAPI = {
  getStatus: () => api.get('/status'),
  getHealth: () => axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`),
  testDB: () => api.get('/db-test'),
};

export const testConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await systemAPI.getHealth();
    console.log('Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Backend connection failed:', error);
    return { 
      success: false, 
      error: error.message || 'Connection failed',
      details: error.response?.data || error
    };
  }
};