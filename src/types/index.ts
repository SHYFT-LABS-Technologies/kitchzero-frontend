export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'super_admin' | 'tenant_admin' | 'branch_admin';
  tenantId?: string;
  branchId?: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type: 'restaurant' | 'hotel';
  settings: Record<string, any>;
  isActive: boolean;
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'cancelled';
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  branchCount?: number;
}

export interface Branch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  settings: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  tenantName?: string;
  tenantType?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface PaginatedResponse<T> {
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

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}