# API Integration Fixes - Summary

## Problem Identified

The frontend was experiencing **404 errors** when trying to fetch data because:

1. **Missing API Gateway**: The application is built as microservices, but all requests were going to a single port (3001), which only had the Auth Service running.
2. **Port Conflicts**: Services had conflicting port assignments:
   - Auth Service was on 3001 (where frontend expects the gateway)
   - Review Service and Chat Service both on 3006
   - Admin Service and Notification Service both on 3007
3. **Missing Authentication**: Some services didn't have authentication middleware properly applied to protected routes.
4. **Inconsistent HTTP Client**: The chat hook was using axios directly instead of the apiClient, bypassing authentication token injection.

## Solutions Implemented

### 1. Created API Gateway (apps/backend/src/gateway/index.ts)

- **Purpose**: Acts as a single entry point for all frontend requests
- **Port**: 3001 (same port frontend expects)
- **Functionality**: Routes requests to appropriate microservices using HTTP proxying

**Route Mapping**:

```
/auth          → Auth Service (3000)
/tutors        → Tutor Service (3002)
/bookings      → Booking Service (3003)
/payments      → Payment Service (3004)
/reviews       → Review Service (3005)
/chat          → Chat Service (3006)
/admin         → Admin Service (3008)
/notifications → Notification Service (3007)
```

### 2. Fixed Port Assignments

| Service        | Original Port | New Port | Reason                            |
| -------------- | ------------- | -------- | --------------------------------- |
| Auth Service   | 3001          | **3000** | Free up 3001 for gateway          |
| Review Service | 3006          | **3005** | Avoid conflict with Chat          |
| Admin Service  | 3007          | **3008** | Avoid conflict with Notifications |

**Changes Made**:

- `apps/backend/src/auth-service/index.ts`: PORT 3001 → 3000
- `apps/backend/src/review-service/index.ts`: PORT 3006 → 3005
- `apps/backend/src/admin-service/index.ts`: PORT 3007 → 3008

### 3. Added Authentication Middleware

Added `authenticateToken` middleware to protected routes in:

#### Booking Service (apps/backend/src/booking-service/routes/booking.routes.ts)

- ✅ POST /bookings
- ✅ GET /bookings/:id
- ✅ GET /bookings/user/:userId
- ✅ PATCH /bookings/:id/status
- ✅ PATCH /bookings/:id/cancel

#### Notification Service (apps/backend/src/notification-service/routes/notification.routes.ts)

- ✅ GET /notifications/:userId
- ✅ PATCH /notifications/:id/read

#### Review Service (apps/backend/src/review-service/routes/review.routes.ts)

- ✅ POST /reviews (create - requires auth)
- ✅ GET /reviews/tutor/:tutorId (public - no auth)
- ✅ PATCH /reviews/:reviewId/flag (flag - requires auth)

### 4. Fixed Frontend HTTP Client Usage

**File**: `apps/frontend/src/hooks/use-chat.ts`

**Issue**: Was using `axios` directly instead of `apiClient`, bypassing JWT token injection

**Solution**:

- Replaced `axios` with `apiClient` for consistency
- Updated API base URL from hardcoded value to use consistent gateway URL
- Updated SOCKET_URL to port 3006 (Chat Service)

```typescript
// Before
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
await axios.get(`${API_BASE_URL}/chat/conversations/${userId}`);

// After
await apiClient.get<Conversation[]>(`/chat/conversations/${userId}`);
```

### 5. Updated NPM Scripts

**File**: `apps/backend/package.json`

Added new scripts:

```json
{
  "dev": "concurrently \"npm run dev:gateway\" \"npm run dev:auth\" ...",
  "dev:gateway": "ts-node-dev --respawn --transpile-only src/gateway/index.ts",
  "dev:auth": "ts-node-dev --respawn --transpile-only src/auth-service/index.ts",
  "dev:tutor": "ts-node-dev --respawn --transpile-only src/tutor-service/index.ts",
  "dev:booking": "ts-node-dev --respawn --transpile-only src/booking-service/index.ts",
  "dev:payment": "ts-node-dev --respawn --transpile-only src/payment-service/index.ts",
  "dev:chat": "ts-node-dev --respawn --transpile-only src/chat-service/index.ts",
  "dev:notification": "ts-node-dev --respawn --transpile-only src/notification-service/index.ts",
  "dev:review": "ts-node-dev --respawn --transpile-only src/review-service/index.ts",
  "dev:admin": "ts-node-dev --respawn --transpile-only src/admin-service/index.ts"
}
```

### 6. Added Dependencies

**File**: `apps/backend/package.json`

Added `express-http-proxy@^1.6.14` for HTTP request proxying.

### 7. Created Documentation

**Files Created**:

- `API_GATEWAY_ARCHITECTURE.md`: Comprehensive architecture documentation
- `apps/backend/.env.example`: Environment variable template

## Frontend API Endpoints - All Fixed

### Dashboard Page (`/dashboard`)

- ✅ `GET /tutors/search` - Fetch available teachers
- ✅ `GET /bookings/user/:userId` - Fetch user's completed bookings
- ✅ `GET /chat/conversations/:userId` - Fetch conversations

### Search Page (`/search`)

- ✅ `GET /tutors/search?subject=...&minRate=...` - Search tutors with filters

### Tutor Profile Page (`/tutors/[id]`)

- ✅ `GET /tutors/:id` - Fetch tutor profile
- ✅ `GET /reviews/tutor/:tutorId` - Fetch tutor reviews

### Chat Page (`/chat`)

- ✅ `GET /chat/conversations/:userId` - Fetch conversations
- ✅ `GET /chat/messages/:conversationId` - Fetch messages
- ✅ WebSocket connection to Chat Service (port 3006)

