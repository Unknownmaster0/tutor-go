'use client';

import { useEffect, useRef } from 'react';
import { Message } from '@/types/chat.types';
import { ReadReceipt } from './read-receipt';

interface MessageThreadProps {
  messages: Message[];
  currentUserId: string;
  isLoading?: boolean;
  typingUser?: string;
}

export const MessageThread = ({
  messages,
  currentUserId,
  isLoading = false,
  typingUser,
}: MessageThreadProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};

    messages.forEach((message) => {
      const dateKey = new Date(message.timestamp).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });

    return groups;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No messages yet. Start the conversation!</p>
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {Object.entries(groupedMessages).map(([dateKey, dateMessages]) => (
        <div key={dateKey}>
          <div className="flex justify-center mb-4">
            <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
              {formatDate(new Date(dateKey))}
            </span>
          </div>
          {dateMessages.map((message) => {
            const isOwnMessage = message.senderId === currentUserId;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-2`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-2 ${
                    isOwnMessage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm break-words">{message.message}</p>
                  <div
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                    }`}
                  >
                    <span>{formatTime(message.timestamp)}</span>
                    {isOwnMessage && <ReadReceipt isRead={message.read} />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
