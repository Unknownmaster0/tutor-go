# Redis Module

Shared Redis client module for TutorGo platform with connection management, caching, and session storage capabilities.

## Features

- **Connection Management**: Automatic connection with retry logic and exponential backoff
- **Connection Pooling**: Efficient connection reuse
- **Caching**: Generic caching operations with TTL support
- **Session Storage**: JWT refresh token storage and management
- **Cache Invalidation**: Pattern-based cache invalidation
- **Type Safety**: Full TypeScript support

## Configuration

Set the following environment variables:

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_RETRY_ATTEMPTS=5
REDIS_RETRY_DELAY=1000
REDIS_KEY_PREFIX=tutorgo:
```

## Usage

### Basic Connection

```typescript
import { connectRedis, disconnectRedis, redisClient } from '@/shared/redis';

// Connect to Redis
await connectRedis();

// Check connection
if (redisClient.isConnected()) {
  console.log('Redis is connected');
}

// Disconnect when done
await disconnectRedis();
```

### Caching Operations

```typescript
import { redisClient } from '@/shared/redis';

// Set a value with TTL
await redisClient.set('user:123', { name: 'John', email: 'john@example.com' }, { ttl: 3600 });

// Get a value
const user = await redisClient.get('user:123');

// Delete a value
await redisClient.del('user:123');

// Check if key exists
const exists = await redisClient.exists('user:123');

// Set expiration
await redisClient.expire('user:123', 7200);

// Get TTL
const ttl = await redisClient.ttl('user:123');

// Delete by pattern
const deletedCount = await redisClient.delPattern('user:*');
```

### Session Management

```typescript
import { redisClient } from '@/shared/redis';

// Store a session (refresh token)
await redisClient.setSession(
  'token:abc123',
  {
    userId: '123',
    email: 'user@example.com',
    role: 'student',
  },
  { ttl: 7 * 24 * 60 * 60 },
); // 7 days

// Get a session
const session = await redisClient.getSession('token:abc123');

// Check if session exists
const exists = await redisClient.sessionExists('token:abc123');

// Delete a session (logout)
await redisClient.deleteSession('token:abc123');

// Revoke all sessions for a user
await redisClient.revokeUserSessions('userId:123');
```

### Cache Invalidation

```typescript
import { redisClient } from '@/shared/redis';

// Invalidate tutor search cache when profile is updated
await redisClient.invalidateCache('search:tutor:*');

// Invalidate specific tutor cache
await redisClient.invalidateCache(`tutor:${tutorId}:*`);
```

### Hash Operations

```typescript
import { redisClient } from '@/shared/redis';

// Store complex data as hash
await redisClient.hSet('tutor:123', 'profile', { name: 'John', bio: 'Expert tutor' });
await redisClient.hSet('tutor:123', 'stats', { rating: 4.5, reviews: 100 });

// Get a hash field
const profile = await redisClient.hGet('tutor:123', 'profile');

// Get all hash fields
const tutorData = await redisClient.hGetAll('tutor:123');

// Delete a hash field
await redisClient.hDel('tutor:123', 'stats');
```

## Testing

Unit tests are provided in the `__tests__` directory:

```bash
npm test -- redis
```

## Architecture

- `connection.ts`: Low-level Redis connection management with retry logic
- `client.ts`: High-level Redis client with caching and session utilities
- `types.ts`: TypeScript interfaces and types
- `index.ts`: Module exports and singleton instance

## Error Handling

The module includes comprehensive error handling:

- Connection failures trigger automatic retry with exponential backoff
- Parse errors are logged and return null
- All operations throw errors that should be caught by the calling code

## Best Practices

1. **Always use TTL**: Set appropriate TTL for cached data to prevent stale data
2. **Use prefixes**: Use the `prefix` option to organize cache keys
3. **Invalidate on updates**: Clear cache when underlying data changes
4. **Handle disconnections**: The client automatically reconnects on connection loss
5. **Use sessions for tokens**: Store JWT refresh tokens in Redis for revocation support
