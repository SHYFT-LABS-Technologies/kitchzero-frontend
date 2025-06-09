// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types/index';
import { authAPI } from '../lib/api';
import { authStorage } from '../lib/auth-storage';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
  isLoading: boolean;
  isAuthenticated: boolean;
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
        const userData = response.data.data.user;
        console.log('✅ Fresh user data received:', userData);
        updateUser(userData);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
      authStorage.clearTokens();
      setUser(null);
    }
  }, [updateUser]);

  const login = React.useCallback(async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      const { user, accessToken, refreshToken } = response.data;

      await authStorage.setTokens(accessToken, refreshToken);
      updateUser(user);
      
    } catch (error: any) {
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
          refreshUser();
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
    login,
    logout,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
  }), [user, login, logout, updateUser, refreshUser, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Export for HMR
if (import.meta.hot) {
  import.meta.hot.accept();
}