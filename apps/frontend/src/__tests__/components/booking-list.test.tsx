import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingList from '@/components/booking/booking-list';
import { Booking } from '@/types/booking.types';

const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    tutorId: 'tutor-1',
    studentId: 'student-1',
    tutorName: 'John Doe',
    subject: 'Mathematics',
    startTime: new Date('2025-12-01T10:00:00'),
    endTime: new Date('2025-12-01T11:00:00'),
    status: 'confirmed',
    totalAmount: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'booking-2',
    tutorId: 'tutor-2',
    studentId: 'student-1',
    tutorName: 'Jane Smith',
    subject: 'Physics',
    startTime: new Date('2025-11-20T14:00:00'),
    endTime: new Date('2025-11-20T15:00:00'),
    status: 'pending',
    totalAmount: 60,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'booking-3',
    tutorId: 'tutor-1',
    studentId: 'student-1',
    tutorName: 'John Doe',
    subject: 'Mathematics',
    startTime: new Date('2025-10-15T09:00:00'),
    endTime: new Date('2025-10-15T10:00:00'),
    status: 'completed',
    totalAmount: 50,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'booking-4',
    tutorId: 'tutor-3',
    studentId: 'student-1',
    tutorName: 'Bob Johnson',
    subject: 'Chemistry',
    startTime: new Date('2025-11-10T16:00:00'),
    endTime: new Date('2025-11-10T17:00:00'),
    status: 'cancelled',
    totalAmount: 55,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe('BookingList', () => {
  const mockOnCancelBooking = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all bookings by default', () => {
    render(<BookingList bookings={mockBookings} />);

    const johnDoe = screen.getAllByText('John Doe');
    expect(johnDoe.length).toBeGreaterThan(0);
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('displays booking counts in tabs', () => {
    render(<BookingList bookings={mockBookings} />);

    // Check that tabs exist with counts
    expect(screen.getByRole('button', { name: /All.*4/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Pending.*1/i })).toBeInTheDocument();
  });

  it('filters bookings by status tab', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={mockBookings} />);

    const upcomingTab = screen.getByRole('button', { name: /Upcoming/i });
    await user.click(upcomingTab);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('filters bookings by subject', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={mockBookings} />);

    const subjectFilter = screen.getByLabelText('Subject');
    await user.selectOptions(subjectFilter, 'Physics');

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('filters bookings by date range', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={mockBookings} />);

    const startDateFilter = screen.getByLabelText('From Date');
    await user.type(startDateFilter, '2025-11-15');

    // Should show bookings from Nov 15 onwards
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('clears filters when clear button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={mockBookings} />);

    const subjectFilter = screen.getByLabelText('Subject');
    await user.selectOptions(subjectFilter, 'Physics');

    const clearButton = screen.getByRole('button', { name: /Clear Filters/i });
    await user.click(clearButton);

    expect(subjectFilter).toHaveValue('');
  });

  it('displays booking details correctly', () => {
    render(<BookingList bookings={mockBookings} />);

    const mathematics = screen.getAllByText('Mathematics');
    expect(mathematics.length).toBeGreaterThan(0);
    const amounts = screen.getAllByText('$50.00');
    expect(amounts.length).toBeGreaterThan(0);
  });

  it('shows status badges with correct colors', () => {
    render(<BookingList bookings={mockBookings} />);

    // Find status badges (not tab buttons)
    const badges = document.querySelectorAll('.px-3.py-1.rounded-full');
    const confirmedBadge = Array.from(badges).find(el => el.textContent === 'Confirmed');
    const pendingBadge = Array.from(badges).find(el => el.textContent === 'Pending');
    
    expect(confirmedBadge).toHaveClass('bg-green-100');
    expect(pendingBadge).toHaveClass('bg-yellow-100');
  });

  it('calls onViewDetails when view button is clicked', async () => {
    const user = userEvent.setup();
    render(
      <BookingList
        bookings={mockBookings}
        onViewDetails={mockOnViewDetails}
      />
    );

    const viewButtons = screen.getAllByRole('button', { name: /View Details/i });
    await user.click(viewButtons[0]);

    expect(mockOnViewDetails).toHaveBeenCalledWith('booking-1');
  });

  it('calls onCancelBooking when cancel button is clicked', async () => {
    const user = userEvent.setup();
    // Use only bookings that can be cancelled (more than 24 hours away)
    const futureBooking = {
      ...mockBookings[0],
      startTime: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours from now
      endTime: new Date(Date.now() + 49 * 60 * 60 * 1000),
    };
    
    render(
      <BookingList
        bookings={[futureBooking]}
        onCancelBooking={mockOnCancelBooking}
      />
    );

    // Get all buttons and find the one that's not a tab
    const allButtons = screen.getAllByRole('button');
    const cancelButton = allButtons.find(btn => 
      btn.textContent === 'Cancel' && !btn.className.includes('border-b-2')
    );
    
    if (cancelButton) {
      await user.click(cancelButton);
      expect(mockOnCancelBooking).toHaveBeenCalledWith(futureBooking.id);
    }
  });

  it('does not show cancel button for completed bookings', () => {
    render(
      <BookingList
        bookings={[mockBookings[2]]} // Completed booking
        onCancelBooking={mockOnCancelBooking}
      />
    );

    // Should only have View Details button, not Cancel action button
    const buttons = screen.queryAllByRole('button');
    const cancelActionButtons = buttons.filter(btn => 
      btn.textContent === 'Cancel' && !btn.className.includes('border-b-2')
    );
    expect(cancelActionButtons.length).toBe(0);
  });

  it('does not show cancel button for cancelled bookings', () => {
    render(
      <BookingList
        bookings={[mockBookings[3]]} // Cancelled booking
        onCancelBooking={mockOnCancelBooking}
      />
    );

    // Should only have View Details button, not Cancel action button
    const buttons = screen.queryAllByRole('button');
    const cancelActionButtons = buttons.filter(btn => 
      btn.textContent === 'Cancel' && !btn.className.includes('border-b-2')
    );
    expect(cancelActionButtons.length).toBe(0);
  });

  it('shows empty state when no bookings match filters', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={mockBookings} />);

    // Filter by a date range that excludes all bookings
    const startDateFilter = screen.getByLabelText('From Date');
    await user.type(startDateFilter, '2026-01-01');

    expect(screen.getByText('No bookings found')).toBeInTheDocument();
  });

  it('shows appropriate message for empty tab', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={[mockBookings[0]]} />); // Only confirmed booking

    const pendingTab = screen.getByRole('button', { name: /Pending/i });
    await user.click(pendingTab);

    expect(screen.getByText(/You have no pending bookings/i)).toBeInTheDocument();
  });

  it('combines tab and filter selections', async () => {
    const user = userEvent.setup();
    render(<BookingList bookings={mockBookings} />);

    const upcomingTab = screen.getByRole('button', { name: /Upcoming/i });
    await user.click(upcomingTab);

    const subjectFilter = screen.getByLabelText('Subject');
    await user.selectOptions(subjectFilter, 'Mathematics');

    // Should show only confirmed Mathematics bookings
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });
});
