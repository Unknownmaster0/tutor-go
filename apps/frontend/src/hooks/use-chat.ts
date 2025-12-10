import { useState, useEffect, useCallback } from 'react';
import { useSocket } from './use-socket';
import { Message, Conversation, ReceiveMessageEvent, UserStatus } from '@/types/chat.types';
import { apiClient } from '@/lib/api-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8007';

export interface UseChatOptions {
  userId: string;
  autoConnect?: boolean;
}

export interface UseChatReturn {
  conversations: Conversation[];
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
  userStatuses: Map<string, UserStatus>;
  loadConversations: () => Promise<void>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, receiverId: string, message: string) => void;
  markAsRead: (messageId: string) => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

export const useChat = (options: UseChatOptions): UseChatReturn => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userStatuses, setUserStatuses] = useState<Map<string, UserStatus>>(new Map());

  const { socket, isConnected, connect, disconnect, emit, on, off } = useSocket({
    url: SOCKET_URL,
    autoConnect: options.autoConnect ?? true,
    onConnect: () => {
      console.log('Chat connected');
    },
    onDisconnect: (reason) => {
      console.log('Chat disconnected:', reason);
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError(error.message);
    },
  });

  // Load conversations
  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Conversation[]>(`/chat/conversations/${options.userId}`);
      setConversations(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  }, [options.userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<Message[]>(`/chat/messages/${conversationId}`);
      setMessages(Array.isArray(response) ? response : []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(
    (conversationId: string, receiverId: string, message: string) => {
      if (!socket || !isConnected) {
        setError('Not connected to chat server');
        return;
      }

      const messageData = {
        conversationId,
        senderId: options.userId,
        receiverId,
        message,
        timestamp: new Date(),
      };

      emit('send-message', messageData);

      // Optimistically add message to local state
      const optimisticMessage: Message = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: options.userId,
        receiverId,
        message,
        read: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, optimisticMessage]);
    },
    [socket, isConnected, options.userId, emit],
  );

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await apiClient.patch(`/chat/messages/${messageId}/read`);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === messageId ? { ...msg, read: true } : msg)),
      );
    } catch (err: any) {
      console.error('Failed to mark message as read:', err);
    }
  }, []);

  // Calculate total unread count
  const unreadCount = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data: ReceiveMessageEvent) => {
      const newMessage: Message = {
        id: data.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        receiverId: options.userId,
        message: data.message,
        read: data.read,
        timestamp: new Date(data.timestamp),
      };

      setMessages((prev) => {
        // Remove optimistic message if it exists
        const filtered = prev.filter((msg) => !msg.id.startsWith('temp-'));
        return [...filtered, newMessage];
      });

      // Update conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === data.conversationId
            ? {
                ...conv,
                lastMessage: data.message,
                lastMessageTime: new Date(data.timestamp),
                unreadCount: conv.unreadCount + 1,
              }
            : conv,
        ),
      );
    };

    const handleUserStatus = (data: UserStatus) => {
      setUserStatuses((prev) => {
        const updated = new Map(prev);
        updated.set(data.userId, data);
        return updated;
      });
    };

    const handleMessageRead = (data: { messageId: string }) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.messageId ? { ...msg, read: true } : msg)),
      );
    };

    on('receive-message', handleReceiveMessage);
    on('user-status', handleUserStatus);
    on('message-read', handleMessageRead);

    return () => {
      off('receive-message', handleReceiveMessage);
      off('user-status', handleUserStatus);
      off('message-read', handleMessageRead);
    };
  }, [socket, options.userId, on, off]);

  return {
    conversations,
    messages,
    isConnected,
    isLoading,
    error,
    unreadCount,
    userStatuses,
    loadConversations,
    loadMessages,
    sendMessage,
    markAsRead,
    connect,
    disconnect,
  };
};
