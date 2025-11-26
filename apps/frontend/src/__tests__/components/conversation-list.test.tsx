import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConversationList } from '@/components/chat/conversation-list';
import { Conversation } from '@/types/chat.types';

describe('ConversationList', () => {
  const mockConversations: Conversation[] = [
    {
      id: 'conv-1',
      participants: ['user-1', 'user-2'],
      participantNames: {
        'user-1': 'John Doe',
        'user-2': 'Jane Smith',
      },
      lastMessage: 'Hello, how are you?',
      lastMessageTime: new Date('2024-01-15T10:30:00'),
      unreadCount: 2,
    },
    {
      id: 'conv-2',
      participants: ['user-1', 'user-3'],
      participantNames: {
        'user-1': 'John Doe',
        'user-3': 'Bob Johnson',
      },
      lastMessage: 'See you tomorrow!',
      lastMessageTime: new Date('2024-01-14T15:45:00'),
      unreadCount: 0,
    },
  ];

  const defaultProps = {
    conversations: mockConversations,
    currentUserId: 'user-1',
    onSelectConversation: vi.fn(),
  };

  it('should render list of conversations', () => {
    render(<ConversationList {...defaultProps} />);

    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.getByText('Hello, how are you?')).toBeInTheDocument();
    expect(screen.getByText('See you tomorrow!')).toBeInTheDocument();
  });

  it('should display unread count badge', () => {
    render(<ConversationList {...defaultProps} />);

    const unreadBadge = screen.getByText('2');
    expect(unreadBadge).toBeInTheDocument();
    expect(unreadBadge).toHaveClass('bg-blue-600');
  });

  it('should not display unread badge when count is 0', () => {
    render(<ConversationList {...defaultProps} />);

    const badges = screen.queryAllByText('0');
    expect(badges.length).toBe(0);
  });

  it('should call onSelectConversation when conversation is clicked', () => {
    const onSelectConversation = vi.fn();
    render(
      <ConversationList {...defaultProps} onSelectConversation={onSelectConversation} />
    );

    const conversation = screen.getByText('Jane Smith').closest('button');
    fireEvent.click(conversation!);

    expect(onSelectConversation).toHaveBeenCalledWith('conv-1');
  });

  it('should highlight selected conversation', () => {
    render(<ConversationList {...defaultProps} selectedConversationId="conv-1" />);

    const selectedConversation = screen.getByText('Jane Smith').closest('button');
    expect(selectedConversation).toHaveClass('bg-blue-50');
  });

  it('should display "No conversations yet" when list is empty', () => {
    render(<ConversationList {...defaultProps} conversations={[]} />);

    expect(screen.getByText('No conversations yet')).toBeInTheDocument();
  });

  it('should display "Unknown" for participant without name', () => {
    const conversationsWithoutNames: Conversation[] = [
      {
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
        lastMessage: 'Hello',
        lastMessageTime: new Date(),
        unreadCount: 0,
      },
    ];

    render(
      <ConversationList {...defaultProps} conversations={conversationsWithoutNames} />
    );

    expect(screen.getByText('Unknown')).toBeInTheDocument();
  });

  it('should truncate long messages', () => {
    const longMessageConversation: Conversation[] = [
      {
        id: 'conv-1',
        participants: ['user-1', 'user-2'],
        participantNames: { 'user-2': 'Jane' },
        lastMessage: 'This is a very long message that should be truncated in the UI',
        lastMessageTime: new Date(),
        unreadCount: 0,
      },
    ];

    render(
      <ConversationList {...defaultProps} conversations={longMessageConversation} />
    );

    const messageElement = screen.getByText(
      'This is a very long message that should be truncated in the UI'
    );
    expect(messageElement).toHaveClass('truncate');
  });
});
