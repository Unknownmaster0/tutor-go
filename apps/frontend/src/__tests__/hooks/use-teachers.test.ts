import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useTeachers } from '@/hooks/use-teachers';
import { apiClient } from '@/lib/api-client';
import { Teacher } from '@/types/dashboard.types';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useTeachers', () => {
  const mockTeachers: Teacher[] = [
    {
      id: 'tutor1',
      userId: 'user1',
      name: 'John Doe',
      email: 'john@example.com',
      bio: 'Experienced math tutor',
      subjects: ['Mathematics', 'Physics'],
      hourlyRate: 50,
      rating: 4.8,
      totalReviews: 25,
      profilePicture: 'https://example.com/john.jpg',
      location: {
        type: 'Point',
        coordinates: [-73.935242, 40.730610],
        address: 'New York, NY',
      },
    },
    {
      id: 'tutor2',
      userId: 'user2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      bio: 'English language specialist',
      subjects: ['English', 'Literature'],
      hourlyRate: 45,
      rating: 4.9,
      totalReviews: 30,
      profilePicture: 'https://example.com/jane.jpg',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as Mock).mockResolvedValue({ tutors: mockTeachers });
  });

  it('fetches teachers on mount', async () => {
    const { result } = renderHook(() => useTeachers());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/tutors/search');
    expect(result.current.teachers).toEqual(mockTeachers);
    expect(result.current.error).toBeNull();
  });

  it('fetches teachers with search parameters', async () => {
    const params = {
      subject: 'Mathematics',
      minRate: 30,
      maxRate: 60,
      minRating: 4.5,
    };

    const { result } = renderHook(() => useTeachers(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/tutors/search?subject=Mathematics&minRate=30&maxRate=60&minRating=4.5'
    );
    expect(result.current.teachers).toEqual(mockTeachers);
  });

  it('fetches teachers with location parameters', async () => {
    const params = {
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 10,
    };

    const { result } = renderHook(() => useTeachers(params));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith(
      '/tutors/search?latitude=40.7128&longitude=-74.006&radius=10'
    );
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch teachers';
    (apiClient.get as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.teachers).toEqual([]);
  });

  it('handles empty response', async () => {
    (apiClient.get as Mock).mockResolvedValue({ tutors: [] });

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.teachers).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles response without tutors property', async () => {
    (apiClient.get as Mock).mockResolvedValue({});

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.teachers).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('refetches teachers when refetch is called', async () => {
    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(result.current.teachers).toEqual(mockTeachers);
  });

  it('updates loading state during refetch', async () => {
    // Use a delayed mock to ensure we can catch the loading state
    (apiClient.get as Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ tutors: mockTeachers }), 50))
    );

    const { result } = renderHook(() => useTeachers());

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

    const { result } = renderHook(() => useTeachers());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    (apiClient.get as Mock).mockResolvedValue({ tutors: mockTeachers });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.teachers).toEqual(mockTeachers);
    });
  });

  it('refetches when params change', async () => {
    const { result, rerender } = renderHook(
      ({ params }) => useTeachers(params),
      { initialProps: { params: { subject: 'Math' } } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(apiClient.get).toHaveBeenCalledWith('/tutors/search?subject=Math');
    });

    rerender({ params: { subject: 'English' } });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/tutors/search?subject=English');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('does not refetch when params remain the same', async () => {
    const params = { subject: 'Math' };
    const { result, rerender } = renderHook(() => useTeachers(params));

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
