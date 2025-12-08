/**
 * Unit tests for token storage service
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Cookies from 'js-cookie';
import { tokenStorage } from '../../lib/token-storage';

// Mock js-cookie
vi.mock('js-cookie', () => ({
  default: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('tokenStorage', () => {
  const mockAccessToken = 'mock-access-token-123';
  const mockRefreshToken = 'mock-refresh-token-456';

  // Create a proper localStorage mock
  const localStorageMock = (() => {
    let store: Record<string, string> = {};
    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Replace global localStorage with our mock
    Object.defineProperty(global, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
    
    // Clear localStorage before each test
    localStorageMock.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('getAccessToken', () => {
    it('should return access token from localStorage', () => {
      localStorage.setItem('accessToken', mockAccessToken);
      expect(tokenStorage.getAccessToken()).toBe(mockAccessToken);
    });

    it('should return null if access token does not exist', () => {
      expect(tokenStorage.getAccessToken()).toBeNull();
    });
  });

  describe('setAccessToken', () => {
    it('should store access token in localStorage', () => {
      tokenStorage.setAccessToken(mockAccessToken);
      expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
    });

    it('should overwrite existing access token', () => {
      localStorage.setItem('accessToken', 'old-token');
      tokenStorage.setAccessToken(mockAccessToken);
      expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
    });
  });

  describe('getRefreshToken', () => {
    it('should return refresh token from cookie', () => {
      vi.mocked(Cookies.get).mockReturnValue(mockRefreshToken);
      expect(tokenStorage.getRefreshToken()).toBe(mockRefreshToken);
      expect(Cookies.get).toHaveBeenCalledWith('refreshToken');
    });

    it('should return null if refresh token cookie does not exist', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);
      expect(tokenStorage.getRefreshToken()).toBeNull();
    });
  });

  describe('setRefreshToken', () => {
    it('should store refresh token in cookie with secure attributes', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      tokenStorage.setRefreshToken(mockRefreshToken);

      expect(Cookies.set).toHaveBeenCalledWith('refreshToken', mockRefreshToken, {
        expires: 7,
        secure: true,
        sameSite: 'strict',
        path: '/',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('should store refresh token without secure flag in development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      tokenStorage.setRefreshToken(mockRefreshToken);

      expect(Cookies.set).toHaveBeenCalledWith('refreshToken', mockRefreshToken, {
        expires: 7,
        secure: false,
        sameSite: 'strict',
        path: '/',
      });

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('setTokens', () => {
    it('should store both access and refresh tokens', () => {
      tokenStorage.setTokens(mockAccessToken, mockRefreshToken);

      expect(localStorage.getItem('accessToken')).toBe(mockAccessToken);
      expect(Cookies.set).toHaveBeenCalledWith('refreshToken', mockRefreshToken, expect.any(Object));
    });
  });

  describe('clearTokens', () => {
    it('should remove both access token and refresh token', () => {
      localStorage.setItem('accessToken', mockAccessToken);
      
      tokenStorage.clearTokens();

      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(Cookies.remove).toHaveBeenCalledWith('refreshToken', { path: '/' });
    });

    it('should handle clearing when tokens do not exist', () => {
      expect(() => tokenStorage.clearTokens()).not.toThrow();
      expect(Cookies.remove).toHaveBeenCalledWith('refreshToken', { path: '/' });
    });
  });

  describe('hasTokens', () => {
    it('should return true when both tokens exist', () => {
      localStorage.setItem('accessToken', mockAccessToken);
      vi.mocked(Cookies.get).mockReturnValue(mockRefreshToken);

      expect(tokenStorage.hasTokens()).toBe(true);
    });

    it('should return false when access token is missing', () => {
      vi.mocked(Cookies.get).mockReturnValue(mockRefreshToken);

      expect(tokenStorage.hasTokens()).toBe(false);
    });

    it('should return false when refresh token is missing', () => {
      localStorage.setItem('accessToken', mockAccessToken);
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      expect(tokenStorage.hasTokens()).toBe(false);
    });

    it('should return false when both tokens are missing', () => {
      vi.mocked(Cookies.get).mockReturnValue(undefined);

      expect(tokenStorage.hasTokens()).toBe(false);
    });
  });
});
