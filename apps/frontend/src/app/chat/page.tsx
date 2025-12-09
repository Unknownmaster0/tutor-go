'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/use-chat';
import { ConversationList } from '@/components/chat/conversation-list';
import { MessageThread } from '@/components/chat/message-thread';
import { MessageInput } from '@/components/chat/message-input';
import { UserStatus } from '@/components/chat/user-status';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Phone, Video, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthContext();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversationId(conversationId);
  };

  const handleSendMessage = (message: string) => {
    if (!selectedConversationId) return;

    const selectedConversation = conversations.find((conv) => conv.id === selectedConversationId);

    if (!selectedConversation) return;

    const receiverId = selectedConversation.participants.find((id) => id !== user?.id);

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

  const filteredConversations = conversations.filter((conv) => {
    const otherParticipantId = conv.participants.find((id) => id !== user?.id);
    const name = conv.participantNames?.[otherParticipantId || ''] || 'Unknown';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main Chat Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Conversations Sidebar */}
        <div
          className={`flex flex-col w-full md:w-80 border-r border-gray-200 bg-white transition-all duration-300 ${
            isMobile && selectedConversationId ? 'hidden' : 'block'
          }`}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Messages</h1>

            {/* Search Box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {/* Connection Status */}
            <div className="mt-3 flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              <span className="text-xs text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mx-4 mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Conversations List */}
          <ConversationList
            conversations={filteredConversations}
            selectedConversationId={selectedConversationId || undefined}
            onSelectConversation={handleSelectConversation}
            currentUserId={user?.id || ''}
            userStatuses={userStatuses}
          />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedConversationId ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {isMobile && (
                    <button
                      onClick={() => setSelectedConversationId(null)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                  )}
                  <div>
                    <h2 className="font-semibold text-gray-900">{getOtherParticipantName()}</h2>
                    {getOtherParticipantStatus() && (
                      <UserStatus
                        isOnline={getOtherParticipantStatus()!.online}
                        lastSeen={getOtherParticipantStatus()!.lastSeen}
                      />
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Video className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <MessageThread
                messages={messages}
                currentUserId={user?.id || ''}
                isLoading={isLoading}
              />

              {/* Typing Indicator */}
              {typingUsers.size > 0 && <TypingIndicator userName={getOtherParticipantName()} />}

              {/* Message Input */}
              <MessageInput
                onSendMessage={handleSendMessage}
                disabled={!isConnected}
                placeholder={isConnected ? 'Type a message...' : 'Connecting to chat server...'}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {conversations.length === 0 ? 'No Conversations Yet' : 'Select a Conversation'}
                </h2>
                <p className="text-gray-600 max-w-sm">
                  {conversations.length === 0
                    ? 'Start booking a session to begin chatting with your tutor or student.'
                    : 'Choose a conversation from the list to start messaging'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
