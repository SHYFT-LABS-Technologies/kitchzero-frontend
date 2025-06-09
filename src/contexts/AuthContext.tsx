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

  const updateUser = (userData: User) => {
    console.log('🔄 Updating user state:', userData);
    setUser(userData);
    authStorage.setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const token = authStorage.getAccessToken();
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
  };

  useEffect(() => {
    const token = authStorage.getAccessToken();
    const savedUser = authStorage.getUser();

    if (token && savedUser) {
      console.log('📱 Loading saved user:', savedUser);
      setUser(savedUser);
      // Refresh user data in background
      refreshUser();
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login({ username, password });
      const { user, accessToken, refreshToken } = response.data.data;

      authStorage.setTokens(accessToken, refreshToken);
      updateUser(user);
      
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = authStorage.getRefreshToken();
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      authStorage.clearTokens();
      setUser(null);
    }
  };

  const value = {
    user,
    login,
    logout,
    updateUser,
    refreshUser,
    isLoading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};