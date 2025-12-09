'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthResponse, LoginDto, RegisterDto } from '@/types/auth.types';
import { apiClient } from '@/lib/api-client';
import { tokenStorage } from '@/lib/token-storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginDto) => Promise<User>;
  register: (data: RegisterDto) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = async () => {
      try {
        if (tokenStorage.hasTokens()) {
          await refreshUser();
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        tokenStorage.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginDto): Promise<User> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
      
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (data: RegisterDto): Promise<User> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      return response.user;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    tokenStorage.clearTokens();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.get<User>('/auth/me');
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await apiClient.patch<User>('/auth/profile', data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    refreshUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
