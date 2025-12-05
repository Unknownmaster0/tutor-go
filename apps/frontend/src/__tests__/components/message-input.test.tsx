import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MessageInput } from '@/components/chat/message-input';

describe('MessageInput', () => {
  const defaultProps = {
    onSendMessage: vi.fn(),
  };

  it('should render input field and send button', () => {
    render(<MessageInput {...defaultProps} />);

    expect(screen.getByPlaceholderText('Type a message...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /send/i })).toBeInTheDocument();
  });

  it('should update input value when typing', async () => {
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await user.type(input, 'Hello world');

    expect(input.value).toBe('Hello world');
  });

  it('should call onSendMessage when form is submitted', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should clear input after sending message', async () => {
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a message...') as HTMLTextAreaElement;
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(input.value).toBe('');
  });

  it('should not send empty messages', async () => {
    const onSendMessage = vi.fn();
    render(<MessageInput {...defaultProps} onSendMessage={onSendMessage} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('should trim whitespace from messages', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, '  Test message  ');

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should send message when Enter is pressed', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Test message{Enter}');

    expect(onSendMessage).toHaveBeenCalledWith('Test message');
  });

  it('should not send message when Shift+Enter is pressed', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} onSendMessage={onSendMessage} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Line 1{Shift>}{Enter}{/Shift}Line 2');

    expect(onSendMessage).not.toHaveBeenCalled();
  });

  it('should disable input and button when disabled prop is true', () => {
    render(<MessageInput {...defaultProps} disabled={true} />);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    expect(input).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('should disable send button when input is empty', () => {
    render(<MessageInput {...defaultProps} />);

    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has text', async () => {
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} />);

    const input = screen.getByPlaceholderText('Type a message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    expect(sendButton).toBeDisabled();

    await user.type(input, 'Test');

    expect(sendButton).not.toBeDisabled();
  });

  it('should use custom placeholder', () => {
    render(<MessageInput {...defaultProps} placeholder="Custom placeholder" />);

    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('should not send message when disabled', async () => {
    const onSendMessage = vi.fn();
    const user = userEvent.setup();
    render(<MessageInput {...defaultProps} onSendMessage={onSendMessage} disabled={true} />);

    const input = screen.getByPlaceholderText('Type a message...');
    await user.type(input, 'Test message');

    const sendButton = screen.getByRole('button', { name: /send/i });
    fireEvent.click(sendButton);

    expect(onSendMessage).not.toHaveBeenCalled();
  });
});
