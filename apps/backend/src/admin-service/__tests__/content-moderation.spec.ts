import { AdminService } from '../services/admin.service';
import { PrismaClient } from '@prisma/client';

describe('AdminService - Content Moderation', () => {
  let adminService: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      review: {
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      message: {
        findMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    adminService = new AdminService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFlaggedContent', () => {
    it('should return all flagged reviews and messages', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          tutorId: 'tutor-1',
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 1,
          comment: 'Inappropriate content',
          flagged: true,
          createdAt: new Date(),
          student: { name: 'Student 1' },
          tutor: { name: 'Tutor 1' },
        },
      ];

      const mockMessages = [
        {
          id: 'message-1',
          conversationId: 'conv-1',
          senderId: 'user-1',
          receiverId: 'user-2',
          message: 'Spam message',
          read: false,
          flagged: true,
          createdAt: new Date(),
          sender: { name: 'User 1' },
        },
      ];

      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      mockPrisma.message.findMany.mockResolvedValue(mockMessages);

      const result = await adminService.getFlaggedContent();

      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('review');
      expect(result[0].content).toBe('Inappropriate content');
      expect(result[1].type).toBe('message');
      expect(result[1].content).toBe('Spam message');
    });

    it('should return empty array when no flagged content', async () => {
      mockPrisma.review.findMany.mockResolvedValue([]);
      mockPrisma.message.findMany.mockResolvedValue([]);

      const result = await adminService.getFlaggedContent();

      expect(result).toHaveLength(0);
    });

    it('should handle reviews without comments', async () => {
      const mockReviews = [
        {
          id: 'review-1',
          tutorId: 'tutor-1',
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 1,
          comment: null,
          flagged: true,
          createdAt: new Date(),
          student: { name: 'Student 1' },
          tutor: { name: 'Tutor 1' },
        },
      ];

      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      mockPrisma.message.findMany.mockResolvedValue([]);

      const result = await adminService.getFlaggedContent();

      expect(result[0].content).toBe('');
    });

    it('should order flagged content by most recent first', async () => {
      const oldDate = new Date('2024-01-01');
      const newDate = new Date('2024-01-02');

      const mockReviews = [
        {
          id: 'review-1',
          tutorId: 'tutor-1',
          studentId: 'student-1',
          bookingId: 'booking-1',
          rating: 1,
          comment: 'Old review',
          flagged: true,
          createdAt: oldDate,
          student: { name: 'Student 1' },
          tutor: { name: 'Tutor 1' },
        },
        {
          id: 'review-2',
          tutorId: 'tutor-2',
          studentId: 'student-2',
          bookingId: 'booking-2',
          rating: 1,
          comment: 'New review',
          flagged: true,
          createdAt: newDate,
          student: { name: 'Student 2' },
          tutor: { name: 'Tutor 2' },
        },
      ];

      mockPrisma.review.findMany.mockResolvedValue(mockReviews);
      mockPrisma.message.findMany.mockResolvedValue([]);

      await adminService.getFlaggedContent();

      expect(mockPrisma.review.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });
  });

  describe('moderateContent', () => {
    describe('review moderation', () => {
      it('should approve a flagged review', async () => {
        mockPrisma.review.update.mockResolvedValue({});

        await adminService.moderateContent(
          'review-1',
          'review',
          { action: 'approve' },
          'admin-1'
        );

        expect(mockPrisma.review.update).toHaveBeenCalledWith({
          where: { id: 'review-1' },
          data: { flagged: false },
        });
      });

      it('should remove a flagged review', async () => {
        mockPrisma.review.delete.mockResolvedValue({});

        await adminService.moderateContent(
          'review-1',
          'review',
          { action: 'remove', reason: 'Inappropriate content' },
          'admin-1'
        );

        expect(mockPrisma.review.delete).toHaveBeenCalledWith({
          where: { id: 'review-1' },
        });
      });

      it('should warn on a flagged review', async () => {
        mockPrisma.review.update.mockResolvedValue({});

        await adminService.moderateContent(
          'review-1',
          'review',
          { action: 'warn', reason: 'Warning issued' },
          'admin-1'
        );

        expect(mockPrisma.review.update).toHaveBeenCalledWith({
          where: { id: 'review-1' },
          data: { flagged: true },
        });
      });
    });

    describe('message moderation', () => {
      it('should approve a flagged message', async () => {
        mockPrisma.message.update.mockResolvedValue({});

        await adminService.moderateContent(
          'message-1',
          'message',
          { action: 'approve' },
          'admin-1'
        );

        expect(mockPrisma.message.update).toHaveBeenCalledWith({
          where: { id: 'message-1' },
          data: { flagged: false },
        });
      });

      it('should remove a flagged message', async () => {
        mockPrisma.message.delete.mockResolvedValue({});

        await adminService.moderateContent(
          'message-1',
          'message',
          { action: 'remove', reason: 'Spam' },
          'admin-1'
        );

        expect(mockPrisma.message.delete).toHaveBeenCalledWith({
          where: { id: 'message-1' },
        });
      });

      it('should warn on a flagged message', async () => {
        mockPrisma.message.update.mockResolvedValue({});

        await adminService.moderateContent(
          'message-1',
          'message',
          { action: 'warn', reason: 'Warning issued' },
          'admin-1'
        );

        expect(mockPrisma.message.update).toHaveBeenCalledWith({
          where: { id: 'message-1' },
          data: { flagged: true },
        });
      });
    });

    it('should handle database errors during moderation', async () => {
      mockPrisma.review.update.mockRejectedValue(new Error('Database error'));

      await expect(
        adminService.moderateContent(
          'review-1',
          'review',
          { action: 'approve' },
          'admin-1'
        )
      ).rejects.toThrow('Failed to moderate content');
    });
  });
});
