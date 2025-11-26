import { AdminService } from '../services/admin.service';
import { PrismaClient, Prisma } from '@prisma/client';

describe('AdminService - Metrics', () => {
  let adminService: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        count: jest.fn(),
      },
      booking: {
        count: jest.fn(),
      },
      payment: {
        aggregate: jest.fn(),
        count: jest.fn(),
      },
    };

    adminService = new AdminService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMetrics', () => {
    it('should return admin dashboard metrics', async () => {
      // Mock user counts
      mockPrisma.user.count
        .mockResolvedValueOnce(100) // total users
        .mockResolvedValueOnce(60) // students
        .mockResolvedValueOnce(35); // tutors

      // Mock booking counts
      mockPrisma.booking.count
        .mockResolvedValueOnce(50) // total bookings
        .mockResolvedValueOnce(10) // pending
        .mockResolvedValueOnce(20) // confirmed
        .mockResolvedValueOnce(15) // completed
        .mockResolvedValueOnce(5); // cancelled

      // Mock revenue aggregate
      mockPrisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal(5000) },
        _avg: null,
        _count: null,
        _max: null,
        _min: null,
      });

      // Mock today's activity
      mockPrisma.user.count.mockResolvedValueOnce(5); // new users today
      mockPrisma.booking.count.mockResolvedValueOnce(8); // bookings today
      mockPrisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal(800) },
        _avg: null,
        _count: null,
        _max: null,
        _min: null,
      });

      const metrics = await adminService.getMetrics();

      expect(metrics).toEqual({
        totalUsers: 100,
        totalStudents: 60,
        totalTutors: 35,
        totalBookings: 50,
        totalRevenue: 5000,
        pendingBookings: 10,
        confirmedBookings: 20,
        completedBookings: 15,
        cancelledBookings: 5,
        averageBookingValue: 100, // 5000 / 50
        recentActivity: {
          newUsersToday: 5,
          bookingsToday: 8,
          revenueToday: 800,
        },
      });
    });

    it('should handle zero bookings correctly', async () => {
      // Mock user counts
      mockPrisma.user.count
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(3);

      // Mock zero bookings
      mockPrisma.booking.count
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      // Mock zero revenue
      mockPrisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: null },
        _avg: null,
        _count: null,
        _max: null,
        _min: null,
      });

      // Mock today's activity
      mockPrisma.user.count.mockResolvedValueOnce(0);
      mockPrisma.booking.count.mockResolvedValueOnce(0);
      mockPrisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: null },
        _avg: null,
        _count: null,
        _max: null,
        _min: null,
      });

      const metrics = await adminService.getMetrics();

      expect(metrics.totalBookings).toBe(0);
      expect(metrics.totalRevenue).toBe(0);
      expect(metrics.averageBookingValue).toBe(0);
    });

    it('should handle database errors', async () => {
      mockPrisma.user.count.mockRejectedValueOnce(
        new Error('Database error')
      );

      await expect(adminService.getMetrics()).rejects.toThrow(
        'Failed to fetch admin metrics'
      );
    });

    it('should calculate metrics for different time periods', async () => {
      // Mock user counts
      mockPrisma.user.count
        .mockResolvedValueOnce(200)
        .mockResolvedValueOnce(120)
        .mockResolvedValueOnce(70);

      // Mock booking counts
      mockPrisma.booking.count
        .mockResolvedValueOnce(150)
        .mockResolvedValueOnce(30)
        .mockResolvedValueOnce(60)
        .mockResolvedValueOnce(50)
        .mockResolvedValueOnce(10);

      // Mock revenue
      mockPrisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal(15000) },
        _avg: null,
        _count: null,
        _max: null,
        _min: null,
      });

      // Mock today's activity
      mockPrisma.user.count.mockResolvedValueOnce(12);
      mockPrisma.booking.count.mockResolvedValueOnce(15);
      mockPrisma.payment.aggregate.mockResolvedValueOnce({
        _sum: { amount: new Prisma.Decimal(1500) },
        _avg: null,
        _count: null,
        _max: null,
        _min: null,
      });

      const metrics = await adminService.getMetrics();

      expect(metrics.totalUsers).toBe(200);
      expect(metrics.totalBookings).toBe(150);
      expect(metrics.totalRevenue).toBe(15000);
      expect(metrics.averageBookingValue).toBe(100);
      expect(metrics.recentActivity.newUsersToday).toBe(12);
      expect(metrics.recentActivity.bookingsToday).toBe(15);
      expect(metrics.recentActivity.revenueToday).toBe(1500);
    });
  });
});
