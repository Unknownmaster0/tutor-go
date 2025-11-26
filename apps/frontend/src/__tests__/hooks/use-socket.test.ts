import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { Socket } from 'socket.io-client';
import { useSocket } from '@/hooks/use-socket';
import * as socketClient from '@/lib/socket-client';

vi.mock('@/lib/socket-client');

describe('useSocket', () => {
  let mockSocket: Partial<Socket>;
  let eventHandlers: Map<string, Function>;

  beforeEach(() => {
    eventHandlers = new Map();

    mockSocket = {
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn((event: string, handler: Function) => {
        eventHandlers.set(event, handler);
        return mockSocket as Socket;
      }),
      off: vi.fn((event: string) => {
        eventHandlers.delete(event);
        return mockSocket as Socket;
      }),
      emit: vi.fn(),
    };

    vi.mocked(socketClient.createSocketConnection).mockReturnValue(mockSocket as Socket);
    vi.mocked(socketClient.getSocket).mockReturnValue(mockSocket as Socket);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should create socket connection on mount', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      renderHook(() => useSocket(options));

      expect(socketClient.createSocketConnection).toHaveBeenCalledWith({
        url: options.url,
        autoConnect: options.autoConnect,
      });
    });

    it('should register connection event handlers', () => {
      const options = {
        url: 'http://localhost:3000',
        onConnect: vi.fn(),
        onDisconnect: vi.fn(),
        onError: vi.fn(),
        onReconnect: vi.fn(),
      };

      renderHook(() => useSocket(options));

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('reconnect', expect.any(Function));
    });

    it('should auto-connect if autoConnect is true', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: true,
      };

      renderHook(() => useSocket(options));

      expect(mockSocket.connect).toHaveBeenCalled();
    });
  });

  describe('connection state', () => {
    it('should update isConnected when socket connects', async () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));

      expect(result.current.isConnected).toBe(false);

      // Simulate connect event
      const connectHandler = eventHandlers.get('connect');
      connectHandler?.();

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });
    });

    it('should update isConnected when socket disconnects', async () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));

      // Simulate connect then disconnect
      const connectHandler = eventHandlers.get('connect');
      connectHandler?.();

      await waitFor(() => {
        expect(result.current.isConnected).toBe(true);
      });

      const disconnectHandler = eventHandlers.get('disconnect');
      disconnectHandler?.('transport close');

      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });
  });

  describe('callbacks', () => {
    it('should call onConnect callback when connected', async () => {
      const onConnect = vi.fn();
      const options = {
        url: 'http://localhost:3000',
        onConnect,
      };

      renderHook(() => useSocket(options));

      const connectHandler = eventHandlers.get('connect');
      connectHandler?.();

      await waitFor(() => {
        expect(onConnect).toHaveBeenCalled();
      });
    });

    it('should call onDisconnect callback with reason', async () => {
      const onDisconnect = vi.fn();
      const options = {
        url: 'http://localhost:3000',
        onDisconnect,
      };

      renderHook(() => useSocket(options));

      const disconnectHandler = eventHandlers.get('disconnect');
      disconnectHandler?.('transport error');

      await waitFor(() => {
        expect(onDisconnect).toHaveBeenCalledWith('transport error');
      });
    });

    it('should call onError callback when error occurs', async () => {
      const onError = vi.fn();
      const options = {
        url: 'http://localhost:3000',
        onError,
      };

      renderHook(() => useSocket(options));

      const error = new Error('Connection failed');
      const errorHandler = eventHandlers.get('error');
      errorHandler?.(error);

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error);
      });
    });

    it('should call onReconnect callback with attempt number', async () => {
      const onReconnect = vi.fn();
      const options = {
        url: 'http://localhost:3000',
        onReconnect,
      };

      renderHook(() => useSocket(options));

      const reconnectHandler = eventHandlers.get('reconnect');
      reconnectHandler?.(3);

      await waitFor(() => {
        expect(onReconnect).toHaveBeenCalledWith(3);
      });
    });
  });

  describe('methods', () => {
    it('should connect socket when connect is called', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));

      result.current.connect();

      expect(socketClient.connectSocket).toHaveBeenCalled();
    });

    it('should disconnect socket when disconnect is called', async () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));

      result.current.disconnect();

      expect(socketClient.disconnectSocket).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.isConnected).toBe(false);
      });
    });

    it('should emit events through socket', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));

      result.current.emit('test-event', { data: 'test' });

      expect(mockSocket.emit).toHaveBeenCalledWith('test-event', { data: 'test' });
    });

    it('should register event listeners', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));
      const handler = vi.fn();

      result.current.on('custom-event', handler);

      expect(mockSocket.on).toHaveBeenCalledWith('custom-event', handler);
    });

    it('should remove event listeners', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));
      const handler = vi.fn();

      result.current.on('custom-event', handler);
      result.current.off('custom-event', handler);

      expect(mockSocket.off).toHaveBeenCalledWith('custom-event', handler);
    });

    it('should remove all listeners for event when no handler provided', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { result } = renderHook(() => useSocket(options));

      result.current.off('custom-event');

      expect(mockSocket.off).toHaveBeenCalledWith('custom-event');
    });
  });

  describe('cleanup', () => {
    it('should disconnect and clean up on unmount', () => {
      const options = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const { unmount } = renderHook(() => useSocket(options));

      unmount();

      expect(mockSocket.off).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockSocket.off).toHaveBeenCalledWith('reconnect', expect.any(Function));
      expect(socketClient.disconnectSocket).toHaveBeenCalled();
    });
  });
});
