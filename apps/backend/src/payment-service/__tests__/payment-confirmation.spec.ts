import { PaymentService } from '../services/payment.service';
import { RabbitMQService } from '../services/rabbitmq.service';

// Mock Stripe
jest.mock('../config/stripe.config', () => ({
  stripeClient: {
    paymentIntents: {
      retrieve: jest.fn(),
    },
  },
  stripeConfig: {
    currency: 'usd',
    paymentMethodTypes: ['card'],
  },
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
}));

describe('PaymentService - Payment Confirmation', () => {
  let paymentService: PaymentService;
  let mockPrisma: any;
  let mockRabbitMQ: any;
  let mockStripeClient: any;

  beforeEach(() => {
    // Mock Prisma
    mockPrisma = {
      booking: {
        update: jest.fn(),
      },
      payment: {
        findFirst: jest.fn(),
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


  describe('confirmPayment', () => {
    it('should confirm payment successfully', async () => {
      const paymentIntentId = 'pi_test_123';
      const bookingId = '123e4567-e89b-12d3-a456-426614174000';
      const paymentId = 'payment-123';
      const tutorId = 'tutor-123';
      const studentId = 'student-123';

      // Mock Stripe payment intent retrieval
      mockStripeClient.paymentIntents.retrieve.mockResolvedValue({
        id: paymentIntentId,
        status: 'succeeded',
      });

      // Mock payment record retrieval
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: paymentId,
        bookingId: bookingId,
        stripePaymentId: paymentIntentId,
        amount: { toNumber: () => 50.0 },
        status: 'pending',
      });

      // Mock payment update
      mockPrisma.payment.update.mockResolvedValue({
        id: paymentId,
        status: 'succeeded',
      });

      // Mock booking update
      mockPrisma.booking.update.mockResolvedValue({
        id: bookingId,
        status: 'confirmed',
        paymentId: paymentId,
        tutorId: tutorId,
        studentId: studentId,
      });

      await paymentService.confirmPayment({
        paymentIntentId,
        bookingId,
      });

      expect(mockStripeClient.paymentIntents.retrieve).toHaveBeenCalledWith(
        paymentIntentId
      );

      expect(mockPrisma.payment.findFirst).toHaveBeenCalledWith({
        where: {
          stripePaymentId: paymentIntentId,
          bookingId: bookingId,
        },
      });

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: paymentId },
        data: {
          status: 'succeeded',
        },
      });

      expect(mockPrisma.booking.update).toHaveBeenCalledWith({
        where: { id: bookingId },
        data: {
          status: 'confirmed',
          paymentId: paymentId,
        },
      });

      expect(mockRabbitMQ.publishPaymentCompletedEvent).toHaveBeenCalledWith({
        paymentId: paymentId,
        bookingId: bookingId,
        amount: 50.0,
        studentId: studentId,
        tutorId: tutorId,
        timestamp: expect.any(Date),
      });
    });

    it('should throw error if payment has not succeeded', async () => {
      mockStripeClient.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_test_123',
        status: 'pending',
      });

      await expect(
        paymentService.confirmPayment({
          paymentIntentId: 'pi_test_123',
          bookingId: 'booking-123',
        })
      ).rejects.toThrow('Payment has not succeeded');
    });

    it('should throw error if payment record not found', async () => {
      mockStripeClient.paymentIntents.retrieve.mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
      });

      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(
        paymentService.confirmPayment({
          paymentIntentId: 'pi_test_123',
          bookingId: 'booking-123',
        })
      ).rejects.toThrow('Payment record not found');
    });
  });
});
