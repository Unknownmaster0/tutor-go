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
  topRated?: boolean; // Get top-rated teachers for dashboard
  limit?: number;
}

/**
 * Custom hook for fetching the list of available teachers
 * By default, fetches top-rated teachers for dashboard display
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

      // Determine which endpoint to use
      const isTopRated = params?.topRated !== false; // Default to top-rated
      let url = '';

      if (isTopRated) {
        // Fetch top-rated teachers for dashboard
        const limit = params?.limit || 6;
        url = `/tutors/top-rated?limit=${limit}`;
      } else {
        // Build query string for search
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
        url = `/tutors/search${queryString ? `?${queryString}` : ''}`;
      }

      const response = await apiClient.get<Teacher[]>(url);
      // Backend returns array directly after apiClient extracts the data field
      setTeachers(Array.isArray(response) ? response : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teachers';
      setError(errorMessage);
      console.error('Error fetching teachers:', err);
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
    params?.topRated,
    params?.limit,
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
