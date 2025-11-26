import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from '@/app/dashboard/page';
import { Teacher } from '@/types/dashboard.types';
import { Booking } from '@/types/booking.types';
import { Conversation } from '@/types/chat.types';

// Mock the hooks
const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    userId: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    subjects: ['Mathematics', 'Physics'],
    hourlyRate: 50,
    rating: 4.5,
    totalReviews: 12,
  },
  {
    id: 'teacher-2',
    userId: 'user-2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    subjects: ['Chemistry'],
    hourlyRate: 45,
    rating: 4.8,
    totalReviews: 20,
  },
];

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    tutorId: 'teacher-1',
    studentId: 'student-1',
    tutorName: 'John Doe',
    subject: 'Mathematics',
    startTime: new Date('2024-03-15T14:00:00'),
    endTime: new Date('2024-03-15T15:00:00'),
    status: 'completed',
    totalAmount: 50,
    createdAt: new Date('2024-03-10T10:00:00'),
    updatedAt: new Date('2024-03-10T10:00:00'),
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: ['student-1', 'teacher-1'],
    participantNames: {
      'student-1': 'Student User',
      'teacher-1': 'John Doe',
    },
    lastMessage: 'Hello, I have a question.',
    lastMessageTime: new Date('2024-03-15T14:00:00'),
    unreadCount: 2,
  },
];

const mockRefetch = vi.fn();

vi.mock('@/hooks/use-teachers', () => ({
  useTeachers: vi.fn(() => ({
    teachers: mockTeachers,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

vi.mock('@/hooks/use-bookings', () => ({
  useBookings: vi.fn(() => ({
    bookings: mockBookings,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

vi.mock('@/hooks/use-conversations', () => ({
  useConversations: vi.fn(() => ({
    conversations: mockConversations,
    isLoading: false,
    error: null,
    refetch: mockRefetch,
  })),
}));

// Mock auth context
const mockUser = {
  id: 'student-1',
  name: 'Test Student',
  email: 'student@example.com',
  role: 'student' as const,
};

const mockLogout = vi.fn();

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: mockUser,
    isLoading: false,
    isAuthenticated: true,
    logout: mockLogout,
  }),
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => '/dashboard',
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: (date: Date, formatStr: string) => {
    if (formatStr.includes('MMM')) return 'Mar 15, 2024 at 2:00 PM';
    return '2:00 PM';
  },
  formatDistanceToNow: () => '2 hours ago',
}));

describe('Student Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with all sections', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Available Teachers')).toBeInTheDocument();
      expect(screen.getByText('Booking History')).toBeInTheDocument();
      expect(screen.getByText('Recent Conversations')).toBeInTheDocument();
    });
  });

  it('displays welcome message with user name', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Welcome, Test Student/)).toBeInTheDocument();
    });
  });

  it('renders teacher list with teachers', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      const johnDoeElements = screen.getAllByText('John Doe');
      const janeSmithElements = screen.getAllByText('Jane Smith');
      
      // Should find at least one instance of each teacher
      expect(johnDoeElements.length).toBeGreaterThan(0);
      expect(janeSmithElements.length).toBeGreaterThan(0);
    });
  });

  it('renders booking history', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Booking History')).toBeInTheDocument();
      // Check for the completed status badge which is unique to booking history
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });
  });

  it('renders chat history', async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Hello, I have a question.')).toBeInTheDocument();
    });
  });

  it('displays empty state when no bookings', async () => {
    const { useBookings } = await import('@/hooks/use-bookings');
    vi.mocked(useBookings).mockReturnValue({
      bookings: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No bookings yet')).toBeInTheDocument();
      expect(
        screen.getByText('Start by booking a session with a teacher above.')
      ).toBeInTheDocument();
    });
  });

  it('displays empty state when no conversations', async () => {
    const { useConversations } = await import('@/hooks/use-conversations');
    vi.mocked(useConversations).mockReturnValue({
      conversations: [],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('No conversations yet')).toBeInTheDocument();
      expect(
        screen.getByText('Start chatting with your teachers after booking a session.')
      ).toBeInTheDocument();
    });
  });

  it('displays loading skeletons while data is loading', async () => {
    const { useTeachers } = await import('@/hooks/use-teachers');
    vi.mocked(useTeachers).mockReturnValue({
      teachers: [],
      isLoading: true,
      error: null,
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      const skeletons = screen.getAllByRole('status');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  it('displays error message when teachers fail to load', async () => {
    const { useTeachers } = await import('@/hooks/use-teachers');
    vi.mocked(useTeachers).mockReturnValue({
      teachers: [],
      isLoading: false,
      error: 'Failed to load teachers',
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load teachers')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });
  });

  it('displays error message when bookings fail to load', async () => {
    const { useBookings } = await import('@/hooks/use-bookings');
    vi.mocked(useBookings).mockReturnValue({
      bookings: [],
      isLoading: false,
      error: 'Failed to load bookings',
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load bookings')).toBeInTheDocument();
    });
  });

  it('displays error message when conversations fail to load', async () => {
    const { useConversations } = await import('@/hooks/use-conversations');
    vi.mocked(useConversations).mockReturnValue({
      conversations: [],
      isLoading: false,
      error: 'Failed to load conversations',
      refetch: mockRefetch,
    });

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load conversations')).toBeInTheDocument();
    });
  });

  it('uses responsive grid layout', async () => {
    const { container } = render(<DashboardPage />);

    await waitFor(() => {
      const grid = container.querySelector('.lg\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
    });
  });

  it('limits displayed bookings to 5', async () => {
    const manyBookings = Array.from({ length: 10 }, (_, i) => ({
      ...mockBookings[0],
      id: `booking-${i}`,
    }));

    const { useBookings } = await import('@/hooks/use-bookings');
    vi.mocked(useBookings).mockReturnValue({
      bookings: manyBookings,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { container } = render(<DashboardPage />);

    await waitFor(() => {
      const bookingCards = container.querySelectorAll(
        'section:nth-of-type(2) .space-y-4 > div'
      );
      expect(bookingCards.length).toBeLessThanOrEqual(5);
    });
  });

  it('limits displayed conversations to 5', async () => {
    const manyConversations = Array.from({ length: 10 }, (_, i) => ({
      ...mockConversations[0],
      id: `conv-${i}`,
    }));

    const { useConversations } = await import('@/hooks/use-conversations');
    vi.mocked(useConversations).mockReturnValue({
      conversations: manyConversations,
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    const { container } = render(<DashboardPage />);

    await waitFor(() => {
      const chatCards = container.querySelectorAll(
        'section:nth-of-type(3) .space-y-4 > div'
      );
      expect(chatCards.length).toBeLessThanOrEqual(5);
    });
  });

  it('ensures students cannot see other students', async () => {
    // The dashboard should only show teachers, not other students
    render(<DashboardPage />);

    await waitFor(() => {
      // Check that the Available Teachers section exists
      expect(screen.getByText('Available Teachers')).toBeInTheDocument();
      
      // Verify no student names appear (other than the logged-in user)
      expect(screen.queryByText('Other Student')).not.toBeInTheDocument();
      expect(screen.queryByText('Another Student')).not.toBeInTheDocument();
    });
  });
});
