'use client';

import { Conversation } from '@/types/chat.types';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
}

export const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
}: ConversationListProps) => {
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

  const getOtherParticipantName = (conversation: Conversation) => {
    const otherParticipantId = conversation.participants.find(
      (id) => id !== currentUserId
    );
    return conversation.participantNames?.[otherParticipantId || ''] || 'Unknown';
  };

  if (conversations.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelectConversation(conversation.id)}
          className={`w-full p-4 border-b hover:bg-gray-50 transition-colors text-left ${
            selectedConversationId === conversation.id ? 'bg-blue-50' : ''
          }`}
        >
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-semibold text-gray-900">
              {getOtherParticipantName(conversation)}
            </h3>
            <span className="text-xs text-gray-500">
              {formatTime(conversation.lastMessageTime)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 truncate flex-1">
              {conversation.lastMessage}
            </p>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {conversation.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
};
