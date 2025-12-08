'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useChat } from '@/hooks/use-chat';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageThread } from '@/components/chat/message-thread';
import { MessageInput } from '@/components/chat/message-input';
import { UserStatus } from '@/components/chat/user-status';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  const {
    conversations,
    messages,
    isConnected,
    isLoading,
    error,
    userStatuses,
    loadConversations,
    loadMessages,
    sendMessage,
  } = useChat({
    userId: user?.id || '',
    autoConnect: true,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    loadConversations();
  }, [isAuthenticated, router, loadConversations]);

  useEffect(() => {
    if (selectedConversationId) {
      loadMessages(selectedConversationId);
    }
  }, [selectedConversationId, loadMessages]);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = (message: string) => {
    if (!selectedConversationId) return;

    const selectedConversation = conversations.find(
      (conv) => conv.id === selectedConversationId
    );

    if (!selectedConversation) return;

    const receiverId = selectedConversation.participants.find(
      (id) => id !== user?.id
    );

    if (!receiverId) return;

    sendMessage(selectedConversationId, receiverId, message);
  };

  const getSelectedConversation = () => {
    return conversations.find((conv) => conv.id === selectedConversationId);
  };

  const getOtherParticipantId = () => {
    const conversation = getSelectedConversation();
    if (!conversation) return null;
    return conversation.participants.find((id) => id !== user?.id);
  };

  const getOtherParticipantName = () => {
    const conversation = getSelectedConversation();
    if (!conversation) return 'Unknown';
    const otherParticipantId = getOtherParticipantId();
    return conversation.participantNames?.[otherParticipantId || ''] || 'Unknown';
  };

  const getOtherParticipantStatus = () => {
    const otherParticipantId = getOtherParticipantId();
    if (!otherParticipantId) return null;
    return userStatuses.get(otherParticipantId);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        {!isConnected && (
          <p className="text-sm text-red-600 mt-1">Disconnected from chat server</p>
        )}
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r bg-white overflow-hidden flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900">Conversations</h2>
          </div>
          {error && (
            <div className="p-4 bg-red-50 border-b">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <ConversationList
            conversations={conversations}
            selectedConversationId={selectedConversationId || undefined}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?.id || ''}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {getOtherParticipantName()}
                  </h2>
                  {getOtherParticipantStatus() && (
                    <UserStatus
                      isOnline={getOtherParticipantStatus()!.online}
                      lastSeen={getOtherParticipantStatus()!.lastSeen}
                    />
                  )}
                </div>
              </div>

              {/* Messages */}
              <MessageThread
                messages={messages}
                currentUserId={user?.id || ''}
                isLoading={isLoading}
              />

              {/* Message Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!isConnected}
                placeholder={
                  isConnected
                    ? 'Type a message...'
                    : 'Connecting to chat server...'
                }
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <p className="mt-4 text-lg">Select a conversation to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
