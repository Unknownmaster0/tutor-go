import { MessageService } from '../services/message.service';
import { prisma } from '../../shared';

// Mock dependencies
jest.mock('../../shared', () => ({
  prisma: {
    booking: {
      findFirst: jest.fn(),
    },
    message: {
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Logger: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

describe('MessageService', () => {
  let messageService: MessageService;

  beforeEach(() => {
    messageService = new MessageService();
    jest.clearAllMocks();
  });

  describe('validateBookingExists', () => {
    it('should return true when confirmed booking exists (student to tutor)', async () => {
      const userId1 = 'student-123';
      const userId2 = 'tutor-456';

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({
        id: 'booking-123',
        studentId: userId1,
        tutorId: userId2,
        status: 'confirmed',
      });

      const result = await messageService.validateBookingExists(userId1, userId2);

      expect(result).toBe(true);
      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            {
              studentId: userId1,
              tutorId: userId2,
              status: 'confirmed',
            },
            {
              studentId: userId2,
              tutorId: userId1,
              status: 'confirmed',
            },
          ],
        },
      });
    });

    it('should return true when confirmed booking exists (tutor to student)', async () => {
      const userId1 = 'tutor-456';
      const userId2 = 'student-123';

      (prisma.booking.findFirst as jest.Mock).mockResolvedValue({
        id: 'booking-123',
        studentId: userId2,
        tutorId: userId1,
        status: 'confirmed',
      });

      const result = await messageService.validateBookingExists(userId1, userId2);

      expect(result).toBe(true);
    });

    it('should return false when no confirmed booking exists', async () => {
      (prisma.booking.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await messageService.validateBookingExists('user-1', 'user-2');

      expect(result).toBe(false);
    });

    it('should return false on database error', async () => {
      (prisma.booking.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await messageService.validateBookingExists('user-1', 'user-2');

      expect(result).toBe(false);
    });
  });

  describe('createMessage', () => {
    it('should create and return a new message', async () => {
      const senderId = 'sender-123';
      const receiverId = 'receiver-456';
      const conversationId = 'conv-789';
      const messageText = 'Hello, world!';

      const mockMessage = {
        id: 'msg-123',
        conversationId,
        senderId,
        receiverId,
        message: messageText,
        read: false,
        createdAt: new Date(),
      };

      (prisma.message.create as jest.Mock).mockResolvedValue(mockMessage);

      const result = await messageService.createMessage(senderId, receiverId, conversationId, messageText);

      expect(result).toEqual({
        id: mockMessage.id,
        conversationId: mockMessage.conversationId,
        senderId: mockMessage.senderId,
        receiverId: mockMessage.receiverId,
        message: mockMessage.message,
        read: mockMessage.read,
        createdAt: mockMessage.createdAt,
      });

      expect(prisma.message.create).toHaveBeenCalledWith({
        data: {
          conversationId,
          senderId,
          receiverId,
          message: messageText,
          read: false,
        },
      });
    });

    it('should throw error when message creation fails', async () => {
      (prisma.message.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        messageService.createMessage('sender', 'receiver', 'conv', 'message')
      ).rejects.toThrow('Failed to create message');
    });
  });

  describe('generateConversationId', () => {
    it('should generate consistent conversation ID regardless of user order', () => {
      const userId1 = 'user-aaa';
      const userId2 = 'user-zzz';

      const id1 = messageService.generateConversationId(userId1, userId2);
      const id2 = messageService.generateConversationId(userId2, userId1);

      expect(id1).toBe(id2);
      expect(id1).toBe('user-aaa_user-zzz');
    });

    it('should sort user IDs alphabetically', () => {
      const result = messageService.generateConversationId('user-zzz', 'user-aaa');
      expect(result).toBe('user-aaa_user-zzz');
    });
  });

  describe('markMessageAsRead', () => {
    it('should mark message as read', async () => {
      const messageId = 'msg-123';

      (prisma.message.update as jest.Mock).mockResolvedValue({
        id: messageId,
        read: true,
      });

      await messageService.markMessageAsRead(messageId);

      expect(prisma.message.update).toHaveBeenCalledWith({
        where: { id: messageId },
        data: { read: true },
      });
    });

    it('should throw error when update fails', async () => {
      (prisma.message.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(messageService.markMessageAsRead('msg-123')).rejects.toThrow(
        'Failed to mark message as read'
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread message count for user', async () => {
      const userId = 'user-123';
      const expectedCount = 5;

      (prisma.message.count as jest.Mock).mockResolvedValue(expectedCount);

      const result = await messageService.getUnreadCount(userId);

      expect(result).toBe(expectedCount);
      expect(prisma.message.count).toHaveBeenCalledWith({
        where: {
          receiverId: userId,
          read: false,
        },
      });
    });

    it('should return 0 on database error', async () => {
      (prisma.message.count as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await messageService.getUnreadCount('user-123');

      expect(result).toBe(0);
    });
  });
});
