import { NotificationService } from '../services/notification.service';
import { SocketService } from '../services/socket.service';
import { EmailService } from '../services/email.service';
import {
  BookingCreatedEvent,
  BookingCancelledEvent,
  PaymentCompletedEvent,
  ReviewSubmittedEvent,
} from '../../shared/rabbitmq';
import { prisma } from '../../shared/database';

// Mock Prisma
jest.mock('../../shared/database', () => ({
  prisma: {
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

// Mock EmailService
jest.mock('../services/email.service');

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockSocketService: jest.Mocked<SocketService>;
  let mockEmailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    mockSocketService = {
      sendNotificationToUser: jest.fn(),
      isUserOnline: jest.fn(),
      getOnlineUsersCount: jest.fn(),
      getIO: jest.fn(),
    } as any;

    mockEmailService = {
      sendBookingCreatedEmail: jest.fn().mockResolvedValue(undefined),
      sendBookingCancelledEmail: jest.fn().mockResolvedValue(undefined),
      sendPaymentCompletedEmail: jest.fn().mockResolvedValue(undefined),
      sendReviewSubmittedEmail: jest.fn().mockResolvedValue(undefined),
      sendNewMessageEmail: jest.fn().mockResolvedValue(undefined),
      verifyConnection: jest.fn().mockResolvedValue(true),
    } as any;

    (EmailService as jest.MockedClass<typeof EmailService>).mockImplementation(() => mockEmailService);

    notificationService = new NotificationService(mockSocketService);
    jest.clearAllMocks();
  });

  describe('createNotification', () => {
    it('should create a notification in the database', async () => {
      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.createNotification({
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'booking',
          title: 'Test Notification',
          message: 'Test message',
          metadata: {},
          read: false,
        },
      });

      expect(result).toEqual({
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
        read: false,
        createdAt: mockNotification.createdAt,
        metadata: {},
      });
    });

    it('should send real-time notification via Socket.io', async () => {
      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await notificationService.createNotification({
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
      });

      expect(mockSocketService.sendNotificationToUser).toHaveBeenCalledWith(
        'user-1',
        expect.objectContaining({
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking',
          title: 'Test Notification',
          message: 'Test message',
        })
      );
    });

    it('should throw error if database operation fails', async () => {
      (prisma.notification.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(
        notificationService.createNotification({
          userId: 'user-1',
          type: 'booking',
          title: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow('Failed to create notification');
    });
  });

  describe('getUserNotifications', () => {
    it('should retrieve all notifications for a user', async () => {
      const mockNotifications = [
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'booking',
          title: 'Notification 1',
          message: 'Message 1',
          read: false,
          createdAt: new Date(),
          metadata: {},
        },
        {
          id: 'notification-2',
          userId: 'user-1',
          type: 'payment',
          title: 'Notification 2',
          message: 'Message 2',
          read: true,
          createdAt: new Date(),
          metadata: {},
        },
      ];

      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await notificationService.getUserNotifications('user-1');

      expect(prisma.notification.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        orderBy: { createdAt: 'desc' },
      });

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('notification-1');
      expect(result[1].id).toBe('notification-2');
    });

    it('should throw error if database operation fails', async () => {
      (prisma.notification.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(notificationService.getUserNotifications('user-1')).rejects.toThrow(
        'Failed to fetch notifications'
      );
    });
  });

  describe('markAsRead', () => {
    it('should mark notification as read', async () => {
      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
        read: true,
        createdAt: new Date(),
        metadata: {},
      };

      (prisma.notification.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead('notification-1', true);

      expect(prisma.notification.update).toHaveBeenCalledWith({
        where: { id: 'notification-1' },
        data: { read: true },
      });

      expect(result.read).toBe(true);
    });

    it('should mark notification as unread', async () => {
      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test Notification',
        message: 'Test message',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      (prisma.notification.update as jest.Mock).mockResolvedValue(mockNotification);

      const result = await notificationService.markAsRead('notification-1', false);

      expect(result.read).toBe(false);
    });

    it('should throw error if database operation fails', async () => {
      (prisma.notification.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      await expect(notificationService.markAsRead('notification-1', true)).rejects.toThrow(
        'Failed to update notification'
      );
    });
  });

  describe('handleBookingCreated', () => {
    it('should process booking created event and create notifications', async () => {
      const event: BookingCreatedEvent = {
        bookingId: '123',
        tutorId: 'tutor-1',
        studentId: 'student-1',
        subject: 'Math',
        startTime: new Date(),
        totalAmount: 50,
        timestamp: new Date(),
      };

      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test',
        message: 'Test',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      const mockTutor = {
        id: 'tutor-1',
        email: 'tutor@example.com',
        name: 'John Tutor',
      };

      const mockStudent = {
        id: 'student-1',
        email: 'student@example.com',
        name: 'Jane Student',
      };

      (prisma.user.findUnique as jest.Mock).mockImplementation((args: any) => {
        if (args.where.id === 'tutor-1') return Promise.resolve(mockTutor);
        if (args.where.id === 'student-1') return Promise.resolve(mockStudent);
        return Promise.resolve(null);
      });

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await notificationService.handleBookingCreated(event);

      // Should create 2 notifications (one for tutor, one for student)
      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleBookingCancelled', () => {
    it('should process booking cancelled event', async () => {
      const event: BookingCancelledEvent = {
        bookingId: '123',
        tutorId: 'tutor-1',
        studentId: 'student-1',
        totalAmount: 50,
        cancellationReason: 'Student request',
        timestamp: new Date(),
      };

      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'booking',
        title: 'Test',
        message: 'Test',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      const mockTutor = {
        id: 'tutor-1',
        email: 'tutor@example.com',
        name: 'John Tutor',
      };

      const mockStudent = {
        id: 'student-1',
        email: 'student@example.com',
        name: 'Jane Student',
      };

      (prisma.user.findUnique as jest.Mock).mockImplementation((args: any) => {
        if (args.where.id === 'tutor-1') return Promise.resolve(mockTutor);
        if (args.where.id === 'student-1') return Promise.resolve(mockStudent);
        return Promise.resolve(null);
      });

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await notificationService.handleBookingCancelled(event);

      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('handlePaymentCompleted', () => {
    it('should process payment completed event', async () => {
      const event: PaymentCompletedEvent = {
        paymentId: 'payment-1',
        bookingId: 'booking-1',
        amount: 50,
        studentId: 'student-1',
        tutorId: 'tutor-1',
        timestamp: new Date(),
      };

      const mockNotification = {
        id: 'notification-1',
        userId: 'user-1',
        type: 'payment',
        title: 'Test',
        message: 'Test',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      const mockTutor = {
        id: 'tutor-1',
        email: 'tutor@example.com',
        name: 'John Tutor',
      };

      const mockStudent = {
        id: 'student-1',
        email: 'student@example.com',
        name: 'Jane Student',
      };

      (prisma.user.findUnique as jest.Mock).mockImplementation((args: any) => {
        if (args.where.id === 'tutor-1') return Promise.resolve(mockTutor);
        if (args.where.id === 'student-1') return Promise.resolve(mockStudent);
        return Promise.resolve(null);
      });

      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await notificationService.handlePaymentCompleted(event);

      expect(prisma.notification.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('handleReviewSubmitted', () => {
    it('should process review submitted event', async () => {
      const event: ReviewSubmittedEvent = {
        reviewId: 'review-1',
        tutorId: 'tutor-1',
        studentId: 'student-1',
        bookingId: 'booking-1',
        rating: 5,
        comment: 'Great tutor!',
        timestamp: new Date(),
      };

      const mockNotification = {
        id: 'notification-1',
        userId: 'tutor-1',
        type: 'review',
        title: 'Test',
        message: 'Test',
        read: false,
        createdAt: new Date(),
        metadata: {},
      };

      const mockTutor = {
        id: 'tutor-1',
        email: 'tutor@example.com',
        name: 'John Tutor',
      };

      (prisma.user.findUnique as jest.Mock).mockResolvedValue(mockTutor);
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockNotification);

      await notificationService.handleReviewSubmitted(event);

      expect(prisma.notification.create).toHaveBeenCalledTimes(1);
    });
  });
});
