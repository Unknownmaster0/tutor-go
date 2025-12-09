'use client';

import { Conversation } from '@/types/chat.types';
import { formatDistanceToNow } from 'date-fns';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onSelect: (conversationId: string) => void;
  currentUserId: string;
  otherUserStatus?: { online: boolean; lastSeen?: Date };
}

export const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
  currentUserId,
  otherUserStatus,
}: ConversationItemProps) => {
  const getOtherParticipantName = () => {
    const otherParticipantId = conversation.participants.find((id) => id !== currentUserId);
    return conversation.participantNames?.[otherParticipantId || ''] || 'Unknown';
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffInHours < 168) {
      return messageDate.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
        isSelected ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-900'}`}>
          {getOtherParticipantName()}
        </h3>
        <span className="text-xs text-gray-500">{formatTime(conversation.lastMessageTime)}</span>
      </div>

      <div className="flex items-center gap-2">
        <p className="text-sm text-gray-600 line-clamp-1 flex-1">
          {conversation.lastMessage || 'No messages yet'}
        </p>
        {conversation.unreadCount > 0 && (
          <span className="flex items-center justify-center min-w-[20px] h-5 bg-blue-600 text-white text-xs font-semibold rounded-full">
            {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
          </span>
        )}
      </div>

      {otherUserStatus && (
        <div className="mt-1 text-xs">
          {otherUserStatus.online ? (
            <span className="text-green-600">● Online</span>
          ) : (
            <span className="text-gray-500">
              Last seen{' '}
              {otherUserStatus.lastSeen
                ? formatDistanceToNow(new Date(otherUserStatus.lastSeen), {
                    addSuffix: true,
                  })
                : 'recently'}
            </span>
          )}
        </div>
      )}
    </button>
  );
};
