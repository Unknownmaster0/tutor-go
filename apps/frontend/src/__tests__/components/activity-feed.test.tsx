import React from 'react';
import { render, screen } from '@testing-library/react';
import { ActivityFeed } from '@/components/admin/activity-feed';
import { RecentActivity } from '@/types/admin.types';

describe('ActivityFeed', () => {
  const mockActivities: RecentActivity[] = [
    {
      id: '1',
      type: 'booking',
      description: 'New booking created',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      userName: 'John Doe',
    },
    {
      id: '2',
      type: 'payment',
      description: 'Payment processed successfully',
      timestamp: new Date('2024-01-15T09:30:00Z'),
      userName: 'Jane Smith',
    },
    {
      id: '3',
      type: 'review',
      description: 'New review submitted',
      timestamp: new Date('2024-01-15T09:00:00Z'),
    },
    {
      id: '4',
      type: 'user',
      description: 'New user registered',
      timestamp: new Date('2024-01-15T08:30:00Z'),
      userName: 'Bob Johnson',
    },
  ];

  it('renders activity feed with activities', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('renders all activity items', () => {
    render(<ActivityFeed activities={mockActivities} />);

    mockActivities.forEach((activity) => {
      expect(screen.getByTestId(`activity-item-${activity.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`activity-description-${activity.id}`)).toHaveTextContent(
        activity.description
      );
    });
  });

  it('displays correct icons for activity types', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByTestId('activity-icon-1')).toHaveTextContent('📅'); // booking
    expect(screen.getByTestId('activity-icon-2')).toHaveTextContent('💳'); // payment
    expect(screen.getByTestId('activity-icon-3')).toHaveTextContent('⭐'); // review
    expect(screen.getByTestId('activity-icon-4')).toHaveTextContent('👤'); // user
  });

  it('displays user names when provided', () => {
    render(<ActivityFeed activities={mockActivities} />);

    expect(screen.getByTestId('activity-user-1')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('activity-user-2')).toHaveTextContent('Jane Smith');
    expect(screen.queryByTestId('activity-user-3')).not.toBeInTheDocument();
    expect(screen.getByTestId('activity-user-4')).toHaveTextContent('Bob Johnson');
  });

  it('displays timestamps', () => {
    render(<ActivityFeed activities={mockActivities} />);

    mockActivities.forEach((activity) => {
      expect(screen.getByTestId(`activity-time-${activity.id}`)).toBeInTheDocument();
    });
  });

  it('renders empty state when no activities', () => {
    render(<ActivityFeed activities={[]} />);

    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    expect(screen.getByText('No recent activity')).toBeInTheDocument();
  });

  it('formats recent timestamps correctly', () => {
    const recentActivity: RecentActivity = {
      id: '5',
      type: 'booking',
      description: 'Recent booking',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    };

    render(<ActivityFeed activities={[recentActivity]} />);

    const timeElement = screen.getByTestId('activity-time-5');
    expect(timeElement.textContent).toMatch(/\d+m ago/);
  });

  it('formats hour-old timestamps correctly', () => {
    const hourOldActivity: RecentActivity = {
      id: '6',
      type: 'payment',
      description: 'Hour old payment',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    };

    render(<ActivityFeed activities={[hourOldActivity]} />);

    const timeElement = screen.getByTestId('activity-time-6');
    expect(timeElement.textContent).toMatch(/\d+h ago/);
  });

  it('formats day-old timestamps correctly', () => {
    const dayOldActivity: RecentActivity = {
      id: '7',
      type: 'review',
      description: 'Day old review',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    };

    render(<ActivityFeed activities={[dayOldActivity]} />);

    const timeElement = screen.getByTestId('activity-time-7');
    expect(timeElement.textContent).toMatch(/\d+d ago/);
  });
});
