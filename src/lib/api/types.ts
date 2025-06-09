// src/lib/api/types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      limit: number;
    };
  };
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export interface RequestConfig {
  skipAuth?: boolean;
  skipRetry?: boolean;
  timeout?: number;
  retries?: number;
}

// Re-export types from main types file
export type { User, Tenant, Branch, AuthResponse, PaginatedResponse } from '../../types';