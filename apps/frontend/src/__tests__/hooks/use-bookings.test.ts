import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useBookings } from '@/hooks/use-bookings';
import { apiClient } from '@/lib/api-client';
import { Booking } from '@/types/booking.types';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useBookings', () => {
  const mockBookings: Booking[] = [
    {
      id: 'booking1',
      studentId: 'student1',
      tutorId: 'tutor1',
      subject: 'Mathematics',
      startTime: new Date('2024-01-15T10:00:00Z'),
      endTime: new Date('2024-01-15T11:00:00Z'),
      status: 'confirmed',
      totalAmount: 50,
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-10T10:00:00Z'),
    },
    {
      id: 'booking2',
      studentId: 'student1',
      tutorId: 'tutor2',
      subject: 'Physics',
      startTime: new Date('2024-01-20T14:00:00Z'),
      endTime: new Date('2024-01-20T15:00:00Z'),
      status: 'completed',
      totalAmount: 45,
      createdAt: new Date('2024-01-12T10:00:00Z'),
      updatedAt: new Date('2024-01-20T15:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as Mock).mockResolvedValue({ bookings: mockBookings });
  });

  it('fetches bookings on mount', async () => {
    const { result } = renderHook(() => useBookings('student1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/student1');
    expect(result.current.bookings).toEqual(mockBookings);
    expect(result.current.error).toBeNull();
  });

  it('fetches bookings with status filter', async () => {
    const { result } = renderHook(() => useBookings('student1', { status: 'completed' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/student1?status=completed');
    expect(result.current.bookings).toEqual(mockBookings);
  });

  it('does not fetch bookings when userId is null', async () => {
    const { result } = renderHook(() => useBookings(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.bookings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch bookings';
    (apiClient.get as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useBookings('student1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.bookings).toEqual([]);
  });

  it('handles empty response', async () => {
    (apiClient.get as Mock).mockResolvedValue({ bookings: [] });

    const { result } = renderHook(() => useBookings('student1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles response without bookings property', async () => {
    (apiClient.get as Mock).mockResolvedValue({});

    const { result } = renderHook(() => useBookings('student1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookings).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('refetches bookings when refetch is called', async () => {
    const { result } = renderHook(() => useBookings('student1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(result.current.bookings).toEqual(mockBookings);
  });

  it('updates loading state during refetch', async () => {
    // Use a delayed mock to ensure we can catch the loading state
    (apiClient.get as Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ bookings: mockBookings }), 50))
    );

    const { result } = renderHook(() => useBookings('student1'));

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

  it('clears error on successful refetch', async () => {
    (apiClient.get as Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBookings('student1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    (apiClient.get as Mock).mockResolvedValue({ bookings: mockBookings });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.bookings).toEqual(mockBookings);
    });
  });

  it('refetches when userId changes', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useBookings(userId),
      { initialProps: { userId: 'student1' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/student1');
    });

    rerender({ userId: 'student2' });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/student2');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('refetches when status filter changes', async () => {
    const { result, rerender } = renderHook(
      ({ status }) => useBookings('student1', { status }),
      { initialProps: { status: 'pending' as const } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/student1?status=pending');
    });

    rerender({ status: 'completed' as const });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/bookings/user/student1?status=completed');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('does not refetch when userId becomes null', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useBookings(userId),
      { initialProps: { userId: 'student1' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callCount = (apiClient.get as Mock).mock.calls.length;

    rerender({ userId: null });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.bookings).toEqual([]);
    expect(apiClient.get).toHaveBeenCalledTimes(callCount);
  });

  it('does not refetch when params remain the same', async () => {
    const { result, rerender } = renderHook(() => useBookings('student1', { status: 'completed' }));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    const callCount = (apiClient.get as Mock).mock.calls.length;
    expect(callCount).toBe(1);

    rerender();

    // Wait a bit to ensure no additional calls are made
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(apiClient.get).toHaveBeenCalledTimes(callCount);
  });
});
