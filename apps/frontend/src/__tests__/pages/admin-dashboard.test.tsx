import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/app/admin/page';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('AdminDashboard', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockMetrics = {
    totalUsers: 150,
    totalStudents: 100,
    totalTutors: 50,
    totalBookings: 200,
    totalRevenue: 5000,
    recentBookings: 25,
    recentRevenue: 750,
  };

  const mockActivity = [
    {
      id: '1',
      type: 'booking' as const,
      description: 'New booking created',
      timestamp: new Date('2024-01-15T10:00:00Z'),
      userName: 'John Doe',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
  });

  it('redirects non-admin users', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'student' },
      loading: false,
    });

    render(<AdminDashboard />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('redirects unauthenticated users', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<AdminDashboard />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('shows loading state while fetching data', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<AdminDashboard />);

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
  });

  it('renders admin dashboard with metrics', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/metrics') return Promise.resolve(mockMetrics);
      if (url === '/admin/activity') return Promise.resolve(mockActivity);
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.getByText('150')).toBeInTheDocument(); // Total users
    expect(screen.getByText('200')).toBeInTheDocument(); // Total bookings
  });

  it('displays error message on API failure', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockRejectedValue({
      response: { data: { message: 'Failed to fetch data' } },
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch data')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('renders metric cards', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/metrics') return Promise.resolve(mockMetrics);
      if (url === '/admin/activity') return Promise.resolve(mockActivity);
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Total Users')).toBeInTheDocument();
    });

    expect(screen.getByText('Total Bookings')).toBeInTheDocument();
    expect(screen.getByText('Total Revenue')).toBeInTheDocument();
  });

  it('renders charts', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/metrics') return Promise.resolve(mockMetrics);
      if (url === '/admin/activity') return Promise.resolve(mockActivity);
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
    });

    expect(screen.getByTestId('bookings-chart')).toBeInTheDocument();
  });

  it('renders activity feed', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/metrics') return Promise.resolve(mockMetrics);
      if (url === '/admin/activity') return Promise.resolve(mockActivity);
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    });
  });

  it('renders quick action buttons', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation((url: string) => {
      if (url === '/admin/metrics') return Promise.resolve(mockMetrics);
      if (url === '/admin/activity') return Promise.resolve(mockActivity);
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Manage Users')).toBeInTheDocument();
    });

    expect(screen.getByText('Content Moderation')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });
});
