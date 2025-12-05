import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { FlaggedContentList } from '@/components/admin/flagged-content-list';
import { FlaggedContent } from '@/types/admin.types';

describe('FlaggedContentList', () => {
  const mockContent: FlaggedContent[] = [
    {
      id: '1',
      type: 'review',
      content: 'This is inappropriate content',
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
    {
      id: '3',
      type: 'review',
      content: 'Already approved content',
      reportedBy: 'user@test.com',
      reportedAt: new Date('2024-01-13'),
      status: 'approved',
    },
  ];

  const mockOnModerate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders flagged content list', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    expect(screen.getByTestId('flagged-content-list')).toBeInTheDocument();
    mockContent.forEach((item) => {
      expect(screen.getByTestId(`content-item-${item.id}`)).toBeInTheDocument();
    });
  });

  it('displays content details correctly', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    expect(screen.getByTestId('content-type-1')).toHaveTextContent('review');
    expect(screen.getByTestId('content-status-1')).toHaveTextContent('pending');
    expect(screen.getByTestId('content-text-1')).toHaveTextContent('This is inappropriate content');
    expect(screen.getByTestId('content-reporter-1')).toHaveTextContent('user@test.com');
  });

  it('displays tutor ID when present', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    expect(screen.getByTestId('content-tutor-1')).toHaveTextContent('tutor-123');
  });

  it('displays student ID when present', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    expect(screen.getByTestId('content-student-2')).toHaveTextContent('student-456');
  });

  it('shows action buttons for pending content', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    expect(screen.getByTestId('approve-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('warn-button-1')).toBeInTheDocument();
    expect(screen.getByTestId('remove-button-1')).toBeInTheDocument();
  });

  it('does not show action buttons for non-pending content', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    expect(screen.queryByTestId('approve-button-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('warn-button-3')).not.toBeInTheDocument();
    expect(screen.queryByTestId('remove-button-3')).not.toBeInTheDocument();
  });

  it('calls onModerate immediately when approve is clicked', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('approve-button-1'));

    expect(mockOnModerate).toHaveBeenCalledWith('1', { action: 'approve' });
  });

  it('shows modal when warn button is clicked', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('warn-button-1'));

    expect(screen.getByTestId('moderation-modal')).toBeInTheDocument();
    expect(screen.getByTestId('action-reason-input')).toBeInTheDocument();
  });

  it('shows modal when remove button is clicked', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('remove-button-1'));

    expect(screen.getByTestId('moderation-modal')).toBeInTheDocument();
  });

  it('closes modal when cancel is clicked', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('warn-button-1'));
    expect(screen.getByTestId('moderation-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('action-cancel-button'));
    expect(screen.queryByTestId('moderation-modal')).not.toBeInTheDocument();
  });

  it('calls onModerate with warn action and reason', async () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('warn-button-1'));

    const reasonInput = screen.getByTestId('action-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Inappropriate language' } });

    fireEvent.click(screen.getByTestId('action-warn-confirm'));

    await waitFor(() => {
      expect(mockOnModerate).toHaveBeenCalledWith('1', {
        action: 'warn',
        reason: 'Inappropriate language',
      });
    });

    expect(screen.queryByTestId('moderation-modal')).not.toBeInTheDocument();
  });

  it('calls onModerate with remove action and reason', async () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('remove-button-1'));

    const reasonInput = screen.getByTestId('action-reason-input');
    fireEvent.change(reasonInput, { target: { value: 'Spam content' } });

    fireEvent.click(screen.getByTestId('action-remove-confirm'));

    await waitFor(() => {
      expect(mockOnModerate).toHaveBeenCalledWith('1', {
        action: 'remove',
        reason: 'Spam content',
      });
    });
  });

  it('calls onModerate without reason if not provided', async () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    fireEvent.click(screen.getByTestId('remove-button-1'));
    fireEvent.click(screen.getByTestId('action-remove-confirm'));

    await waitFor(() => {
      expect(mockOnModerate).toHaveBeenCalledWith('1', {
        action: 'remove',
        reason: undefined,
      });
    });
  });

  it('renders empty state when no content', () => {
    render(<FlaggedContentList content={[]} onModerate={mockOnModerate} />);

    expect(screen.getByTestId('flagged-content-list')).toBeInTheDocument();
    expect(screen.getByText('No flagged content')).toBeInTheDocument();
  });

  it('displays correct badge colors for content types', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    const reviewBadge = screen.getByTestId('content-type-1');
    const messageBadge = screen.getByTestId('content-type-2');

    expect(reviewBadge).toHaveClass('bg-blue-100');
    expect(messageBadge).toHaveClass('bg-purple-100');
  });

  it('displays correct badge colors for statuses', () => {
    render(<FlaggedContentList content={mockContent} onModerate={mockOnModerate} />);

    const pendingBadge = screen.getByTestId('content-status-1');
    const approvedBadge = screen.getByTestId('content-status-3');

    expect(pendingBadge).toHaveClass('bg-yellow-100');
    expect(approvedBadge).toHaveClass('bg-green-100');
  });
});
