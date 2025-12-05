import React from 'react';
import { render, screen } from '@testing-library/react';
import { MetricCard } from '@/components/admin/metric-card';

describe('MetricCard', () => {
  it('renders metric card with title and value', () => {
    render(<MetricCard title="Total Users" value={150} />);

    expect(screen.getByTestId('metric-card')).toBeInTheDocument();
    expect(screen.getByTestId('metric-title')).toHaveTextContent('Total Users');
    expect(screen.getByTestId('metric-value')).toHaveTextContent('150');
  });

  it('renders subtitle when provided', () => {
    render(
      <MetricCard
        title="Total Users"
        value={150}
        subtitle="50 students, 100 tutors"
      />
    );

    expect(screen.getByTestId('metric-subtitle')).toHaveTextContent('50 students, 100 tutors');
  });

  it('renders icon when provided', () => {
    render(
      <MetricCard
        title="Total Users"
        value={150}
        icon={<span data-testid="custom-icon">👥</span>}
      />
    );

    expect(screen.getByTestId('metric-icon')).toBeInTheDocument();
    expect(screen.getByTestId('custom-icon')).toHaveTextContent('👥');
  });

  it('renders positive trend', () => {
    render(
      <MetricCard
        title="Total Users"
        value={150}
        trend={{ value: 15, isPositive: true }}
      />
    );

    const trend = screen.getByTestId('metric-trend');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveTextContent('↑');
    expect(trend).toHaveTextContent('15%');
    expect(trend).toHaveClass('text-green-600');
  });

  it('renders negative trend', () => {
    render(
      <MetricCard
        title="Total Users"
        value={150}
        trend={{ value: -10, isPositive: false }}
      />
    );

    const trend = screen.getByTestId('metric-trend');
    expect(trend).toBeInTheDocument();
    expect(trend).toHaveTextContent('↓');
    expect(trend).toHaveTextContent('10%');
    expect(trend).toHaveClass('text-red-600');
  });

  it('renders string value', () => {
    render(<MetricCard title="Revenue" value="$1,234.56" />);

    expect(screen.getByTestId('metric-value')).toHaveTextContent('$1,234.56');
  });

  it('renders without optional props', () => {
    render(<MetricCard title="Simple Metric" value={42} />);

    expect(screen.getByTestId('metric-card')).toBeInTheDocument();
    expect(screen.queryByTestId('metric-subtitle')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-trend')).not.toBeInTheDocument();
  });
});
