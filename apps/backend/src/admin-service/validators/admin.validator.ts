import { z } from 'zod';

export const suspendUserSchema = z.object({
  body: z.object({
    reason: z.string().min(10, 'Suspension reason must be at least 10 characters'),
  }),
});

export const moderateContentSchema = z.object({
  body: z.object({
    type: z.enum(['review', 'message'], {
      message: 'Type must be either review or message',
    }),
    action: z.enum(['approve', 'remove', 'warn'], {
      message: 'Action must be approve, remove, or warn',
    }),
    reason: z.string().optional(),
  }),
});

export const searchUsersSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    role: z.enum(['student', 'tutor', 'admin']).optional(),
    status: z.enum(['active', 'suspended']).optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});

export const getTransactionsSchema = z.object({
  query: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    status: z.enum(['pending', 'succeeded', 'failed', 'refunded']).optional(),
    userId: z.string().uuid().optional(),
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
  }),
});
