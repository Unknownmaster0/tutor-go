import {
  BookingCreatedEvent,
  BookingCancelledEvent,
  PaymentCompletedEvent,
  ReviewSubmittedEvent,
} from '../../shared/rabbitmq';
import { prisma } from '../../shared/database';
import { CreateNotificationDto, NotificationResponseDto } from '../dto';
import { EmailService } from './email.service';
import { SocketService } from './socket.service';

/**
 * Notification Service
 * Handles notification creation and delivery
 */
export class NotificationService {
  private emailService: EmailService;
  private socketService?: SocketService;

  constructor(socketService?: SocketService) {
    this.emailService = new EmailService();
    this.socketService = socketService;
  }

  /**
   * Handle booking created event
   */
  async handleBookingCreated(event: BookingCreatedEvent): Promise<void> {
    console.log('Processing booking created event:', event.bookingId);

    // Get user details for email
    const [tutor, student] = await Promise.all([
      prisma.user.findUnique({ where: { id: event.tutorId } }),
      prisma.user.findUnique({ where: { id: event.studentId } }),
    ]);

    if (!tutor || !student) {
      throw new Error('User not found');
    }

    // Create notifications for both tutor and student
    await this.createNotification({
      userId: event.tutorId,
      type: 'booking',
      title: 'New Booking Request',
      message: 'You have a new booking request for ' + event.subject,
      metadata: {
        bookingId: event.bookingId,
        studentId: event.studentId,
        subject: event.subject,
        startTime: event.startTime,
      },
    });

    await this.createNotification({
      userId: event.studentId,
      type: 'booking',
      title: 'Booking Created',
      message: 'Your booking for ' + event.subject + ' has been created',
      metadata: {
        bookingId: event.bookingId,
        tutorId: event.tutorId,
        subject: event.subject,
        startTime: event.startTime,
      },
    });

    // Send email notifications
    await this.emailService.sendBookingCreatedEmail(tutor.email, tutor.name, {
      subject: event.subject,
      startTime: event.startTime,
      studentName: student.name,
    });

    await this.emailService.sendBookingCreatedEmail(student.email, student.name, {
      subject: event.subject,
      startTime: event.startTime,
      tutorName: tutor.name,
    });

    console.log('Booking created notifications sent successfully');
  }

  /**
   * Handle booking cancelled event
   */
  async handleBookingCancelled(event: BookingCancelledEvent): Promise<void> {
    console.log('Processing booking cancelled event:', event.bookingId);

    // Get user details for email
    const [tutor, student] = await Promise.all([
      prisma.user.findUnique({ where: { id: event.tutorId } }),
      prisma.user.findUnique({ where: { id: event.studentId } }),
    ]);

    if (!tutor || !student) {
      throw new Error('User not found');
    }

    const reasonText = event.cancellationReason ? ': ' + event.cancellationReason : '';

    // Create notifications for both tutor and student
    await this.createNotification({
      userId: event.tutorId,
      type: 'booking',
      title: 'Booking Cancelled',
      message: 'A booking has been cancelled' + reasonText,
      metadata: {
        bookingId: event.bookingId,
        studentId: event.studentId,
        cancellationReason: event.cancellationReason,
      },
    });

    await this.createNotification({
      userId: event.studentId,
      type: 'booking',
      title: 'Booking Cancelled',
      message: 'Your booking has been cancelled' + reasonText,
      metadata: {
        bookingId: event.bookingId,
        tutorId: event.tutorId,
        cancellationReason: event.cancellationReason,
      },
    });

    // Send email notifications
    await this.emailService.sendBookingCancelledEmail(
      tutor.email,
      tutor.name,
      event.cancellationReason
    );

    await this.emailService.sendBookingCancelledEmail(
      student.email,
      student.name,
      event.cancellationReason
    );

    console.log('Booking cancelled notifications sent successfully');
  }

  /**
   * Handle payment completed event
   */
  async handlePaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    console.log('Processing payment completed event:', event.paymentId);

    // Get user details for email
    const [tutor, student] = await Promise.all([
      prisma.user.findUnique({ where: { id: event.tutorId } }),
      prisma.user.findUnique({ where: { id: event.studentId } }),
    ]);

