import axios from 'axios';
import { authStorage } from './auth-storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with security headers
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  },
  withCredentials: true, // Include cookies for CSRF tokens
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = authStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    // Remove sensitive data from logs in production
    if (import.meta.env.MODE !== 'production') {
      console.log('API Request:', config.method?.toUpperCase(), config.url);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with better error handling
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.MODE !== 'production') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = authStorage.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          authStorage.setTokens(accessToken, refreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        authStorage.clearTokens();
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

  changeCredentials: (data: { currentPassword: string; newUsername: string; newPassword: string }) =>
    api.post('/auth/change-credentials', data),
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

