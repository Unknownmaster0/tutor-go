import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Conversation } from '@/types/chat.types';

interface UseConversationsResult {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching user chat conversations
 * 
 * @param userId - The ID of the user whose conversations to fetch
 * @returns Object containing conversations array, loading state, error state, and refetch function
 */
export function useConversations(userId: string | null): UseConversationsResult {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      setConversations([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const url = `/chat/conversations/${userId}`;
      const response = await apiClient.get<{ conversations: Conversation[] }>(url);
      setConversations(response.conversations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch conversations';
      setError(errorMessage);
      console.error('Error fetching conversations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const refetch = useCallback(async () => {
    await fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    refetch,
  };
}
