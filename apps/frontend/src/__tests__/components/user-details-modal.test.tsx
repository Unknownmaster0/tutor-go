import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserDetailsModal } from '@/components/admin/user-details-modal';
import { User } from '@/types/admin.types';

describe('UserDetailsModal', () => {
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    role: 'student',
    emailVerified: true,
    suspended: false,
    createdAt: new Date('2024-01-01T10:00:00Z'),
    updatedAt: new Date('2024-01-15T15:30:00Z'),
  };

  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when user is null', () => {
    const { container } = render(<UserDetailsModal user={null} onClose={mockOnClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders modal with user details', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    expect(screen.getByTestId('user-details-modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-title')).toHaveTextContent('User Details');
  });

  it('displays basic user information', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    expect(screen.getByTestId('detail-name')).toHaveTextContent('Test User');
    expect(screen.getByTestId('detail-email')).toHaveTextContent('test@example.com');
    expect(screen.getByTestId('detail-role')).toHaveTextContent('student');
    expect(screen.getByTestId('detail-id')).toHaveTextContent('user-123');
  });

  it('displays account status correctly for active user', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    expect(screen.getByTestId('detail-verified')).toHaveTextContent('Yes');
    expect(screen.getByTestId('detail-suspended')).toHaveTextContent('Active');
  });

  it('displays account status correctly for suspended user', () => {
    const suspendedUser = { ...mockUser, suspended: true };
    render(<UserDetailsModal user={suspendedUser} onClose={mockOnClose} />);

    expect(screen.getByTestId('detail-suspended')).toHaveTextContent('Suspended');
  });

  it('displays account status correctly for unverified user', () => {
    const unverifiedUser = { ...mockUser, emailVerified: false };
    render(<UserDetailsModal user={unverifiedUser} onClose={mockOnClose} />);

    expect(screen.getByTestId('detail-verified')).toHaveTextContent('No');
  });

  it('displays timestamps', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    expect(screen.getByTestId('detail-created')).toBeInTheDocument();
    expect(screen.getByTestId('detail-updated')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('close-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close modal button is clicked', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('close-modal-button'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking outside modal', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('user-details-modal'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('does not close when clicking inside modal content', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    const modalContent = screen.getByTestId('user-details-modal').firstChild as HTMLElement;
    fireEvent.click(modalContent);
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('displays role-specific activity summary for tutor', () => {
    const tutorUser = { ...mockUser, role: 'tutor' as const };
    render(<UserDetailsModal user={tutorUser} onClose={mockOnClose} />);

    expect(screen.getByText(/Total sessions, earnings, and ratings/)).toBeInTheDocument();
  });

  it('displays role-specific activity summary for student', () => {
    render(<UserDetailsModal user={mockUser} onClose={mockOnClose} />);

    expect(screen.getByText(/Total bookings and reviews/)).toBeInTheDocument();
  });

  it('displays role-specific activity summary for admin', () => {
    const adminUser = { ...mockUser, role: 'admin' as const };
    render(<UserDetailsModal user={adminUser} onClose={mockOnClose} />);

    expect(screen.getByText(/Admin activity logs/)).toBeInTheDocument();
  });
});
