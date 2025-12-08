import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticateToken } from '../../auth-service/middleware/auth.middleware';
import { requireAdmin } from '../../auth-service/middleware/role.guard';
import { validate } from '../../shared/middleware/validation.middleware';
import {
  suspendUserSchema,
  moderateContentSchema,
  searchUsersSchema,
  getTransactionsSchema,
} from '../validators/admin.validator';

export const createAdminRoutes = (adminController: AdminController): Router => {
  const router = Router();

  // All admin routes require authentication and admin role
  router.use(authenticateToken);
  router.use(requireAdmin);

  // GET /admin/metrics - Get dashboard metrics
  router.get('/metrics', adminController.getMetrics);

  // GET /admin/activity - Get recent activity
  router.get('/activity', adminController.getActivity);

  // GET /admin/revenue - Get revenue data
  router.get('/revenue', adminController.getRevenueData);

  // GET /admin/bookings - Get bookings data
  router.get('/bookings', adminController.getBookingsData);

  // GET /admin/users - Search and filter users
  router.get('/users', validate(searchUsersSchema), adminController.searchUsers);

  // PATCH /admin/users/:id/suspend - Suspend a user
  router.patch('/users/:id/suspend', validate(suspendUserSchema), adminController.suspendUser);

  // PATCH /admin/users/:id/unsuspend - Unsuspend a user
  router.patch('/users/:id/unsuspend', adminController.unsuspendUser);

  // GET /admin/flagged-content - Get flagged content
  router.get('/flagged-content', adminController.getFlaggedContent);

  // POST /admin/flagged-content/:id/moderate - Moderate content
  router.post(
    '/flagged-content/:id/moderate',
    validate(moderateContentSchema),
    adminController.moderateContent,
  );

  // GET /admin/transactions - Get transaction history
  router.get('/transactions', validate(getTransactionsSchema), adminController.getTransactions);

  return router;
};
