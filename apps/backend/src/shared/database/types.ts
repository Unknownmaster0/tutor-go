/**
 * Database Types and Interfaces
 * 
 * This file exports types from Prisma and custom MongoDB types
 * for use across the application.
 */

// Re-export Prisma types
export type {
  User,
  Booking,
  Payment,
  Review,
  Message,
  Notification,
  Role,
  BookingStatus,
  PaymentStatus,
  NotificationType,
} from '@prisma/client';

// MongoDB types
export type {
  ITutorProfile,
  ISubject,
  ILocation,
  IAvailability,
} from './schemas/tutor-profile.schema';

// Prisma Client
export { PrismaClient } from '@prisma/client';
