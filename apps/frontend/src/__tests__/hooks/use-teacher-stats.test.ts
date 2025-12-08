import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useTeacherStats } from '@/hooks/use-teacher-stats';
import { apiClient } from '@/lib/api-client';
import { Booking } from '@/types/booking.types';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useTeacherStats', () => {
  const mockBookings: Booking[] = [
    {
      id: 'booking1',
      studentId: 'student1',
      tutorId: 'tutor1',
      subject: 'Mathematics',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      status: 'completed',
      totalAmount: 50,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-15T11:00:00Z'),
    },
    {
      id: 'booking2',
      studentId: 'student2',
      tutorId: 'tutor1',
      subject: 'Physics',
      startTime: new Date('2024-01-20T14:00:00Z'),
      endTime: new Date('2024-01-20T15:00:00Z'),
      status: 'completed',
      totalAmount: 45,
      createdAt: new Date('2024-01-12T10:00:00Z'),
      updatedAt: new Date('2024-01-20T15:00:00Z'),
    },
    {
      id: 'booking3',
      studentId: 'student1',
      tutorId: 'tutor1',
      subject: 'Mathematics',
      startTime: new Date('2024-01-22T10:00:00Z'),
      endTime: new Date('2024-01-22T11:00:00Z'),
      status: 'completed',
      totalAmount: 50,
      createdAt: new Date('2024-01-18T10:00:00Z'),
      updatedAt: new Date('2024-01-22T11:00:00Z'),
    },
    {
      id: 'booking4',
      studentId: 'student3',
      tutorId: 'tutor1',
      subject: 'Chemistry',
      startTime: new Date('2024-01-25T14:00:00Z'),
      endTime: new Date('2024-01-25T15:00:00Z'),
      status: 'pending',
      totalAmount: 40,
      createdAt: new Date('2024-01-23T10:00:00Z'),
      updatedAt: new Date('2024-01-23T10:00:00Z'),
    },
  ];

  const mockTutorProfile = {
    tutor: {
      id: 'tutor1',
      userId: 'user1',
      rating: 4.7,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock the API responses
    (apiClient.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/bookings/user/')) {
        return Promise.resolve({ bookings: mockBookings });
      }
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutorProfile);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });
  });

  it('fetches and calculates teacher statistics on mount', async () => {
    const { result } = renderHook(() => useTeacherStats('user1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/user1');
    expect(apiClient.get).toHaveBeenCalledWith('/tutors/user1');
    
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.totalStudents).toBe(2); // student1 and student2 (student3 has pending booking)
    expect(result.current.stats?.totalSessions).toBe(3); // 3 completed bookings
    expect(result.current.stats?.totalEarnings).toBe(145); // 50 + 45 + 50
    expect(result.current.stats?.averageRating).toBe(4.7);
    expect(result.current.error).toBeNull();
  });

  it('calculates earnings by period correctly', async () => {
    // Create bookings with specific dates relative to now
    const now = new Date();
    const recentBookings: Booking[] = [
      {
        id: 'booking1',
        studentId: 'student1',
        tutorId: 'tutor1',
        subject: 'Math',
        startTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        endTime: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'completed',
        totalAmount: 50,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'booking2',
        studentId: 'student2',
        tutorId: 'tutor1',
        subject: 'Physics',
        startTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        endTime: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000),
        status: 'completed',
        totalAmount: 45,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'booking3',
        studentId: 'student3',
        tutorId: 'tutor1',
        subject: 'Chemistry',
        startTime: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000), // 200 days ago
        endTime: new Date(now.getTime() - 200 * 24 * 60 * 60 * 1000),
        status: 'completed',
        totalAmount: 40,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    (apiClient.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/bookings/user/')) {
        return Promise.resolve({ bookings: recentBookings });
      }
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutorProfile);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats?.earningsByPeriod.week).toBe(50); // Only booking1
    expect(result.current.stats?.earningsByPeriod.month).toBe(95); // booking1 + booking2
    expect(result.current.stats?.earningsByPeriod.year).toBe(135); // All bookings
    expect(result.current.stats?.totalEarnings).toBe(135);
  });

  it('does not fetch statistics when userId is null', async () => {
    const { result } = renderHook(() => useTeacherStats(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.stats).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('handles bookings fetch error', async () => {
    const errorMessage = 'Failed to fetch bookings';
    (apiClient.get as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.stats).toBeNull();
  });

  it('handles profile fetch error gracefully', async () => {
    (apiClient.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/bookings/user/')) {
        return Promise.resolve({ bookings: mockBookings });
      }
      if (url.includes('/tutors/')) {
        return Promise.reject(new Error('Profile not found'));
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should still calculate stats, but with rating as 0
    expect(result.current.stats).toBeDefined();
    expect(result.current.stats?.averageRating).toBe(0);
    expect(result.current.stats?.totalStudents).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('handles empty bookings array', async () => {
    (apiClient.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/bookings/user/')) {
        return Promise.resolve({ bookings: [] });
      }
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutorProfile);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats?.totalStudents).toBe(0);
    expect(result.current.stats?.totalSessions).toBe(0);
    expect(result.current.stats?.totalEarnings).toBe(0);
    expect(result.current.stats?.averageRating).toBe(4.7);
  });

  it('excludes non-completed bookings from calculations', async () => {
    const mixedBookings: Booking[] = [
      ...mockBookings,
      {
        id: 'booking5',
        studentId: 'student4',
        tutorId: 'tutor1',
        subject: 'Biology',
        startTime: new Date('2024-01-26T10:00:00Z'),
        endTime: new Date('2024-01-26T11:00:00Z'),
        status: 'cancelled',
        totalAmount: 60,
        createdAt: new Date('2024-01-24T10:00:00Z'),
        updatedAt: new Date('2024-01-25T10:00:00Z'),
      },
    ];

    (apiClient.get as Mock).mockImplementation((url: string) => {
      if (url.includes('/bookings/user/')) {
        return Promise.resolve({ bookings: mixedBookings });
      }
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutorProfile);
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Should only count completed bookings
    expect(result.current.stats?.totalStudents).toBe(2);
    expect(result.current.stats?.totalSessions).toBe(3);
    expect(result.current.stats?.totalEarnings).toBe(145); // Excludes cancelled booking
  });

  it('refetches statistics when refetch is called', async () => {
    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCallCount = (apiClient.get as Mock).mock.calls.length;

    await act(async () => {
      await result.current.refetch();
    });

    expect((apiClient.get as Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
  });

  it('updates loading state during refetch', async () => {
    // Use a delayed mock to ensure we can catch the loading state
    (apiClient.get as Mock).mockImplementation((url: string) => 
      new Promise(resolve => setTimeout(() => {
        if (url.includes('/bookings/user/')) {
          resolve({ bookings: mockBookings });
        } else if (url.includes('/tutors/')) {
          resolve(mockTutorProfile);
        }
      }, 50))
    );

    const { result } = renderHook(() => useTeacherStats('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    act(() => {
      result.current.refetch();
    });

    // Loading should be true immediately after calling refetch
    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('refetches when userId changes', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useTeacherStats(userId),
      { initialProps: { userId: 'user1' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const initialCallCount = (apiClient.get as Mock).mock.calls.length;

    rerender({ userId: 'user2' });

    await waitFor(() => {
      expect((apiClient.get as Mock).mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('does not refetch when userId becomes null', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useTeacherStats(userId),
      { initialProps: { userId: 'user1' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callCount = (apiClient.get as Mock).mock.calls.length;

    rerender({ userId: null });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.stats).toBeNull();
    expect(apiClient.get).toHaveBeenCalledTimes(callCount);
  });
});
