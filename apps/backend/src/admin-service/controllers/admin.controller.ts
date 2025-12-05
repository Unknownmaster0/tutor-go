import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service';
import { ApiResponse, Logger } from '../../shared';
import { AuthRequest } from '../../auth-service/middleware/auth.middleware';

export class AdminController {
  private logger: Logger;

  constructor(private adminService: AdminService) {
    this.logger = new Logger('AdminController');
  }

  /**
   * GET /admin/metrics
   * Get admin dashboard metrics
   */
  getMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      this.logger.log('Getting admin metrics');

      const metrics = await this.adminService.getMetrics();

      ApiResponse.success(res, metrics, 'Admin metrics retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting admin metrics:', error);
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to get admin metrics',
        500
      );
    }
  };

  /**
   * GET /admin/users
   * Search and filter users
   */
  searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { search, role, status, page, limit } = req.query;

      this.logger.log('Searching users');

      const filters = {
        search: search as string,
        role: role as 'student' | 'tutor' | 'admin',
        status: status as 'active' | 'suspended',
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this.adminService.searchUsers(filters);

      ApiResponse.success(res, result, 'Users retrieved successfully');
    } catch (error) {
      this.logger.error('Error searching users:', error);
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to search users',
        500
      );
    }
  };

  /**
   * PATCH /admin/users/:id/suspend
   * Suspend a user account
   */
  suspendUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      this.logger.log(`Suspending user ${id}`);

      if (!reason) {
        ApiResponse.error(res, 'Suspension reason is required', 400);
        return;
      }

      const user = await this.adminService.suspendUser(id, { reason });

      ApiResponse.success(res, user, 'User suspended successfully');
    } catch (error) {
      this.logger.error('Error suspending user:', error);
      const statusCode = error instanceof Error && error.message === 'User not found' ? 404 : 500;
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to suspend user',
        statusCode
      );
    }
  };

  /**
   * PATCH /admin/users/:id/unsuspend
   * Unsuspend a user account
   */
  unsuspendUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      this.logger.log(`Unsuspending user ${id}`);

      const user = await this.adminService.unsuspendUser(id);

      ApiResponse.success(res, user, 'User unsuspended successfully');
    } catch (error) {
      this.logger.error('Error unsuspending user:', error);
      const statusCode = error instanceof Error && error.message === 'User not found' ? 404 : 500;
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to unsuspend user',
        statusCode
      );
    }
  };

  /**
   * GET /admin/flagged-content
   * Get flagged content for moderation
   */
  getFlaggedContent = async (req: Request, res: Response): Promise<void> => {
    try {
      this.logger.log('Getting flagged content');

      const flaggedContent = await this.adminService.getFlaggedContent();

      ApiResponse.success(res, flaggedContent, 'Flagged content retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting flagged content:', error);
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to get flagged content',
        500
      );
    }
  };

  /**
   * POST /admin/flagged-content/:id/moderate
   * Moderate flagged content
   */
  moderateContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { type, action, reason } = req.body;
      const authReq = req as AuthRequest;

      this.logger.log(`Moderating content ${id}`);

      if (!type || !action) {
        ApiResponse.error(res, 'Type and action are required', 400);
        return;
      }

      if (!['review', 'message'].includes(type)) {
        ApiResponse.error(res, 'Invalid content type', 400);
        return;
      }

      if (!['approve', 'remove', 'warn'].includes(action)) {
        ApiResponse.error(res, 'Invalid moderation action', 400);
        return;
      }

      const moderatorId = authReq.user?.userId || '';

      await this.adminService.moderateContent(
        id,
        type as 'review' | 'message',
        { action, reason },
        moderatorId
      );

      ApiResponse.success(res, null, 'Content moderated successfully');
    } catch (error) {
      this.logger.error('Error moderating content:', error);
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to moderate content',
        500
      );
    }
  };

  /**
   * GET /admin/transactions
   * Get transaction history with filters
   */
  getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { startDate, endDate, status, userId, page, limit } = req.query;

      this.logger.log('Getting transactions');

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        status: status as 'pending' | 'succeeded' | 'failed' | 'refunded',
        userId: userId as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      };

      const result = await this.adminService.getTransactions(filters);

      ApiResponse.success(res, result, 'Transactions retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting transactions:', error);
      ApiResponse.error(
        res,
        error instanceof Error ? error.message : 'Failed to get transactions',
        500
      );
    }
  };
}
