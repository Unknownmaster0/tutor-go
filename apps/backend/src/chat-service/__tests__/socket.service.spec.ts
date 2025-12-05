import { Server, Socket } from 'socket.io';
import { SocketService } from '../services/socket.service';
import { AuthenticatedSocket } from '../middleware/socket-auth.middleware';

// Mock dependencies
jest.mock('../../shared', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('SocketService', () => {
  let mockIo: any;
  let socketService: SocketService;
  let mockSocket: Partial<AuthenticatedSocket>;
  let connectionHandler: (socket: Socket) => void;

  beforeEach(() => {
    // Mock Socket.IO server
    mockIo = {
      on: jest.fn((event: string, handler: any) => {
        if (event === 'connection') {
          connectionHandler = handler;
        }
        return mockIo;
      }),
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    };

    socketService = new SocketService(mockIo as Server);

    // Mock authenticated socket
    mockSocket = {
      id: 'socket-123',
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'student',
      },
      join: jest.fn(),
      leave: jest.fn(),
      emit: jest.fn(),
      on: jest.fn(),
      disconnect: jest.fn(),
      broadcast: {
        emit: jest.fn(),
      } as any,
    };
  });

  describe('initialize', () => {
    it('should set up connection handler', () => {
      socketService.initialize();

      expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('handleConnection', () => {
    beforeEach(() => {
      socketService.initialize();
    });

    it('should handle new authenticated connection', async () => {
      await connectionHandler(mockSocket as Socket);

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(mockSocket.join).toHaveBeenCalledWith('user:user-123');
      expect(mockSocket.emit).toHaveBeenCalled();
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('join-conversation', expect.any(Function));
      expect(mockSocket.on).toHaveBeenCalledWith('leave-conversation', expect.any(Function));
    });

    it('should disconnect socket without user ID', () => {
      const socketWithoutUser: any = {
        ...mockSocket,
        user: undefined,
      };

      connectionHandler(socketWithoutUser);

      expect(socketWithoutUser.disconnect).toHaveBeenCalled();
    });

    it('should track connected users', async () => {
      await connectionHandler(mockSocket as Socket);

      // Wait for async operations
      await new Promise(resolve => setImmediate(resolve));

      expect(socketService.isUserOnline('user-123')).toBe(true);
      expect(socketService.getUserSocketId('user-123')).toBe('socket-123');
    });
  });

  describe('handleDisconnection', () => {
    beforeEach(async () => {
      socketService.initialize();
      await connectionHandler(mockSocket as Socket);
      await new Promise(resolve => setImmediate(resolve));
    });

    it('should remove user from connected users on disconnect', async () => {
      // Get the disconnect handler
      const disconnectHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'disconnect'
      )[1];

      await disconnectHandler();
      await new Promise(resolve => setImmediate(resolve));

      expect(socketService.isUserOnline('user-123')).toBe(false);
      expect(socketService.getUserSocketId('user-123')).toBeUndefined();
    });
  });

  describe('handleJoinConversation', () => {
    beforeEach(async () => {
      socketService.initialize();
      await connectionHandler(mockSocket as Socket);
      await new Promise(resolve => setImmediate(resolve));
    });

    it('should allow user to join conversation room', () => {
      const conversationId = 'conv-123';
      const joinHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'join-conversation'
      )[1];

      joinHandler(conversationId);

      expect(mockSocket.join).toHaveBeenCalledWith(`conversation:${conversationId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('joined-conversation', {
        conversationId,
        timestamp: expect.any(String),
      });
    });

    it('should emit error if conversation ID is missing', () => {
      const joinHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'join-conversation'
      )[1];

      joinHandler('');

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Conversation ID required',
      });
    });
  });

  describe('handleLeaveConversation', () => {
    beforeEach(async () => {
      socketService.initialize();
      await connectionHandler(mockSocket as Socket);
      await new Promise(resolve => setImmediate(resolve));
    });

    it('should allow user to leave conversation room', () => {
      const conversationId = 'conv-123';
      const leaveHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'leave-conversation'
      )[1];

      leaveHandler(conversationId);

      expect(mockSocket.leave).toHaveBeenCalledWith(`conversation:${conversationId}`);
      expect(mockSocket.emit).toHaveBeenCalledWith('left-conversation', {
        conversationId,
        timestamp: expect.any(String),
      });
    });

    it('should emit error if conversation ID is missing', () => {
      const leaveHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'leave-conversation'
      )[1];

      leaveHandler('');

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Conversation ID required',
      });
    });
  });

  describe('emitToConversation', () => {
    it('should emit event to conversation room', () => {
      const conversationId = 'conv-123';
      const event = 'new-message';
      const data = { message: 'Hello' };

      socketService.emitToConversation(conversationId, event, data);

      expect(mockIo.to).toHaveBeenCalledWith(`conversation:${conversationId}`);
      expect(mockIo.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('emitToUser', () => {
    it('should emit event to specific user', () => {
      const userId = 'user-123';
      const event = 'notification';
      const data = { message: 'You have a new message' };

      socketService.emitToUser(userId, event, data);

      expect(mockIo.to).toHaveBeenCalledWith(`user:${userId}`);
      expect(mockIo.emit).toHaveBeenCalledWith(event, data);
    });
  });

  describe('user status methods', () => {
    beforeEach(async () => {
      socketService.initialize();
      await connectionHandler(mockSocket as Socket);
      await new Promise(resolve => setImmediate(resolve));
    });

    it('should check if user is online', () => {
      expect(socketService.isUserOnline('user-123')).toBe(true);
      expect(socketService.isUserOnline('user-456')).toBe(false);
    });

    it('should get user socket ID', () => {
      expect(socketService.getUserSocketId('user-123')).toBe('socket-123');
      expect(socketService.getUserSocketId('user-456')).toBeUndefined();
    });

    it('should get connected users count', () => {
      expect(socketService.getConnectedUsersCount()).toBe(1);
    });

    it('should get all connected user IDs', () => {
      const userIds = socketService.getConnectedUserIds();
      expect(userIds).toEqual(['user-123']);
    });
  });

  describe('multiple connections', () => {
    beforeEach(() => {
      socketService.initialize();
    });

    it('should handle multiple user connections', () => {
      const socket1: any = { ...mockSocket, id: 'socket-1', user: { userId: 'user-1', email: 'user1@test.com', role: 'student' } };
      const socket2: any = { ...mockSocket, id: 'socket-2', user: { userId: 'user-2', email: 'user2@test.com', role: 'tutor' } };

      connectionHandler(socket1);
      connectionHandler(socket2);

      expect(socketService.getConnectedUsersCount()).toBe(2);
      expect(socketService.isUserOnline('user-1')).toBe(true);
      expect(socketService.isUserOnline('user-2')).toBe(true);
    });
  });
});
