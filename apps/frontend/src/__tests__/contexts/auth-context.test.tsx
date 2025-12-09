/**
 * Unit tests for auth context
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuthContext } from '../../contexts/AuthContext';
import { apiClient } from '../../lib/api-client';
import { tokenStorage } from '../../lib/token-storage';
import { User, AuthResponse, LoginDto, RegisterDto } from '../../types/auth.types';

// Mock dependencies
vi.mock('../../lib/api-client', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('../../lib/token-storage', () => ({
  tokenStorage: {
    hasTokens: vi.fn(),
    setTokens: vi.fn(),
    clearTokens: vi.fn(),
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
  },
}));

describe('AuthContext', () => {
  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student',
    emailVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockAuthResponse: AuthResponse = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
    user: mockUser,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(tokenStorage.hasTokens).mockReturnValue(false);
  });

  describe('initialization', () => {
    it('should initialize with no user when no tokens exist', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should load user data when tokens exist', async () => {
      vi.mocked(tokenStorage.hasTokens).mockReturnValue(true);
      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should clear tokens and set loading to false on initialization error', async () => {
      vi.mocked(tokenStorage.hasTokens).mockReturnValue(true);
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Failed to fetch user'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(tokenStorage.clearTokens).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should store tokens and set user on successful login', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      let returnedUser: User | undefined;
      await act(async () => {
        returnedUser = await result.current.login(credentials);
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', credentials);
      expect(tokenStorage.setTokens).toHaveBeenCalledWith(
        mockAuthResponse.accessToken,
        mockAuthResponse.refreshToken,
      );
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(returnedUser).toEqual(mockUser);
    });

    it('should throw error on failed login', async () => {
      const error = new Error('Invalid credentials');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const credentials: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      await expect(
        act(async () => {
          await result.current.login(credentials);
        }),
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(tokenStorage.setTokens).not.toHaveBeenCalled();
    });

    it('should ensure tokens are stored before setting user state', async () => {
      const callOrder: string[] = [];

      vi.mocked(apiClient.post).mockResolvedValue(mockAuthResponse);
      vi.mocked(tokenStorage.setTokens).mockImplementation(() => {
        callOrder.push('setTokens');
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login({
          email: 'test@example.com',
          password: 'password123',
        });
        callOrder.push('setUser');
      });

      expect(callOrder).toEqual(['setTokens', 'setUser']);
    });
  });

  describe('register', () => {
    it('should store tokens and set user on successful registration', async () => {
      vi.mocked(apiClient.post).mockResolvedValue(mockAuthResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const registerData: RegisterDto = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'student',
      };

      let returnedUser: User | undefined;
      await act(async () => {
        returnedUser = await result.current.register(registerData);
      });

      expect(apiClient.post).toHaveBeenCalledWith('/auth/register', registerData);
      expect(tokenStorage.setTokens).toHaveBeenCalledWith(
        mockAuthResponse.accessToken,
        mockAuthResponse.refreshToken,
      );
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(returnedUser).toEqual(mockUser);
    });

    it('should throw error on failed registration', async () => {
      const error = new Error('Email already exists');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const registerData: RegisterDto = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'student',
      };

      await expect(
        act(async () => {
          await result.current.register(registerData);
        }),
      ).rejects.toThrow('Email already exists');

      expect(result.current.user).toBeNull();
      expect(tokenStorage.setTokens).not.toHaveBeenCalled();
    });

    it('should ensure tokens are stored before setting user state', async () => {
      const callOrder: string[] = [];

      vi.mocked(apiClient.post).mockResolvedValue(mockAuthResponse);
      vi.mocked(tokenStorage.setTokens).mockImplementation(() => {
        callOrder.push('setTokens');
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'student',
        });
        callOrder.push('setUser');
      });

      expect(callOrder).toEqual(['setTokens', 'setUser']);
    });
  });

  describe('logout', () => {
    it('should clear tokens and user state', async () => {
      vi.mocked(tokenStorage.hasTokens).mockReturnValue(true);
      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      act(() => {
        result.current.logout();
      });

      expect(tokenStorage.clearTokens).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('refreshUser', () => {
    it('should fetch and update user data', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      vi.mocked(apiClient.get).mockResolvedValue(updatedUser);

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result.current.user).toEqual(updatedUser);
    });

    it('should throw error on failed refresh', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const error = new Error('Unauthorized');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.refreshUser();
        }),
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('updateProfile', () => {
    it('should update user profile and local state', async () => {
      vi.mocked(tokenStorage.hasTokens).mockReturnValue(true);
      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const updatedData = { name: 'Updated Name', phone: '1234567890' };
      const updatedUser = { ...mockUser, ...updatedData };
      vi.mocked(apiClient.patch).mockResolvedValue(updatedUser);

      await act(async () => {
        await result.current.updateProfile(updatedData);
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/auth/profile', updatedData);
      expect(result.current.user).toEqual(updatedUser);
    });

    it('should throw error on failed profile update', async () => {
      vi.mocked(tokenStorage.hasTokens).mockReturnValue(true);
      vi.mocked(apiClient.get).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      const error = new Error('Validation failed');
      vi.mocked(apiClient.patch).mockRejectedValue(error);

      await expect(
        act(async () => {
          await result.current.updateProfile({ name: '' });
        }),
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');
    });
  });
});
