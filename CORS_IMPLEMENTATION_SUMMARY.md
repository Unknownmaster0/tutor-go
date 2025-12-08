# CORS Implementation Summary

## Overview

This document outlines the CORS (Cross-Origin Resource Sharing) configuration implemented across all backend microservices to enable the frontend to communicate with backend services.

## What Was Done

### 1. Created Centralized CORS Configuration

**File**: `apps/backend/src/shared/config/cors.config.ts`

This file provides two configuration functions:

#### `getCorsConfig()`

Used for regular HTTP endpoints (Express middleware). Provides:

- **Allowed Origins**:
  - `FRONTEND_URL` environment variable (defaults to `http://localhost:3000`)
  - Local development origins: `localhost:3000-3007`, `127.0.0.1:3000`
  - Production origins (if configured via environment variables)
- **Allowed Methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Allowed Headers**: Content-Type, Authorization, X-Requested-With
- **Credentials**: ✅ Enabled (allows sending cookies and credentials)
- **Max Age**: 3600 seconds

#### `getSocketIoCorsConfig()`

Used for Socket.IO real-time connections. Provides:

- **Allowed Origin**: `FRONTEND_URL` environment variable
- **Methods**: GET, POST
- **Credentials**: ✅ Enabled

### 2. Updated All Backend Services

All 8 backend services now use the centralized CORS configuration:

| Service                  | Port | Update                                                                               |
| ------------------------ | ---- | ------------------------------------------------------------------------------------ |
| **Auth Service**         | 3001 | ✅ Updated with `getCorsConfig()`                                                    |
| **Tutor Service**        | 3002 | ✅ Updated with `getCorsConfig()`                                                    |
| **Booking Service**      | 3003 | ✅ Updated with `getCorsConfig()`                                                    |
| **Payment Service**      | 3004 | ✅ Updated with `getCorsConfig()`                                                    |
| **Chat Service**         | 3006 | ✅ Updated with `getCorsConfig()` for HTTP + `getSocketIoCorsConfig()` for Socket.IO |
| **Review Service**       | 3006 | ✅ Updated with `getCorsConfig()`                                                    |
| **Notification Service** | 3007 | ✅ Updated with `getCorsConfig()` for HTTP + `getSocketIoCorsConfig()` for Socket.IO |
| **Admin Service**        | 3007 | ✅ Updated with `getCorsConfig()`                                                    |

### 3. Updated Environment Configuration

**File**: `apps/backend/.env`

Added:

```env
# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

This environment variable is used by all services to determine which origin to accept requests from.

## How It Works

### Request Flow

```
Frontend (http://localhost:3000)
    ↓
Makes request to Backend Service (http://localhost:3001, 3002, etc.)
    ↓
Service checks CORS config via getCorsConfig()
    ↓
✅ Origin is in allowed list → Request allowed
✅ Credentials included → Processed correctly
```

### CORS Headers Sent in Response

When a frontend request is accepted, the backend responds with:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With
Access-Control-Allow-Credentials: true
```

## Development Setup

1. **Frontend** runs on: `http://localhost:3000`
2. **Backend Services** run on: `http://localhost:3001-3007`
3. **FRONTEND_URL** in backend `.env`: `http://localhost:3000` (already configured)

All services will automatically allow requests from the frontend.

## Production Deployment

To configure for production, update your `.env` file:

```env
FRONTEND_URL=https://your-frontend-domain.com
NODE_ENV=production
API_BASE_URL=https://api.your-domain.com
```

The CORS configuration will automatically:

- Use the production `FRONTEND_URL`
- Include any additional origins specified via `API_BASE_URL`

## Socket.IO Configuration

For real-time features (Chat & Notifications), Socket.IO CORS is configured separately:

```typescript
const io = new Server(httpServer, {
  cors: getSocketIoCorsConfig(),
});
```

This ensures WebSocket connections from the frontend are properly authorized.

## Security Features

✅ **Whitelist-based approach**: Only explicitly allowed origins can access the APIs
✅ **Credentials support**: Allows secure transmission of cookies and authorization tokens
✅ **OPTIONS preflight**: Automatically handled by Express CORS middleware
✅ **Method restrictions**: Only necessary HTTP methods are allowed
✅ **Header validation**: Only required headers are accepted

## Testing CORS

To test if CORS is working correctly:

1. **From Frontend**:

```javascript
// This should work now
fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
});
```

2. **Check Browser Console**:
   - No "CORS policy" errors should appear
   - Request should complete successfully

3. **Check Response Headers**:
   - Should see `Access-Control-Allow-Origin` header with your frontend URL

## Files Modified

- ✅ `apps/backend/src/shared/config/cors.config.ts` (NEW)
- ✅ `apps/backend/src/shared/index.ts` (UPDATED - exports CORS config)
- ✅ `apps/backend/src/auth-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/tutor-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/booking-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/payment-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/chat-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/notification-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/notification-service/services/socket.service.ts` (UPDATED)
- ✅ `apps/backend/src/review-service/index.ts` (UPDATED)
- ✅ `apps/backend/src/admin-service/index.ts` (UPDATED)
- ✅ `apps/backend/.env` (UPDATED - added FRONTEND_URL)

## Conclusion

All backend services now have proper CORS configuration that allows the frontend (running on `http://localhost:3000`) to make requests and establish Socket.IO connections. The implementation is secure, scalable, and ready for production deployment with simple environment variable changes.
