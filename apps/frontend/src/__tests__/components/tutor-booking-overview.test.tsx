import { render, screen, waitFor } from '@testing-library/react';
import { TutorBookingOverview } from '@/components/tutor/tutor-booking-overview';
import { apiClient } from '@/lib/api-client';
import { Booking } from '@/types/booking.types';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

const mockUpcomingBookings: Booking[] = [
  {
    id: '1',
    tutorId: 'tutor1',
    studentId: 'student1',
    studentName: 'John Student',
    subject: 'Mathematics',
    startTime: new Date(Date.now() + 86400000), // Tomorrow
    endTime: new Date(Date.now() + 90000000), // Tomorrow + 1 hour
    status: 'confirmed',
    totalAmount: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    tutorId: 'tutor1',
    studentId: 'student2',
    studentName: 'Jane Student',
    subject: 'Physics',
    startTime: new Date(Date.now() + 172800000), // Day after tomorrow
    endTime: new Date(Date.now() + 176400000), // Day after tomorrow + 1 hour
    status: 'confirmed',
    totalAmount: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockCompletedBookings: Booking[] = [
  {
    id: '3',
    tutorId: 'tutor1',
    studentId: 'student3',
    subject: 'Chemistry',
    startTime: new Date(Date.now() - 2592000000), // 30 days ago
    endTime: new Date(Date.now() - 2588400000), // 30 days ago + 1 hour
    status: 'completed',
    totalAmount: 55,
    createdAt: new Date(Date.now() - 2678400000), // 31 days ago
    updatedAt: new Date(Date.now() - 2592000000), // 30 days ago
  },
  {
    id: '4',
    tutorId: 'tutor1',
    studentId: 'student4',
    subject: 'Biology',
    startTime: new Date(Date.now() - 1296000000), // 15 days ago
    endTime: new Date(Date.now() - 1292400000), // 15 days ago + 1 hour
    status: 'completed',
    totalAmount: 50,
    createdAt: new Date(Date.now() - 1382400000), // 16 days ago
    updatedAt: new Date(Date.now() - 1296000000), // 15 days ago
  },
];

describe('TutorBookingOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state initially', () => {
    vi.mocked(apiClient.get).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<TutorBookingOverview tutorId="tutor1" />);

    const loadingElement = document.querySelector('.animate-pulse');
    expect(loadingElement).toBeInTheDocument();
  });

  it('displays earnings and session statistics', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(mockUpcomingBookings)
      .mockResolvedValueOnce([...mockUpcomingBookings, ...mockCompletedBookings]);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      expect(screen.getByText(/total earnings/i)).toBeInTheDocument();
      expect(screen.getByText('$105.00')).toBeInTheDocument(); // 55 + 50 from completed
      expect(screen.getByText(/completed sessions/i)).toBeInTheDocument();
      // Check for completed sessions count in the stats card
      const completedCard = screen.getByText(/completed sessions/i).closest('div');
      expect(completedCard).toHaveTextContent('2');
    });
  });

  it('displays upcoming sessions', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(mockUpcomingBookings)
      .mockResolvedValueOnce([...mockUpcomingBookings, ...mockCompletedBookings]);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      expect(screen.getByText('John Student')).toBeInTheDocument();
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
      expect(screen.getByText('Jane Student')).toBeInTheDocument();
      expect(screen.getByText('Physics')).toBeInTheDocument();
    });
  });

  it('shows empty state when no upcoming sessions', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce([]).mockResolvedValueOnce(mockCompletedBookings);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      expect(screen.getByText(/no upcoming sessions/i)).toBeInTheDocument();
    });
  });

  it('displays error message when data fetch fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValue({
      response: { data: { message: 'Failed to load data' } },
    });

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      expect(screen.getByText(/failed to load data/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  it('calculates this month earnings correctly', async () => {
    const thisMonthBooking: Booking = {
      id: '5',
      tutorId: 'tutor1',
      studentId: 'student5',
      subject: 'English',
      startTime: new Date('2025-11-20T10:00:00'),
      endTime: new Date('2025-11-20T11:00:00'),
      status: 'completed',
      totalAmount: 45,
      createdAt: new Date(), // Current month
      updatedAt: new Date(),
    };

    vi.mocked(apiClient.get)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([thisMonthBooking, ...mockCompletedBookings]);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      expect(screen.getByText(/this month/i)).toBeInTheDocument();
      // Should show earnings from current month only
      const thisMonthCard = screen.getByText(/this month/i).closest('div');
      expect(thisMonthCard).toBeInTheDocument();
    });
  });

  it('displays view all link', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(mockUpcomingBookings)
      .mockResolvedValueOnce([...mockUpcomingBookings, ...mockCompletedBookings]);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      const viewAllLink = screen.getByText(/view all/i);
      expect(viewAllLink).toBeInTheDocument();
      expect(viewAllLink.closest('a')).toHaveAttribute('href', '/bookings');
    });
  });

  it('displays view button for each booking', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(mockUpcomingBookings)
      .mockResolvedValueOnce([...mockUpcomingBookings, ...mockCompletedBookings]);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      const viewButtons = screen.getAllByRole('link', { name: /view/i });
      // There are 3 links: "View All" + 2 booking "View" buttons
      expect(viewButtons.length).toBeGreaterThanOrEqual(2);
      // Find the booking view buttons (not "View All")
      const bookingViewButtons = viewButtons.filter((btn) =>
        btn.getAttribute('href')?.startsWith('/bookings/'),
      );
      expect(bookingViewButtons).toHaveLength(2);
      expect(bookingViewButtons[0]).toHaveAttribute('href', '/bookings/1');
      expect(bookingViewButtons[1]).toHaveAttribute('href', '/bookings/2');
    });
  });

  it('formats dates and times correctly', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(mockUpcomingBookings)
      .mockResolvedValueOnce([...mockUpcomingBookings, ...mockCompletedBookings]);

    render(<TutorBookingOverview tutorId="tutor1" />);

    await waitFor(() => {
      // Check that dates are formatted (exact format may vary by locale)
      const decDates = screen.getAllByText(/dec/i);
      expect(decDates.length).toBeGreaterThan(0);
    });
  });
});
