import { PrismaClient } from '@prisma/client';
import { Logger } from '../../shared';
import {
  AdminMetricsDto,
  UserSearchDto,
  UserManagementDto,
  SuspendUserDto,
  FlaggedContentDto,
  ModerationActionDto,
  TransactionFilterDto,
  TransactionDto,
} from '../dto/admin.dto';

export class AdminService {
  private logger: Logger;

  constructor(private prisma: PrismaClient) {
    this.logger = new Logger('AdminService');
  }

  /**
   * Get admin dashboard metrics
   */
  async getMetrics(): Promise<AdminMetricsDto> {
    try {
      this.logger.log('Fetching admin metrics');

      // Get total users by role
      const [totalUsers, totalStudents, totalTutors] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: 'student' } }),
        this.prisma.user.count({ where: { role: 'tutor' } }),
      ]);

      // Get booking statistics
      const [
        totalBookings,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
      ] = await Promise.all([
        this.prisma.booking.count(),
        this.prisma.booking.count({ where: { status: 'pending' } }),
        this.prisma.booking.count({ where: { status: 'confirmed' } }),
        this.prisma.booking.count({ where: { status: 'completed' } }),
        this.prisma.booking.count({ where: { status: 'cancelled' } }),
      ]);

      // Calculate total revenue from succeeded payments
      const revenueResult = await this.prisma.payment.aggregate({
        where: { status: 'succeeded' },
        _sum: { amount: true },
      });
      const totalRevenue = Number(revenueResult._sum.amount || 0);

      // Calculate average booking value
      const averageBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

      // Get today's activity
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [newUsersToday, bookingsToday, revenueTodayResult] = await Promise.all([
        this.prisma.user.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.booking.count({
          where: { createdAt: { gte: today } },
        }),
        this.prisma.payment.aggregate({
          where: {
            status: 'succeeded',
            createdAt: { gte: today },
          },
          _sum: { amount: true },
        }),
      ]);

      const revenueToday = Number(revenueTodayResult._sum.amount || 0);

      const metrics: AdminMetricsDto = {
        totalUsers,
        totalStudents,
        totalTutors,
        totalBookings,
        totalRevenue,
        pendingBookings,
        confirmedBookings,
        completedBookings,
        cancelledBookings,
        averageBookingValue,
        recentActivity: {
          newUsersToday,
          bookingsToday,
          revenueToday,
        },
      };

      this.logger.log('Admin metrics fetched successfully');
      return metrics;
    } catch (error) {
      this.logger.error('Error fetching admin metrics:', error);
      throw new Error('Failed to fetch admin metrics');
    }
  }

  /**
   * Search and filter users
   */
  async searchUsers(
    filters: UserSearchDto,
  ): Promise<{ users: UserManagementDto[]; total: number; page: number; totalPages: number }> {
    try {
      const { search, role, status, page = 1, limit = 20 } = filters;

      this.logger.log('Searching users with filters:', filters);

      const where: any = {};

      // Apply search filter
      if (search) {
        where.OR = [
          { email: { contains: search, mode: 'insensitive' } },
          { name: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Apply role filter
      if (role) {
        where.role = role;
      }

      // Apply status filter
      if (status === 'suspended') {
        where.suspended = true;
      } else if (status === 'active') {
        where.suspended = false;
      }

      // Get total count
      const total = await this.prisma.user.count({ where });

      // Get paginated users
      const skip = (page - 1) * limit;
      const users = await this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          suspended: true,
          suspensionReason: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Found ${users.length} users`);
      return {
        users: users as UserManagementDto[],
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error searching users:', error);
      throw new Error('Failed to search users');
    }
  }

  /**
   * Suspend a user account
   */
  async suspendUser(userId: string, data: SuspendUserDto): Promise<UserManagementDto> {
    try {
      this.logger.log(`Suspending user ${userId}`);

      // Check if user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.suspended) {
        throw new Error('User is already suspended');
      }

      // Suspend the user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          suspended: true,
          suspensionReason: data.reason,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          suspended: true,
          suspensionReason: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User ${userId} suspended successfully`);
      return updatedUser as UserManagementDto;
    } catch (error) {
      this.logger.error('Error suspending user:', error);
      throw error;
    }
  }

  /**
   * Unsuspend a user account
   */
  async unsuspendUser(userId: string): Promise<UserManagementDto> {
    try {
      this.logger.log(`Unsuspending user ${userId}`);

      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (!user.suspended) {
        throw new Error('User is not suspended');
      }

      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: {
          suspended: false,
          suspensionReason: null,
          updatedAt: new Date(),
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          suspended: true,
          suspensionReason: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      this.logger.log(`User ${userId} unsuspended successfully`);
      return updatedUser as UserManagementDto;
    } catch (error) {
      this.logger.error('Error unsuspending user:', error);
      throw error;
    }
  }

  /**
   * Get flagged content for moderation
   */
  async getFlaggedContent(): Promise<FlaggedContentDto[]> {
    try {
      this.logger.log('Fetching flagged content');

      // Get flagged reviews
      const flaggedReviews = await this.prisma.review.findMany({
        where: { flagged: true },
        include: {
          student: { select: { name: true } },
          tutor: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Get flagged messages (assuming we add a flagged field to messages)
      const flaggedMessages = await this.prisma.message.findMany({
        where: { flagged: true },
        include: {
          sender: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform reviews to FlaggedContentDto
      const reviewContent: FlaggedContentDto[] = flaggedReviews.map((review) => ({
        id: review.id,
        type: 'review' as const,
        contentId: review.id,
        content: review.comment || '',
        reportedBy: review.student.name,
        reportedAt: review.createdAt,
        status: 'pending' as const,
      }));

      // Transform messages to FlaggedContentDto
      const messageContent: FlaggedContentDto[] = flaggedMessages.map((message) => ({
        id: message.id,
        type: 'message' as const,
        contentId: message.id,
        content: message.message,
        reportedBy: message.sender.name,
        reportedAt: message.createdAt,
        status: 'pending' as const,
      }));

      const allFlaggedContent = [...reviewContent, ...messageContent];

      this.logger.log(`Found ${allFlaggedContent.length} flagged items`);
      return allFlaggedContent;
    } catch (error) {
      this.logger.error('Error fetching flagged content:', error);
      throw new Error('Failed to fetch flagged content');
    }
  }

  /**
   * Moderate flagged content
   */
  async moderateContent(
    contentId: string,
    type: 'review' | 'message',
    action: ModerationActionDto,
    _moderatorId: string,
  ): Promise<void> {
    try {
      this.logger.log(`Moderating ${type} ${contentId} with action ${action.action}`);

      if (type === 'review') {
        if (action.action === 'approve') {
          // Unflag the review
          await this.prisma.review.update({
            where: { id: contentId },
            data: { flagged: false },
          });
        } else if (action.action === 'remove') {
          // Delete the review
          await this.prisma.review.delete({
            where: { id: contentId },
          });
        } else if (action.action === 'warn') {
          // Keep flagged but add a warning (could extend schema for this)
          await this.prisma.review.update({
            where: { id: contentId },
            data: { flagged: true },
          });
        }
      } else if (type === 'message') {
        if (action.action === 'approve') {
          // Unflag the message
          await this.prisma.message.update({
            where: { id: contentId },
            data: { flagged: false },
          });
        } else if (action.action === 'remove') {
          // Delete the message
          await this.prisma.message.delete({
            where: { id: contentId },
          });
        } else if (action.action === 'warn') {
          // Keep flagged
          await this.prisma.message.update({
            where: { id: contentId },
            data: { flagged: true },
          });
        }
      }

      this.logger.log(`Content moderated successfully`);
    } catch (error) {
      this.logger.error('Error moderating content:', error);
      throw new Error('Failed to moderate content');
    }
  }

  /**
   * Get transaction history with filters
   */
  async getTransactions(
    filters: TransactionFilterDto,
  ): Promise<{ transactions: TransactionDto[]; total: number; page: number; totalPages: number }> {
    try {
      const { startDate, endDate, status, userId, page = 1, limit = 20 } = filters;

      this.logger.log('Fetching transactions with filters:', filters);

      const where: any = {};

      // Apply date filters
      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = startDate;
        if (endDate) where.createdAt.lte = endDate;
      }

      // Apply status filter
      if (status) {
        where.status = status;
      }

      // Apply user filter (either student or tutor)
      if (userId) {
        where.booking = {
          OR: [{ studentId: userId }, { tutorId: userId }],
        };
      }

      // Get total count
      const total = await this.prisma.payment.count({ where });

      // Get paginated transactions
      const skip = (page - 1) * limit;
      const payments = await this.prisma.payment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          booking: {
            include: {
              student: { select: { id: true, name: true } },
              tutor: { select: { id: true, name: true } },
            },
          },
        },
      });

      // Transform to TransactionDto
      const transactions: TransactionDto[] = payments.map((payment) => ({
        id: payment.id,
        bookingId: payment.bookingId,
        amount: Number(payment.amount),
        currency: payment.currency,
        status: payment.status,
        studentId: payment.booking.student.id,
        studentName: payment.booking.student.name,
        tutorId: payment.booking.tutor.id,
        tutorName: payment.booking.tutor.name,
        subject: payment.booking.subject,
        createdAt: payment.createdAt,
        refundAmount: payment.refundAmount ? Number(payment.refundAmount) : undefined,
        refundReason: payment.refundReason || undefined,
      }));

      const totalPages = Math.ceil(total / limit);

      this.logger.log(`Found ${transactions.length} transactions`);
      return {
        transactions,
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Error fetching transactions:', error);
      throw new Error('Failed to fetch transactions');
    }
  }

  /**
   * Get recent activity
   */
  async getActivity(): Promise<
    Array<{ id: string; type: string; description: string; timestamp: Date }>
  > {
    try {
      this.logger.log('Fetching recent activity');

      // Get recent bookings
      const recentBookings = await this.prisma.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          student: { select: { name: true } },
          tutor: { select: { name: true } },
        },
      });

      // Transform to activity format
      const activity = recentBookings.map((booking) => ({
        id: booking.id,
        type: 'booking',
        description: `Booking created: ${booking.student.name} booked ${booking.tutor.name}`,
        timestamp: booking.createdAt,
      }));

      return activity;
    } catch (error) {
      this.logger.error('Error fetching activity:', error);
      throw new Error('Failed to fetch activity');
    }
  }

  /**
   * Get revenue data
   */
  async getRevenueData(): Promise<Array<{ date: string; revenue: number }>> {
    try {
      this.logger.log('Fetching revenue data');

      // Get last 7 days of revenue
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const revenueData = await Promise.all(
        last7Days.map(async (date) => {
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const result = await this.prisma.payment.aggregate({
            where: {
              status: 'succeeded',
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
            _sum: { amount: true },
          });

          return {
            date: date.toISOString().split('T')[0],
            revenue: Number(result._sum.amount || 0),
          };
        }),
      );

      return revenueData;
    } catch (error) {
      this.logger.error('Error fetching revenue data:', error);
      throw new Error('Failed to fetch revenue data');
    }
  }

  /**
   * Get bookings data
   */
  async getBookingsData(): Promise<Array<{ date: string; bookings: number }>> {
    try {
      this.logger.log('Fetching bookings data');

      // Get last 7 days of bookings
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - i));
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const bookingsData = await Promise.all(
        last7Days.map(async (date) => {
          const nextDate = new Date(date);
          nextDate.setDate(nextDate.getDate() + 1);

          const count = await this.prisma.booking.count({
            where: {
              createdAt: {
                gte: date,
                lt: nextDate,
              },
            },
          });

          return {
            date: date.toISOString().split('T')[0],
            bookings: count,
          };
        }),
      );

      return bookingsData;
    } catch (error) {
      this.logger.error('Error fetching bookings data:', error);
      throw new Error('Failed to fetch bookings data');
    }
  }
}
