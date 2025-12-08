import { EmailService } from '../services/email.service';
import nodemailer from 'nodemailer';

// Mock nodemailer
jest.mock('nodemailer');

describe('EmailService', () => {
  let emailService: EmailService;
  let mockTransporter: any;

  beforeEach(() => {
    mockTransporter = {
      sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
      verify: jest.fn().mockResolvedValue(true),
    };

    (nodemailer.createTransport as jest.Mock).mockReturnValue(mockTransporter);
    (nodemailer.getTestMessageUrl as jest.Mock).mockReturnValue('https://ethereal.email/message/test');

    emailService = new EmailService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendBookingCreatedEmail', () => {
    it('should send booking created email to tutor', async () => {
      const to = 'tutor@example.com';
      const recipientName = 'John Tutor';
      const bookingDetails = {
        subject: 'Math',
        startTime: new Date('2024-01-15T10:00:00Z'),
        studentName: 'Jane Student',
      };

      await emailService.sendBookingCreatedEmail(to, recipientName, bookingDetails);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'New Booking Request',
          html: expect.stringContaining('John Tutor'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Math'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Jane Student'),
        })
      );
    });

    it('should send booking created email to student', async () => {
      const to = 'student@example.com';
      const recipientName = 'Jane Student';
      const bookingDetails = {
        subject: 'Physics',
        startTime: new Date('2024-01-15T10:00:00Z'),
        tutorName: 'John Tutor',
      };

      await emailService.sendBookingCreatedEmail(to, recipientName, bookingDetails);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Booking Created',
          html: expect.stringContaining('Jane Student'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Physics'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('John Tutor'),
        })
      );
    });

    it('should throw error if email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        emailService.sendBookingCreatedEmail('test@example.com', 'Test User', {
          subject: 'Math',
          startTime: new Date(),
          tutorName: 'Tutor',
        })
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendBookingCancelledEmail', () => {
    it('should send booking cancelled email with reason', async () => {
      const to = 'user@example.com';
      const recipientName = 'Test User';
      const cancellationReason = 'Student request';

      await emailService.sendBookingCancelledEmail(to, recipientName, cancellationReason);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Booking Cancelled',
          html: expect.stringContaining('Test User'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Student request'),
        })
      );
    });

    it('should send booking cancelled email without reason', async () => {
      const to = 'user@example.com';
      const recipientName = 'Test User';

      await emailService.sendBookingCancelledEmail(to, recipientName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Booking Cancelled',
          html: expect.stringContaining('Test User'),
        })
      );
    });

    it('should throw error if email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        emailService.sendBookingCancelledEmail('test@example.com', 'Test User')
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendPaymentCompletedEmail', () => {
    it('should send payment received email to tutor', async () => {
      const to = 'tutor@example.com';
      const recipientName = 'John Tutor';
      const amount = 50.0;
      const isForTutor = true;

      await emailService.sendPaymentCompletedEmail(to, recipientName, amount, isForTutor);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Payment Received',
          html: expect.stringContaining('John Tutor'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('50.00'),
        })
      );
    });

    it('should send payment confirmed email to student', async () => {
      const to = 'student@example.com';
      const recipientName = 'Jane Student';
      const amount = 75.5;
      const isForTutor = false;

      await emailService.sendPaymentCompletedEmail(to, recipientName, amount, isForTutor);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'Payment Confirmed',
          html: expect.stringContaining('Jane Student'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('75.50'),
        })
      );
    });

    it('should throw error if email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        emailService.sendPaymentCompletedEmail('test@example.com', 'Test User', 50, true)
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendReviewSubmittedEmail', () => {
    it('should send review email with comment', async () => {
      const to = 'tutor@example.com';
      const tutorName = 'John Tutor';
      const rating = 5;
      const comment = 'Excellent tutor!';

      await emailService.sendReviewSubmittedEmail(to, tutorName, rating, comment);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'New Review Received',
          html: expect.stringContaining('John Tutor'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('⭐⭐⭐⭐⭐'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Excellent tutor!'),
        })
      );
    });

    it('should send review email without comment', async () => {
      const to = 'tutor@example.com';
      const tutorName = 'John Tutor';
      const rating = 4;

      await emailService.sendReviewSubmittedEmail(to, tutorName, rating);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'New Review Received',
          html: expect.stringContaining('John Tutor'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('⭐⭐⭐⭐'),
        })
      );
    });

    it('should throw error if email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        emailService.sendReviewSubmittedEmail('test@example.com', 'Test Tutor', 5)
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('sendNewMessageEmail', () => {
    it('should send new message notification email', async () => {
      const to = 'user@example.com';
      const recipientName = 'Jane User';
      const senderName = 'John Sender';

      await emailService.sendNewMessageEmail(to, recipientName, senderName);

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to,
          subject: 'New Message Received',
          html: expect.stringContaining('Jane User'),
        })
      );

      expect(mockTransporter.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('John Sender'),
        })
      );
    });

    it('should throw error if email sending fails', async () => {
      mockTransporter.sendMail.mockRejectedValue(new Error('SMTP error'));

      await expect(
        emailService.sendNewMessageEmail('test@example.com', 'Test User', 'Sender')
      ).rejects.toThrow('Failed to send email');
    });
  });

  describe('verifyConnection', () => {
    it('should verify email service connection successfully', async () => {
      const result = await emailService.verifyConnection();

      expect(mockTransporter.verify).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false if verification fails', async () => {
      mockTransporter.verify.mockRejectedValue(new Error('Connection failed'));

      const result = await emailService.verifyConnection();

      expect(result).toBe(false);
    });
  });
});
