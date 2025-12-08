# API Gateway Architecture

## Overview

This application uses a **microservices architecture** with an **API Gateway** pattern. The API Gateway acts as a single entry point for all client requests and routes them to the appropriate backend services.

## Architecture Diagram

```
Frontend (http://localhost:3000)
         ↓
API Gateway (http://localhost:3001)
         ↓
    ┌────────────────────────────────────────────┐
    │                                            │
    ├─ Auth Service (3000)                      │
    ├─ Tutor Service (3002)                     │
    ├─ Booking Service (3003)                   │
    ├─ Payment Service (3004)                   │
    ├─ Review Service (3005)                    │
    ├─ Chat Service (3006)                      │
    ├─ Notification Service (3007)              │
    └─ Admin Service (3008)                     │
```

## Service Configuration

### Port Assignments

| Service              | Port | Default Port | Purpose                                             |
| -------------------- | ---- | ------------ | --------------------------------------------------- |
| API Gateway          | 3001 | 3001         | Routes all client requests                          |
| Auth Service         | 3000 | 3001 → 3000  | User authentication, registration, token management |
| Tutor Service        | 3002 | 3002         | Tutor profiles, search, availability                |
| Booking Service      | 3003 | 3003         | Session bookings, reservations                      |
| Payment Service      | 3004 | 3004         | Payment processing (Stripe, etc.)                   |
| Review Service       | 3005 | 3006 → 3005  | Reviews and ratings                                 |
| Chat Service         | 3006 | 3006         | Real-time messaging with WebSockets                 |
| Notification Service | 3007 | 3007         | Notifications (email, push, in-app)                 |
| Admin Service        | 3008 | 3007 → 3008  | Admin dashboard and management                      |

## Route Mapping

The API Gateway maps frontend requests to the appropriate services:

### Auth Routes

```
POST   /auth/login          → Auth Service (3000)
POST   /auth/register       → Auth Service (3000)
POST   /auth/refresh        → Auth Service (3000)
GET    /auth/me            → Auth Service (3000)
PATCH  /auth/profile       → Auth Service (3000)
```

### Tutor Routes

```
GET    /tutors/search      → Tutor Service (3002)
GET    /tutors/:id         → Tutor Service (3002)
GET    /tutors/:id/availability  → Tutor Service (3002)
POST   /tutors/profile     → Tutor Service (3002)
PUT    /tutors/profile     → Tutor Service (3002)
GET    /tutors/profile     → Tutor Service (3002)
```

### Booking Routes

```
POST   /bookings           → Booking Service (3003)
GET    /bookings/:id       → Booking Service (3003)
GET    /bookings/user/:userId  → Booking Service (3003)
PATCH  /bookings/:id/status    → Booking Service (3003)
PATCH  /bookings/:id/cancel    → Booking Service (3003)
```

### Payment Routes

```
POST   /payments/process   → Payment Service (3004)
GET    /payments/:id       → Payment Service (3004)
```

### Chat Routes

```
GET    /chat/conversations/:userId  → Chat Service (3006)
GET    /chat/messages/:conversationId  → Chat Service (3006)
PATCH  /chat/conversations/:conversationId/read  → Chat Service (3006)
```

### Review Routes

```
POST   /reviews           → Review Service (3005)
GET    /reviews/tutor/:tutorId  → Review Service (3005)
PATCH  /reviews/:reviewId/flag  → Review Service (3005)
```

### Admin Routes

```
GET    /admin/metrics     → Admin Service (3008)
GET    /admin/activity    → Admin Service (3008)
GET    /admin/revenue     → Admin Service (3008)
GET    /admin/bookings    → Admin Service (3008)
GET    /admin/users       → Admin Service (3008)
PATCH  /admin/users/:id/suspend  → Admin Service (3008)
```

### Notification Routes

```
GET    /notifications/:userId  → Notification Service (3007)
PATCH  /notifications/:id/read → Notification Service (3007)
```

## Frontend Configuration

The frontend is configured to use `http://localhost:3001` as the API URL:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
```

This ensures all API requests go through the gateway.

## Starting the Services

### Development Mode

Start each service in a separate terminal:

```bash
# Terminal 1: API Gateway
cd apps/backend
npm run dev:gateway

# Terminal 2: Auth Service
npm run dev:auth

# Terminal 3: Tutor Service
npm run dev:tutor

# Terminal 4: Booking Service
npm run dev:booking

# Terminal 5: Payment Service
npm run dev:payment

# Terminal 6: Review Service
npm run dev:review

# Terminal 7: Chat Service
npm run dev:chat

# Terminal 8: Notification Service
npm run dev:notification

# Terminal 9: Admin Service
npm run dev:admin

# Terminal 10: Frontend
cd apps/frontend
npm run dev
```

Or use a process manager like `concurrently` or `pm2` for easier management.

### Docker Compose

You can also add the services to `docker-compose.yml` for containerized deployment:

```yaml
gateway:
  build: ./apps/backend
  command: npm run dev:gateway
  ports:
    - '3001:3001'
  depends_on:
    - auth
    - tutor
    - booking
  environment:
    - GATEWAY_PORT=3001
    - AUTH_SERVICE_URL=http://auth:3000
    # ... other services

auth:
  build: ./apps/backend
  command: npm run dev:auth
  ports:
    - '3000:3000'
  depends_on:
    - postgres
    - redis
```

## Authentication Flow

1. User logs in via frontend
2. Frontend sends credentials to `/auth/login`
3. Gateway routes to Auth Service (3000)
4. Auth Service returns JWT tokens
5. Frontend stores tokens in localStorage/cookies
6. For protected routes, frontend includes `Authorization: Bearer <token>` header
7. Gateway forwards request to appropriate service
8. Service validates token with Auth middleware
9. If valid, request proceeds; if invalid, returns 401 Unauthorized

## Error Handling

If a service is unavailable, the gateway returns:

```json
{
  "success": false,
  "message": "[Service Name] is unavailable",
  "error": "error message"
}
```

Status code: 503 Service Unavailable

## Debugging

### Enable Gateway Logging

Set environment variable:

```bash
DEBUG=api-gateway:*
```

### Health Checks

Check if each service is running:

```bash
curl http://localhost:3001/health        # Gateway
curl http://localhost:3000/health        # Auth
curl http://localhost:3002/health        # Tutor
curl http://localhost:3003/health        # Booking
```

## Security Considerations

1. **Authentication**: All protected routes require JWT authentication
2. **CORS**: Configured to allow frontend origin
3. **Rate Limiting**: Can be added to gateway for DDoS protection
4. **API Key Validation**: Can be added for inter-service communication
5. **Request Logging**: Gateway logs all requests for debugging and auditing

## Future Improvements

1. Add rate limiting to gateway
2. Add caching layer (Redis) for frequently accessed data
3. Add request/response compression
4. Add circuit breaker pattern for fault tolerance
5. Add metrics collection (Prometheus/Grafana)
6. Add distributed tracing (Jaeger)
7. Implement load balancing across service replicas
