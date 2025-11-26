import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageThread } from '@/components/chat/message-thread';
import { Message } from '@/types/chat.types';

describe('MessageThread', () => {
  beforeEach(() => {
    // Mock scrollIntoView
    Element.prototype.scrollIntoView = vi.fn();
  });
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      message: 'Hello!',
      read: true,
      timestamp: new Date('2024-01-15T10:00:00'),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'user-2',
      receiverId: 'user-1',
      message: 'Hi there!',
      read: false,
      timestamp: new Date('2024-01-15T10:05:00'),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      message: 'How are you?',
      read: false,
      timestamp: new Date('2024-01-15T10:10:00'),
    },
  ];

  const defaultProps = {
    messages: mockMessages,
    currentUserId: 'user-1',
  };

  it('should render all messages', () => {
    render(<MessageThread {...defaultProps} />);

    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
    expect(screen.getByText('How are you?')).toBeInTheDocument();
  });

  it('should style own messages differently', () => {
    render(<MessageThread {...defaultProps} />);

    const ownMessage = screen.getByText('Hello!').closest('div');
    expect(ownMessage).toHaveClass('bg-blue-600', 'text-white');
  });

  it('should style other user messages differently', () => {
    render(<MessageThread {...defaultProps} />);

    const otherMessage = screen.getByText('Hi there!').closest('div');
    expect(otherMessage).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('should display read receipts for own messages', () => {
    render(<MessageThread {...defaultProps} />);

    const readMessage = screen.getByText('Hello!').closest('div');
    expect(readMessage?.textContent).toContain('✓✓');
  });

  it('should not display read receipts for unread messages', () => {
    render(<MessageThread {...defaultProps} />);

    const unreadMessage = screen.getByText('How are you?').closest('div');
    expect(unreadMessage?.textContent).not.toContain('✓✓');
  });

  it('should display loading state', () => {
    render(<MessageThread {...defaultProps} messages={[]} isLoading={true} />);

    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('should display empty state when no messages', () => {
    render(<MessageThread {...defaultProps} messages={[]} />);

    expect(screen.getByText('No messages yet. Start the conversation!')).toBeInTheDocument();
  });

  it('should group messages by date', () => {
    const messagesAcrossDays: Message[] = [
      {
        id: 'msg-1',
        conversationId: 'conv-1',
        senderId: 'user-1',
        receiverId: 'user-2',
        message: 'Yesterday message',
        read: true,
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        id: 'msg-2',
        conversationId: 'conv-1',
        senderId: 'user-2',
        receiverId: 'user-1',
        message: 'Today message',
        read: false,
        timestamp: new Date(),
      },
    ];

    render(<MessageThread {...defaultProps} messages={messagesAcrossDays} />);

    expect(screen.getByText('Yesterday')).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
  });

  it('should align own messages to the right', () => {
    render(<MessageThread {...defaultProps} />);

    const ownMessageContainer = screen.getByText('Hello!').closest('div')?.parentElement;
    expect(ownMessageContainer).toHaveClass('justify-end');
  });

  it('should align other messages to the left', () => {
    render(<MessageThread {...defaultProps} />);

    const otherMessageContainer = screen.getByText('Hi there!').closest('div')?.parentElement;
    expect(otherMessageContainer).toHaveClass('justify-start');
  });
});
