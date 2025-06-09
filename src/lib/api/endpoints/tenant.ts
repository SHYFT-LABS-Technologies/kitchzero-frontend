import ApiClient from '../client';
import type { User, Branch, PaginatedResponse } from '../types';

interface CreateBranchData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
}

interface UpdateBranchData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  settings?: Record<string, any>;
  isActive?: boolean;
}

interface CreateBranchAdminData {
  username: string;
  email?: string;
  password: string;
}

interface PaginationParams {
  page?: number;
  limit?: number;
}

export class TenantAPI {
  private client = ApiClient.getInstance().client;

  async getInfo(): Promise<{ data: { tenant: any } }> {
    const response = await this.client.get('/tenant/info');
    return response.data;
  }

  async getUsers(params?: PaginationParams): Promise<PaginatedResponse<User>> {
    const response = await this.client.get('/tenant/users', { params });
    return response.data;
  }

  async getBranches(params?: PaginationParams): Promise<PaginatedResponse<Branch>> {
    const response = await this.client.get('/tenant/branches', { params });
    return response.data;
  }

  async createBranch(branchData: CreateBranchData): Promise<{ data: { branch: Branch } }> {
    const response = await this.client.post('/tenant/branches', branchData);
    return response.data;
  }

  async getBranch(branchId: string): Promise<{ data: { branch: Branch } }> {
    const response = await this.client.get(`/tenant/branches/${branchId}`);
    return response.data;
  }

  async updateBranch(branchId: string, branchData: UpdateBranchData): Promise<{ data: { branch: Branch } }> {
    const response = await this.client.put(`/tenant/branches/${branchId}`, branchData);
    return response.data;
  }

  async deleteBranch(branchId: string): Promise<void> {
    await this.client.delete(`/tenant/branches/${branchId}`);
  }

  async createBranchAdmin(branchId: string, userData: CreateBranchAdminData): Promise<{ data: { user: User } }> {
    const response = await this.client.post(`/tenant/branches/${branchId}/admins`, userData);
    return response.data;
  }
}

export const tenantAPI = new TenantAPI();