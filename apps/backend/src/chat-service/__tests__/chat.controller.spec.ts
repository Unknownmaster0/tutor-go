import { Request, Response } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { MessageService } from '../services/message.service';
import { ApiResponse } from '../../shared';

// Mock dependencies
jest.mock('../services/message.service');
jest.mock('../../shared', () => ({
  ApiResponse: {
    success: jest.fn(),
    error: jest.fn(),
  },
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('ChatController', () => {
  let chatController: ChatController;
  let mockMessageService: jest.Mocked<MessageService>;
  let mockReq: any;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    chatController = new ChatController();
    mockMessageService = (chatController as any).messageService as jest.Mocked<MessageService>;

    mockReq = {
      params: {},
      query: {},
      user: {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'student',
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    jest.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should retrieve conversations for authenticated user', async () => {
      mockReq.params = { userId: 'user-123' };
      const mockConversations = [
        {
          id: 'conv-1',
          participants: ['user-123', 'user-456'],
          lastMessage: 'Hello',
          lastMessageTime: new Date(),
          unreadCount: 2,
        },
      ];

      mockMessageService.getConversationsByUser.mockResolvedValue(mockConversations);

      await chatController.getConversations(mockReq as Request, mockRes as Response);

      expect(mockMessageService.getConversationsByUser).toHaveBeenCalledWith('user-123');
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockRes,
        mockConversations,
        'Conversations retrieved successfully'
      );
    });

    it('should reject access to other users conversations', async () => {
      mockReq.params = { userId: 'other-user' };

      await chatController.getConversations(mockReq as Request, mockRes as Response);

      expect(mockMessageService.getConversationsByUser).not.toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(mockRes, 'Unauthorized access', 403);
    });


    it('should handle errors gracefully', async () => {
      mockReq.params = { userId: 'user-123' };
      mockMessageService.getConversationsByUser.mockRejectedValue(new Error('Database error'));

      await chatController.getConversations(mockReq as Request, mockRes as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockRes,
        'Failed to retrieve conversations',
        500
      );
    });
  });

  describe('getMessages', () => {
    it('should retrieve messages for a conversation', async () => {
      mockReq.params = { conversationId: 'user-123_user-456' };
      mockReq.query = { limit: '20', offset: '10' };

      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'user-123_user-456',
          senderId: 'user-123',
          receiverId: 'user-456',
          message: 'Hello',
          read: true,
          createdAt: new Date(),
        },
      ];

      mockMessageService.getMessagesByConversation.mockResolvedValue(mockMessages);

      await chatController.getMessages(mockReq as Request, mockRes as Response);

      expect(mockMessageService.getMessagesByConversation).toHaveBeenCalledWith(
        'user-123_user-456',
        20,
        10
      );
      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockRes,
        mockMessages,
        'Messages retrieved successfully'
      );
    });

    it('should use default pagination values', async () => {
      mockReq.params = { conversationId: 'user-123_user-456' };
      mockReq.query = {};

      mockMessageService.getMessagesByConversation.mockResolvedValue([]);

      await chatController.getMessages(mockReq as Request, mockRes as Response);

      expect(mockMessageService.getMessagesByConversation).toHaveBeenCalledWith(
        'user-123_user-456',
        50,
        0
      );
    });

    it('should reject access to conversations user is not part of', async () => {
      mockReq.params = { conversationId: 'user-456_user-789' };

      await chatController.getMessages(mockReq as Request, mockRes as Response);

      expect(mockMessageService.getMessagesByConversation).not.toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockRes,
        'Unauthorized access to conversation',
        403
      );
    });

    it('should reject unauthenticated requests', async () => {
      mockReq.user = undefined;
      mockReq.params = { conversationId: 'user-123_user-456' };

      await chatController.getMessages(mockReq as Request, mockRes as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(mockRes, 'Unauthorized', 401);
    });

    it('should handle errors gracefully', async () => {
      mockReq.params = { conversationId: 'user-123_user-456' };
      mockMessageService.getMessagesByConversation.mockRejectedValue(new Error('Database error'));

      await chatController.getMessages(mockReq as Request, mockRes as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(mockRes, 'Failed to retrieve messages', 500);
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark conversation as read for authenticated user', async () => {
      mockReq.params = { conversationId: 'conv-123' };

      mockMessageService.markConversationAsRead.mockResolvedValue();

      await chatController.markConversationAsRead(mockReq as Request, mockRes as Response);

      expect(mockMessageService.markConversationAsRead).toHaveBeenCalledWith('conv-123', 'user-123');
      expect(ApiResponse.success).toHaveBeenCalledWith(mockRes, null, 'Conversation marked as read');
    });

    it('should reject unauthenticated requests', async () => {
      mockReq.user = undefined;
      mockReq.params = { conversationId: 'conv-123' };

      await chatController.markConversationAsRead(mockReq as Request, mockRes as Response);

      expect(mockMessageService.markConversationAsRead).not.toHaveBeenCalled();
      expect(ApiResponse.error).toHaveBeenCalledWith(mockRes, 'Unauthorized', 401);
    });

    it('should handle errors gracefully', async () => {
      mockReq.params = { conversationId: 'conv-123' };
      mockMessageService.markConversationAsRead.mockRejectedValue(new Error('Database error'));

      await chatController.markConversationAsRead(mockReq as Request, mockRes as Response);

      expect(ApiResponse.error).toHaveBeenCalledWith(
        mockRes,
        'Failed to mark conversation as read',
        500
      );
    });
  });
});
