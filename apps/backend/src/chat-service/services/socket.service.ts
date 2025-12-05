import { Server, Socket } from 'socket.io';
import { Logger } from '../../shared';
import { AuthenticatedSocket } from '../middleware/socket-auth.middleware';
import { MessageService } from './message.service';
import { RedisService } from './redis.service';
import { SendMessageDto } from '../dto/message.dto';

export class SocketService {
  private io: Server;
  private logger: Logger;
  private connectedUsers: Map<string, string>; // userId -> socketId
  private messageService: MessageService;
  private redisService: RedisService;

  constructor(io: Server) {
    this.io = io;
    this.logger = new Logger('SocketService');
    this.connectedUsers = new Map();
    this.messageService = new MessageService();
    this.redisService = new RedisService();
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis(): Promise<void> {
    await this.redisService.connect();
  }

  /**
   * Initialize socket event handlers
   */
  initialize(): void {
    this.io.on('connection', async (socket: Socket) => {
      await this.handleConnection(socket as AuthenticatedSocket);
    });
    this.logger.log('Socket service initialized');
  }

  /**
   * Handle new socket connection
   */
  private async handleConnection(socket: AuthenticatedSocket): Promise<void> {
    const userId = socket.user?.userId;
    
    if (!userId) {
      this.logger.warn(`Connection without user ID: ${socket.id}`);
      socket.disconnect();
      return;
    }

    this.logger.log(`User connected: ${userId} (socket: ${socket.id})`);
    
    // Store user connection
    this.connectedUsers.set(userId, socket.id);

    // Set user as online in Redis
    await this.redisService.setUserOnline(userId, socket.id);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Get queued messages for offline user
    const queuedMessages = await this.redisService.getQueuedMessages(userId);
    
    // Get unread count
    const unreadCount = await this.redisService.getUnreadCount(userId);

    // Emit connection success with queued messages
    socket.emit('connected', {
      userId,
      socketId: socket.id,
      timestamp: new Date().toISOString(),
      queuedMessages,
      unreadCount,
    });

    // Broadcast online status to other users
    socket.broadcast.emit('user-online', { userId });

    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle joining conversation rooms
    socket.on('join-conversation', (conversationId: string) => {
      this.handleJoinConversation(socket, conversationId);
    });

    // Handle leaving conversation rooms
    socket.on('leave-conversation', (conversationId: string) => {
      this.handleLeaveConversation(socket, conversationId);
    });

    // Handle sending messages
    socket.on('send-message', async (data: SendMessageDto) => {
      await this.handleSendMessage(socket, data);
    });
  }

  /**
   * Handle socket disconnection
   */
  private async handleDisconnection(socket: AuthenticatedSocket): Promise<void> {
    const userId = socket.user?.userId;
    
    if (userId) {
      this.connectedUsers.delete(userId);
      
      // Set user as offline in Redis
      await this.redisService.setUserOffline(userId);
      
      // Broadcast offline status to other users
      socket.broadcast.emit('user-offline', { userId });
      
      this.logger.log(`User disconnected: ${userId} (socket: ${socket.id})`);
    }
  }

  /**
   * Handle user joining a conversation room
   */
  private handleJoinConversation(socket: AuthenticatedSocket, conversationId: string): void {
    const userId = socket.user?.userId;
    
    if (!conversationId) {
      socket.emit('error', { message: 'Conversation ID required' });
      return;
    }

    socket.join(`conversation:${conversationId}`);
    this.logger.log(`User ${userId} joined conversation: ${conversationId}`);
    
    socket.emit('joined-conversation', {
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle user leaving a conversation room
   */
  private handleLeaveConversation(socket: AuthenticatedSocket, conversationId: string): void {
    const userId = socket.user?.userId;
    
    if (!conversationId) {
      socket.emit('error', { message: 'Conversation ID required' });
      return;
    }

    socket.leave(`conversation:${conversationId}`);
    this.logger.log(`User ${userId} left conversation: ${conversationId}`);
    
    socket.emit('left-conversation', {
      conversationId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit message to a specific conversation room
   */
  emitToConversation(conversationId: string, event: string, data: any): void {
    this.io.to(`conversation:${conversationId}`).emit(event, data);
  }

  /**
   * Emit message to a specific user
   */
  emitToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Get socket ID for a user
   */
  getUserSocketId(userId: string): string | undefined {
    return this.connectedUsers.get(userId);
  }

  /**
   * Get count of connected users
   */
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  /**
   * Get all connected user IDs
   */
  getConnectedUserIds(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  /**
   * Handle sending a message
   */
  private async handleSendMessage(socket: AuthenticatedSocket, data: SendMessageDto): Promise<void> {
    const senderId = socket.user?.userId;

    if (!senderId) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }

    const { conversationId, receiverId, message } = data;

    // Validate input
    if (!conversationId || !receiverId || !message) {
      socket.emit('error', { message: 'Missing required fields: conversationId, receiverId, message' });
      return;
    }

    if (!message.trim()) {
      socket.emit('error', { message: 'Message cannot be empty' });
      return;
    }

    try {
      // Validate that users have a confirmed booking
      const hasBooking = await this.messageService.validateBookingExists(senderId, receiverId);
      
      if (!hasBooking) {
        socket.emit('error', { 
          message: 'Cannot send message. You must have a confirmed booking with this user.' 
        });
        this.logger.warn(`User ${senderId} attempted to message ${receiverId} without confirmed booking`);
        return;
      }

      // Create message in database
      const savedMessage = await this.messageService.createMessage(
        senderId,
        receiverId,
        conversationId,
        message.trim()
      );

      // Prepare message event data
      const messageEvent = {
        id: savedMessage.id,
        conversationId: savedMessage.conversationId,
        senderId: savedMessage.senderId,
        receiverId: savedMessage.receiverId,
        message: savedMessage.message,
        timestamp: savedMessage.createdAt,
        read: false,
      };

      // Emit to sender (confirmation)
      socket.emit('message-sent', messageEvent);

      // Check if receiver is online
      const isReceiverOnline = await this.redisService.isUserOnline(receiverId);

      if (isReceiverOnline) {
        // Emit to receiver in real-time (if online)
        this.emitToUser(receiverId, 'new-message', messageEvent);
      } else {
        // Queue message for offline user
        await this.redisService.queueMessageForOfflineUser(receiverId, messageEvent);
        this.logger.log(`Message queued for offline user ${receiverId}`);
      }

      // Increment unread count for receiver
      await this.redisService.incrementUnreadCount(receiverId);

      // Emit to conversation room
      this.emitToConversation(conversationId, 'message', messageEvent);

      this.logger.log(`Message sent from ${senderId} to ${receiverId} in conversation ${conversationId}`);
    } catch (error) {
      this.logger.error('Error handling send message:', error);
      socket.emit('error', { 
        message: 'Failed to send message. Please try again.' 
      });
    }
  }

  /**
   * Get online status for a user
   */
  async getUserOnlineStatus(userId: string): Promise<boolean> {
    return await this.redisService.isUserOnline(userId);
  }

  /**
   * Cleanup on service shutdown
   */
  async cleanup(): Promise<void> {
    await this.redisService.disconnect();
  }
}
