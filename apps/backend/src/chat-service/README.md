# Chat Service

Real-time messaging service for TutorGo platform using Socket.IO, PostgreSQL, and Redis.

## Features

- ✅ Real-time messaging via WebSocket (Socket.IO)
- ✅ JWT authentication for WebSocket connections
- ✅ Booking validation (users must have confirmed booking to chat)
- ✅ Message persistence in PostgreSQL
- ✅ Online/offline status tracking with Redis
- ✅ Message queuing for offline users
- ✅ Unread message count tracking
- ✅ Message history retrieval with pagination
- ✅ Conversation management
- ✅ REST API for message history

## Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ WebSocket (Socket.IO)
       │ + JWT Auth
       ▼
┌─────────────────────────────┐
│     Chat Service            │
│  ┌──────────────────────┐   │
│  │  Socket.IO Server    │   │
│  │  + Auth Middleware   │   │
│  └──────────┬───────────┘   │
│             │                │
│  ┌──────────▼───────────┐   │
│  │   Socket Service     │   │
│  │  - Connection Mgmt   │   │
│  │  - Room Management   │   │
│  │  - Message Routing   │   │
│  └──────────┬───────────┘   │
│             │                │
│  ┌──────────▼───────────┐   │
│  │  Message Service     │   │
│  │  - Booking Validation│   │
│  │  - Message CRUD      │   │
│  │  - History Retrieval │   │
│  └──────────┬───────────┘   │
│             │                │
│  ┌──────────▼───────────┐   │
│  │   Redis Service      │   │
│  │  - Online Status     │   │
│  │  - Message Queue     │   │
│  │  - Unread Counts     │   │
│  └──────────────────────┘   │
└─────────────────────────────┘
       │              │
       ▼              ▼
┌────────────┐  ┌──────────┐
│ PostgreSQL │  │  Redis   │
│ (Messages) │  │ (Status) │
└────────────┘  └──────────┘
```

## Installation

```bash
npm install
```

## Environment Variables

```env
CHAT_SERVICE_PORT=3006
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your-secret-key
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgresql://user:password@localhost:5432/tutorgo
```

## Running the Service

```bash
# Development
npm run dev:chat

# Production
npm start
```

## WebSocket Events

### Client → Server

#### `send-message`

Send a new message to another user.

```typescript
socket.emit('send-message', {
  conversationId: 'user1_user2',
  receiverId: 'user-456',
  message: 'Hello, how are you?',
});
```

#### `join-conversation`

Join a conversation room to receive messages.

```typescript
socket.emit('join-conversation', 'user1_user2');
```

#### `leave-conversation`

Leave a conversation room.

```typescript
socket.emit('leave-conversation', 'user1_user2');
```

### Server → Client

#### `connected`

Sent when client successfully connects.

```typescript
socket.on('connected', (data) => {
  console.log('Connected:', data);
  // {
  //   userId: 'user-123',
  //   socketId: 'abc123',
  //   timestamp: '2024-01-01T00:00:00.000Z',
  //   queuedMessages: [...],
  //   unreadCount: 5
  // }
});
```

#### `message-sent`

Confirmation that message was sent successfully.

```typescript
socket.on('message-sent', (message) => {
  console.log('Message sent:', message);
});
```

#### `new-message`

Receive a new message from another user.

```typescript
socket.on('new-message', (message) => {
  console.log('New message:', message);
  // {
  //   id: 'msg-123',
  //   conversationId: 'user1_user2',
  //   senderId: 'user-456',
  //   message: 'Hello!',
  //   timestamp: '2024-01-01T00:00:00.000Z',
  //   read: false
  // }
});
```

#### `user-online` / `user-offline`

Broadcast when users come online or go offline.

```typescript
socket.on('user-online', ({ userId }) => {
  console.log(`${userId} is now online`);
});

socket.on('user-offline', ({ userId }) => {
  console.log(`${userId} is now offline`);
});
```

#### `error`

Error messages from the server.

```typescript
socket.on('error', ({ message }) => {
  console.error('Error:', message);
});
```

## REST API Endpoints

### GET /chat/conversations/:userId

Get all conversations for a user.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
[
  {
    "id": "user1_user2",
    "participants": ["user1", "user2"],
    "lastMessage": "Hello!",
    "lastMessageTime": "2024-01-01T00:00:00.000Z",
    "unreadCount": 3
  }
]
```

### GET /chat/messages/:conversationId

Get messages for a conversation with pagination.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `limit` (optional, default: 50) - Number of messages to retrieve
- `offset` (optional, default: 0) - Offset for pagination

**Response:**

```json
[
  {
    "id": "msg-123",
    "conversationId": "user1_user2",
    "senderId": "user1",
    "receiverId": "user2",
    "message": "Hello!",
    "read": false,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### PATCH /chat/conversations/:conversationId/read

Mark all messages in a conversation as read.

**Headers:**

```
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Conversation marked as read"
}
```

## Client Example

```typescript
import { io } from 'socket.io-client';

// Connect with JWT token
const socket = io('http://localhost:3006', {
  auth: {
    token: 'your-jwt-token',
  },
});

// Listen for connection
socket.on('connected', (data) => {
  console.log('Connected:', data);

  // Join conversation
  socket.emit('join-conversation', 'user1_user2');
});

// Listen for new messages
socket.on('new-message', (message) => {
  console.log('New message:', message);
});

// Send a message
socket.emit('send-message', {
  conversationId: 'user1_user2',
  receiverId: 'user-456',
  message: 'Hello!',
});

// Listen for errors
socket.on('error', ({ message }) => {
  console.error('Error:', message);
});
```

## Testing

```bash
# Run all tests
npm test -- apps/backend/src/chat-service/__tests__

# Run specific test file
npm test -- apps/backend/src/chat-service/__tests__/socket.service.spec.ts

# Run with coverage
npm run test:cov
```

## Security

- All WebSocket connections require JWT authentication
- Users can only chat with others they have confirmed bookings with
- Users can only access their own conversations
- Message content is validated before storage
- Rate limiting should be implemented in production

## Performance Considerations

- Redis is used for ephemeral data (online status, message queues)
- PostgreSQL is used for permanent message storage
- Message history is paginated to avoid large data transfers
- Socket.IO rooms are used for efficient message broadcasting
- Connection pooling for database connections

## Troubleshooting

### WebSocket connection fails

- Check JWT token is valid and not expired
- Verify CORS settings allow your frontend origin
- Ensure WebSocket port (3006) is accessible

### Messages not being delivered

- Verify users have a confirmed booking
- Check Redis connection is working
- Ensure receiver is in the correct conversation room

### High memory usage

- Check for memory leaks in connection handlers
- Monitor Redis memory usage
- Implement connection limits

## Future Enhancements

- Message encryption
- File/image sharing
- Typing indicators
- Read receipts
- Message reactions
- Group chat support
- Voice/video calls
- Message search
- Message editing/deletion
