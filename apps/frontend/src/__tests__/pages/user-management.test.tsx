import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import UserManagement from '@/app/admin/users/page';
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
    patch: vi.fn(),
  },
}));

describe('UserManagement', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockUsers = [
    {
      id: '1',
      email: 'student@test.com',
      name: 'John Student',
      role: 'student',
      emailVerified: true,
      suspended: false,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      email: 'tutor@test.com',
      name: 'Jane Tutor',
      role: 'tutor',
      emailVerified: true,
      suspended: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15'),
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

    render(<UserManagement />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('redirects unauthenticated users', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<UserManagement />);

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

    render(<UserManagement />);

    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  it('renders user management page with users', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByTestId('user-search')).toBeInTheDocument();
    expect(screen.getByTestId('user-list')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockRejectedValue({
      response: { data: { message: 'Failed to fetch users' } },
    });

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch users')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('filters users by search query', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 users/)).toBeInTheDocument();
    });
  });

  it('filters users by role', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    const roleFilter = screen.getByTestId('role-filter');
    fireEvent.change(roleFilter, { target: { value: 'student' } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 users/)).toBeInTheDocument();
    });
  });

  it('suspends user when confirmed', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockUsers);
    (apiClient.patch as any).mockResolvedValue({});

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('suspend-button-1'));
    
    const reasonInput = screen.getByTestId('suspend-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Violation' } });

    fireEvent.click(screen.getByTestId('suspend-confirm-button'));

    await waitFor(() => {
      expect(apiClient.patch).toHaveBeenCalledWith('/admin/users/1/suspend', {
        reason: 'Violation',
      });
    });
  });

  it('opens user details modal when view is clicked', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('view-details-1'));

    await waitFor(() => {
      expect(screen.getByTestId('user-details-modal')).toBeInTheDocument();
    });
  });

  it('navigates back to admin dashboard', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockUsers);

    render(<UserManagement />);

    await waitFor(() => {
      expect(screen.getByTestId('user-management')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Dashboard');
    fireEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/admin');
  });
});
