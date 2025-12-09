import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import ContentModeration from '@/app/admin/moderation/page';
import { useAuthContext } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api-client';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('ContentModeration', () => {
  const mockRouter = {
    push: vi.fn(),
  };

  const mockContent = [
    {
      id: '1',
      type: 'review',
      content: 'Inappropriate review',
      reportedBy: 'user@test.com',
      reportedAt: new Date('2024-01-15'),
      status: 'pending',
      tutorId: 'tutor-123',
    },
    {
      id: '2',
      type: 'message',
      content: 'Spam message',
      reportedBy: 'another@test.com',
      reportedAt: new Date('2024-01-14'),
      status: 'pending',
      studentId: 'student-456',
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

    render(<ContentModeration />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('redirects unauthenticated users', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      loading: false,
    });

    render(<ContentModeration />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('shows loading state while fetching data', () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockImplementation(
      () => new Promise(() => {}), // Never resolves
    );

    render(<ContentModeration />);

    expect(screen.getByText('Loading flagged content...')).toBeInTheDocument();
  });

  it('renders content moderation page with content', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
    });

    expect(screen.getByText('Content Moderation')).toBeInTheDocument();
    expect(screen.getByTestId('moderation-filters')).toBeInTheDocument();
    expect(screen.getByTestId('flagged-content-list')).toBeInTheDocument();
  });

  it('displays error message on API failure', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockRejectedValue({
      response: { data: { message: 'Failed to fetch content' } },
    });

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch content')).toBeInTheDocument();
    });

    expect(screen.getByText('Retry')).toBeInTheDocument();
  });

  it('filters content by type', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
    });

    const typeFilter = screen.getByTestId('type-filter');
    fireEvent.change(typeFilter, { target: { value: 'review' } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 1 of 2 items/)).toBeInTheDocument();
    });
  });

  it('filters content by status', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
    });

    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 items/)).toBeInTheDocument();
    });
  });

  it('moderates content when action is taken', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);
    (apiClient.post as any).mockResolvedValue({});

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('approve-button-1'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/admin/flagged-content/1/moderate', {
        action: 'approve',
      });
    });
  });

  it('navigates back to admin dashboard', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
    });

    const backButton = screen.getByText('← Back to Dashboard');
    fireEvent.click(backButton);

    expect(mockRouter.push).toHaveBeenCalledWith('/admin');
  });

  it('displays item count correctly', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByText(/Showing 2 of 2 items/)).toBeInTheDocument();
    });
  });

  it('updates content status after moderation', async () => {
    (useAuth as any).mockReturnValue({
      user: { id: '1', role: 'admin' },
      loading: false,
    });

    (apiClient.get as any).mockResolvedValue(mockContent);
    (apiClient.post as any).mockResolvedValue({});

    render(<ContentModeration />);

    await waitFor(() => {
      expect(screen.getByTestId('content-moderation')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('approve-button-1'));

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });
  });
});
