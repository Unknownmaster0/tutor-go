'use client';

import React, { createContext, useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  emailVerified: boolean;
  suspended: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  clearError: () => void;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'student' | 'tutor';
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenStorage.getAccessToken();
        if (token) {
          // Verify token by fetching current user
          const response = await apiClient.get<User>('/auth/me');
          setUser(response);
        }
      } catch (err) {
        // Token is invalid, clear it
        tokenStorage.clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', {
        email,
        password,
      });

      const { user, accessToken, refreshToken } = response;
      tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<LoginResponse>('/auth/register', data);
      console.log('Registration response:', response);
      const { user, accessToken, refreshToken } = response;
      tokenStorage.setTokens(accessToken, refreshToken);
      setUser(user);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (err) {
      // Continue with logout even if request fails
      console.error('Logout request failed:', err);
    } finally {
      tokenStorage.clearTokens();
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/forgot-password', { email });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to send password reset email';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.post('/auth/reset-password', { token, newPassword });
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refresh = tokenStorage.getRefreshToken();
      if (!refresh) throw new Error('No refresh token available');

      const response = await apiClient.post<LoginResponse>('/auth/refresh', {
        refreshToken: refresh,
      });

      const { accessToken, refreshToken: newRefreshToken } = response;
      tokenStorage.setTokens(accessToken, newRefreshToken);
    } catch (err) {
      // Refresh failed, logout user
      tokenStorage.clearTokens();
      setUser(null);
      throw err;
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    refreshToken,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
