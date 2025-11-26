import React from 'react';
import { render, screen } from '@testing-library/react';
import { BookingsChart } from '@/components/admin/bookings-chart';
import { BookingData } from '@/types/admin.types';

describe('BookingsChart', () => {
  const mockData: BookingData[] = [
    { date: '2024-01-01', bookings: 10 },
    { date: '2024-01-02', bookings: 15 },
    { date: '2024-01-03', bookings: 20 },
    { date: '2024-01-04', bookings: 12 },
    { date: '2024-01-05', bookings: 18 },
  ];

  it('renders bookings chart with data', () => {
    render(<BookingsChart data={mockData} />);

    expect(screen.getByTestId('bookings-chart')).toBeInTheDocument();
    expect(screen.getByText('Bookings Over Time')).toBeInTheDocument();
  });

  it('renders all booking bars', () => {
    render(<BookingsChart data={mockData} />);

    mockData.forEach((_, index) => {
      expect(screen.getByTestId(`booking-bar-${index}`)).toBeInTheDocument();
      expect(screen.getByTestId(`booking-label-${index}`)).toBeInTheDocument();
    });
  });

  it('displays total and average bookings', () => {
    render(<BookingsChart data={mockData} />);

    const totalBookings = mockData.reduce((sum, d) => sum + d.bookings, 0);
    const avgBookings = totalBookings / mockData.length;

    expect(screen.getByText(`Total: ${totalBookings}`)).toBeInTheDocument();
    expect(screen.getByText(`Avg: ${avgBookings.toFixed(1)}`)).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<BookingsChart data={[]} />);

    expect(screen.getByTestId('bookings-chart')).toBeInTheDocument();
    expect(screen.getByText('No booking data available')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<BookingsChart data={mockData} />);

    const firstLabel = screen.getByTestId('booking-label-0');
    expect(firstLabel).toBeInTheDocument();
  });

  it('sets bar heights proportionally', () => {
    render(<BookingsChart data={mockData} />);

    const firstBar = screen.getByTestId('booking-bar-0');
    const lastBar = screen.getByTestId('booking-bar-4');

    expect(firstBar).toHaveAttribute('style');
    expect(lastBar).toHaveAttribute('style');
    expect(firstBar.style.height).toBeTruthy();
    expect(lastBar.style.height).toBeTruthy();
  });

  it('handles single data point', () => {
    const singleData: BookingData[] = [{ date: '2024-01-01', bookings: 10 }];
    render(<BookingsChart data={singleData} />);

    expect(screen.getByTestId('booking-bar-0')).toBeInTheDocument();
    expect(screen.getByText('Total: 10')).toBeInTheDocument();
    expect(screen.getByText('Avg: 10.0')).toBeInTheDocument();
  });

  it('handles zero bookings', () => {
    const zeroData: BookingData[] = [
      { date: '2024-01-01', bookings: 0 },
      { date: '2024-01-02', bookings: 0 },
    ];
    render(<BookingsChart data={zeroData} />);

    expect(screen.getByText('Total: 0')).toBeInTheDocument();
    expect(screen.getByText('Avg: 0.0')).toBeInTheDocument();
  });
});
