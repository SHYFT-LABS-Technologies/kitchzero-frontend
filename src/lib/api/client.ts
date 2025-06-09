// src/lib/api/client.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  enableLogging?: boolean;
}

class ApiClient {
  private static instance: ApiClient;
  public client: AxiosInstance;
  private config: ApiClientConfig;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: API_BASE_URL,
      timeout: 10000,
      retries: 3,
      enableLogging: import.meta.env.MODE === 'development',
      ...config,
    };

    this.client = this.createAxiosInstance();
  }

  static getInstance(config?: ApiClientConfig): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient(config);
    }
    return ApiClient.instance;
  }

  private createAxiosInstance(): AxiosInstance {
    // Only include headers that are allowed by CORS
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers,
      withCredentials: true,
      validateStatus: (status) => status >= 200 && status < 300,
    });

    return instance;
  }

  updateConfig(newConfig: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (newConfig.baseURL) {
      this.client.defaults.baseURL = newConfig.baseURL;
    }
    if (newConfig.timeout) {
      this.client.defaults.timeout = newConfig.timeout;
    }
  }

  getConfig(): ApiClientConfig {
    return { ...this.config };
  }
}

export default ApiClient;