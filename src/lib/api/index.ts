import ApiClient from './client';
import { apiInterceptors } from './interceptors';

// Import all endpoint APIs
import { authAPI } from './endpoints/auth';
import { adminAPI } from './endpoints/admin';
import { tenantAPI } from './endpoints/tenant';
import { systemAPI } from './endpoints/system';
import { wasteManagementAPI } from './endpoints/waste-management';

// Initialize API client with interceptors
const apiClient = ApiClient.getInstance();
apiInterceptors.setupInterceptors(apiClient.client);

// Export the configured API client
export { apiClient };

// Export all API endpoints
export { authAPI, adminAPI, tenantAPI, systemAPI, wasteManagementAPI };

// Export the raw axios instance for direct use if needed
export const api = apiClient.client;

// Export types and utilities
export type { ApiError } from './utils/error-handler';
export { handleApiError } from './utils/error-handler';

// Test connection function
export const testConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    const response = await systemAPI.getHealth();
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('❌ Backend connection failed:', error);
    return {
      success: false,
      error: error.message || 'Connection failed',
      details: error.response?.data || error
    };
  }
};

// Initialize the API client when this module is imported
console.log('🚀 API Client initialized with interceptors');