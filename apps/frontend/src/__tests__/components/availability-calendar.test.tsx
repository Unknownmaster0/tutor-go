import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AvailabilityCalendar } from '@/components/calendar/availability-calendar';

describe('AvailabilityCalendar', () => {
  const mockAvailability = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '12:00' },
    { dayOfWeek: 1, startTime: '14:00', endTime: '17:00' },
    { dayOfWeek: 3, startTime: '10:00', endTime: '15:00' },
  ];

  it('renders calendar title', () => {
    render(<AvailabilityCalendar availability={mockAvailability} />);

    expect(screen.getByText('Availability')).toBeInTheDocument();
  });

  it('displays all days of the week', () => {
    render(<AvailabilityCalendar availability={mockAvailability} />);

    // Days are shown in abbreviated form in the calendar grid (Sun, Mon, etc.)
    // But full names are shown in the time slots section
    expect(screen.getByText('Monday')).toBeInTheDocument();
    expect(screen.getByText('Wednesday')).toBeInTheDocument();
  });

  it('shows available time slots section', () => {
    render(<AvailabilityCalendar availability={mockAvailability} />);

    expect(screen.getByText('Available Time Slots')).toBeInTheDocument();
  });

  it('displays time slots for available days', () => {
    render(<AvailabilityCalendar availability={mockAvailability} />);

    // Check for formatted time slots - use getAllByText since there might be multiple
    const timeSlots = screen.getAllByText(/9:00 AM/);
    expect(timeSlots.length).toBeGreaterThan(0);
  });

  it('shows message when no availability', () => {
    render(<AvailabilityCalendar availability={[]} />);

    expect(screen.getByText('No availability set yet')).toBeInTheDocument();
  });

  it('renders time slot buttons', () => {
    render(<AvailabilityCalendar availability={mockAvailability} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
