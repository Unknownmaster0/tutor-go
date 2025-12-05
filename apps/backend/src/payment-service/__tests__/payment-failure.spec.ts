import { PaymentService } from '../services/payment.service';
import { RabbitMQService } from '../services/rabbitmq.service';

describe('PaymentService - Payment Failure Handling', () => {
  let paymentService: PaymentService;
  let mockPrisma: any;
  let mockRabbitMQ: any;

  beforeEach(() => {
    // Mock Prisma
    mockPrisma = {
      payment: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    // Mock RabbitMQ
    mockRabbitMQ = {
      publishPaymentCompletedEvent: jest.fn(),
    };

    paymentService = new PaymentService(mockPrisma as any, mockRabbitMQ);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handlePaymentFailure', () => {
    it('should handle payment failure successfully', async () => {
      const paymentIntentId = 'pi_test_failed';
      const paymentId = 'payment-123';
      const bookingId = 'booking-123';

      // Mock payment record retrieval
      mockPrisma.payment.findFirst.mockResolvedValue({
        id: paymentId,
        bookingId: bookingId,
        stripePaymentId: paymentIntentId,
        status: 'pending',
      });

      // Mock payment update
      mockPrisma.payment.update.mockResolvedValue({
        id: paymentId,
        status: 'failed',
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await paymentService.handlePaymentFailure(paymentIntentId);

      expect(mockPrisma.payment.findFirst).toHaveBeenCalledWith({
        where: { stripePaymentId: paymentIntentId },
      });

      expect(mockPrisma.payment.update).toHaveBeenCalledWith({
        where: { id: paymentId },
        data: {
          status: 'failed',
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        `Payment failed for booking ${bookingId}`
      );

      consoleSpy.mockRestore();
    });

    it('should throw error if payment record not found', async () => {
      mockPrisma.payment.findFirst.mockResolvedValue(null);

      await expect(
        paymentService.handlePaymentFailure('pi_test_nonexistent')
      ).rejects.toThrow('Payment record not found');
    });
  });
});
