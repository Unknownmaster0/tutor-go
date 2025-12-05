# Chat Service Implementation Summary

## Overview

The Chat Service provides real-time messaging functionality between students and tutors using Socket.IO for WebSocket connections, PostgreSQL for message persistence, and Redis for online/offline status tracking and message queuing.

## Completed Tasks

### ✅ Task 9.1: Set up Socket.io server

- Implemented Socket.IO server with JWT authentication middleware
- Created `socketAuthMiddleware` to validate JWT tokens from WebSocket handshake
- Implemented `SocketService` to manage connections, rooms, and user tracking
- Added connection/disconnection handlers
- Implemented conversation room management (join/leave)
- **Tests**: 23 unit tests passing (socket-auth.middleware.spec.ts, socket.service.spec.ts)

### ✅ Task 9.2: Implement real-time message sending

- Created `MessageService` for database operations
- Implemented booking validation before allowing chat (users must have confirmed booking)
- Added real-time message sending via Socket.IO events
- Implemented message persistence in PostgreSQL
- Added message validation (empty messages, required fields)
- Emit messages to sender, receiver, and conversation room
- **Tests**: 21 unit tests passing (message.service.spec.ts, message-sending.spec.ts)

### ✅ Task 9.3: Implement message history retrieval

- Created REST API endpoints for message history
- Implemented `GET /chat/conversations/:userId` - Get all conversations for a user
- Implemented `GET /chat/messages/:conversationId` - Get messages with pagination
- Implemented `PATCH /chat/conversations/:conversationId/read` - Mark conversation as read
- Added authorization checks (users can only access their own conversations)
- Created `ChatController` with proper error handling
- **Tests**: 19 unit tests passing (message-history.spec.ts, chat.controller.spec.ts)

### ✅ Task 9.4: Implement online/offline status and notifications

- Created `RedisService` for online/offline status tracking
- Implemented user online status management (set online/offline)
- Added message queuing for offline users
- Implemented unread message count tracking
- Broadcast online/offline status to connected users
- Deliver queued messages when user comes online
- **Tests**: 27 unit tests passing (redis.service.spec.ts, online-status.spec.ts)

## Architecture

### Components

#### 1. Socket.IO Server (`index.ts`)

- HTTP server with Socket.IO integration
- JWT authentication middleware
- CORS configuration for frontend
- Health check endpoints

#### 2. Authentication Middleware (`middleware/socket-auth.middleware.ts`)

- Validates JWT tokens from WebSocket handshake
- Supports token in `auth` object or `Authorization` header
- Attaches user information to socket

#### 3. Socket Service (`services/socket.service.ts`)

- Manages WebSocket connections
- Tracks connected users (in-memory Map + Redis)
- Handles conversation room management
- Processes message sending events
- Manages online/offline status broadcasts

#### 4. Message Service (`services/message.service.ts`)

- Validates booking exists before allowing chat
- Creates and stores messages in PostgreSQL
- Retrieves message history with pagination
- Gets conversations for a user
- Marks messages/conversations as read
- Generates consistent conversation IDs

#### 5. Redis Service (`services/redis.service.ts`)

- Tracks user online/offline status
- Stores socket ID mappings
- Queues messages for offline users
- Manages unread message counts
- TTL-based expiration for all keys

#### 6. Chat Controller (`controllers/chat.controller.ts`)

- REST API endpoints for message history
- Authorization checks
- Error handling

### Data Flow

#### Message Sending Flow

1. Client emits `send-message` event via Socket.IO
2. Server validates JWT authentication
3. Check if users have confirmed booking
4. Validate message content
5. Save message to PostgreSQL
6. Check if receiver is online (Redis)
7. If online: emit to receiver in real-time
8. If offline: queue message in Redis
9. Increment unread count in Redis
10. Emit to conversation room
11. Send confirmation to sender

#### Connection Flow

1. Client connects with JWT token
2. Authenticate via `socketAuthMiddleware`
3. Set user as online in Redis
4. Join user to personal room
5. Retrieve queued messages from Redis
6. Get unread count from Redis
7. Send connection confirmation with queued messages
8. Broadcast online status to other users

#### Disconnection Flow

1. User disconnects
2. Remove from connected users map
3. Set user as offline in Redis
4. Broadcast offline status to other users

## Database Schema

### Messages Table (PostgreSQL)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES users(id),
  receiver_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_receiver ON messages(receiver_id);
