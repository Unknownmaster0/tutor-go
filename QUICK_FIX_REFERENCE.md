# Quick Reference - API Integration Fixes

## Root Cause of 404 Errors

The application uses a **microservices architecture**, but there was no API Gateway. The frontend expected all APIs at `localhost:3001`, but only the Auth Service was running there. Requests to `/bookings`, `/tutors`, `/chat`, etc. were hitting the wrong service (or no service at all).

## Solution Summary

✅ Created an **API Gateway** at port 3001 that routes to the correct microservices
✅ Fixed port conflicts between services  
✅ Added missing authentication middleware
✅ Fixed HTTP client inconsistency in chat hook
✅ Updated npm scripts to launch all services
✅ Added comprehensive documentation

---

## Changes Made

### 1. New API Gateway Service

```
File: apps/backend/src/gateway/index.ts
Purpose: Routes all frontend requests to appropriate microservices
Port: 3001
```

### 2. Port Corrections

| Service | Old  | New      |
| ------- | ---- | -------- |
| Auth    | 3001 | **3000** |
| Review  | 3006 | **3005** |
| Admin   | 3007 | **3008** |

### 3. Files Modified

```
✅ apps/backend/src/auth-service/index.ts
✅ apps/backend/src/review-service/index.ts
✅ apps/backend/src/admin-service/index.ts
✅ apps/backend/src/booking-service/routes/booking.routes.ts
✅ apps/backend/src/notification-service/routes/notification.routes.ts
✅ apps/backend/src/review-service/routes/review.routes.ts
✅ apps/frontend/src/hooks/use-chat.ts
✅ apps/backend/package.json
```

### 4. Dependencies Added

```
express-http-proxy@^1.6.14
```

---

## How to Start Everything

From `apps/backend` directory:

```bash
npm run dev
```

This starts all 9 services at once:

- Gateway (3001)
- Auth (3000)
- Tutor (3002)
- Booking (3003)
- Payment (3004)
- Review (3005)
- Chat (3006)
- Notification (3007)
- Admin (3008)

From `apps/frontend` directory:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

---

## API Route Mapping

| Endpoint           | Service              | Port |
| ------------------ | -------------------- | ---- |
| `/auth/*`          | Auth Service         | 3000 |
| `/tutors/*`        | Tutor Service        | 3002 |
| `/bookings/*`      | Booking Service      | 3003 |
| `/payments/*`      | Payment Service      | 3004 |
| `/reviews/*`       | Review Service       | 3005 |
| `/chat/*`          | Chat Service         | 3006 |
| `/admin/*`         | Admin Service        | 3008 |
| `/notifications/*` | Notification Service | 3007 |

---

## Testing the Fix

### 1. Verify Gateway is Running

```bash
curl http://localhost:3001/health
```

### 2. Login to Get Token

```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### 3. Test Protected Endpoint

```bash
curl http://localhost:3001/bookings/user/USER_ID \
  -H "Authorization: Bearer TOKEN"
```

### 4. Dashboard Should Load

Open `http://localhost:3000/dashboard` - should see all sections loading without 404 errors

---

## Architecture Overview

```
Frontend (port 3000)
        ↓
API Gateway (port 3001)
        ↓
┌──────────────────────────────────────┐
│  Microservices (independent ports)    │
├──────────────────────────────────────┤
│ ✅ Auth Service (3000)                │
│ ✅ Tutor Service (3002)               │
│ ✅ Booking Service (3003)             │
│ ✅ Payment Service (3004)             │
│ ✅ Review Service (3005)              │
│ ✅ Chat Service (3006)                │
│ ✅ Notification Service (3007)        │
│ ✅ Admin Service (3008)               │
└──────────────────────────────────────┘
```

---

## All Frontend Pages - Status

### Dashboard (`/dashboard`)

- ✅ Available Teachers - Uses `GET /tutors/search`
- ✅ Booking History - Uses `GET /bookings/user/:userId`
- ✅ Recent Conversations - Uses `GET /chat/conversations/:userId`

### Search (`/search`)

- ✅ Tutor Search - Uses `GET /tutors/search?...filters`
- ✅ Map View - Uses tutor location data from search

### Tutor Profile (`/tutors/[id]`)

- ✅ Profile Details - Uses `GET /tutors/:id`
- ✅ Reviews - Uses `GET /reviews/tutor/:tutorId`
- ✅ Availability - Uses `GET /tutors/:id/availability`

### Chat (`/chat`)

- ✅ Conversations List - Uses `GET /chat/conversations/:userId`
- ✅ Messages - Uses `GET /chat/messages/:conversationId`
- ✅ WebSocket - Connects to Chat Service (3006)

### Auth (`/auth/login`, `/auth/register`)

- ✅ Login - Uses `POST /auth/login`
- ✅ Register - Uses `POST /auth/register`

### Tutor Dashboard (`/dashboard/tutor`)

- ✅ Profile - Uses `GET /tutors/profile`
- ✅ Availability - Uses `GET /tutors/:id/availability`
- ✅ Sessions - Uses `GET /bookings/user/:tutorId`

### Admin (`/admin`)

- ✅ Metrics - Uses `GET /admin/metrics`
- ✅ Activity - Uses `GET /admin/activity`
- ✅ Revenue - Uses `GET /admin/revenue`
- ✅ Users - Uses `GET /admin/users`

---

## Documentation Files

- `API_GATEWAY_ARCHITECTURE.md` - Detailed architecture documentation
- `API_INTEGRATION_FIX_SUMMARY.md` - Complete fix summary with examples
- `apps/backend/.env.example` - Environment variable template

---

## Common Issues & Fixes

| Issue                   | Solution                                    |
| ----------------------- | ------------------------------------------- |
| Port already in use     | Kill process on that port or change .env    |
| Cannot find module      | Run `npm install` in apps/backend           |
| 503 Service Unavailable | Make sure all services are running          |
| 401 Unauthorized        | Add valid JWT token to Authorization header |
| CORS errors             | Check cors.config.ts for allowed origins    |

---

## Before & After

### Before (404 Errors)

```
Frontend → localhost:3001 → Only Auth Service → ❌ /bookings not found
```

### After (Working)

```
Frontend → localhost:3001 (Gateway) → Routes to correct service → ✅ Works!
```

---

## Next Steps for Production

1. Deploy gateway and all services to production
2. Update `NEXT_PUBLIC_API_URL` to production gateway URL
3. Add environment-specific configuration
4. Implement monitoring and logging
5. Add rate limiting and request validation
6. Set up CI/CD for automated testing and deployment
7. Configure load balancing for high availability

---

**All 404 errors in the dashboard should now be fixed! 🎉**
