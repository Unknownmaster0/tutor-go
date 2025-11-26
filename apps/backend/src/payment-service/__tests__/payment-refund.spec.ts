import { PaymentService } from '../services/payment.service';
import { RabbitMQService } from '../services/rabbitmq.service';

// Mock Stripe
jest.mock('../config/stripe.config', () => ({
  stripeClient: {
    refunds: {
      create: jest.fn(),
    },
  },
  stripeConfig: {
    currency: 'usd',
    paymentMethodTypes: ['card'],
  },
  STRIPE_WEBHOOK_SECRET: 'whsec_test',
}));

describe('PaymentService - Refund Processing', () => {
  let paymentService: PaymentService;
  let mockPrisma: any;
  let mockRabbitMQ: any;
  let mockStripeClient: any;

  beforeEach(() => {
    // Mock Prisma
    mockPrisma = {
      payment: {
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

  describe('processRefund', () => {
    it('should process full refund successfully', async () => {
      const paymentId = 'payment-123';
      const stripePaymentId = 'pi_test_123';

      // Mock payment retrieval
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: paymentId,
        stripePaymentId: stripePaymentId,
        amount: { toNumber: () => 50.0 },
        status: 'succeeded',
      });

      // Mock Stripe refund creation
      mockStripeClient.refunds.create.mockResolvedValue({
        id: 'refund_123',
        amount: 5000,
        status: 'succeeded',
      });

      // Mock payment update
      mockPrisma.payment.update.mockResolvedValue({
        id: paymentId,
        status: 'refunded',
      });

      await paymentService.processRefund({
        paymentId,
        reason: 'Customer requested cancellation',
      });

      expect(mockPrisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: paymentId },
      });

      expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
        payment_intent: stripePaymentId,
        amount: 5000,
        reason: 'requested_by_customer',
        metadata: {
          reason: 'Customer requested cancellation',
        },
      });

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: paymentId },
        data: {
          status: 'refunded',
          refundAmount: 50.0,
          refundReason: 'Customer requested cancellation',
        },
      });
    });

    it('should process partial refund successfully', async () => {
      const paymentId = 'payment-123';
      const stripePaymentId = 'pi_test_123';
      const partialAmount = 25.0;

      mockPrisma.payment.findUnique.mockResolvedValue({
        id: paymentId,
        stripePaymentId: stripePaymentId,
        amount: { toNumber: () => 50.0 },
        status: 'succeeded',
      });

      mockStripeClient.refunds.create.mockResolvedValue({
        id: 'refund_123',
        amount: 2500,
        status: 'succeeded',
      });

      mockPrisma.payment.update.mockResolvedValue({
        id: paymentId,
        status: 'refunded',
      });

      await paymentService.processRefund({
        paymentId,
        amount: partialAmount,
        reason: 'Partial refund requested',
      });

      expect(mockStripeClient.refunds.create).toHaveBeenCalledWith({
        payment_intent: stripePaymentId,
        amount: 2500,
        reason: 'requested_by_customer',
        metadata: {
          reason: 'Partial refund requested',
        },
      });
    });

    it('should throw error if payment not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue(null);

      await expect(
        paymentService.processRefund({
          paymentId: 'non-existent',
          reason: 'Test',
        })
      ).rejects.toThrow('Payment not found');
    });

    it('should throw error if payment is not succeeded', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        status: 'pending',
      });

      await expect(
        paymentService.processRefund({
          paymentId: 'payment-123',
          reason: 'Test',
        })
      ).rejects.toThrow('Can only refund succeeded payments');
    });

    it('should throw error if stripe payment ID not found', async () => {
      mockPrisma.payment.findUnique.mockResolvedValue({
        id: 'payment-123',
        status: 'succeeded',
        stripePaymentId: null,
      });

      await expect(
        paymentService.processRefund({
          paymentId: 'payment-123',
          reason: 'Test',
        })
      ).rejects.toThrow('Stripe payment ID not found');
    });
  });
});
