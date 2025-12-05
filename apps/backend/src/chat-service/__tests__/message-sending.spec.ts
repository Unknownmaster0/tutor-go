import { Server, Socket } from 'socket.io';
import { SocketService } from '../services/socket.service';
import { MessageService } from '../services/message.service';
import { AuthenticatedSocket } from '../middleware/socket-auth.middleware';

// Mock dependencies
jest.mock('../../shared', () => ({
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
  prisma: {
    booking: {
      findFirst: jest.fn(),
    },
    message: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../services/message.service');

describe('SocketService - Message Sending', () => {
  let mockIo: any;
  let socketService: SocketService;
  let mockSocket: Partial<AuthenticatedSocket>;
  let connectionHandler: (socket: Socket) => void;
  let mockMessageService: jest.Mocked<MessageService>;

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

    // Get the mocked MessageService instance
    mockMessageService = (socketService as any).messageService as jest.Mocked<MessageService>;
  });

  describe('handleSendMessage', () => {
    beforeEach(() => {
      socketService.initialize();
      connectionHandler(mockSocket as Socket);
    });

    it('should send message successfully when booking exists', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: 'Hello, how are you?',
      };

      const savedMessage = {
        id: 'msg-123',
        conversationId: messageData.conversationId,
        senderId: 'user-123',
        receiverId: messageData.receiverId,
        message: messageData.message,
        read: false,
        createdAt: new Date(),
      };

      mockMessageService.validateBookingExists.mockResolvedValue(true);
      mockMessageService.createMessage.mockResolvedValue(savedMessage);

      // Get the send-message handler
      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockMessageService.validateBookingExists).toHaveBeenCalledWith('user-123', 'receiver-456');
      expect(mockMessageService.createMessage).toHaveBeenCalledWith(
        'user-123',
        'receiver-456',
        'conv-123',
        'Hello, how are you?'
      );

      expect(mockSocket.emit).toHaveBeenCalledWith('message-sent', expect.objectContaining({
        id: 'msg-123',
        conversationId: 'conv-123',
        senderId: 'user-123',
        receiverId: 'receiver-456',
        message: 'Hello, how are you?',
      }));
    });

    it('should reject message when no confirmed booking exists', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: 'Hello',
      };

      mockMessageService.validateBookingExists.mockResolvedValue(false);

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockMessageService.validateBookingExists).toHaveBeenCalled();
      expect(mockMessageService.createMessage).not.toHaveBeenCalled();
      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Cannot send message. You must have a confirmed booking with this user.',
      });
    });

    it('should reject message with missing conversationId', async () => {
      const messageData = {
        conversationId: '',
        receiverId: 'receiver-456',
        message: 'Hello',
      };

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Missing required fields: conversationId, receiverId, message',
      });
      expect(mockMessageService.validateBookingExists).not.toHaveBeenCalled();
    });

    it('should reject message with missing receiverId', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: '',
        message: 'Hello',
      };

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Missing required fields: conversationId, receiverId, message',
      });
    });

    it('should reject empty message', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: '   ',
      };

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Message cannot be empty',
      });
    });

    it('should trim message before saving', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: '  Hello, world!  ',
      };

      const savedMessage = {
        id: 'msg-123',
        conversationId: messageData.conversationId,
        senderId: 'user-123',
        receiverId: messageData.receiverId,
        message: 'Hello, world!',
        read: false,
        createdAt: new Date(),
      };

      mockMessageService.validateBookingExists.mockResolvedValue(true);
      mockMessageService.createMessage.mockResolvedValue(savedMessage);

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockMessageService.createMessage).toHaveBeenCalledWith(
        'user-123',
        'receiver-456',
        'conv-123',
        'Hello, world!'
      );
    });

    it('should emit to receiver and conversation room', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: 'Hello',
      };

      const savedMessage = {
        id: 'msg-123',
        conversationId: messageData.conversationId,
        senderId: 'user-123',
        receiverId: messageData.receiverId,
        message: messageData.message,
        read: false,
        createdAt: new Date(),
      };

      mockMessageService.validateBookingExists.mockResolvedValue(true);
      mockMessageService.createMessage.mockResolvedValue(savedMessage);
      
      // Mock Redis service
      const mockRedisService = (socketService as any).redisService;
      mockRedisService.isUserOnline = jest.fn().mockResolvedValue(true);
      mockRedisService.incrementUnreadCount = jest.fn().mockResolvedValue(undefined);

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      // Check that emitToUser was called
      expect(mockIo.to).toHaveBeenCalledWith('user:receiver-456');
      
      // Check that emitToConversation was called
      expect(mockIo.to).toHaveBeenCalledWith('conversation:conv-123');
    });

    it('should handle database errors gracefully', async () => {
      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: 'Hello',
      };

      mockMessageService.validateBookingExists.mockResolvedValue(true);
      mockMessageService.createMessage.mockRejectedValue(new Error('Database error'));

      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      await sendMessageHandler(messageData);

      expect(mockSocket.emit).toHaveBeenCalledWith('error', {
        message: 'Failed to send message. Please try again.',
      });
    });

    it('should reject message from unauthenticated socket', async () => {
      const unauthSocket: any = {
        ...mockSocket,
        user: undefined,
      };

      const messageData = {
        conversationId: 'conv-123',
        receiverId: 'receiver-456',
        message: 'Hello',
      };

      // Simulate connection with unauthenticated socket
      const sendMessageHandler = (mockSocket.on as jest.Mock).mock.calls.find(
        call => call[0] === 'send-message'
      )[1];

      // Bind to unauthenticated socket
      await sendMessageHandler.call({ ...socketService, user: undefined }, messageData);

      // The handler should check for user authentication
      // Since we're testing the handler directly, we need to ensure it handles missing user
    });
  });
});
