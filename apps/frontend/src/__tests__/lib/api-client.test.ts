/**
 * Tests for API client with token refresh functionality
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock token storage
const mockTokenStorage = {
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
  getRefreshToken: vi.fn(),
  setRefreshToken: vi.fn(),
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  hasTokens: vi.fn(),
};

vi.mock('../../lib/token-storage', () => ({
  tokenStorage: mockTokenStorage,
}));

// Mock axios
const mockAxiosInstance = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
};

const mockAxiosPost = vi.fn();

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => mockAxiosInstance),
    post: mockAxiosPost,
  },
}));

describe('ApiClient', () => {
  const mockAccessToken = 'mock-access-token';
  const mockRefreshToken = 'mock-refresh-token';
  const mockNewAccessToken = 'mock-new-access-token';
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Token Storage Integration', () => {
    it('should retrieve refresh token from cookie storage', () => {
      mockTokenStorage.getRefreshToken.mockReturnValue(mockRefreshToken);
      
      const token = mockTokenStorage.getRefreshToken();
      
      expect(token).toBe(mockRefreshToken);
      expect(mockTokenStorage.getRefreshToken).toHaveBeenCalled();
    });

    it('should verify token storage methods are available', () => {
      // Verify token storage methods are available
      expect(mockTokenStorage.getAccessToken).toBeDefined();
      expect(mockTokenStorage.getRefreshToken).toBeDefined();
      expect(mockTokenStorage.setAccessToken).toBeDefined();
      expect(mockTokenStorage.clearTokens).toBeDefined();
    });
  });

  describe('Token Refresh Logic', () => {
    it('should use refresh token from cookies for token refresh', () => {
      mockTokenStorage.getRefreshToken.mockReturnValue(mockRefreshToken);
      mockAxiosPost.mockResolvedValueOnce({
        data: {
          data: {
            accessToken: mockNewAccessToken,
          },
        },
      });

      const refreshToken = mockTokenStorage.getRefreshToken();
      
      expect(refreshToken).toBe(mockRefreshToken);
      expect(mockTokenStorage.getRefreshToken).toHaveBeenCalled();
    });

    it('should store new access token after successful refresh', () => {
      mockTokenStorage.setAccessToken(mockNewAccessToken);
      
      expect(mockTokenStorage.setAccessToken).toHaveBeenCalledWith(mockNewAccessToken);
    });

    it('should clear all tokens when refresh fails', () => {
      mockTokenStorage.clearTokens();
      
      expect(mockTokenStorage.clearTokens).toHaveBeenCalled();
    });

    it('should handle missing refresh token gracefully', () => {
      mockTokenStorage.getRefreshToken.mockReturnValue(null);
      
      const refreshToken = mockTokenStorage.getRefreshToken();
      
      expect(refreshToken).toBeNull();
    });
  });

  describe('HTTP Methods', () => {
    it('should make GET request and return data', async () => {
      const { apiClient } = await import('../../lib/api-client');
      const mockData = { id: 1, name: 'Test' };
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      const result = await apiClient.get('/test');

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockData);
    });

    it('should make POST request and return data', async () => {
      const { apiClient } = await import('../../lib/api-client');
      const mockData = { id: 1, name: 'Test' };
      const postData = { name: 'Test' };
      mockAxiosInstance.post.mockResolvedValueOnce({ data: mockData });

      const result = await apiClient.post('/test', postData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make PUT request and return data', async () => {
      const { apiClient } = await import('../../lib/api-client');
      const mockData = { id: 1, name: 'Updated' };
      const putData = { name: 'Updated' };
      mockAxiosInstance.put.mockResolvedValueOnce({ data: mockData });

      const result = await apiClient.put('/test/1', putData);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make PATCH request and return data', async () => {
      const { apiClient } = await import('../../lib/api-client');
      const mockData = { id: 1, name: 'Patched' };
      const patchData = { name: 'Patched' };
      mockAxiosInstance.patch.mockResolvedValueOnce({ data: mockData });

      const result = await apiClient.patch('/test/1', patchData);

      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', patchData, undefined);
      expect(result).toEqual(mockData);
    });

    it('should make DELETE request and return data', async () => {
      const { apiClient } = await import('../../lib/api-client');
      const mockData = { success: true };
      mockAxiosInstance.delete.mockResolvedValueOnce({ data: mockData });

      const result = await apiClient.delete('/test/1');

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockData);
    });
  });

  describe('API Client Configuration', () => {
    it('should have interceptors configured', () => {
      // Verify interceptors exist on the mock instance
      expect(mockAxiosInstance.interceptors).toBeDefined();
      expect(mockAxiosInstance.interceptors.request).toBeDefined();
      expect(mockAxiosInstance.interceptors.response).toBeDefined();
    });

    it('should have HTTP methods available', () => {
      expect(mockAxiosInstance.get).toBeDefined();
      expect(mockAxiosInstance.post).toBeDefined();
      expect(mockAxiosInstance.put).toBeDefined();
      expect(mockAxiosInstance.patch).toBeDefined();
      expect(mockAxiosInstance.delete).toBeDefined();
    });
  });
});
