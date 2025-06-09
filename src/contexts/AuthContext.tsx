import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index';
import { authAPI } from '../lib/api';
import { authStorage } from '../lib/auth-storage';

interface Tenant {
  id: string;
  name: string;
  slug: string;
  subscriptionStatus: string;
}

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
  canAccessMultipleTenants: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUser = React.useCallback((userData: User) => {
    console.log('🔄 Updating user state:', userData);
    setUser(userData);
    authStorage.setUser(userData);
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      const token = await authStorage.getAccessToken();
      if (token) {
        console.log('🔄 Refreshing user data from server...');
        const response = await authAPI.me();
        
        let userData: User;
        if (response.data?.user) {
          userData = response.data.user;
        } else if (response.user) {
          userData = response.user;
        } else if (response.data && !response.data.user) {
          userData = response.data as User;
        } else {
          userData = response as User;
        }
        
        console.log('✅ Fresh user data received:', userData);
        updateUser(userData);

        // If user has a tenant, fetch tenant info
        if (userData.tenantId && userData.role !== 'super_admin') {
          try {
            const tenantResponse = await fetch('/api/v1/tenant/info', {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            
            if (tenantResponse.ok) {
              const tenantData = await tenantResponse.json();
              if (tenantData.success && tenantData.data.tenant) {
                setTenant({
                  id: tenantData.data.tenant.id,
                  name: tenantData.data.tenant.name,
                  slug: tenantData.data.tenant.slug,
                  subscriptionStatus: tenantData.data.tenant.subscription_status,
                });
              }
            }
          } catch (error) {
            console.warn('Could not fetch tenant info:', error);
          }
        }
      }
    } catch (error: any) {
      console.error('Error refreshing user:', error);
      
      if (error.response?.status === 401) {
        console.log('🚨 Authentication expired, clearing session');
        authStorage.clearTokens();
        setUser(null);
        setTenant(null);
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
  }, [updateUser]);

  const login = React.useCallback(async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      
      let loginData;
      if (response.data) {
        loginData = response.data;
      } else {
        loginData = response;
      }
      
      const { user, accessToken, refreshToken } = loginData;

      await authStorage.setTokens(accessToken, refreshToken);
      updateUser(user);
      
      // Fetch tenant info if applicable
      if (user.tenantId && user.role !== 'super_admin') {
        try {
          const tenantResponse = await fetch('/api/v1/tenant/info', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (tenantResponse.ok) {
            const tenantData = await tenantResponse.json();
            if (tenantData.success && tenantData.data.tenant) {
              setTenant({
                id: tenantData.data.tenant.id,
                name: tenantData.data.tenant.name,
                slug: tenantData.data.tenant.slug,
                subscriptionStatus: tenantData.data.tenant.subscription_status,
              });
            }
          }
        } catch (error) {
          console.warn('Could not fetch tenant info after login:', error);
        }
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }, [updateUser]);

  const logout = React.useCallback(async () => {
    try {
      const refreshToken = await authStorage.getRefreshToken();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStorage.clearTokens();
      setUser(null);
      setTenant(null);
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await authStorage.getAccessToken();
        const savedUser = authStorage.getUser();

        if (token && savedUser) {
          console.log('📱 Loading saved user:', savedUser);
          setUser(savedUser);
          // Refresh user data in background
          setTimeout(() => {
            refreshUser().catch(console.error);
          }, 100);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        authStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [refreshUser]);

  const value = React.useMemo(() => ({
    user,
    tenant,
    login,
    logout,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
    canAccessMultipleTenants: user?.role === 'super_admin',
  }), [user, tenant, login, logout, updateUser, refreshUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export for HMR
if (import.meta.hot) {
  import.meta.hot.accept();
}