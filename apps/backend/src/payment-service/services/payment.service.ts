import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { stripeClient, stripeConfig } from '../config/stripe.config';
import { RabbitMQService } from './rabbitmq.service';
import {
  CreatePaymentIntentDto,
  PaymentIntentResponse,
  ConfirmPaymentDto,
  RefundPaymentDto,
} from '../dto';

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

    // Create Stripe payment intent
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(dto.amount * 100), // Convert to cents
      currency: dto.currency || stripeConfig.currency,
      payment_method_types: stripeConfig.paymentMethodTypes,
      metadata: {
        bookingId: dto.bookingId,
      },
    });

    // Store payment record in database
    await this.prisma.payment.create({
      data: {
        bookingId: dto.bookingId,
        stripePaymentId: paymentIntent.id,
        amount: dto.amount,
        currency: dto.currency || stripeConfig.currency,
        status: 'pending',
      },
    });

    return {
      clientSecret: paymentIntent.client_secret!,
      paymentIntentId: paymentIntent.id,
    };
  }

  async confirmPayment(dto: ConfirmPaymentDto): Promise<void> {
    // Retrieve payment intent from Stripe
    const paymentIntent = await stripeClient.paymentIntents.retrieve(dto.paymentIntentId);

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not succeeded');
    }

    // Update payment record
    const payment = await this.prisma.payment.findFirst({
      where: {
        stripePaymentId: dto.paymentIntentId,
        bookingId: dto.bookingId,
      },
    });

    if (!payment) {
      throw new Error('Payment record not found');
    }

    // Update payment status
    await this.prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'succeeded',
      },
    });

    // Update booking status to confirmed
    const booking = await this.prisma.booking.update({
      where: { id: dto.bookingId },
      data: {
        status: 'confirmed',
        paymentId: payment.id,
      },
    });

    // Publish payment completed event to RabbitMQ
    await this.rabbitMQService.publishPaymentCompletedEvent({
      paymentId: payment.id,
      bookingId: dto.bookingId,
      amount: payment.amount.toNumber(),
      studentId: booking.studentId,
      tutorId: booking.tutorId,
      timestamp: new Date(),
    });
  }

  async handlePaymentFailure(paymentIntentId: string): Promise<void> {
    // Find payment record
    const payment = await this.prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
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

    if (!payment.stripePaymentId) {
      throw new Error('Stripe payment ID not found');
    }

    // Calculate refund amount
    const refundAmount = dto.amount
      ? Math.round(dto.amount * 100)
      : Math.round(payment.amount.toNumber() * 100);

    // Process refund through Stripe
    const refund = await stripeClient.refunds.create({
      payment_intent: payment.stripePaymentId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        reason: dto.reason,
      },
    });

    // Update payment record
    await this.prisma.payment.update({
      where: { id: dto.paymentId },
      data: {
        status: 'refunded',
        refundAmount: refundAmount / 100,
        refundReason: dto.reason,
      },
    });

    console.log(`Refund processed: ${refund.id}`);
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const succeededIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', succeededIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const failedIntent = event.data.object as Stripe.PaymentIntent;
        await this.handlePaymentFailure(failedIntent.id);
        break;
      }

      case 'charge.refunded': {
        const refundedCharge = event.data.object as Stripe.Charge;
        console.log('Charge refunded:', refundedCharge.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }
}
