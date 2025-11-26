import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatHistoryCard } from '@/components/dashboard/ChatHistoryCard';
import { Conversation } from '@/types/chat.types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock date-fns to have consistent output
vi.mock('date-fns', () => ({
  formatDistanceToNow: () => '2 hours ago',
}));

describe('ChatHistoryCard', () => {
  const currentUserId = 'student-1';

  const mockConversation: Conversation = {
    id: 'conv-1',
    participants: ['student-1', 'tutor-1'],
    participantNames: {
      'student-1': 'Student User',
      'tutor-1': 'John Doe',
    },
    lastMessage: 'Hello, I have a question about the homework.',
    lastMessageTime: new Date('2024-03-15T14:00:00'),
    unreadCount: 2,
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders conversation information correctly', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(
      screen.getByText('Hello, I have a question about the homework.')
    ).toBeInTheDocument();
    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('displays unread count badge when there are unread messages', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    expect(screen.getByText('2 unread')).toBeInTheDocument();
  });

  it('does not display unread badge when unreadCount is 0', () => {
    const conversationWithNoUnread = { ...mockConversation, unreadCount: 0 };
    render(
      <ChatHistoryCard
        conversation={conversationWithNoUnread}
        currentUserId={currentUserId}
      />
    );

    expect(screen.queryByText(/unread/)).not.toBeInTheDocument();
  });

  it('truncates long messages', () => {
    const conversationWithLongMessage = {
      ...mockConversation,
      lastMessage:
        'This is a very long message that should be truncated because it exceeds the maximum length allowed for display in the chat history card component.',
    };
    render(
      <ChatHistoryCard
        conversation={conversationWithLongMessage}
        currentUserId={currentUserId}
      />
    );

    const messageElement = screen.getByText(/This is a very long message/);
    expect(messageElement.textContent).toContain('...');
    expect(messageElement.textContent?.length).toBeLessThan(
      conversationWithLongMessage.lastMessage.length
    );
  });

  it('displays full message when under 60 characters', () => {
    const conversationWithShortMessage = {
      ...mockConversation,
      lastMessage: 'Short message',
    };
    render(
      <ChatHistoryCard
        conversation={conversationWithShortMessage}
        currentUserId={currentUserId}
      />
    );

    expect(screen.getByText('Short message')).toBeInTheDocument();
    expect(screen.queryByText(/\.\.\./)).not.toBeInTheDocument();
  });

  it('displays other participant name correctly', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    // Should show the other participant (tutor), not the current user
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Student User')).not.toBeInTheDocument();
  });

  it('displays avatar with first letter of participant name', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('handles missing participant names gracefully', () => {
    const conversationWithoutNames = {
      ...mockConversation,
      participantNames: undefined,
    };
    render(
      <ChatHistoryCard
        conversation={conversationWithoutNames}
        currentUserId={currentUserId}
      />
    );

    expect(screen.getByText('Unknown User')).toBeInTheDocument();
  });

  it('navigates to chat page on click', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    const card = screen.getByText('John Doe').closest('.bg-white');
    fireEvent.click(card!);

    expect(mockPush).toHaveBeenCalledWith('/chat/conv-1');
  });

  it('calls custom onClick handler when provided', () => {
    const mockOnClick = vi.fn();
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
        onClick={mockOnClick}
      />
    );

    const card = screen.getByText('John Doe').closest('.bg-white');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledWith('conv-1');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('applies hover styles', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    const card = screen.getByText('John Doe').closest('.bg-white');
    expect(card).toHaveClass('hover:shadow-medium');
    expect(card).toHaveClass('cursor-pointer');
  });

  it('displays unread badge with correct styling', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    const badge = screen.getByText('2 unread');
    expect(badge).toHaveClass('bg-primary-600');
    expect(badge).toHaveClass('text-white');
  });

  it('truncates participant name if too long', () => {
    const conversationWithLongName = {
      ...mockConversation,
      participantNames: {
        'student-1': 'Student User',
        'tutor-1': 'Very Long Teacher Name That Should Be Truncated',
      },
    };
    render(
      <ChatHistoryCard
        conversation={conversationWithLongName}
        currentUserId={currentUserId}
      />
    );

    const nameElement = screen.getByText(
      'Very Long Teacher Name That Should Be Truncated'
    );
    expect(nameElement).toHaveClass('truncate');
  });

  it('applies line-clamp to message text', () => {
    render(
      <ChatHistoryCard
        conversation={mockConversation}
        currentUserId={currentUserId}
      />
    );

    const messageElement = screen.getByText(
      'Hello, I have a question about the homework.'
    );
    expect(messageElement).toHaveClass('line-clamp-2');
  });

  it('handles conversation with multiple participants correctly', () => {
    const conversationWithMultipleParticipants = {
      ...mockConversation,
      participants: ['student-1', 'tutor-1', 'tutor-2'],
      participantNames: {
        'student-1': 'Student User',
        'tutor-1': 'John Doe',
        'tutor-2': 'Jane Smith',
      },
    };
    render(
      <ChatHistoryCard
        conversation={conversationWithMultipleParticipants}
        currentUserId={currentUserId}
      />
    );

    // Should show the first non-current user
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays singular "unread" for 1 unread message', () => {
    const conversationWithOneUnread = { ...mockConversation, unreadCount: 1 };
    render(
      <ChatHistoryCard
        conversation={conversationWithOneUnread}
        currentUserId={currentUserId}
      />
    );

    expect(screen.getByText('1 unread')).toBeInTheDocument();
  });
});
