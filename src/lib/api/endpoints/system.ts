import axios from 'axios';
import ApiClient from '../client';

interface SystemStatus {
  name: string;
  version: string;
  environment: string;
  timestamp: string;
}

interface HealthStatus {
  status: 'OK' | 'UNHEALTHY';
  timestamp: string;
  environment: string;
  uptime: number;
  memory: any;
  database: {
    healthy: boolean;
    stats: any;
  };
  responseTime: number;
  version: string;
}

interface DatabaseTestResult {
  status: string;
  timestamp: string;
  user_count: number;
  database: string;
  tables: string[];
  query_time: number;
}

export class SystemAPI {
  private client = ApiClient.getInstance().client;

  async getStatus(): Promise<{ data: SystemStatus }> {
    const response = await this.client.get('/status', { skipAuth: true } as any);
    return response.data;
  }

  async getHealth(): Promise<{ data: HealthStatus }> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
    const response = await axios.get(`${API_BASE_URL.replace('/api/v1', '')}/health`, {
      timeout: 5000,
    });
    return response.data;
  }

  async testDB(): Promise<{ data: DatabaseTestResult }> {
    const response = await this.client.get('/db-test', { skipAuth: true } as any);
    return response.data;
  }

  async debugUser(username: string): Promise<{ data: any }> {
    const response = await this.client.get(`/debug/user/${username}`, { 
      skipAuth: true 
    } as any);
    return response.data;
  }

  async testConnection(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
    details?: any;
  }> {
    try {
      const response = await this.getHealth();
      return { success: true, data: response.data };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Connection failed',
        details: error.response?.data || error
      };
    }
  }
}

export const systemAPI = new SystemAPI();