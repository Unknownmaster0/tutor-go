export interface AdminMetrics {
  totalUsers: number;
  totalStudents: number;
  totalTutors: number;
  totalBookings: number;
  totalRevenue: number;
  recentBookings: number;
  recentRevenue: number;
}

export interface RecentActivity {
  id: string;
  type: 'booking' | 'payment' | 'review' | 'user';
  description: string;
  timestamp: Date;
  userId?: string;
  userName?: string;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface BookingData {
  date: string;
  bookings: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  emailVerified: boolean;
  suspended: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SuspendUserRequest {
  reason: string;
}

export interface FlaggedContent {
  id: string;
  type: 'review' | 'message';
  content: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'pending' | 'approved' | 'removed';
  tutorId?: string;
  studentId?: string;
}

export interface ModerationAction {
  action: 'approve' | 'remove' | 'warn';
  reason?: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  studentName: string;
  tutorName: string;
  createdAt: Date;
}
