import { Logger } from '../../shared';

export class EmailService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('EmailService');
  }

  async sendVerificationEmail(email: string, name: string): Promise<void> {
    // Mock implementation - log instead of sending actual email
    this.logger.log(`[MOCK] Sending verification email to ${email}`);
    this.logger.log(`[MOCK] Email content: Welcome ${name}! Please verify your email address.`);
    
    // In production, integrate with SendGrid, AWS SES, or Nodemailer
    // Example:
    // await this.emailClient.send({
    //   to: email,
    //   subject: 'Verify your TutorGo account',
    //   html: `<p>Welcome ${name}! Please verify your email address.</p>`,
    // });
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    // Mock implementation - log instead of sending actual email
    this.logger.log(`[MOCK] Sending password reset email to ${email}`);
    this.logger.log(`[MOCK] Reset token: ${resetToken}`);
    this.logger.log(`[MOCK] Email content: Hi ${name}, click the link to reset your password.`);
    
    // In production, integrate with email service
    // const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    // await this.emailClient.send({
    //   to: email,
    //   subject: 'Reset your TutorGo password',
    //   html: `<p>Hi ${name}, click <a href="${resetLink}">here</a> to reset your password.</p>`,
    // });
  }

  async sendBookingConfirmationEmail(email: string, name: string, bookingDetails: any): Promise<void> {
    this.logger.log(`[MOCK] Sending booking confirmation email to ${email}`);
    this.logger.log(`[MOCK] Booking details:`, bookingDetails);
  }
}
