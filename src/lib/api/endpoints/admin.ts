import ApiClient from '../client';
import type { User, Tenant, PaginatedResponse } from '../types';

interface CreateUserData {
  username: string;
  email?: string;
  password: string;
  role: 'tenant_admin' | 'branch_admin';
  tenantId?: string;
  branchId?: string;
}

interface UpdateUserData {
  email?: string;
  isActive?: boolean;
  role?: string;
  tenantId?: string;
  branchId?: string;
}

interface CreateTenantData {
  name: string;
  slug: string;
  type: 'restaurant' | 'hotel';
  settings?: Record<string, any>;
}

interface UpdateTenantData {
  name?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
  subscriptionStatus?: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionEndDate?: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export class AdminAPI {
  private client = ApiClient.getInstance().client;

  // Users Management
  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await this.client.get('/admin/users', { params });
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<{ data: { user: User } }> {
    const response = await this.client.post('/admin/users', userData);
    return response.data;
  }

  async updateUser(userId: string, userData: UpdateUserData): Promise<{ data: { user: User } }> {
    const response = await this.client.put(`/admin/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<void> {
    await this.client.delete(`/admin/users/${userId}`);
  }

  async resetUserPassword(userId: string): Promise<{ data: { temporaryPassword: string } }> {
    const response = await this.client.post(`/admin/users/${userId}/reset-password`);
    return response.data;
  }

  // Tenants Management
  async getTenants(params?: PaginationParams): Promise<PaginatedResponse<Tenant>> {
    const response = await this.client.get('/admin/tenants', { params });
    return response.data;
  }

  async createTenant(tenantData: CreateTenantData): Promise<{ data: { tenant: Tenant } }> {
    const response = await this.client.post('/admin/tenants', tenantData);
    return response.data;
  }

  async getTenant(tenantId: string): Promise<{ data: { tenant: Tenant } }> {
    const response = await this.client.get(`/admin/tenants/${tenantId}`);
    return response.data;
  }

  async updateTenant(tenantId: string, tenantData: UpdateTenantData): Promise<{ data: { tenant: Tenant } }> {
    const response = await this.client.put(`/admin/tenants/${tenantId}`, tenantData);
    return response.data;
  }

  async deleteTenant(tenantId: string): Promise<void> {
    await this.client.delete(`/admin/tenants/${tenantId}`);
  }
}

export const adminAPI = new AdminAPI();