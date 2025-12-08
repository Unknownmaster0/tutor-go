# API Architecture Diagram

## Before (❌ Broken)
```
┌─────────────────────────────────────────────────────────┐
│                  Browser (localhost:3000)                │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Frontend (Next.js)                  │   │
│  │   Routes: /, /auth/login, /dashboard            │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      │ API Request
                      │ GET /tutors/search
                      │ POST /bookings
                      │ GET /payments
                      ▼
        ┌─────────────────────────────┐
        │  localhost:3001 (Auth Only) │  ❌ Wrong service!
        │  - /auth routes             │
        └─────────────────────────────┘
                      │
                      ▼
              ❌ 404 Not Found ❌
        (/tutors/search not found in Auth)
```

## After (✅ Fixed)
```
┌─────────────────────────────────────────────────────────┐
│                  Browser (localhost:3000)                │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │              Frontend (Next.js)                  │   │
│  │   Routes: /, /auth/login, /dashboard            │   │
│  └──────────────────┬───────────────────────────────┘   │
└─────────────────────┼──────────────────────────────────────┘
                      │
                      │ API Request
                      │ (All requests to localhost:3001)
                      ▼
        ┌──────────────────────────────────────┐
        │       API Gateway (3001)              │  ✅ Single Entry Point
        │  - Routes requests to services        │
        │  - Health check: /health              │
        └────┬───┬───┬────┬────┬───┬───┬────────┘
             │   │   │    │    │   │   │
    ┌────────┘   │   │    │    │   │   └──────────────┐
    │             │   │    │    │   │                  │
    ▼             ▼   ▼    ▼    ▼   ▼                  ▼
┌─────────┐  ┌──────┐ ┌──────┐ ┌──────┐ ┌────────┐ ┌──────┐ ┌────────┐
│  Auth   │  │Tutor │ │Booking│ │Payment│ │  Chat  │ │Review│ │Notif. │
│ (3008)  │  │(3002)│ │(3003) │ │(3004) │ │ (3006) │ │(3005)│ │(3007) │
└─────────┘  └──────┘ └──────┘ └──────┘ └────────┘ └──────┘ └────────┘
  Auth       Tutors   Bookings  Payments  Messages  Reviews  Notifications
  Service    Service  Service   Service   Service   Service  Service
```

## Request Flow Example

### Scenario: User views dashboard and sees teacher list

```
1. User navigates to /dashboard
   ┌──────────────────────────────┐
   │ Frontend loads                │
   │ GET /tutors/search            │
   └──────────┬───────────────────┘
              │
              │ Sent to API_URL: http://localhost:3001
              ▼
   ┌──────────────────────────────┐
   │ API Gateway on :3001          │
   │ Receives: GET /tutors/search  │
   └──────────┬───────────────────┘
              │
              │ Routes based on path prefix
              │ "/tutors" → TUTOR_SERVICE_URL
              ▼
   ┌──────────────────────────────────────┐
   │ Tutor Service on :3002                │
   │ Receives: GET /tutors/search          │
   │ Queries database for teachers         │
   │ Returns: [ { id, name, rating } ... ]│
   └──────────┬───────────────────────────┘
              │
              │ Response
              ▼
   ┌──────────────────────────────┐
   │ API Gateway                   │
   │ Passes response back          │
   └──────────┬───────────────────┘
              │
              │ Response data
              ▼
   ┌──────────────────────────────┐
   │ Frontend                      │
   │ Displays teacher list ✅      │
   └──────────────────────────────┘
```

## Route Mapping Table

```
┌─────────────────────┬──────────────────┬──────────────────┐
│  Request Path       │  Routed To       │  Service Port    │
├─────────────────────┼──────────────────┼──────────────────┤
│ /auth/*             │ Auth Service     │ 3008             │
│ /tutors/*           │ Tutor Service    │ 3002             │
│ /bookings/*         │ Booking Service  │ 3003             │
│ /payments/*         │ Payment Service  │ 3004             │
│ /chat/*             │ Chat Service     │ 3006             │
│ /messages/*         │ Chat Service     │ 3006             │
│ /reviews/*          │ Review Service   │ 3005             │
│ /notifications/*    │ Notification Svc │ 3007             │
│ /admin/*            │ Admin Service    │ 3009             │
│ /health             │ Gateway Health   │ 3001 (gateway)   │
└─────────────────────┴──────────────────┴──────────────────┘
```

## Port Assignment

```
3001 ◄─── API Gateway (Entry Point)
     │
     ├─► 3008 (Auth Service)
     ├─► 3002 (Tutor Service)
     ├─► 3003 (Booking Service)
     ├─► 3004 (Payment Service)
     ├─► 3006 (Chat Service)
     ├─► 3005 (Review Service)
     ├─► 3007 (Notification Service)
     └─► 3009 (Admin Service)
```

## Technology Stack

```
Frontend             API Gateway           Microservices
────────             ────────────           ──────────────
Next.js              Express.js             Express.js
React                Helmet                 Prisma ORM
TypeScript           CORS                   MongoDB
Axios                Morgan Logger          PostgreSQL
                     Compression            Redis
                     HTTP Proxy             RabbitMQ
```

## Data Flow Examples

### Example 1: Authentication
```
User Login
    ↓
Frontend: POST http://localhost:3001/auth/login
    ↓
API Gateway (3001)
    ↓ (routes /auth to Auth Service)
Auth Service (3008): POST /auth/login
    ↓
Validates credentials, generates JWT
    ↓
Returns: { token, refreshToken }
    ↓
API Gateway passes response back
    ↓
Frontend stores token
```

### Example 2: Fetch Bookings
```
Dashboard loads
    ↓
Frontend: GET http://localhost:3001/bookings
    ↓
API Gateway (3001)
    ↓ (routes /bookings to Booking Service)
Booking Service (3003): GET /bookings
    ↓
Queries database: SELECT * FROM bookings WHERE userId = ?
    ↓
Returns: [ { id, tutorId, startTime } ... ]
    ↓
API Gateway passes response back
    ↓
Frontend displays booking list
```

### Example 3: Create Review
```
User submits review
    ↓
Frontend: POST http://localhost:3001/reviews
    ↓
API Gateway (3001)
    ↓ (routes /reviews to Review Service)
Review Service (3005): POST /reviews
    ↓
Validates review data
Saves to database
Publishes event to RabbitMQ (for notifications)
    ↓
Returns: { id, rating, comment }
    ↓
API Gateway passes response back
    ↓
Frontend shows success message
```

## What Was Changed

```
Before:
localhost:3001 → Auth Service only
                 ❌ /tutors → 404
                 ❌ /bookings → 404
                 ❌ /reviews → 404

After:
localhost:3001 → API Gateway
                 ✅ /auth → Auth Service (3008)
                 ✅ /tutors → Tutor Service (3002)
                 ✅ /bookings → Booking Service (3003)
                 ✅ /reviews → Review Service (3005)
                 ✅ etc... all routed correctly
```

## How to Test

```
1. Start backend: npm run dev (from apps/backend)
2. Check logs:
   ✅ "API Gateway running on http://localhost:3001"
   ✅ "Auth Service running on http://localhost:3008"
   ✅ "Tutor Service running on http://localhost:3002"
   ... etc

3. Test gateway health:
   curl http://localhost:3001/health
   
   Response: { "service": "api-gateway", "status": "healthy" }

4. Start frontend: npm run dev (from apps/frontend)

5. Navigate to dashboard: http://localhost:3000/dashboard

6. Should see teachers loaded (no 404) ✅
```

---
**Status**: API Gateway properly implemented and configured ✅
