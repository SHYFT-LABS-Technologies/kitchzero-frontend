import type { AxiosResponse } from 'axios';
import ApiClient from '../client';
import type { User, AuthResponse } from '../types';

interface LoginCredentials {
  username: string;
  password: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface ChangeCredentialsData {
  currentPassword: string;
  newUsername: string;
  newPassword: string;
}

export class AuthAPI {
  private client = ApiClient.getInstance().client;

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.client.post(
      '/auth/login',
      credentials,
      { skipAuth: true } as any
    );
    return response.data;
  }

  async logout(refreshToken?: string): Promise<void> {
    await this.client.post('/auth/logout', { refreshToken });
  }

  async me(): Promise<{ data: { user: User } }> {
    try {
      const response = await this.client.get('/auth/me');
      
      // Log the actual response structure for debugging
      console.log('🔍 Auth API /me response:', response.data);
      
      // Ensure we return the expected structure
      if (response.data?.data?.user) {
        return { data: { user: response.data.data.user } };
      } else if (response.data?.user) {
        return { data: { user: response.data.user } };
      } else {
        // If the response is the user object directly
        return { data: { user: response.data } };
      }
    } catch (error) {
      console.error('Auth API /me error:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.client.post('/auth/change-password', data);
  }

  async changeCredentials(data: ChangeCredentialsData): Promise<{ data: { user: User } }> {
    const response = await this.client.post('/auth/change-credentials', data);
    
    // Ensure consistent response structure
    if (response.data?.data?.user) {
      return { data: { user: response.data.data.user } };
    } else if (response.data?.user) {
      return { data: { user: response.data.user } };
    } else {
      return { data: { user: response.data } };
    }
  }

  async refreshToken(refreshToken: string): Promise<{ data: { accessToken: string } }> {
    const response = await this.client.post(
      '/auth/refresh',
      { refreshToken },
      { skipAuth: true } as any
    );
    return response.data;
  }
}

export const authAPI = new AuthAPI();