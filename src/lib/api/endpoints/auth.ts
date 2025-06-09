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
    const response = await this.client.get('/auth/me');
    return response.data;
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    await this.client.post('/auth/change-password', data);
  }

  async changeCredentials(data: ChangeCredentialsData): Promise<{ data: { user: User } }> {
    const response = await this.client.post('/auth/change-credentials', data);
    return response.data;
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