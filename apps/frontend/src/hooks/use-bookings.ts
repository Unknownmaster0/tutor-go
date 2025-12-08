import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Booking, BookingStatus } from '@/types/booking.types';

interface UseBookingsResult {
  bookings: Booking[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface BookingsFilterParams {
  status?: BookingStatus;
}

/**
 * Custom hook for fetching user bookings
 *
 * @param userId - The ID of the user whose bookings to fetch
 * @param params - Optional filter parameters (e.g., status)
 * @returns Object containing bookings array, loading state, error state, and refetch function
 */
export function useBookings(
  userId: string | null,
  params?: BookingsFilterParams,
): UseBookingsResult {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setBookings([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params?.status) {
        queryParams.append('status', params.status);
      }

      const queryString = queryParams.toString();
      const url = `/bookings/user/${userId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get<Booking[]>(url);
      setBookings(Array.isArray(response) ? response : []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, params?.status]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const refetch = useCallback(async () => {
    await fetchBookings();
  }, [fetchBookings]);

  return {
    bookings,
    isLoading,
    error,
    refetch,
  };
}
