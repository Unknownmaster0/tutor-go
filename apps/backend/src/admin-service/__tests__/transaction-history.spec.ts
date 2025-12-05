import { AdminService } from '../services/admin.service';
import { PrismaClient, Prisma } from '@prisma/client';

describe('AdminService - Transaction History', () => {
  let adminService: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      payment: {
        count: jest.fn(),
        findMany: jest.fn(),
      },
    };

    adminService = new AdminService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should return paginated transactions with default filters', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          bookingId: 'booking-1',
          amount: new Prisma.Decimal(100),
          currency: 'USD',
          status: 'succeeded',
          refundAmount: null,
          refundReason: null,
          createdAt: new Date(),
          booking: {
            subject: 'Math',
            student: { id: 'student-1', name: 'Student 1' },
            tutor: { id: 'tutor-1', name: 'Tutor 1' },
          },
        },
        {
          id: 'payment-2',
          bookingId: 'booking-2',
          amount: new Prisma.Decimal(150),
          currency: 'USD',
          status: 'succeeded',
          refundAmount: null,
          refundReason: null,
          createdAt: new Date(),
          booking: {
            subject: 'Physics',
            student: { id: 'student-2', name: 'Student 2' },
            tutor: { id: 'tutor-2', name: 'Tutor 2' },
          },
        },
      ];

      mockPrisma.payment.count.mockResolvedValue(2);
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await adminService.getTransactions({});

      expect(result.transactions).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.transactions[0].amount).toBe(100);
      expect(result.transactions[0].studentName).toBe('Student 1');
      expect(result.transactions[0].tutorName).toBe('Tutor 1');
    });

    it('should filter transactions by date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockPrisma.payment.count.mockResolvedValue(5);
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await adminService.getTransactions({ startDate, endDate });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          }),
        })
      );
    });

    it('should filter transactions by status', async () => {
      mockPrisma.payment.count.mockResolvedValue(3);
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await adminService.getTransactions({ status: 'succeeded' });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'succeeded',
          }),
        })
      );
    });

    it('should filter transactions by user ID', async () => {
      const userId = 'user-123';

      mockPrisma.payment.count.mockResolvedValue(10);
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await adminService.getTransactions({ userId });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            booking: {
              OR: [{ studentId: userId }, { tutorId: userId }],
            },
          }),
        })
      );
    });

    it('should handle pagination correctly', async () => {
      const mockPayments = Array.from({ length: 10 }, (_, i) => ({
        id: `payment-${i + 1}`,
        bookingId: `booking-${i + 1}`,
        amount: new Prisma.Decimal(100),
        currency: 'USD',
        status: 'succeeded',
        refundAmount: null,
        refundReason: null,
        createdAt: new Date(),
        booking: {
          subject: 'Math',
          student: { id: 'student-1', name: 'Student 1' },
          tutor: { id: 'tutor-1', name: 'Tutor 1' },
        },
      }));

      mockPrisma.payment.count.mockResolvedValue(50);
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await adminService.getTransactions({ page: 2, limit: 10 });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
    });

    it('should include refund information when available', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          bookingId: 'booking-1',
          amount: new Prisma.Decimal(100),
          currency: 'USD',
          status: 'refunded',
          refundAmount: new Prisma.Decimal(100),
          refundReason: 'Cancelled by student',
          createdAt: new Date(),
          booking: {
            subject: 'Math',
            student: { id: 'student-1', name: 'Student 1' },
            tutor: { id: 'tutor-1', name: 'Tutor 1' },
          },
        },
      ];

      mockPrisma.payment.count.mockResolvedValue(1);
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await adminService.getTransactions({});

      expect(result.transactions[0].refundAmount).toBe(100);
      expect(result.transactions[0].refundReason).toBe('Cancelled by student');
    });

    it('should order transactions by most recent first', async () => {
      mockPrisma.payment.count.mockResolvedValue(10);
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await adminService.getTransactions({});

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle multiple filters simultaneously', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const userId = 'user-123';
      const status = 'succeeded';

      mockPrisma.payment.count.mockResolvedValue(5);
      mockPrisma.payment.findMany.mockResolvedValue([]);

      await adminService.getTransactions({
        startDate,
        endDate,
        status,
        userId,
        page: 1,
        limit: 20,
      });

      expect(mockPrisma.payment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
            status: 'succeeded',
            booking: {
              OR: [{ studentId: userId }, { tutorId: userId }],
            },
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.payment.count.mockRejectedValue(new Error('Database error'));

      await expect(adminService.getTransactions({})).rejects.toThrow(
        'Failed to fetch transactions'
      );
    });

    it('should convert Decimal amounts to numbers', async () => {
      const mockPayments = [
        {
          id: 'payment-1',
          bookingId: 'booking-1',
          amount: new Prisma.Decimal('99.99'),
          currency: 'USD',
          status: 'succeeded',
          refundAmount: new Prisma.Decimal('50.00'),
          refundReason: 'Partial refund',
          createdAt: new Date(),
          booking: {
            subject: 'Math',
            student: { id: 'student-1', name: 'Student 1' },
            tutor: { id: 'tutor-1', name: 'Tutor 1' },
          },
        },
      ];

      mockPrisma.payment.count.mockResolvedValue(1);
      mockPrisma.payment.findMany.mockResolvedValue(mockPayments);

      const result = await adminService.getTransactions({});

      expect(typeof result.transactions[0].amount).toBe('number');
      expect(result.transactions[0].amount).toBe(99.99);
      expect(typeof result.transactions[0].refundAmount).toBe('number');
      expect(result.transactions[0].refundAmount).toBe(50);
    });
  });
});
