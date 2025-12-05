export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  participantNames?: { [userId: string]: string };
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}

export interface SendMessageEvent {
  conversationId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Date;
}

export interface ReceiveMessageEvent {
  id: string;
  conversationId: string;
  senderId: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export interface UserStatus {
  userId: string;
  online: boolean;
  lastSeen?: Date;
}
