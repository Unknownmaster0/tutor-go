import { PrismaClient } from '@prisma/client';
import { razorpayClient } from '../config/razorpay.config';
import { RabbitMQService } from './rabbitmq.service';
import crypto from 'crypto';

export interface CreatePaymentIntentDto {
  bookingId: string;
  amount: number;
  currency?: string;
}

export interface ConfirmPaymentDto {
  orderId: string;
  paymentId: string;
  signature: string;
  bookingId: string;
}

export interface RefundPaymentDto {
  paymentId: string;
  amount?: number;
  reason: string;
}

export interface PaymentIntentResponse {
  orderId: string;
  amount: number;
  currency: string;
}

export class PaymentService {
  constructor(
    private prisma: PrismaClient,
    private rabbitMQService: RabbitMQService,
  ) {}

  async createPaymentIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntentResponse> {
    // Verify booking exists and is in pending status
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Booking is not in pending status');
    }

    // Check if payment already exists for this booking
    const existingPayment = await this.prisma.payment.findUnique({
      where: { bookingId: dto.bookingId },
    });

    // If payment exists and is pending, return the existing order
    if (existingPayment && existingPayment.status === 'pending') {
      return {
        orderId: existingPayment.stripePaymentId,
        amount: existingPayment.amount.toNumber(),
        currency: existingPayment.currency,
      };
    }

    // If payment exists but failed/succeeded, delete it and create new one
    if (existingPayment) {
      await this.prisma.payment.delete({
        where: { id: existingPayment.id },
      });
    }

    // Create Razorpay order
    // Use only last 30 chars of booking ID for receipt (Razorpay max is 40 chars)
    const receiptId = dto.bookingId.slice(-30);
    const razorpayOrder = await razorpayClient.orders.create({
      amount: Math.round(dto.amount * 100), // Amount in paise
      currency: dto.currency || 'INR',
      receipt: receiptId,
      notes: {
        bookingId: dto.bookingId,
      },
    });

    // Store payment record in database
    await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        stripePaymentId: razorpayOrder.id, // Store Razorpay order ID
        amount: dto.amount,
        currency: dto.currency || 'INR',
        status: 'pending',
      },
    });

    return {
      orderId: razorpayOrder.id,
      amount: dto.amount,
      currency: dto.currency || 'INR',
    };
  }

  async confirmPayment(dto: ConfirmPaymentDto): Promise<void> {
    // Verify payment signature
    const isSignatureValid = this.verifyPaymentSignature(
      dto.orderId,
      dto.paymentId,
      dto.signature,
    );

    if (!isSignatureValid) {
      throw new Error('Payment signature verification failed');
    }

    // Fetch payment details from Razorpay
    const payment = await razorpayClient.payments.fetch(dto.paymentId);

    if (payment.status !== 'captured') {
      throw new Error('Payment is not captured');
    }

    // Update payment record
    const paymentRecord = await this.prisma.payment.findFirst({
      where: {
        stripePaymentId: dto.orderId,
        bookingId: dto.bookingId,
      },
    });

    if (!paymentRecord) {
      throw new Error('Payment record not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        status: 'succeeded',
      },
    });

    // Update booking status to confirmed
    const booking = await this.prisma.booking.update({
      where: { id: dto.bookingId },
      data: {
        status: 'confirmed',
        paymentId: paymentRecord.id,
      },
    });

    // Publish payment completed event to RabbitMQ
    await this.rabbitMQService.publishPaymentCompletedEvent({
      paymentId: paymentRecord.id,
      bookingId: dto.bookingId,
      amount: paymentRecord.amount.toNumber(),
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      timestamp: new Date(),
    });
  }

  async handlePaymentFailure(paymentId: string): Promise<void> {
    // Find payment record
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: paymentId },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Update payment status to failed
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'failed',
      },
    });

    // Keep booking in pending status to allow retry
    console.log(`Payment failed for booking ${payment.bookingId}`);
  }

  async processRefund(dto: RefundPaymentDto): Promise<void> {
    // Find payment record
    const payment = await this.prisma.payment.findUnique({
      where: { id: dto.paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'succeeded') {
      throw new Error('Can only refund succeeded payments');
    }

    // Create Razorpay refund
    const refund = await razorpayClient.payments.refund(payment.stripePaymentId, {
      amount: dto.amount ? Math.round(dto.amount * 100) : undefined,
    });

    // Update payment record
    await this.prisma.payment.update({
      where: { id: dto.paymentId },
      data: {
        status: 'refunded',
        refundAmount: dto.amount || payment.amount.toNumber(),
        refundReason: dto.reason,
      },
    });

    // Update booking status
    await this.prisma.booking.update({
      where: { id: payment.bookingId },
      data: {
        status: 'cancelled',
      },
    });

    console.log(`Refund processed for payment ${dto.paymentId}: ${refund.id}`);
  }

  // Verify Razorpay payment signature
  private verifyPaymentSignature(orderId: string, paymentId: string, signature: string): boolean {
    const body = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  }

  async handleWebhookEvent(event: any): Promise<void> {
    console.log('Webhook event received:', event.event);

    switch (event.event) {
      case 'payment.authorized':
        console.log('Payment authorized:', event.payload?.payment?.entity?.id);
        break;
      case 'payment.failed':
        if (event.payload?.payment?.entity?.id) {
          await this.handlePaymentFailure(event.payload.payment.entity.id);
        }
        break;
      case 'payment.captured':
        console.log('Payment captured:', event.payload?.payment?.entity?.id);
        break;
      default:
        console.log('Unknown webhook event:', event.event);
    }
  }
}
