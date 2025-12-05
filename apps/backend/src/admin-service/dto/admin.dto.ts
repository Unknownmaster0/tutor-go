export interface AdminMetricsDto {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalBookings: number;
  totalRevenue: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageBookingValue: number;
  recentActivity: {
    newUsersToday: number;
    bookingsToday: number;
    revenueToday: number;
  };
}

export interface UserSearchDto {
  search?: string;
  role?: 'student' | 'tutor' | 'admin';
  status?: 'active' | 'suspended';
  page?: number;
  limit?: number;
}

export interface UserManagementDto {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
  suspended: boolean;
  suspensionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuspendUserDto {
  reason: string;
}

export interface FlaggedContentDto {
  id: string;
  type: 'review' | 'message';
  contentId: string;
  content: string;
  reportedBy?: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'removed';
  moderationAction?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
}

export interface ModerationActionDto {
  action: 'approve' | 'remove' | 'warn';
  reason?: string;
}

export interface TransactionFilterDto {
  startDate?: Date;
  endDate?: Date;
  status?: 'pending' | 'succeeded' | 'failed' | 'refunded';
  userId?: string;
  page?: number;
  limit?: number;
}

export interface TransactionDto {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subject: string;
  createdAt: Date;
  refundAmount?: number;
  refundReason?: string;
}
