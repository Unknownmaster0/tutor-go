'use client';

import { Conversation, UserStatus } from '@/types/chat.types';
import { ConversationItem } from './conversation-item';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  currentUserId: string;
  userStatuses?: Map<string, UserStatus>;
}

export const ConversationList = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  currentUserId,
  userStatuses = new Map(),
}: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <div className="text-3xl mb-3">💬</div>
        <p className="text-center">No conversations yet</p>
        <p className="text-xs text-gray-400 mt-2">Start booking a session to chat with tutors</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full divide-y divide-gray-100">
      {conversations.map((conversation) => {
        const otherParticipantId = conversation.participants.find((id) => id !== currentUserId);
        const otherUserStatus = otherParticipantId
          ? userStatuses.get(otherParticipantId)
          : undefined;

        return (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isSelected={selectedConversationId === conversation.id}
            onSelect={onSelectConversation}
            currentUserId={currentUserId}
            otherUserStatus={otherUserStatus}
          />
        );
      })}
    </div>
  );
};
