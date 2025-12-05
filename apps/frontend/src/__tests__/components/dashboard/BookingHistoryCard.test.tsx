import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingHistoryCard } from '@/components/dashboard/BookingHistoryCard';
import { Booking } from '@/types/booking.types';

describe('BookingHistoryCard', () => {
  const mockBooking: Booking = {
    id: 'booking-1',
    tutorId: 'tutor-1',
    studentId: 'student-1',
    tutorName: 'John Doe',
    studentName: 'Jane Student',
    subject: 'Mathematics',
    startTime: new Date('2024-03-15T14:00:00'),
    endTime: new Date('2024-03-15T15:00:00'),
    status: 'completed',
    totalAmount: 50,
    createdAt: new Date('2024-03-10T10:00:00'),
    updatedAt: new Date('2024-03-10T10:00:00'),
  };

  it('renders booking information correctly', () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    expect(screen.getByText(/Mar 15, 2024/)).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('displays completed status badge with correct styling', () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    const statusBadge = screen.getByText('Completed');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-success/10');
    expect(statusBadge).toHaveClass('text-success');
  });

  it('displays pending status badge with correct styling', () => {
    const pendingBooking = { ...mockBooking, status: 'pending' as const };
    render(<BookingHistoryCard booking={pendingBooking} />);

    const statusBadge = screen.getByText('Pending');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-warning/10');
    expect(statusBadge).toHaveClass('text-warning');
  });

  it('displays confirmed status badge with correct styling', () => {
    const confirmedBooking = { ...mockBooking, status: 'confirmed' as const };
    render(<BookingHistoryCard booking={confirmedBooking} />);

    const statusBadge = screen.getByText('Confirmed');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-primary-50');
    expect(statusBadge).toHaveClass('text-primary-700');
  });

  it('displays cancelled status badge with correct styling', () => {
    const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };
    render(<BookingHistoryCard booking={cancelledBooking} />);

    const statusBadge = screen.getByText('Cancelled');
    expect(statusBadge).toBeInTheDocument();
    expect(statusBadge).toHaveClass('bg-error/10');
    expect(statusBadge).toHaveClass('text-error');
  });

  it('formats date correctly', () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    // Check for formatted date
    expect(screen.getByText(/Mar 15, 2024/)).toBeInTheDocument();
  });

  it('formats time correctly', () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    // Check for formatted time (2:00 PM)
    expect(screen.getByText(/2:00 PM/i)).toBeInTheDocument();
  });

  it('renders without teacher name when not provided', () => {
    const bookingWithoutTeacher = { ...mockBooking, tutorName: undefined };
    render(<BookingHistoryCard booking={bookingWithoutTeacher} />);

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const mockOnClick = vi.fn();
    render(<BookingHistoryCard booking={mockBooking} onClick={mockOnClick} />);

    const card = screen.getByText('Mathematics').closest('.bg-white');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledWith('booking-1');
  });

  it('does not apply hover styles when onClick is not provided', () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    const card = screen.getByText('Mathematics').closest('.bg-white');
    expect(card).not.toHaveClass('hover:shadow-medium');
  });

  it('applies hover styles when onClick is provided', () => {
    const mockOnClick = vi.fn();
    render(<BookingHistoryCard booking={mockBooking} onClick={mockOnClick} />);

    const card = screen.getByText('Mathematics').closest('.bg-white');
    expect(card).toHaveClass('hover:shadow-medium');
  });

  it('renders all icons correctly', () => {
    render(<BookingHistoryCard booking={mockBooking} />);

    const card = screen.getByText('Mathematics').closest('.bg-white');
    const svgs = card?.querySelectorAll('svg');
    
    // Should have 3 icons: calendar, user, book
    expect(svgs?.length).toBe(3);
  });

  it('displays responsive layout classes', () => {
    const { container } = render(<BookingHistoryCard booking={mockBooking} />);

    const card = container.querySelector('.flex');
    expect(card).toHaveClass('flex-col');
    expect(card).toHaveClass('sm:flex-row');
    expect(card).toHaveClass('sm:items-center');
  });

  it('truncates long teacher names', () => {
    const bookingWithLongName = {
      ...mockBooking,
      tutorName: 'Very Long Teacher Name That Should Be Truncated',
    };
    render(<BookingHistoryCard booking={bookingWithLongName} />);

    const teacherName = screen.getByText('Very Long Teacher Name That Should Be Truncated');
    expect(teacherName).toHaveClass('truncate');
  });

  it('truncates long subject names', () => {
    const bookingWithLongSubject = {
      ...mockBooking,
      subject: 'Very Long Subject Name That Should Be Truncated',
    };
    render(<BookingHistoryCard booking={bookingWithLongSubject} />);

    const subject = screen.getByText('Very Long Subject Name That Should Be Truncated');
    expect(subject).toHaveClass('truncate');
  });
});
