import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { authenticateToken } from '../../auth-service/middleware/auth.middleware';
import { asyncHandler } from '../../shared';

const router = Router();
const chatController = new ChatController();

// All routes require authentication
router.use(authenticateToken);

// GET /chat/conversations/:userId - Get all conversations for a user
router.get('/conversations/:userId', asyncHandler(chatController.getConversations));

// GET /chat/messages/:conversationId - Get messages for a conversation
router.get('/messages/:conversationId', asyncHandler(chatController.getMessages));

// PATCH /chat/conversations/:conversationId/read - Mark conversation as read
router.patch('/conversations/:conversationId/read', asyncHandler(chatController.markConversationAsRead));

export default router;
