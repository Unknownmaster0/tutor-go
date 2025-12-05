import nodemailer, { Transporter } from 'nodemailer';

/**
 * Email Service
 * Handles sending email notifications using Nodemailer
 */
export class EmailService {
  private transporter: Transporter;
  private fromEmail: string;

  constructor() {
    // Initialize email transporter
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@tutorgo.com';

    // Configure transporter based on environment
    if (process.env.NODE_ENV === 'production') {
      // Production: Use real SMTP service (SendGrid, AWS SES, etc.)
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Development: Use Ethereal email for testing
      // In real development, you would create an Ethereal account
      // For now, we'll use a test configuration
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.ETHEREAL_USER || 'test@ethereal.email',
          pass: process.env.ETHEREAL_PASS || 'test',
        },
      });
    }
  }

  /**
   * Send booking created email
   */
  async sendBookingCreatedEmail(
    to: string,
    recipientName: string,
    bookingDetails: {
      subject: string;
      startTime: Date;
      tutorName?: string;
      studentName?: string;
    }
  ): Promise<void> {
    const isForTutor = !!bookingDetails.studentName;
    const subject = isForTutor ? 'New Booking Request' : 'Booking Created';
    const otherParty = isForTutor ? bookingDetails.studentName : bookingDetails.tutorName;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">${subject}</h2>
        <p>Hi ${recipientName},</p>
        <p>${isForTutor ? 'You have received a new booking request' : 'Your booking has been created successfully'}.</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Subject:</strong> ${bookingDetails.subject}</p>
          <p><strong>${isForTutor ? 'Student' : 'Tutor'}:</strong> ${otherParty}</p>
          <p><strong>Start Time:</strong> ${bookingDetails.startTime.toLocaleString()}</p>
        </div>
        <p>Please log in to your account to view more details.</p>
        <p>Best regards,<br>TutorGo Team</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  /**
   * Send booking cancelled email
   */
  async sendBookingCancelledEmail(
    to: string,
    recipientName: string,
    cancellationReason?: string
  ): Promise<void> {
    const subject = 'Booking Cancelled';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #EF4444;">${subject}</h2>
        <p>Hi ${recipientName},</p>
        <p>A booking has been cancelled.</p>
        ${
          cancellationReason
            ? `<div style="background-color: #FEF2F2; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Reason:</strong> ${cancellationReason}</p>
        </div>`
            : ''
        }
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>TutorGo Team</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  /**
   * Send payment completed email
   */
  async sendPaymentCompletedEmail(
    to: string,
    recipientName: string,
    amount: number,
    isForTutor: boolean
  ): Promise<void> {
    const subject = isForTutor ? 'Payment Received' : 'Payment Confirmed';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10B981;">${subject}</h2>
        <p>Hi ${recipientName},</p>
        <p>${isForTutor ? 'You have received a payment' : 'Your payment has been confirmed'}.</p>
        <div style="background-color: #F0FDF4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
        </div>
        <p>${isForTutor ? 'The funds will be transferred to your account according to our payment schedule.' : 'Your booking is now confirmed.'}</p>
        <p>Best regards,<br>TutorGo Team</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  /**
   * Send review submitted email
   */
  async sendReviewSubmittedEmail(
    to: string,
    tutorName: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    const subject = 'New Review Received';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">${subject}</h2>
        <p>Hi ${tutorName},</p>
        <p>You have received a new review!</p>
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Rating:</strong> ${'⭐'.repeat(rating)} (${rating}/5)</p>
          ${comment ? `<p><strong>Comment:</strong> ${comment}</p>` : ''}
        </div>
        <p>Keep up the great work!</p>
        <p>Best regards,<br>TutorGo Team</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  /**
   * Send new message notification email
   */
  async sendNewMessageEmail(
    to: string,
    recipientName: string,
    senderName: string
  ): Promise<void> {
    const subject = 'New Message Received';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">${subject}</h2>
        <p>Hi ${recipientName},</p>
        <p>You have received a new message from ${senderName}.</p>
        <p>Please log in to your account to view and respond to the message.</p>
        <p>Best regards,<br>TutorGo Team</p>
      </div>
    `;

    await this.sendEmail(to, subject, html);
  }

  /**
   * Generic email sending method
   */
  private async sendEmail(to: string, subject: string, html: string): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      console.log(`Email sent: ${info.messageId}`);

      // Log preview URL for development (Ethereal)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Verify email configuration
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready to send emails');
      return true;
    } catch (error) {
      console.error('Email service verification failed:', error);
      return false;
    }
  }
}
