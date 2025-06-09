import { AxiosRequestConfig, AxiosResponse } from 'axios';

interface RetryConfig {
  retries: number;
  retryDelay: number;
  retryCondition?: (error: any) => boolean;
}

export class RetryLogic {
  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    config: RetryConfig
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 0; attempt <= config.retries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;

        // Don't retry if this is the last attempt
        if (attempt === config.retries) {
          break;
        }

        // Check if we should retry this error
        if (config.retryCondition && !config.retryCondition(error)) {
          break;
        }

        // Default retry condition for network errors and 5xx responses
        if (!this.shouldRetry(error)) {
          break;
        }

        // Wait before retrying
        await this.delay(config.retryDelay * Math.pow(2, attempt));
      }
    }

    throw lastError;
  }

  private static shouldRetry(error: any): boolean {
    // Retry on network errors
    if (!error.response) {
      return true;
    }

    // Retry on 5xx server errors
    const status = error.response.status;
    return status >= 500 && status < 600;
  }

  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}