```

### Redis Keys

- `user:{userId}:status` - Online/offline status (TTL: 1 hour online, 24 hours offline)
- `user:{userId}:socket` - Socket ID mapping (TTL: 1 hour)
- `user:{userId}:offline_messages` - Queued messages (TTL: 7 days)
- `user:{userId}:unread_count` - Unread message count (TTL: 7 days)

## API Endpoints

### WebSocket Events

#### Client → Server

- `send-message` - Send a new message
  ```typescript
  {
    conversationId: string;
    receiverId: string;
    message: string;
  }
  ```
- `join-conversation` - Join a conversation room
- `leave-conversation` - Leave a conversation room

#### Server → Client

- `connected` - Connection confirmation with queued messages
  ```typescript
  {
    userId: string;
    socketId: string;
    timestamp: string;
    queuedMessages: Message[];
    unreadCount: number;
  }
  ```
- `message-sent` - Message send confirmation
- `new-message` - New message received
- `message` - Message in conversation room
- `user-online` - User came online
- `user-offline` - User went offline
- `error` - Error message

### REST API

#### GET /chat/conversations/:userId

Get all conversations for a user.

- **Auth**: Required (JWT)
- **Authorization**: User can only access their own conversations
- **Response**: Array of conversations with last message and unread count

#### GET /chat/messages/:conversationId

Get messages for a conversation with pagination.

- **Auth**: Required (JWT)
- **Authorization**: User must be participant in conversation
- **Query Params**: `limit` (default: 50), `offset` (default: 0)
- **Response**: Array of messages ordered by creation date (desc)

#### PATCH /chat/conversations/:conversationId/read

Mark all messages in a conversation as read.

- **Auth**: Required (JWT)
- **Response**: Success message

## Testing

### Test Coverage

- **Total Tests**: 90 unit tests
- **Test Files**: 7 test files
- **Coverage**: All major functionality covered

### Test Files

1. `socket-auth.middleware.spec.ts` - JWT authentication (7 tests)
2. `socket.service.spec.ts` - Socket connection management (16 tests)
3. `message.service.spec.ts` - Message database operations (12 tests)
4. `message-sending.spec.ts` - Real-time message sending (9 tests)
5. `message-history.spec.ts` - Message history retrieval (8 tests)
6. `chat.controller.spec.ts` - REST API endpoints (11 tests)
7. `redis.service.spec.ts` - Redis operations (19 tests)
8. `online-status.spec.ts` - Online/offline status (8 tests)

## Requirements Fulfilled

### Requirement 7.1: Enable chat interface for confirmed bookings ✅

- Validates booking exists before allowing chat
- Only users with confirmed bookings can message each other

### Requirement 7.2: Real-time message delivery ✅

- Socket.IO for real-time communication
- Messages delivered instantly to online users
- Messages stored in database for persistence

### Requirement 7.3: Notification indicators ✅

- Unread count tracked in Redis
- Real-time notification when new message arrives
- Broadcast online/offline status

### Requirement 7.4: Message history ✅

- REST API to retrieve message history
- Pagination support
- Conversation list with last message

### Requirement 7.5: Offline message queuing ✅

- Messages queued in Redis for offline users
- Delivered when user comes online
- TTL-based expiration (7 days)

## Environment Variables

```env
CHAT_SERVICE_PORT=3006
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/tutorgo
```

## Dependencies

### Production

- `socket.io` - WebSocket server
- `express` - HTTP server
- `jsonwebtoken` - JWT authentication
- `redis` - Redis client
- `@prisma/client` - PostgreSQL ORM

### Development

- `@types/socket.io` - TypeScript types
- `jest` - Testing framework
- `ts-jest` - TypeScript Jest transformer

## Future Enhancements

1. **Message Encryption**: End-to-end encryption for messages
2. **File Sharing**: Support for sending images/files
3. **Typing Indicators**: Show when user is typing
4. **Message Reactions**: Allow users to react to messages
5. **Message Search**: Full-text search across messages
6. **Read Receipts**: Show when messages are read
7. **Group Chat**: Support for multi-user conversations
8. **Voice/Video**: WebRTC integration for calls
9. **Message Editing**: Allow users to edit sent messages
10. **Message Deletion**: Soft delete with retention policy

## Notes

- All WebSocket connections require JWT authentication
- Users can only chat with others they have confirmed bookings with
- Messages are stored permanently in PostgreSQL
- Redis is used for ephemeral data (status, queues, counts)
- Conversation IDs are generated deterministically from user IDs
- All async operations have proper error handling
- Tests mock all external dependencies (database, Redis, Socket.IO)
