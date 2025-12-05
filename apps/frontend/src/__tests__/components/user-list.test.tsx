import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserList } from '@/components/admin/user-list';
import { User } from '@/types/admin.types';

describe('UserList', () => {
  const mockUsers: User[] = [
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
    {
      id: '3',
      email: 'suspended@test.com',
      name: 'Bob Suspended',
      role: 'student',
      emailVerified: true,
      suspended: true,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-15'),
    },
  ];

  const mockOnSuspend = vi.fn();
  const mockOnViewDetails = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders user list with users', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByTestId('user-list')).toBeInTheDocument();
    mockUsers.forEach((user) => {
      expect(screen.getByTestId(`user-row-${user.id}`)).toBeInTheDocument();
      expect(screen.getByTestId(`user-name-${user.id}`)).toHaveTextContent(user.name);
      expect(screen.getByTestId(`user-email-${user.id}`)).toHaveTextContent(user.email);
    });
  });

  it('displays correct role badges', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByTestId('user-role-1')).toHaveTextContent('student');
    expect(screen.getByTestId('user-role-2')).toHaveTextContent('tutor');
  });

  it('displays correct status badges', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByTestId('user-status-1')).toHaveTextContent('Active');
    expect(screen.getByTestId('user-status-3')).toHaveTextContent('Suspended');
  });

  it('calls onViewDetails when view button is clicked', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByTestId('view-details-1'));
    expect(mockOnViewDetails).toHaveBeenCalledWith('1');
  });

  it('shows suspend modal when suspend button is clicked', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByTestId('suspend-button-1'));
    expect(screen.getByTestId('suspend-modal')).toBeInTheDocument();
    expect(screen.getByTestId('suspend-reason-input')).toBeInTheDocument();
  });

  it('does not show suspend button for already suspended users', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.queryByTestId('suspend-button-3')).not.toBeInTheDocument();
  });

  it('closes suspend modal when cancel is clicked', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByTestId('suspend-button-1'));
    expect(screen.getByTestId('suspend-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('suspend-cancel-button'));
    expect(screen.queryByTestId('suspend-modal')).not.toBeInTheDocument();
  });

  it('calls onSuspend with reason when confirmed', async () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByTestId('suspend-button-1'));
    
    const reasonInput = screen.getByTestId('suspend-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Violation of terms' } });

    fireEvent.click(screen.getByTestId('suspend-confirm-button'));

    await waitFor(() => {
      expect(mockOnSuspend).toHaveBeenCalledWith('1', 'Violation of terms');
    });

    expect(screen.queryByTestId('suspend-modal')).not.toBeInTheDocument();
  });

  it('disables confirm button when reason is empty', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    fireEvent.click(screen.getByTestId('suspend-button-1'));
    
    const confirmButton = screen.getByTestId('suspend-confirm-button');
    expect(confirmButton).toBeDisabled();
  });

  it('renders empty state when no users', () => {
    render(
      <UserList
        users={[]}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    expect(screen.getByTestId('user-list')).toBeInTheDocument();
    expect(screen.getByText('No users found')).toBeInTheDocument();
  });

  it('formats join date correctly', () => {
    render(
      <UserList
        users={mockUsers}
        onSuspend={mockOnSuspend}
        onViewDetails={mockOnViewDetails}
      />
    );

    mockUsers.forEach((user) => {
      const joinedElement = screen.getByTestId(`user-joined-${user.id}`);
      expect(joinedElement).toBeInTheDocument();
    });
  });
});
