import { AdminService } from '../services/admin.service';
import { PrismaClient } from '@prisma/client';

describe('AdminService - User Management', () => {
  let adminService: AdminService;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        count: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    adminService = new AdminService(mockPrisma);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchUsers', () => {
    it('should return paginated users with default filters', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'user1@example.com',
          name: 'User 1',
          role: 'student',
          emailVerified: true,
          suspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          email: 'user2@example.com',
          name: 'User 2',
          role: 'tutor',
          emailVerified: true,
          suspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.count.mockResolvedValue(2);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await adminService.searchUsers({});

      expect(result.users).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should filter users by search term', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'student',
          emailVerified: true,
          suspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await adminService.searchUsers({ search: 'john' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { email: { contains: 'john', mode: 'insensitive' } },
              { name: { contains: 'john', mode: 'insensitive' } },
            ]),
          }),
        })
      );
      expect(result.users).toHaveLength(1);
    });

    it('should filter users by role', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'tutor@example.com',
          name: 'Tutor User',
          role: 'tutor',
          emailVerified: true,
          suspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await adminService.searchUsers({ role: 'tutor' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            role: 'tutor',
          }),
        })
      );
      expect(result.users[0].role).toBe('tutor');
    });

    it('should filter users by suspended status', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'suspended@example.com',
          name: 'Suspended User',
          role: 'student',
          emailVerified: true,
          suspended: true,
          suspensionReason: 'Violation of terms',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.count.mockResolvedValue(1);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await adminService.searchUsers({ status: 'suspended' });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            suspended: true,
          }),
        })
      );
      expect(result.users[0].suspended).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      const mockUsers = Array.from({ length: 10 }, (_, i) => ({
        id: `${i + 1}`,
        email: `user${i + 1}@example.com`,
        name: `User ${i + 1}`,
        role: 'student',
        emailVerified: true,
        suspended: false,
        suspensionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      mockPrisma.user.count.mockResolvedValue(50);
      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await adminService.searchUsers({ page: 2, limit: 10 });

      expect(mockPrisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
      expect(result.page).toBe(2);
      expect(result.totalPages).toBe(5);
    });
  });

  describe('suspendUser', () => {
    it('should suspend a user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'student',
        emailVerified: true,
        suspended: false,
        suspensionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockUser,
        suspended: true,
        suspensionReason: 'Violation of terms',
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await adminService.suspendUser('1', {
        reason: 'Violation of terms',
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            suspended: true,
            suspensionReason: 'Violation of terms',
          }),
        })
      );
      expect(result.suspended).toBe(true);
      expect(result.suspensionReason).toBe('Violation of terms');
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        adminService.suspendUser('999', { reason: 'Test' })
      ).rejects.toThrow('User not found');
    });

    it('should throw error if user already suspended', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'student',
        emailVerified: true,
        suspended: true,
        suspensionReason: 'Previous violation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        adminService.suspendUser('1', { reason: 'New violation' })
      ).rejects.toThrow('User is already suspended');
    });
  });

  describe('unsuspendUser', () => {
    it('should unsuspend a user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'student',
        emailVerified: true,
        suspended: true,
        suspensionReason: 'Previous violation',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockUpdatedUser = {
        ...mockUser,
        suspended: false,
        suspensionReason: null,
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await adminService.unsuspendUser('1');

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: '1' },
          data: expect.objectContaining({
            suspended: false,
            suspensionReason: null,
          }),
        })
      );
      expect(result.suspended).toBe(false);
      expect(result.suspensionReason).toBeNull();
    });

    it('should throw error if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(adminService.unsuspendUser('999')).rejects.toThrow(
        'User not found'
      );
    });

    it('should throw error if user not suspended', async () => {
      const mockUser = {
        id: '1',
        email: 'user@example.com',
        name: 'Test User',
        role: 'student',
        emailVerified: true,
        suspended: false,
        suspensionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(adminService.unsuspendUser('1')).rejects.toThrow(
        'User is not suspended'
      );
    });
  });
});
