import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { tokenStorage } from './token-storage';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Enable cookies for cross-origin requests
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = tokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor to handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // Handle 401 errors with token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            // Get refresh token from cookie storage
            const refreshToken = tokenStorage.getRefreshToken();

            if (!refreshToken) {
              // No refresh token available, redirect to login
              tokenStorage.clearTokens();
              if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
              }
              return Promise.reject(error);
            }

            // Attempt to refresh the access token
            const response = await axios.post(`${API_URL}/auth/refresh`, {
              refreshToken,
            });

            // Extract new access token from response
            // Backend returns: { success: true, message: "...", data: { accessToken, ... } }
            const apiResponse = response.data;
            const newAccessToken = apiResponse.data?.accessToken;

            if (!newAccessToken) {
              throw new Error('No access token in refresh response');
            }

            // Store the new access token
            tokenStorage.setAccessToken(newAccessToken);

            // Update the failed request with new token and retry
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            // Refresh failed, clear all tokens and redirect to login
            tokenStorage.clearTokens();
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login';
            }
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.get<{ success: boolean; message: string; data: T }>(
      url,
      config,
    );
    return response.data.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.post<{ success: boolean; message: string; data: T }>(
      url,
      data,
      config,
    );
    return response.data.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.put<{ success: boolean; message: string; data: T }>(
      url,
      data,
      config,
    );
    return response.data.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig) {
    const response = await this.client.patch<{ success: boolean; message: string; data: T }>(
      url,
      data,
      config,
    );
    return response.data.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig) {
    const response = await this.client.delete<{ success: boolean; message: string; data: T }>(
      url,
      config,
    );
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