### Auth Pages (`/auth/login`, `/auth/register`)

- ✅ `POST /auth/login` - User login
- ✅ `POST /auth/register` - User registration
- ✅ `GET /auth/me` - Get current user
- ✅ `PATCH /auth/profile` - Update user profile
- ✅ `POST /auth/refresh` - Refresh access token

### Admin Dashboard (`/admin`)

- ✅ `GET /admin/metrics` - Admin metrics
- ✅ `GET /admin/activity` - Recent activity
- ✅ `GET /admin/revenue` - Revenue data
- ✅ `GET /admin/bookings` - Bookings data

### Tutor Dashboard (`/dashboard/tutor`)

- ✅ `GET /bookings/user/:tutorId` - Tutor's sessions
- ✅ `GET /tutors/profile` - Tutor's profile
- ✅ `GET /tutors/:id/availability` - Tutor's availability

## How to Run the Application

### Prerequisites

```bash
npm install
cd apps/backend
npm install
cd ../frontend
npm install
```

### Start All Services at Once

From `apps/backend` directory:

```bash
npm run dev
```

This will start:

1. API Gateway (port 3001)
2. Auth Service (port 3000)
3. Tutor Service (port 3002)
4. Booking Service (port 3003)
5. Payment Service (port 3004)
6. Review Service (port 3005)
7. Chat Service (port 3006)
8. Notification Service (port 3007)
9. Admin Service (port 3008)

### Start Individual Services

```bash
npm run dev:gateway      # API Gateway
npm run dev:auth        # Auth Service
npm run dev:tutor       # Tutor Service
npm run dev:booking     # Booking Service
npm run dev:payment     # Payment Service
npm run dev:review      # Review Service
npm run dev:chat        # Chat Service
npm run dev:notification # Notification Service
npm run dev:admin       # Admin Service
```

### Start Frontend

From `apps/frontend` directory:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Verification Steps

### 1. Check Gateway is Running

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "success": true,
  "message": "Success",
  "data": {
    "service": "api-gateway",
    "timestamp": "...",
    "uptime": ...
  }
}
```

### 2. Check Individual Services

```bash
curl http://localhost:3000/health     # Auth
curl http://localhost:3002/health     # Tutor
curl http://localhost:3003/health     # Booking
curl http://localhost:3004/health     # Payment
curl http://localhost:3005/health     # Review
curl http://localhost:3006/health     # Chat
curl http://localhost:3007/health     # Notification
curl http://localhost:3008/health     # Admin
```

### 3. Test a Protected Route (requires valid token)

```bash
# First login to get a token
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Use the token for protected endpoints
curl http://localhost:3001/bookings/user/USER_ID \
  -H "Authorization: Bearer TOKEN"
```

### 4. Dashboard Should Load Without Errors

- Navigate to `http://localhost:3000/dashboard`
- Should see "Available Teachers", "Booking History", and "Recent Conversations" sections
- No 404 errors in browser console

## Error Handling

If you see a 503 error:

```json
{
  "success": false,
  "message": "Service X is unavailable",
  "error": "..."
}
```

This means the gateway is running but the target service is down. Make sure all services are running with `npm run dev` or check individual service status.

## Common Issues & Solutions

### Issue: EADDRINUSE Port already in use

**Solution**: Kill the process on that port or change the port in .env:

```bash
# Windows
netstat -ano | findstr :PORT_NUMBER
taskkill /PID PID_NUMBER /F

# macOS/Linux
lsof -ti:PORT_NUMBER | xargs kill -9
```

### Issue: "Cannot find module" errors

**Solution**: Make sure all dependencies are installed:

```bash
cd apps/backend
npm install
npm install express-http-proxy
```

### Issue: JWT token validation failing

**Solution**: Ensure JWT_SECRET is set in `.env`:

```
JWT_SECRET=your-secret-key-change-in-production
```

### Issue: CORS errors

**Solution**: Verify CORS is configured properly. Check `apps/backend/src/shared/config/cors.config.ts` to ensure frontend URL is in allowed origins.

## Next Steps

1. **Implement Load Balancing**: Add multiple instances of each service with load balancing
2. **Add Circuit Breaker**: Implement circuit breaker pattern for fault tolerance
3. **Add Caching**: Use Redis caching for frequently accessed data
4. **Add Rate Limiting**: Implement rate limiting to prevent abuse
5. **Add Monitoring**: Set up Prometheus/Grafana for metrics and monitoring
6. **Add Distributed Tracing**: Implement Jaeger for request tracing
7. **Production Deployment**: Use Docker and Kubernetes for containerization and orchestration

## Files Modified

1. ✅ `apps/backend/src/auth-service/index.ts` - Changed port from 3001 to 3000
2. ✅ `apps/backend/src/review-service/index.ts` - Changed port from 3006 to 3005
3. ✅ `apps/backend/src/admin-service/index.ts` - Changed port from 3007 to 3008
4. ✅ `apps/backend/src/booking-service/routes/booking.routes.ts` - Added authentication middleware
5. ✅ `apps/backend/src/notification-service/routes/notification.routes.ts` - Added authentication middleware
6. ✅ `apps/backend/src/review-service/routes/review.routes.ts` - Added authentication middleware
7. ✅ `apps/frontend/src/hooks/use-chat.ts` - Switched from axios to apiClient
8. ✅ `apps/backend/package.json` - Added gateway script and express-http-proxy
9. ✅ `apps/backend/src/gateway/index.ts` - Created new API Gateway service
10. ✅ `API_GATEWAY_ARCHITECTURE.md` - Created comprehensive documentation

## Support

For issues or questions, refer to:

- `API_GATEWAY_ARCHITECTURE.md` for architecture details
- `.env.example` for environment configuration
- Individual service README files in their respective directories
