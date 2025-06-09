import type { AxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';
import { authStorage } from '../auth-storage';
import { handleApiError, type ApiErrorResponse } from './utils/error-handler';

interface RequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
  skipAuth?: boolean;
}

export class ApiInterceptors {
  private refreshTokenPromise: Promise<string> | null = null;

  setupInterceptors(axiosInstance: AxiosInstance): void {
    this.setupRequestInterceptor(axiosInstance);
    this.setupResponseInterceptor(axiosInstance);
  }

  private setupRequestInterceptor(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.request.use(
      async (config: RequestConfig) => {
        try {
          // Add authentication token
          if (!config.skipAuth) {
            const token = await authStorage.getAccessToken();
            if (token) {
              config.headers = config.headers || {};
              config.headers.Authorization = `Bearer ${token}`;
            }
          }

          // Add request tracking (only headers allowed by CORS)
          config.headers = config.headers || {};
          config.headers['X-Request-ID'] = this.generateRequestId();
          config.headers['X-Request-Timestamp'] = Date.now().toString();

          // Validate request URL for security
          if (config.url && !this.isValidRequestUrl(config.url)) {
            throw new Error('Invalid request URL detected');
          }

          // Security logging in development
          if (import.meta.env.MODE === 'development') {
            console.log('🚀 API Request:', {
              method: config.method?.toUpperCase(),
              url: config.url,
              requestId: config.headers['X-Request-ID'],
            });
          }

          return config;
        } catch (error) {
          return Promise.reject(error);
        }
      },
      (error: AxiosError) => {
        console.error('❌ Request Error:', error.message);
        return Promise.reject(error);
      }
    );
  }

  private setupResponseInterceptor(axiosInstance: AxiosInstance): void {
    axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Log successful responses in development
        if (import.meta.env.MODE === 'development') {
          console.log('✅ API Response:', {
            status: response.status,
            url: response.config.url,
            requestId: response.config.headers?.['X-Request-ID'],
          });
        }
        return response;
      },
      async (error: AxiosError<ApiErrorResponse>) => {
        const originalRequest = error.config as RequestConfig;

        if (!originalRequest) {
          return Promise.reject(error);
        }

        // Handle 401 Unauthorized with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            this.handleAuthenticationFailure();
            return Promise.reject(refreshError);
          }
        }

        // Log security-relevant errors
        if (error.response?.status && error.response.status >= 400) {
          console.error('🚨 API Error:', {
            status: error.response.status,
            url: originalRequest.url,
            message: error.message,
            requestId: originalRequest.headers?.['X-Request-ID'],
          });
        }

        // Transform error using our error handler
        const handledError = handleApiError(error);
        return Promise.reject(handledError);
      }
    );
  }

  private async refreshAccessToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshTokenPromise) {
      return this.refreshTokenPromise;
    }

    this.refreshTokenPromise = this.performTokenRefresh();
    
    try {
      const newToken = await this.refreshTokenPromise;
      return newToken;
    } finally {
      this.refreshTokenPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<string | null> {
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');

      // Make refresh request without interceptors to avoid infinite loop
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      const { accessToken } = data.data;

      // Store new token
      await authStorage.setTokens(accessToken, refreshToken);
      
      console.log('✅ Token refreshed successfully');
      return accessToken;
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      authStorage.clearTokens();
      throw error;
    }
  }

  private handleAuthenticationFailure(): void {
    console.log('🚨 Authentication failed, clearing tokens');
    authStorage.clearTokens();
    
    // Only redirect if not already on login page
    if (window.location.pathname !== '/login') {
      console.log('🔄 Redirecting to login page');
      window.location.href = '/login';
    }
  }

  private isValidRequestUrl(url: string): boolean {
    try {
      // Prevent SSRF attacks by validating allowed URL patterns
      const allowedPatterns = [
        /^\/api\/v1\/.+/,     // API endpoints
        /^\/auth\/.+/,        // Auth endpoints
        /^\/health$/,         // Health check
        /^\/status$/,         // Status check
        /^\/db-test$/,        // Database test
      ];

      return allowedPatterns.some(pattern => pattern.test(url));
    } catch {
      return false;
    }
  }

  private generateRequestId(): string {
    // Generate secure random request ID
    if (window.crypto && window.crypto.getRandomValues) {
      const array = new Uint8Array(8);
      window.crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }
    // Fallback for older browsers
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}

export const apiInterceptors = new ApiInterceptors();