/**
 * Dashboard Type Definitions
 * 
 * This file contains TypeScript interfaces and types for dashboard components.
 * It consolidates and extends existing types for use across student and teacher dashboards.
 */

import { Booking, BookingStatus } from './booking.types';
import { Conversation } from './chat.types';

// Re-export types that are used in dashboards
export type { Booking, BookingStatus, Conversation };

/**
 * Teacher interface for student dashboard teacher list
 * Simplified version of TutorProfile with essential display information
 */
export interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  bio?: string;
  subjects: string[] | { name: string; proficiency: string }[];
  hourlyRate: number;
  rating: number;
  totalReviews: number;
  profilePicture?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
    address?: string;
  };
  videoUrl?: string;
  distance?: number;
}

/**
 * Booking history item for dashboard display
 * Extends the base Booking type with additional display fields
 */
export interface BookingHistoryItem extends Booking {
  teacherName?: string;
  studentName?: string;
  duration?: number;
}

/**
 * Chat history item for dashboard display
 * Extends the base Conversation type with participant details
 */
export interface ChatHistoryItem extends Conversation {
  participantDetails?: {
    id: string;
    name: string;
    role: 'student' | 'tutor';
    profilePicture?: string;
  }[];
}

/**
 * Teacher dashboard statistics
 * Aggregated data for teacher performance metrics
 */
export interface DashboardStats {
  totalStudents: number;
  totalSessions: number;
  averageRating: number;
  totalEarnings: number;
  earningsByPeriod: {
    week: number;
    month: number;
    year: number;
  };
}

/**
 * Upcoming session details for teacher dashboard
 */
export interface UpcomingSession {
  id: string;
  studentId: string;
  studentName: string;
  studentProfilePicture?: string;
  subject: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: 'confirmed';
  meetingLink?: string;
}

/**
 * Notification types for dashboard
 */
export type NotificationType = 'booking' | 'payment' | 'message' | 'review' | 'system';

export interface DashboardNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

/**
 * Earnings data for charts
 */
export interface EarningsData {
  period: string; // e.g., "2024-01", "Week 1", "Jan 2024"
  amount: number;
  sessionCount: number;
}

/**
 * Filter options for teacher list
 */
export interface TeacherFilterOptions {
  searchQuery?: string;
  subject?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  sortBy?: 'rating' | 'rate' | 'distance' | 'reviews';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Dashboard data loading states
 */
export interface DashboardLoadingState {
  teachers?: boolean;
  bookings?: boolean;
  conversations?: boolean;
  statistics?: boolean;
  notifications?: boolean;
}

/**
 * Dashboard error states
 */
export interface DashboardError {
  section: 'teachers' | 'bookings' | 'conversations' | 'statistics' | 'notifications';
  message: string;
  code?: string;
  retryable: boolean;
}
