import React from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Conversation } from '@/types/chat.types';
import { formatDistanceToNow } from 'date-fns';

export interface ChatHistoryCardProps {
  conversation: Conversation;
  currentUserId: string;
  onClick?: (conversationId: string) => void;
}

export const ChatHistoryCard: React.FC<ChatHistoryCardProps> = ({
  conversation,
  currentUserId,
  onClick,
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick(conversation.id);
    } else {
      router.push(`/chat/${conversation.id}`);
    }
  };

  // Get the other participant's name
  const getOtherParticipantName = (): string => {
    if (conversation.participantNames) {
      const otherParticipantId = conversation.participants.find((id) => id !== currentUserId);
      if (otherParticipantId && conversation.participantNames[otherParticipantId]) {
        return conversation.participantNames[otherParticipantId];
      }
    }
    return 'Unknown User';
  };

  const otherParticipantName = getOtherParticipantName();

  // Format timestamp as relative time
  const formattedTime = formatDistanceToNow(new Date(conversation.lastMessageTime), {
    addSuffix: true,
  });

  // Truncate last message if too long
  const truncatedMessage =
    conversation.lastMessage.length > 60
      ? `${conversation.lastMessage.substring(0, 60)}...`
      : conversation.lastMessage;

  return (
    <Card
      hover
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
      className="flex items-start gap-4 cursor-pointer"
      aria-label={`Conversation with ${otherParticipantName}${conversation.unreadCount > 0 ? ` (${conversation.unreadCount} unread messages)` : ''}`}
    >
      {/* Avatar Placeholder */}
      <div className="flex-shrink-0">
        <div
          className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center"
          aria-hidden="true"
        >
          <span className="text-primary-600 text-lg font-semibold">
            {otherParticipantName.charAt(0).toUpperCase()}
          </span>
        </div>
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="text-sm font-semibold text-neutral-900 truncate">
            {otherParticipantName}
          </h4>
          <time
            className="text-xs text-neutral-500 flex-shrink-0"
            title={new Date(conversation.lastMessageTime).toLocaleString()}
          >
            {formattedTime}
          </time>
        </div>

        <p className="text-sm text-neutral-600 line-clamp-2 mb-2">{truncatedMessage}</p>

        {/* Unread Badge */}
        {conversation.unreadCount > 0 && (
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-600 text-white"
              aria-label={`${conversation.unreadCount} unread messages`}
            >
              {conversation.unreadCount} unread
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