    if (!tutor || !student) {
      throw new Error('User not found');
    }

    // Create notifications for both tutor and student
    await this.createNotification({
      userId: event.tutorId,
      type: 'payment',
      title: 'Payment Received',
      message: `You have received a payment of $${event.amount}`,
      metadata: {
        paymentId: event.paymentId,
        bookingId: event.bookingId,
        amount: event.amount,
        studentId: event.studentId,
      },
    });

    await this.createNotification({
      userId: event.studentId,
      type: 'payment',
      title: 'Payment Confirmed',
      message: `Your payment of $${event.amount} has been confirmed`,
      metadata: {
        paymentId: event.paymentId,
        bookingId: event.bookingId,
        amount: event.amount,
        tutorId: event.tutorId,
      },
    });

    // Send email notifications
    await this.emailService.sendPaymentCompletedEmail(tutor.email, tutor.name, event.amount, true);
    await this.emailService.sendPaymentCompletedEmail(
      student.email,
      student.name,
      event.amount,
      false
    );

    console.log('Payment completed notifications sent successfully');
  }

  /**
   * Handle review submitted event
   */
  async handleReviewSubmitted(event: ReviewSubmittedEvent): Promise<void> {
    console.log('Processing review submitted event:', event.reviewId);

    // Get tutor details for email
    const tutor = await prisma.user.findUnique({ where: { id: event.tutorId } });

    if (!tutor) {
      throw new Error('Tutor not found');
    }

    // Create notification for tutor
    await this.createNotification({
      userId: event.tutorId,
      type: 'review',
      title: 'New Review Received',
      message: 'You received a ' + event.rating + '-star review',
      metadata: {
        reviewId: event.reviewId,
        studentId: event.studentId,
        bookingId: event.bookingId,
        rating: event.rating,
        comment: event.comment,
      },
    });

    // Send email notification
    await this.emailService.sendReviewSubmittedEmail(
      tutor.email,
      tutor.name,
      event.rating,
      event.comment
    );

    console.log('Review submitted notifications sent successfully');
  }

  /**
   * Create a notification in the database
   */
  async createNotification(notification: CreateNotificationDto): Promise<NotificationResponseDto> {
    try {
      const createdNotification = await prisma.notification.create({
        data: {
          userId: notification.userId,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          metadata: notification.metadata || {},
          read: false,
        },
      });

      const notificationResponse: NotificationResponseDto = {
        id: createdNotification.id,
        userId: createdNotification.userId,
        type: createdNotification.type as 'booking' | 'payment' | 'message' | 'review',
        title: createdNotification.title,
        message: createdNotification.message,
        read: createdNotification.read,
        createdAt: createdNotification.createdAt,
        metadata: createdNotification.metadata,
      };

      // Send real-time notification if user is online
      if (this.socketService) {
        this.socketService.sendNotificationToUser(notification.userId, notificationResponse);
      }

      return notificationResponse;
    } catch (error) {
      throw new Error('Failed to create notification');
    }
  }

  /**
   * Get notifications for a user
   */
  async getUserNotifications(userId: string): Promise<NotificationResponseDto[]> {
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });

      return notifications.map((notification) => ({
        id: notification.id,
        userId: notification.userId,
        type: notification.type as 'booking' | 'payment' | 'message' | 'review',
        title: notification.title,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt,
        metadata: notification.metadata,
      }));
    } catch (error) {
      throw new Error('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read/unread
   */
  async markAsRead(notificationId: string, read: boolean): Promise<NotificationResponseDto> {
    try {
      const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { read },
      });

      return {
        id: updatedNotification.id,
        userId: updatedNotification.userId,
        type: updatedNotification.type as 'booking' | 'payment' | 'message' | 'review',
        title: updatedNotification.title,
        message: updatedNotification.message,
        read: updatedNotification.read,
        createdAt: updatedNotification.createdAt,
        metadata: updatedNotification.metadata,
      };
    } catch (error) {
      throw new Error('Failed to update notification');
    }
  }
}
