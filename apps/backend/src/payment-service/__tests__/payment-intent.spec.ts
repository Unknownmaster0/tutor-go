import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { PaymentService } from '../services/payment.service';
import { RabbitMQService } from '../services/rabbitmq.service';

// Mock Stripe
jest.mock('stripe');
jest.mock('../config/stripe.config', () => ({
  stripeClient: {
    paymentIntents: {
      create: jest.fn(),
      retrieve: jest.fn(),
    },
  },
  stripeConfig: {
    currency: 'usd',
    paymentMethodTypes: ['card'],
  },
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
}));

describe('PaymentService - Payment Intent Creation', () => {
  let paymentService: PaymentService;
  let mockPrisma: any;
  let mockRabbitMQ: any;
  let mockStripeClient: any;

  beforeEach(() => {
    // Mock Prisma
    mockPrisma = {
      booking: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      payment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    // Mock RabbitMQ
    mockRabbitMQ = {
      publishPaymentCompletedEvent: jest.fn(),
    };

    // Get mocked Stripe client
    const { stripeClient } = require('../config/stripe.config');
    mockStripeClient = stripeClient;

    paymentService = new PaymentService(mockPrisma as any, mockRabbitMQ);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('createPaymentIntent', () => {
    it('should create payment intent successfully', async () => {
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      const amount = 50.0;

      // Mock booking exists and is pending
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: bookingId,
        status: 'pending',
        tutor_id: 'tutor-123',
        student_id: 'student-123',
        total_amount: amount,
      });

      // Mock Stripe payment intent creation
      mockStripeClient.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_456',
        amount: 5000,
        currency: 'usd',
      });

      // Mock payment record creation
      mockPrisma.payment.create.mockResolvedValue({
        id: 'payment-123',
        bookingId: bookingId,
        stripePaymentId: 'pi_test_123',
        amount: amount,
        currency: 'usd',
        status: 'pending',
      });

      const result = await paymentService.createPaymentIntent({
        bookingId,
        amount,
        currency: 'usd',
      });

      expect(result).toEqual({
        clientSecret: 'pi_test_123_secret_456',
        paymentIntentId: 'pi_test_123',
      });

      expect(mockPrisma.booking.findUnique).toHaveBeenCalledWith({
        where: { id: bookingId },
      });

      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith({
        amount: 5000, // 50.00 * 100
        currency: 'usd',
        payment_method_types: ['card'],
        metadata: {
          bookingId,
        },
      });

      expect(mockPrisma.payment.create).toHaveBeenCalledWith({
        data: {
          bookingId: bookingId,
          stripePaymentId: 'pi_test_123',
          amount: amount,
          currency: 'usd',
          status: 'pending',
        },
      });
    });

    it('should throw error if booking not found', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.createPaymentIntent({
          bookingId: 'non-existent',
          amount: 50.0,
        })
      ).rejects.toThrow('Booking not found');
    });

    it('should throw error if booking is not in pending status', async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        id: 'booking-123',
        status: 'confirmed',
      });

      await expect(
        paymentService.createPaymentIntent({
          bookingId: 'booking-123',
          amount: 50.0,
        })
      ).rejects.toThrow('Booking is not in pending status');
    });

    it('should use default currency if not provided', async () => {
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';

      mockPrisma.booking.findUnique.mockResolvedValue({
        id: bookingId,
        status: 'pending',
      });

      mockStripeClient.paymentIntents.create.mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret_456',
      });

      mockPrisma.payment.create.mockResolvedValue({
        id: 'payment-123',
      });

      await paymentService.createPaymentIntent({
        bookingId,
        amount: 50.0,
      });

      expect(mockStripeClient.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          currency: 'usd',
        })
      );
    });
  });
});
