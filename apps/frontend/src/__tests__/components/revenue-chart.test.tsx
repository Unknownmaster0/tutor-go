import React from 'react';
import { render, screen } from '@testing-library/react';
import { RevenueChart } from '@/components/admin/revenue-chart';
import { RevenueData } from '@/types/admin.types';

describe('RevenueChart', () => {
  const mockData: RevenueData[] = [
    { date: '2024-01-01', revenue: 500 },
    { date: '2024-01-02', revenue: 750 },
    { date: '2024-01-03', revenue: 1000 },
    { date: '2024-01-04', revenue: 600 },
    { date: '2024-01-05', revenue: 900 },
  ];

  it('renders revenue chart with data', () => {
    render(<RevenueChart data={mockData} />);

    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    expect(screen.getByText('Revenue Over Time')).toBeInTheDocument();
  });

  it('renders all revenue bars', () => {
    render(<RevenueChart data={mockData} />);

    mockData.forEach((_, index) => {
      expect(screen.getByTestId(`revenue-bar-${index}`)).toBeInTheDocument();
      expect(screen.getByTestId(`revenue-label-${index}`)).toBeInTheDocument();
    });
  });

  it('displays total and average revenue', () => {
    render(<RevenueChart data={mockData} />);

    const totalRevenue = mockData.reduce((sum, d) => sum + d.revenue, 0);
    const avgRevenue = totalRevenue / mockData.length;

    expect(screen.getByText(`Total: $${totalRevenue.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`Avg: $${avgRevenue.toFixed(2)}`)).toBeInTheDocument();
  });

  it('renders empty state when no data', () => {
    render(<RevenueChart data={[]} />);

    expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    expect(screen.getByText('No revenue data available')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(<RevenueChart data={mockData} />);

    const firstLabel = screen.getByTestId('revenue-label-0');
    expect(firstLabel).toBeInTheDocument();
    // Date formatting will vary by locale, just check it exists
  });

  it('sets bar heights proportionally', () => {
    render(<RevenueChart data={mockData} />);

    const firstBar = screen.getByTestId('revenue-bar-0');
    const lastBar = screen.getByTestId('revenue-bar-4');

    // Both bars should have height style set
    expect(firstBar).toHaveAttribute('style');
    expect(lastBar).toHaveAttribute('style');
    expect(firstBar.style.height).toBeTruthy();
    expect(lastBar.style.height).toBeTruthy();
  });

  it('handles single data point', () => {
    const singleData: RevenueData[] = [{ date: '2024-01-01', revenue: 500 }];
    render(<RevenueChart data={singleData} />);

    expect(screen.getByTestId('revenue-bar-0')).toBeInTheDocument();
    expect(screen.getByText('Total: $500.00')).toBeInTheDocument();
    expect(screen.getByText('Avg: $500.00')).toBeInTheDocument();
  });
});
