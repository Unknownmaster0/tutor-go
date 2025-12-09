'use client';

import { memo } from 'react';

interface TypingIndicatorProps {
  userName?: string;
}

export const TypingIndicator = memo(({ userName = 'Someone' }: TypingIndicatorProps) => {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 p-4">
      <span>{userName} is typing</span>
      <div className="flex gap-1">
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '0ms' }}
        ></span>
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '150ms' }}
        ></span>
        <span
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: '300ms' }}
        ></span>
      </div>
    </div>
  );
});

TypingIndicator.displayName = 'TypingIndicator';
