export interface SendMessageDto {
  conversationId: string;
  receiverId: string;
  message: string;
}

export interface MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface SendMessageEventDto {
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

export interface ReceiveMessageEventDto {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface ConversationResponseDto {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface GetMessagesQueryDto {
  limit?: number;
  offset?: number;
}
