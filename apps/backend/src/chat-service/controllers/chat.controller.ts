import { Request, Response } from 'express';
import { MessageService } from '../services/message.service';
import { ApiResponse, Logger } from '../../shared';
import { AuthRequest } from '../../auth-service/middleware/auth.middleware';

export class ChatController {
  private messageService: MessageService;
  private logger: Logger;

  constructor() {
    this.messageService = new MessageService();
    this.logger = new Logger('ChatController');
  }

  /**
   * GET /chat/conversations/:userId
   * Get all conversations for a user
   */
  getConversations = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const authenticatedUser = (req as AuthRequest).user;

      // Ensure user can only access their own conversations
      if (authenticatedUser?.userId !== userId) {
        ApiResponse.error(res, 'Unauthorized access', 403);
        return;
      }

      const conversations = await this.messageService.getConversationsByUser(userId);

      ApiResponse.success(res, conversations, 'Conversations retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting conversations:', error);
      ApiResponse.error(res, 'Failed to retrieve conversations', 500);
    }
  };

  /**
   * GET /chat/messages/:conversationId
   * Get messages for a conversation with pagination
   */
  getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const { limit = '50', offset = '0' } = req.query;

      const authenticatedUser = (req as AuthRequest).user;

      if (!authenticatedUser) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      // Verify user is part of the conversation
      const participants = conversationId.split('_');
      if (!participants.includes(authenticatedUser.userId)) {
        ApiResponse.error(res, 'Unauthorized access to conversation', 403);
        return;
      }

      const messages = await this.messageService.getMessagesByConversation(
        conversationId,
        parseInt(limit as string),
        parseInt(offset as string)
      );

      ApiResponse.success(res, messages, 'Messages retrieved successfully');
    } catch (error) {
      this.logger.error('Error getting messages:', error);
      ApiResponse.error(res, 'Failed to retrieve messages', 500);
    }
  };

  /**
   * PATCH /chat/conversations/:conversationId/read
   * Mark all messages in a conversation as read
   */
  markConversationAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const authenticatedUser = (req as AuthRequest).user;

      if (!authenticatedUser) {
        ApiResponse.error(res, 'Unauthorized', 401);
        return;
      }

      await this.messageService.markConversationAsRead(conversationId, authenticatedUser.userId);

      ApiResponse.success(res, null, 'Conversation marked as read');
    } catch (error) {
      this.logger.error('Error marking conversation as read:', error);
      ApiResponse.error(res, 'Failed to mark conversation as read', 500);
    }
  };
}
