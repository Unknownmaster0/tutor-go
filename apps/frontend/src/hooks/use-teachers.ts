import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Teacher } from '@/types/dashboard.types';

interface UseTeachersResult {
  teachers: Teacher[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface TeacherSearchParams {
  subject?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

/**
 * Custom hook for fetching the list of available teachers
 *
 * @param params - Optional search parameters for filtering teachers
 * @returns Object containing teachers array, loading state, error state, and refetch function
 */
export function useTeachers(params?: TeacherSearchParams): UseTeachersResult {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeachers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.subject) queryParams.append('subject', params.subject);
      if (params?.minRate !== undefined) queryParams.append('minRate', params.minRate.toString());
      if (params?.maxRate !== undefined) queryParams.append('maxRate', params.maxRate.toString());
      if (params?.minRating !== undefined)
        queryParams.append('minRating', params.minRating.toString());
      if (params?.latitude !== undefined)
        queryParams.append('latitude', params.latitude.toString());
      if (params?.longitude !== undefined)
        queryParams.append('longitude', params.longitude.toString());
      if (params?.radius !== undefined) queryParams.append('radius', params.radius.toString());

      const queryString = queryParams.toString();
      const url = `/tutors/search${queryString ? `?${queryString}` : ''}`;

      console.log(`[useTeachers] Fetching teachers from ${url}`);
      const response = await apiClient.get<Teacher[]>(url);
      console.log('[useTeachers] Response received:', response);
      
      // Backend returns array directly after apiClient extracts the data field
      setTeachers(Array.isArray(response) ? response : []);
    } catch (err) {
      let errorMessage = 'Failed to fetch teachers';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      console.error('[useTeachers] Error fetching teachers:', err);
      
      // Check if it's a network error
      if (errorMessage.includes('Network Error') || errorMessage.includes('Unable to reach')) {
        errorMessage = 'Network Error: API Gateway is not responding. Make sure the backend services are running with "npm run dev"';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [
    params?.subject,
    params?.minRate,
    params?.maxRate,
    params?.minRating,
    params?.latitude,
    params?.longitude,
    params?.radius,
  ]);

  useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const refetch = useCallback(async () => {
    await fetchTeachers();
  }, [fetchTeachers]);

  return {
    teachers,
    isLoading,
    error,
    refetch,
  };
}
