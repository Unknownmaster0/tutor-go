import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { DashboardStats } from '@/types/dashboard.types';
import { Booking } from '@/types/booking.types';

interface UseTeacherStatsResult {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching and calculating teacher statistics
 * 
 * This hook aggregates data from multiple sources:
 * - Bookings: to calculate total students, sessions, and earnings
 * - Reviews: to get average rating
 * 
 * @param userId - The ID of the teacher user
 * @returns Object containing stats, loading state, error state, and refetch function
 */
export function useTeacherStats(userId: string | null): UseTeacherStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeacherStats = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setStats(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Fetch bookings for the teacher
      const bookingsResponse = await apiClient.get<{ bookings: Booking[] }>(`/bookings/user/${userId}`);
      const bookings = bookingsResponse.bookings || [];

      // Calculate total students (unique student IDs from completed bookings)
      const completedBookings = bookings.filter(b => b.status === 'completed');
      const uniqueStudentIds = new Set(completedBookings.map(b => b.studentId));
      const totalStudents = uniqueStudentIds.size;

      // Calculate total sessions (completed bookings)
      const totalSessions = completedBookings.length;

      // Calculate total earnings
      const totalEarnings = completedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      // Calculate earnings by period
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

      const weeklyEarnings = completedBookings
        .filter(b => new Date(b.endTime) >= oneWeekAgo)
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      const monthlyEarnings = completedBookings
        .filter(b => new Date(b.endTime) >= oneMonthAgo)
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      const yearlyEarnings = completedBookings
        .filter(b => new Date(b.endTime) >= oneYearAgo)
        .reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

      // Fetch teacher profile to get average rating
      let averageRating = 0;
      try {
        const profileResponse = await apiClient.get<{ tutor: { rating: number } }>(`/tutors/${userId}`);
        averageRating = profileResponse.tutor?.rating || 0;
      } catch (profileError) {
        console.warn('Failed to fetch teacher profile for rating:', profileError);
        // Continue with rating as 0 if profile fetch fails
      }

      const calculatedStats: DashboardStats = {
        totalStudents,
        totalSessions,
        averageRating,
        totalEarnings,
        earningsByPeriod: {
          week: weeklyEarnings,
          month: monthlyEarnings,
          year: yearlyEarnings,
        },
      };

      setStats(calculatedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch teacher statistics';
      setError(errorMessage);
      console.error('Error fetching teacher statistics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchTeacherStats();
  }, [fetchTeacherStats]);

  const refetch = useCallback(async () => {
    await fetchTeacherStats();
  }, [fetchTeacherStats]);

  return {
    stats,
    isLoading,
    error,
    refetch,
  };
}
