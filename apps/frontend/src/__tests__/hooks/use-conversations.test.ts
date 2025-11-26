import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, Mock } from 'vitest';
import { useConversations } from '@/hooks/use-conversations';
import { apiClient } from '@/lib/api-client';
import { Conversation } from '@/types/chat.types';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('useConversations', () => {
  const mockConversations: Conversation[] = [
    {
      id: 'conv1',
      participants: ['user1', 'user2'],
      lastMessage: {
        id: 'msg1',
        conversationId: 'conv1',
        senderId: 'user2',
        content: 'Hello, how are you?',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        read: false,
      },
      createdAt: new Date('2024-01-10T10:00:00Z'),
      updatedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
      id: 'conv2',
      participants: ['user1', 'user3'],
      lastMessage: {
        id: 'msg2',
        conversationId: 'conv2',
        senderId: 'user1',
        content: 'Thanks for the session!',
        createdAt: new Date('2024-01-14T14:00:00Z'),
        read: true,
      },
      createdAt: new Date('2024-01-12T10:00:00Z'),
      updatedAt: new Date('2024-01-14T14:00:00Z'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (apiClient.get as Mock).mockResolvedValue({ conversations: mockConversations });
  });

  it('fetches conversations on mount', async () => {
    const { result } = renderHook(() => useConversations('user1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledWith('/chat/conversations/user1');
    expect(result.current.conversations).toEqual(mockConversations);
    expect(result.current.error).toBeNull();
  });

  it('does not fetch conversations when userId is null', async () => {
    const { result } = renderHook(() => useConversations(null));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).not.toHaveBeenCalled();
    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    const errorMessage = 'Failed to fetch conversations';
    (apiClient.get as Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useConversations('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.conversations).toEqual([]);
  });

  it('handles empty response', async () => {
    (apiClient.get as Mock).mockResolvedValue({ conversations: [] });

    const { result } = renderHook(() => useConversations('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('handles response without conversations property', async () => {
    (apiClient.get as Mock).mockResolvedValue({});

    const { result } = renderHook(() => useConversations('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.conversations).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('refetches conversations when refetch is called', async () => {
    const { result } = renderHook(() => useConversations('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(apiClient.get).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refetch();
    });

    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(result.current.conversations).toEqual(mockConversations);
  });

  it('updates loading state during refetch', async () => {
    // Use a delayed mock to ensure we can catch the loading state
    (apiClient.get as Mock).mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ conversations: mockConversations }), 50))
    );

    const { result } = renderHook(() => useConversations('user1'));

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

    const { result } = renderHook(() => useConversations('user1'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe('Network error');
    });

    (apiClient.get as Mock).mockResolvedValue({ conversations: mockConversations });

    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.error).toBeNull();
      expect(result.current.conversations).toEqual(mockConversations);
    });
  });

  it('refetches when userId changes', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useConversations(userId),
      { initialProps: { userId: 'user1' } }
    );

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
      expect(apiClient.get).toHaveBeenCalledWith('/chat/conversations/user1');
    });

    rerender({ userId: 'user2' });

    await waitFor(() => {
      expect(apiClient.get).toHaveBeenCalledWith('/chat/conversations/user2');
      expect(apiClient.get).toHaveBeenCalledTimes(2);
    });
  });

  it('does not refetch when userId becomes null', async () => {
    const { result, rerender } = renderHook(
      ({ userId }) => useConversations(userId),
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

    expect(result.current.conversations).toEqual([]);
    expect(apiClient.get).toHaveBeenCalledTimes(callCount);
  });

  it('does not refetch when userId remains the same', async () => {
    const { result, rerender } = renderHook(() => useConversations('user1'));

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
