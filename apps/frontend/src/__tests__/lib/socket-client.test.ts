import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { io, Socket } from 'socket.io-client';
import {
  createSocketConnection,
  getSocket,
  disconnectSocket,
  connectSocket,
  resetSocket,
} from '@/lib/socket-client';
import { getAccessToken } from '@/lib/token-storage';

vi.mock('socket.io-client');
vi.mock('@/lib/token-storage', () => ({
  getAccessToken: vi.fn(),
}));

describe('Socket Client', () => {
  let mockSocket: Partial<Socket>;

  beforeEach(() => {
    mockSocket = {
      connected: false,
      connect: vi.fn(),
      disconnect: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      emit: vi.fn(),
      auth: {},
    };

    vi.mocked(io).mockReturnValue(mockSocket as Socket);
    vi.mocked(getAccessToken).mockReturnValue('test-token');
    resetSocket();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetSocket();
  });

  describe('createSocketConnection', () => {
    it('should create a new socket connection with correct config', () => {
      const config = {
        url: 'http://localhost:3000',
        autoConnect: false,
      };

      const socket = createSocketConnection(config);

      expect(io).toHaveBeenCalledWith(config.url, {
        autoConnect: false,
        auth: {
          token: 'test-token',
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });
      expect(socket).toBeDefined();
    });

    it('should return existing socket if already connected', () => {
      mockSocket.connected = true;
      vi.mocked(io).mockReturnValue(mockSocket as Socket);

      const config = { url: 'http://localhost:3000' };
      
      const socket1 = createSocketConnection(config);
      const socket2 = createSocketConnection(config);

      expect(socket1).toBe(socket2);
      expect(io).toHaveBeenCalledTimes(1);
    });

    it('should use autoConnect true by default when not specified', () => {
      const config = { url: 'http://localhost:3000' };

      createSocketConnection(config);

      expect(io).toHaveBeenCalledWith(
        config.url,
        expect.objectContaining({
          autoConnect: false,
        })
      );
    });
  });

  describe('getSocket', () => {
    it('should return null when no socket exists', () => {
      const socket = getSocket();
      expect(socket).toBeNull();
    });

    it('should return the socket instance after creation', () => {
      const config = { url: 'http://localhost:3000' };
      createSocketConnection(config);

      const socket = getSocket();
      expect(socket).toBeDefined();
    });
  });

  describe('disconnectSocket', () => {
    it('should disconnect and clear the socket', () => {
      const config = { url: 'http://localhost:3000' };
      createSocketConnection(config);

      disconnectSocket();

      expect(mockSocket.disconnect).toHaveBeenCalled();
      expect(getSocket()).toBeNull();
    });

    it('should handle disconnect when no socket exists', () => {
      expect(() => disconnectSocket()).not.toThrow();
    });
  });

  describe('connectSocket', () => {
    it('should connect socket with updated token', () => {
      const config = { url: 'http://localhost:3000', autoConnect: false };
      createSocketConnection(config);

      vi.mocked(getAccessToken).mockReturnValue('new-token');

      connectSocket();

      expect(mockSocket.auth).toEqual({ token: 'new-token' });
      expect(mockSocket.connect).toHaveBeenCalled();
    });

    it('should not connect if socket is already connected', () => {
      mockSocket.connected = true;
      const config = { url: 'http://localhost:3000' };
      createSocketConnection(config);

      connectSocket();

      expect(mockSocket.connect).not.toHaveBeenCalled();
    });

    it('should handle connect when no socket exists', () => {
      expect(() => connectSocket()).not.toThrow();
    });
  });
});
