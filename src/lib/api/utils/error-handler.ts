import type { AxiosError } from 'axios';

export interface ApiErrorResponse {
  success: false;
  message: string;
  code?: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

export class ApiError extends Error {
  public status: number;
  public code?: string;
  public errors?: Array<{ field: string; message: string }>;

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    errors?: Array<{ field: string; message: string }>
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export function handleApiError(error: AxiosError<ApiErrorResponse>): ApiError {
  // Network error
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return new ApiError('Request timeout', 408, 'TIMEOUT');
    }
    return new ApiError('Network error. Please check your connection.', 0, 'NETWORK_ERROR');
  }

  const { status, data } = error.response;
  
  // Server returned error response
  if (data && data.message) {
    return new ApiError(
      data.message,
      status,
      data.code,
      data.errors
    );
  }

  // Fallback error messages
  const defaultMessages: Record<number, string> = {
    400: 'Invalid request data',
    401: 'Authentication required',
    403: 'Access denied',
    404: 'Resource not found',
    409: 'Resource already exists',
    422: 'Validation failed',
    429: 'Too many requests',
    500: 'Internal server error',
    502: 'Service temporarily unavailable',
    503: 'Service temporarily unavailable',
  };

  const message = defaultMessages[status] || 'An unexpected error occurred';
  return new ApiError(message, status);
}