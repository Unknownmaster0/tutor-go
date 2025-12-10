import { prisma } from '../../shared';
import { Logger } from '../../shared';
import { MessageResponseDto } from '../dto/message.dto';

export class MessageService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger('MessageService');
  }

  /**
   * Validate that users have a confirmed booking before allowing chat
   */
  async validateBookingExists(userId1: string, userId2: string): Promise<boolean> {
    try {
      const booking = await prisma.booking.findFirst({
        where: {
          OR: [
            {
              studentId: userId1,
              tutorId: userId2,
              status: 'confirmed',
            },
            {
              studentId: userId2,
              tutorId: userId1,
              status: 'confirmed',
            },
          ],
        },
      });

      return booking !== null;
    } catch (error) {
      this.logger.error('Error validating booking:', error);
      return false;
    }
  }

  /**
   * Create a new message in the database
   */
  async createMessage(
    senderId: string,
    receiverId: string,
    conversationId: string,
    message: string,
  ): Promise<MessageResponseDto> {
    try {
      const newMessage = await prisma.message.create({
        data: {
          conversationId,
          senderId,
          receiverId,
          message,
          read: false,
        },
      });

      this.logger.log(`Message created: ${newMessage.id} from ${senderId} to ${receiverId}`);

      return {
        id: newMessage.id,
        conversationId: newMessage.conversationId,
        senderId: newMessage.senderId,
        receiverId: newMessage.receiverId,
        message: newMessage.message,
        read: newMessage.read,
        createdAt: newMessage.createdAt,
      };
    } catch (error) {
      this.logger.error('Error creating message:', error);
      throw new Error('Failed to create message');
    }
  }

  /**
   * Get or create conversation ID for two users
   */
  generateConversationId(userId1: string, userId2: string): string {
    // Sort user IDs to ensure consistent conversation ID
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      await prisma.message.update({
        where: { id: messageId },
        data: { read: true },
      });

      this.logger.log(`Message marked as read: ${messageId}`);
    } catch (error) {
      this.logger.error('Error marking message as read:', error);
      throw new Error('Failed to mark message as read');
    }
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Get messages for a conversation with pagination
   */
  async getMessagesByConversation(
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<MessageResponseDto[]> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: offset,
      });

      return messages.map((msg) => ({
        id: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId,
        receiverId: msg.receiverId,
        message: msg.message,
        read: msg.read,
        createdAt: msg.createdAt,
      }));
    } catch (error) {
      this.logger.error('Error getting messages by conversation:', error);
      throw new Error('Failed to retrieve messages');
    }
  }

  /**
   * Get all conversations for a user
   */
  async getConversationsByUser(userId: string): Promise<any[]> {
    try {
      // Get all unique conversation IDs where user is sender or receiver
      const messages = await prisma.message.findMany({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
        orderBy: {
          createdAt: 'desc',
        },
        distinct: ['conversationId'],
      });

      // For each conversation, get the last message and unread count
      const conversations = await Promise.all(
        messages.map(async (msg) => {
          const lastMessage = await prisma.message.findFirst({
            where: {
              conversationId: msg.conversationId,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });

          const unreadCount = await prisma.message.count({
            where: {
              conversationId: msg.conversationId,
              receiverId: userId,
              read: false,
            },
          });

          // Get participants from conversation ID
          const participants = msg.conversationId.split('_');

          return {
            id: msg.conversationId,
            participants,
            lastMessage: lastMessage?.message || '',
            lastMessageTime: lastMessage?.createdAt || new Date(),
            unreadCount,
          };
        }),
      );

      return conversations;
    } catch (error) {
      this.logger.error('Error getting conversations by user:', error);
      throw new Error('Failed to retrieve conversations');
    }
  }

  /**
   * Mark all messages in a conversation as read for a user
   */
  async markConversationAsRead(conversationId: string, userId: string): Promise<void> {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: userId,
          read: false,
        },
        data: {
          read: true,
        },
      });

      this.logger.log(`Marked conversation ${conversationId} as read for user ${userId}`);
    } catch (error) {
      this.logger.error('Error marking conversation as read:', error);
      throw new Error('Failed to mark conversation as read');
    }
  }
}
