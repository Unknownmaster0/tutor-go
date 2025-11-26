import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useChat } from '@/hooks/use-chat';
import * as useSocketModule from '@/hooks/use-socket';
import axios from 'axios';

vi.mock('@/hooks/use-socket');
vi.mock('axios');

describe('useChat', () => {
  let mockSocket: any;
  let mockUseSocket: any;
  let eventHandlers: Map<string, Function>;

  beforeEach(() => {
    eventHandlers = new Map();

    mockSocket = {
      emit: vi.fn(),
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers.set(event, handler);
      }),
      off: vi.fn(),
    };

    mockUseSocket = {
      socket: mockSocket,
      isConnected: true,
      connect: vi.fn(),
      disconnect: vi.fn(),
      emit: vi.fn(),
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers.set(event, handler);
      }),
      off: vi.fn(),
    };

    vi.mocked(useSocketModule.useSocket).mockReturnValue(mockUseSocket);
    vi.mocked(axios.get).mockResolvedValue({ data: [] });
    vi.mocked(axios.patch).mockResolvedValue({ data: {} });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      expect(result.current.conversations).toEqual([]);
      expect(result.current.messages).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.unreadCount).toBe(0);
    });

    it('should connect to socket on mount when autoConnect is true', () => {
      renderHook(() => useChat({ userId: 'user-1', autoConnect: true }));

      expect(useSocketModule.useSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          autoConnect: true,
        })
      );
    });
  });

  describe('loadConversations', () => {
    it('should load conversations successfully', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          participants: ['user-1', 'user-2'],
          lastMessage: 'Hello',
          lastMessageTime: new Date(),
          unreadCount: 1,
        },
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockConversations });

      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      await act(async () => {
        await result.current.loadConversations();
      });

      await waitFor(() => {
        expect(result.current.conversations).toEqual(mockConversations);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
      });
    });

    it('should handle load conversations error', async () => {
      const errorMessage = 'Failed to load';
      vi.mocked(axios.get).mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      await act(async () => {
        await result.current.loadConversations();
      });

      await waitFor(() => {
        expect(result.current.error).toBe(errorMessage);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('loadMessages', () => {
    it('should load messages successfully', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'conv-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          message: 'Hello',
          read: false,
          timestamp: new Date(),
        },
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockMessages });

      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      await act(async () => {
        await result.current.loadMessages('conv-1');
      });

      await waitFor(() => {
        expect(result.current.messages).toEqual(mockMessages);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('sendMessage', () => {
    it('should send message when connected', () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      act(() => {
        result.current.sendMessage('conv-1', 'user-2', 'Hello');
      });

      expect(mockUseSocket.emit).toHaveBeenCalledWith(
        'send-message',
        expect.objectContaining({
          conversationId: 'conv-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          message: 'Hello',
        })
      );
    });

    it('should add optimistic message to state', () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      act(() => {
        result.current.sendMessage('conv-1', 'user-2', 'Hello');
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].message).toBe('Hello');
      expect(result.current.messages[0].id).toMatch(/^temp-/);
    });

    it('should set error when not connected', () => {
      mockUseSocket.isConnected = false;

      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      act(() => {
        result.current.sendMessage('conv-1', 'user-2', 'Hello');
      });

      expect(result.current.error).toBe('Not connected to chat server');
    });
  });

  describe('markAsRead', () => {
    it('should mark message as read', async () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      // Add a message first
      act(() => {
        result.current.sendMessage('conv-1', 'user-2', 'Hello');
      });

      const messageId = result.current.messages[0].id;

      await act(async () => {
        await result.current.markAsRead(messageId);
      });

      await waitFor(() => {
        const message = result.current.messages.find((m) => m.id === messageId);
        expect(message?.read).toBe(true);
      });
    });
  });

  describe('real-time updates', () => {
    it('should handle incoming messages', async () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      const incomingMessage = {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-2',
        message: 'Hi there',
        timestamp: new Date(),
        read: false,
      };

      act(() => {
        const handler = eventHandlers.get('receive-message');
        handler?.(incomingMessage);
      });

      await waitFor(() => {
        expect(result.current.messages).toHaveLength(1);
        expect(result.current.messages[0].message).toBe('Hi there');
      });
    });

    it('should update user status', async () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      const userStatus = {
        userId: 'user-2',
        online: true,
        lastSeen: new Date(),
      };

      act(() => {
        const handler = eventHandlers.get('user-status');
        handler?.(userStatus);
      });

      await waitFor(() => {
        const status = result.current.userStatuses.get('user-2');
        expect(status?.online).toBe(true);
      });
    });

    it('should handle message read event', async () => {
      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      // Add a message first
      act(() => {
        result.current.sendMessage('conv-1', 'user-2', 'Hello');
      });

      const messageId = result.current.messages[0].id;

      act(() => {
        const handler = eventHandlers.get('message-read');
        handler?.({ messageId });
      });

      await waitFor(() => {
        const message = result.current.messages.find((m) => m.id === messageId);
        expect(message?.read).toBe(true);
      });
    });
  });

  describe('unreadCount', () => {
    it('should calculate total unread count', async () => {
      const mockConversations = [
        {
          id: 'conv-1',
          participants: ['user-1', 'user-2'],
          lastMessage: 'Hello',
          lastMessageTime: new Date(),
          unreadCount: 2,
        },
        {
          id: 'conv-2',
          participants: ['user-1', 'user-3'],
          lastMessage: 'Hi',
          lastMessageTime: new Date(),
          unreadCount: 3,
        },
      ];

      vi.mocked(axios.get).mockResolvedValueOnce({ data: mockConversations });

      const { result } = renderHook(() =>
        useChat({ userId: 'user-1', autoConnect: false })
      );

      await act(async () => {
        await result.current.loadConversations();
      });

      await waitFor(() => {
        expect(result.current.unreadCount).toBe(5);
      });
    });
  });
});
