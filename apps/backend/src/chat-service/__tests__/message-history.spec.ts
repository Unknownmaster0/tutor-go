import { MessageService } from '../services/message.service';
import { prisma } from '../../shared';

// Mock dependencies
jest.mock('../../shared', () => ({
  prisma: {
    message: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
    },
  },
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('MessageService - Message History', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService();
    jest.clearAllMocks();
  });

  describe('getMessagesByConversation', () => {
    it('should retrieve messages for a conversation with default pagination', async () => {
      const conversationId = 'conv-123';
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId,
          senderId: 'user-1',
          receiverId: 'user-2',
          message: 'Hello',
          read: true,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'msg-2',
          conversationId,
          senderId: 'user-2',
          receiverId: 'user-1',
          message: 'Hi there',
          read: false,
          createdAt: new Date('2024-01-02'),
        },
      ];

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);

      const result = await messageService.getMessagesByConversation(conversationId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('msg-1');
      expect(result[1].id).toBe('msg-2');
      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        skip: 0,
      });
    });


    it('should retrieve messages with custom pagination', async () => {
      const conversationId = 'conv-123';
      const limit = 10;
      const offset = 20;

      (prisma.message.findMany as jest.Mock).mockResolvedValue([]);

      await messageService.getMessagesByConversation(conversationId, limit, offset);

      expect(prisma.message.findMany).toHaveBeenCalledWith({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });
    });

    it('should throw error when retrieval fails', async () => {
      (prisma.message.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        messageService.getMessagesByConversation('conv-123')
      ).rejects.toThrow('Failed to retrieve messages');
    });
  });

  describe('getConversationsByUser', () => {
    it('should retrieve all conversations for a user', async () => {
      const userId = 'user-123';
      const mockMessages = [
        {
          id: 'msg-1',
          conversationId: 'user-123_user-456',
          senderId: 'user-123',
          receiverId: 'user-456',
          message: 'Hello',
          read: true,
          createdAt: new Date('2024-01-01'),
        },
      ];

      const mockLastMessage = {
        id: 'msg-2',
        conversationId: 'user-123_user-456',
        senderId: 'user-456',
        receiverId: 'user-123',
        message: 'Latest message',
        read: false,
        createdAt: new Date('2024-01-02'),
      };

      (prisma.message.findMany as jest.Mock).mockResolvedValue(mockMessages);
      (prisma.message.findFirst as jest.Mock).mockResolvedValue(mockLastMessage);
      (prisma.message.count as jest.Mock).mockResolvedValue(3);

      const result = await messageService.getConversationsByUser(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user-123_user-456');
      expect(result[0].participants).toEqual(['user-123', 'user-456']);
      expect(result[0].lastMessage).toBe('Latest message');
      expect(result[0].unreadCount).toBe(3);
    });

    it('should handle empty conversations list', async () => {
      (prisma.message.findMany as jest.Mock).mockResolvedValue([]);

      const result = await messageService.getConversationsByUser('user-123');

      expect(result).toHaveLength(0);
    });

    it('should throw error when retrieval fails', async () => {
      (prisma.message.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        messageService.getConversationsByUser('user-123')
      ).rejects.toThrow('Failed to retrieve conversations');
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark all unread messages in conversation as read', async () => {
      const conversationId = 'conv-123';
      const userId = 'user-123';

      (prisma.message.updateMany as jest.Mock).mockResolvedValue({ count: 5 });

      await messageService.markConversationAsRead(conversationId, userId);

      expect(prisma.message.updateMany).toHaveBeenCalledWith({
        where: {
          conversationId,
          receiverId: userId,
          read: false,
        },
        data: {
          read: true,
        },
      });
    });

    it('should throw error when update fails', async () => {
      (prisma.message.updateMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        messageService.markConversationAsRead('conv-123', 'user-123')
      ).rejects.toThrow('Failed to mark conversation as read');
    });
  });
});
