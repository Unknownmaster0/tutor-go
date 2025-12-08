/**
 * Token storage utilities for managing JWT tokens
 * - Access tokens are stored in localStorage for easy API access
 * - Refresh tokens are stored in secure cookies for enhanced security
 */

import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_COOKIE = 'refreshToken';

export const tokenStorage = {
  /**
   * Get access token from localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  /**
   * Set access token in localStorage
   */
  setAccessToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    }
  },

  /**
   * Get refresh token from secure cookie
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return Cookies.get(REFRESH_TOKEN_COOKIE) || null;
  },

  /**
   * Set refresh token in secure cookie with security attributes
   * - secure: Only sent over HTTPS (in production)
   * - sameSite: 'strict' to prevent CSRF attacks
   * - expires: 7 days
   */
  setRefreshToken(token: string): void {
    if (typeof window !== 'undefined') {
      Cookies.set(REFRESH_TOKEN_COOKIE, token, {
        expires: 7, // 7 days
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // Strict CSRF protection
        path: '/', // Available across the entire app
      });
    }
  },

  /**
   * Set both access and refresh tokens
   */
  setTokens(accessToken: string, refreshToken: string): void {
    this.setAccessToken(accessToken);
    this.setRefreshToken(refreshToken);
  },

  /**
   * Clear both access token (localStorage) and refresh token (cookie)
   */
  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      Cookies.remove(REFRESH_TOKEN_COOKIE, { path: '/' });
    }
  },

  /**
   * Check if both tokens exist
   */
  hasTokens(): boolean {
    return !!(this.getAccessToken() && this.getRefreshToken());
  },
};
