# Tutor-Go Platform: Comprehensive Integration & Debugging Tasks

**Date Created**: December 8, 2025  
**Project**: TutorGo Platform (Full Stack: Next.js + Express Microservices)  
**Status**: Ready for Step-by-Step Resolution

---

## 📋 Table of Contents

1. [Task Overview](#task-overview)
2. [Detailed Tasks](#detailed-tasks)
3. [Architecture Summary](#architecture-summary)
4. [Port Configuration](#port-configuration)
5. [Current Issues & Fixes](#current-issues--fixes)

---

## 🎯 Task Overview

This document outlines 7 major integration and debugging tasks for the Tutor-Go platform. Each task builds upon the previous one to ensure proper frontend-backend integration, CORS handling, and request/response flow debugging.

**Total Tasks**: 7  
**Estimated Time**: 4-6 hours  
**Difficulty**: Intermediate to Advanced

---

## 📝 Detailed Tasks

### **TASK 1: Verify Frontend-Backend Integration Architecture**

**Objective**: Ensure the frontend is correctly configured to communicate with the API Gateway, and understand the complete request flow.

**Current State Analysis**:

- Frontend: Next.js on `http://localhost:3000`
- API Gateway: Express on `http://localhost:8000` (or 3001 based on config)
- Microservices: Express services on ports 8001-8008
- Frontend API Client: `apps/frontend/src/lib/api-client.ts`

**Files to Review**:

1. `apps/frontend/src/lib/api-client.ts` - Frontend API client configuration
2. `apps/frontend/.env.example` - Frontend environment variables
3. `apps/backend/src/gateway/index.ts` - API Gateway configuration
4. `apps/backend/src/shared/config/cors.config.ts` - CORS allowed origins

**Checklist**:

- [ ] Verify `NEXT_PUBLIC_API_URL` is correctly set to API Gateway URL
- [ ] Confirm API Gateway is running on correct port (check .env files)
- [ ] Verify all microservices are registered as proxy routes in gateway
- [ ] Check that frontend API client correctly uses the API_URL as baseURL
- [ ] Ensure request interceptor adds Authorization headers properly
- [ ] Verify response interceptor handles both success and error responses

**Expected Outcome**:

```
✅ Frontend makes requests to: http://localhost:8000 (or configured GATEWAY_PORT)
✅ Gateway proxies requests to appropriate microservices (auth, tutor, booking, etc.)
✅ API Client interceptors work correctly for token management
✅ All service endpoints are documented and accessible
```

**Documentation to Create**:

- Document the current API Gateway proxy routes mapping
- List all available API endpoints from each service
- Create a diagram showing request flow from frontend → gateway → microservices

---

### **TASK 2: Comprehensive CORS Configuration Verification & Fix**

**Objective**: Ensure CORS is properly configured for frontend-to-backend communication without blocking legitimate requests.

**Current State Analysis**:

- CORS Config File: `apps/backend/src/shared/config/cors.config.ts`
- Currently allows: `http://localhost:3000`, `http://localhost:8000`, `http://127.0.0.1:3000`, `http://127.0.0.1:8000`
- Credentials enabled: `true`
- Allowed Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS

**Files to Check**:

1. `apps/backend/src/gateway/index.ts` - Gateway CORS middleware setup
2. `apps/backend/src/auth-service/index.ts` - Auth service CORS setup
3. `apps/backend/src/tutor-service/index.ts` - Tutor service CORS setup
4. `apps/backend/src/booking-service/index.ts` - Booking service CORS setup
5. `apps/backend/src/shared/config/cors.config.ts` - CORS configuration

**Checklist**:

- [ ] Verify CORS middleware is applied to ALL services (gateway + individual microservices)
- [ ] Check that `credentials: true` is set correctly for cookie-based auth
- [ ] Confirm all microservices import and use `getCorsConfig()` from shared
- [ ] Verify allowed headers include: `Authorization`, `Content-Type`, `X-Requested-With`
- [ ] Test preflight requests (OPTIONS) are handled correctly
- [ ] Check for CORS errors in browser console when making requests
- [ ] Verify environment-based CORS configuration (dev vs production)

**Testing Steps**:

1. Open browser DevTools → Network tab
2. Make a request from frontend to backend
3. Check for these headers in response:
   - `Access-Control-Allow-Origin: http://localhost:3000`
   - `Access-Control-Allow-Credentials: true`
   - `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`
4. Look for any CORS errors (red X) in console

**Expected Outcome**:

```
✅ No CORS errors in browser console
✅ Preflight (OPTIONS) requests return 200
✅ Credentials (cookies/tokens) are properly sent
✅ All cross-origin requests succeed
```

**Fixes to Apply** (if needed):

- Add CORS middleware to any service missing it
- Update allowed origins to include actual frontend URL
- Ensure `credentials: true` for token-based auth

---

### **TASK 3: Port Conflict Detection & Resolution**

**Objective**: Verify no port conflicts exist between frontend, gateway, and microservices.

**Current Configuration** (as per PORT_CONFIGURATION_REPORT.md):
| Service | Port | Variable |
|---------|------|----------|
| Frontend | 3000 | - |
| API Gateway | 8000 | GATEWAY_PORT |
| Auth Service | 8001 | AUTH_SERVICE_PORT |
| Tutor Service | 8002 | TUTOR_SERVICE_PORT |
| Booking Service | 8003 | BOOKING_SERVICE_PORT |
| Payment Service | 8004 | PAYMENT_SERVICE_PORT |
| Review Service | 8005 | REVIEW_SERVICE_PORT |
| Chat Service | 8006 | CHAT_SERVICE_PORT |
| Notification Service | 8007 | NOTIFICATION_SERVICE_PORT |
| Admin Service | 8008 | ADMIN_SERVICE_PORT |

**Files to Review**:

1. `apps/backend/.env.example` - Backend environment variables
2. Each service's `index.ts` file - Port configuration
3. `docker-compose.yml` - Docker port mappings

**Checklist**:

- [ ] Verify each microservice reads its port from correct environment variable
- [ ] Confirm no two services are using the same port
- [ ] Check that Gateway is NOT using port 3000 (reserved for frontend)
- [ ] Verify Auth service is NOT using port 3000 (was a previous conflict)
- [ ] Test all services can start without "port already in use" errors
- [ ] Verify gateway proxies use internal service URLs (e.g., http://localhost:8001)
- [ ] Check .env files match the port configuration

**Testing Steps**:

```bash
# In terminal, check which ports are in use
netstat -ano | findstr :8000
netstat -ano | findstr :8001
netstat -ano | findstr :8002
# etc.

# Or try to start all services
npm run dev:backend
# Should see all services starting without port conflicts
```

**Expected Outcome**:

```
✅ Auth Service: http://localhost:8001
✅ Tutor Service: http://localhost:8002
✅ Booking Service: http://localhost:8003
✅ API Gateway: http://localhost:8000
✅ No "port already in use" errors
✅ All services start successfully in 30 seconds
```

**Fixes to Apply** (if needed):

- Update environment variables to match port configuration
- Modify microservice index.ts files if using hardcoded ports
- Verify docker-compose.yml port mappings are correct

---

### **TASK 4: Frontend API Request Validation (Endpoints & Body Data)**

**Objective**: Verify frontend is making correct API requests to the right endpoints with proper request body structure.

**Current Frontend API Client**:

- Location: `apps/frontend/src/lib/api-client.ts`
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`
- Base URL: `process.env.NEXT_PUBLIC_API_URL` (should be `http://localhost:8000`)

**Key Endpoints to Verify**:

#### Authentication Endpoints (Gateway → Auth Service)

```
POST   /auth/register     { email, password, name, role }
POST   /auth/login        { email, password }
POST   /auth/refresh      { refreshToken }
POST   /auth/logout       (requires auth header)
GET    /auth/me           (requires auth header)
```

#### Tutor Endpoints (Gateway → Tutor Service)

```
GET    /tutors/search?subject=Math&location=...  (public)
GET    /tutors/:id                                 (public)
POST   /tutors/profile                             (requires auth)
GET    /tutors/profile/:id                         (requires auth)
PUT    /tutors/profile                             (requires auth)
DELETE /tutors/profile                             (requires auth)
PUT    /tutors/availability                        (requires auth)
```

#### Booking Endpoints (Gateway → Booking Service)

```
POST   /bookings                                   (requires auth)
GET    /bookings/:id                               (requires auth)
GET    /bookings/user/:userId                      (requires auth)
PATCH  /bookings/:id/status                        (requires auth)
PATCH  /bookings/:id/cancel                        (requires auth)
```

#### Payment Endpoints (Gateway → Payment Service)

```
POST   /payments/create-intent                     (requires auth)
POST   /payments/webhook                           (stripe webhook)
GET    /payments/history                           (requires auth)
```

#### Admin Endpoints (Gateway → Admin Service)

```
GET    /admin/metrics                              (requires admin auth)
GET    /admin/activity                             (requires admin auth)
GET    /admin/revenue                              (requires admin auth)
GET    /admin/users                                (requires admin auth)
```

**Files to Analyze**:

1. All files in `apps/frontend/src/app/**/*.tsx` - Page components making API calls
2. All files in `apps/frontend/src/hooks/**/*.ts` - Custom hooks using API
3. `apps/frontend/src/lib/api-client.ts` - API client implementation

**Checklist**:

- [ ] Search codebase for all `apiClient.get()`, `apiClient.post()` calls
- [ ] For each call, verify:
  - [ ] Correct endpoint path (starts with `/`, not `http://...`)
  - [ ] Request body has correct structure (matches backend validator expectations)
  - [ ] Request includes required query parameters (if applicable)
  - [ ] Authorization header is properly added (token interceptor)
- [ ] Check for hardcoded `localhost` URLs (should use `NEXT_PUBLIC_API_URL`)
- [ ] Verify all protected endpoints include authentication
- [ ] Confirm request/response types match between frontend and backend

**Testing Steps**:

1. Open DevTools → Network tab
2. Perform an action in frontend (e.g., login, search tutors)
3. Inspect the request:
   - Headers should include: `Authorization: Bearer <token>`
   - URL should be: `http://localhost:8000/auth/login` (or appropriate endpoint)
   - Body should match expected format
4. Check response format (should be: `{ success: true, message: "...", data: {...} }`)

**Expected Outcome**:

```
✅ All API requests go to correct endpoints
✅ Request body structure matches backend validators
✅ All required headers are present
✅ Authentication token is included in protected requests
✅ Requests don't have hardcoded localhost URLs
```

**Common Issues to Fix**:

- [ ] Missing `Authorization` header in requests
- [ ] Wrong endpoint paths (e.g., `/tutors/profile` vs `/tutors/profile/:id`)
- [ ] Incorrect query parameter format
- [ ] Missing required fields in request body
- [ ] Hardcoded URLs instead of using environment variables

---

### **TASK 5: API Gateway Routing Verification**

**Objective**: Ensure API Gateway correctly proxies all frontend requests to the appropriate microservices.

**Current Gateway Configuration**:

- Location: `apps/backend/src/gateway/index.ts`
- Proxies requests from `/path` → service URL + `/path`

**Routes Currently Defined**:

```typescript
'/auth'     → AUTH_SERVICE_URL (8001)
'/tutors'   → TUTOR_SERVICE_URL (8002)
'/bookings' → BOOKING_SERVICE_URL (8003)
'/payments' → PAYMENT_SERVICE_URL (8004)
'/reviews'  → REVIEW_SERVICE_URL (8005)
'/chat'     → CHAT_SERVICE_URL (8006)
'/notification' → NOTIFICATION_SERVICE_URL (8007)
'/admin'    → ADMIN_SERVICE_URL (8008)
'/health'   → Local gateway response (8000)
```

**Files to Review**:

1. `apps/backend/src/gateway/index.ts` (lines 50-250) - All proxy middleware
2. `.env` files - Service URLs configuration
3. `apps/backend/.env.example` - Environment template

**Checklist**:

- [ ] All service URLs point to correct internal ports (8001-8008)
- [ ] Each proxy route has proper error handling
- [ ] Logging is enabled for all proxy requests (onProxyReq)
- [ ] CORS middleware is applied BEFORE proxy middleware
- [ ] Preflight OPTIONS requests are handled
- [ ] Path rewriting is correct (e.g., `/auth` → `/auth`, not `/auth/auth`)
- [ ] Service availability is checked (health endpoints responding)
- [ ] Gateway error responses have consistent format

**Testing Steps**:

```bash
# 1. Start all services
npm run dev:backend

# 2. Check gateway health
curl http://localhost:8000/health

# 3. Test auth route through gateway
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# 4. Test tutor route through gateway
curl http://localhost:8000/tutors/search?subject=Math

# 5. Check gateway logs for routing info
```

**Expected Outcome**:

```
✅ Gateway responds on http://localhost:8000
✅ All routes are proxied to correct microservices
✅ Request headers are properly forwarded
✅ Response headers from services are returned to frontend
✅ Error messages from services are properly returned
✅ No CORS issues in gateway responses
```

**Common Issues to Fix**:

- [ ] Service URLs using wrong ports
- [ ] Path rewriting causing double paths (e.g., `/auth/auth`)
- [ ] CORS not applied to gateway (should be applied)
- [ ] Error handling not returning proper error responses
- [ ] Services not accessible from gateway (connectivity issue)

---

### **TASK 6: Add Console Logging for Request Flow Debugging**

**Objective**: Add strategic console.log statements to each backend service route to track request flow and verify responses are being sent.

**Logging Strategy**:
Each route should log when the request arrives and before the response is sent. Format: `"✓ In route: [SERVICE]/[ENDPOINT]"`

**Services & Routes to Update**:

#### Auth Service (`apps/backend/src/auth-service/routes/auth.routes.ts`)

```typescript
POST   /auth/register    → "✓ In route: auth/register"
POST   /auth/login       → "✓ In route: auth/login"
POST   /auth/refresh     → "✓ In route: auth/refresh"
POST   /auth/logout      → "✓ In route: auth/logout"
GET    /auth/me          → "✓ In route: auth/me"
```

#### Tutor Service (`apps/backend/src/tutor-service/routes/tutor.routes.ts`)

```typescript
GET    /tutors/search           → "✓ In route: tutor/search"
GET    /tutors/:id              → "✓ In route: tutor/getById"
POST   /tutors/profile          → "✓ In route: tutor/createProfile"
GET    /tutors/profile          → "✓ In route: tutor/getProfile"
PUT    /tutors/profile          → "✓ In route: tutor/updateProfile"
DELETE /tutors/profile          → "✓ In route: tutor/deleteProfile"
PUT    /tutors/availability     → "✓ In route: tutor/setAvailability"
```

#### Booking Service (`apps/backend/src/booking-service/routes/booking.routes.ts`)

```typescript
POST   /bookings                → "✓ In route: booking/create"
GET    /bookings/:id            → "✓ In route: booking/getById"
GET    /bookings/user/:userId   → "✓ In route: booking/getUserBookings"
PATCH  /bookings/:id/status     → "✓ In route: booking/updateStatus"
PATCH  /bookings/:id/cancel     → "✓ In route: booking/cancelBooking"
```

#### Admin Service (`apps/backend/src/admin-service/routes/...`)

```typescript
GET    /admin/metrics           → "✓ In route: admin/metrics"
GET    /admin/activity          → "✓ In route: admin/activity"
GET    /admin/revenue           → "✓ In route: admin/revenue"
GET    /admin/users             → "✓ In route: admin/users"
```

#### Payment Service (`apps/backend/src/payment-service/routes/...`)

```typescript
POST   /payments/create-intent  → "✓ In route: payment/createIntent"
POST   /payments/webhook        → "✓ In route: payment/webhook"
GET    /payments/history        → "✓ In route: payment/history"
```

**Implementation Details**:

For each route, add logging at the BEGINNING and END:

```typescript
// Route definition in routes file (e.g., auth.routes.ts)
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  console.log('✓ In route: auth/login');  // ADD THIS LINE

  // ... existing route logic ...

  // Before sending response
  ApiResponse.success(res, { token: '...', user: {...} });
  console.log('✓ Response sent from: auth/login'); // ADD THIS LINE
}));
```

Or add middleware at service level in `index.ts`:

```typescript
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function (data) {
    console.log(`✓ Response sent for: ${req.method} ${req.path}`);
    return originalSend.call(this, data);
  };
  next();
});
```

**Files to Modify**:

1. `apps/backend/src/auth-service/routes/auth.routes.ts`
2. `apps/backend/src/auth-service/controllers/auth.controller.ts`
3. `apps/backend/src/tutor-service/routes/tutor.routes.ts`
4. `apps/backend/src/tutor-service/controllers/tutor.controller.ts`
5. `apps/backend/src/booking-service/routes/booking.routes.ts`
6. `apps/backend/src/booking-service/controllers/booking.controller.ts`
7. All other service routes and controllers

**Checklist**:

- [ ] Add "In route: X" log at the start of each route handler
- [ ] Add "Response sent from: X" log before sending responses
- [ ] Use consistent format: `✓ In route: [service]/[endpoint]`
- [ ] Include method and path in logs for clarity
- [ ] Ensure logs don't include sensitive data (passwords, tokens)
- [ ] Test that logs appear in backend terminal when frontend makes requests
- [ ] Verify logs show complete request flow (gateway → service → response)

**Testing Steps**:

1. Start all backend services: `npm run dev:backend`
2. Watch the terminal output (should show logs)
3. Make a request from frontend (e.g., login)
4. Check backend terminal for:
   ```
   ✓ In route: auth/login
   ✓ Response sent from: auth/login
   ```
5. Repeat for different endpoints

**Expected Outcome**:

```
✅ Console logs appear for every API call
✅ Logs show complete request flow
✅ Can verify response was sent by checking for "Response sent" logs
✅ Easier to debug missing responses or request issues
✅ Logs use consistent format across all services
```

---

### **TASK 7: Backend Response Structure Standardization & Frontend Consumption**

**Objective**: Ensure all backend services return responses in a consistent structure that the frontend can properly consume.

**Current Response Structure** (defined in `apps/backend/src/shared/utils/response.ts`):

**Success Response**:

```typescript
{
  success: true,
  message: "Success message",
  data: {
    // Actual response data
  }
}
```

**Error Response**:

```typescript
{
  success: false,
  message: "Error message",
  errors?: [
    // Optional: array of validation errors
  ]
}
```

**Files to Review**:

1. `apps/backend/src/shared/utils/response.ts` - Response structure
2. `apps/backend/src/shared/middleware/errorHandler.ts` - Error handling
3. All service controllers (auth, tutor, booking, etc.)
4. `apps/frontend/src/lib/api-client.ts` - Frontend response handling

**Checklist**:

**Backend Side**:

- [ ] All endpoints use `ApiResponse.success()`, `ApiResponse.error()`, or `ApiResponse.created()`
- [ ] Success responses include `success: true`
- [ ] Error responses include `success: false`
- [ ] All responses follow the exact structure: `{ success, message, data/errors }`
- [ ] HTTP status codes are correct (200, 201, 400, 401, 500, etc.)
- [ ] No endpoints return raw data without wrapping in ApiResponse
- [ ] Validation errors are properly formatted
- [ ] Error handler catches all exceptions and returns proper format

**Frontend Side**:

- [ ] API client correctly extracts `data` from responses
- [ ] Error handling checks `success` flag before processing data
- [ ] Response interceptor properly handles different status codes
- [ ] Error messages are user-friendly and displayed correctly
- [ ] 401 responses trigger token refresh (already implemented)
- [ ] 400 validation errors are properly parsed and displayed
- [ ] 500 errors show appropriate error messages

**Response Format Examples**:

**Example 1: Login Success**

```typescript
// Backend Response
{
  success: true,
  message: "Login successful",
  data: {
    accessToken: "eyJhbGc...",
    refreshToken: "eyJhbGc...",
    user: {
      id: "user-123",
      email: "user@example.com",
      name: "John Doe",
      role: "student"
    }
  }
}

// Frontend receives in apiClient.post()
// data = { accessToken, refreshToken, user }
```

**Example 2: Validation Error**

```typescript
// Backend Response
{
  success: false,
  message: "Validation failed",
  errors: [
    {
      field: "email",
      message: "Invalid email format"
    },
    {
      field: "password",
      message: "Password must be at least 8 characters"
    }
  ]
}
```

**Example 3: Get Tutors Search**

```typescript
// Backend Response
{
  success: true,
  message: "Tutors found",
  data: [
    {
      id: "tutor-1",
      name: "Jane Smith",
      subject: "Math",
      rating: 4.8,
      pricePerHour: 50,
      location: "New York"
    },
    // ... more tutors
  ]
}

// Frontend receives array of tutors directly
```

**Example 4: Create Booking**

```typescript
// Backend Response
{
  success: true,
  message: "Created successfully",
  data: {
    id: "booking-123",
    studentId: "user-456",
    tutorId: "tutor-789",
    scheduledTime: "2025-12-15T14:00:00Z",
    status: "pending",
    totalPrice: 50
  }
}
```

**Testing Steps**:

**Manual Testing**:

1. Open DevTools → Network tab → Response tab
2. Make a frontend API request
3. Check response structure:
   - [ ] Has `success` field
   - [ ] Has `message` field
   - [ ] Has `data` or `errors` field
   - [ ] Status code matches response type

**Automated Testing**:

```bash
# Test auth/login response
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}' \
  -s | jq '.success, .message, .data'
```

**Frontend Implementation Verification**:

```typescript
// In api-client.ts, verify response extraction
async get<T>(url: string, config?: AxiosRequestConfig) {
  const response = await this.client.get<{ success: boolean; message: string; data: T }>(
    url,
    config,
  );
  // Should return only the data, not the wrapper
  return response.data.data;
}
```

**Checklist for Each Service**:

**Auth Service** (`auth.controller.ts`):

- [ ] `register()` returns user with tokens
- [ ] `login()` returns user with tokens
- [ ] `logout()` returns success message
- [ ] `me()` returns user profile
- [ ] `refreshToken()` returns new token

**Tutor Service** (`tutor.controller.ts`):

- [ ] `searchTutors()` returns array of tutors
- [ ] `getProfileById()` returns tutor profile
- [ ] `createProfile()` returns created profile
- [ ] `updateProfile()` returns updated profile
- [ ] `getAvailability()` returns availability slots

**Booking Service** (`booking.controller.ts`):

- [ ] `createBooking()` returns booking object
- [ ] `getBookingById()` returns booking object
- [ ] `getUserBookings()` returns array of bookings
- [ ] `updateBookingStatus()` returns updated booking
- [ ] `cancelBooking()` returns cancelled booking

**Payment Service**:

- [ ] `createPaymentIntent()` returns Stripe client secret
- [ ] `webhook()` returns success message
- [ ] `getPaymentHistory()` returns array of payments

**Admin Service**:

- [ ] `getMetrics()` returns metrics object
- [ ] `getActivity()` returns array of activities
- [ ] `getRevenue()` returns revenue data
- [ ] `getUsers()` returns array of users

**Expected Outcome**:

```
✅ All endpoints return consistent response structure
✅ Success responses have correct HTTP status codes
✅ Error responses include helpful error messages
✅ Frontend can properly parse and use response data
✅ No parsing errors in frontend console
✅ Response data types match frontend TypeScript types
✅ Validation errors are clearly formatted
✅ All endpoints follow the same response pattern
```

**Common Issues to Fix**:

- [ ] Some endpoints returning raw data instead of wrapped response
- [ ] Inconsistent response structure across services
- [ ] Missing `success` or `message` fields in responses
- [ ] Wrong HTTP status codes (e.g., returning 200 for errors)
- [ ] Validation errors not properly formatted
- [ ] Frontend not handling error responses correctly

---

## 🏗️ Architecture Summary

### High-Level Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND (Port 3000)                    │
│                   Next.js React Application                 │
│                                                              │
│  Components → hooks → api-client (axios)                   │
└────────────┬────────────────────────────────────────────────┘
             │ HTTP Request with Auth Token
             │ NEXT_PUBLIC_API_URL = http://localhost:8000
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│              API GATEWAY (Port 8000)                        │
│                 Express Proxy Middleware                    │
│                                                              │
│  Handles: CORS, Compression, Logging, Error Handling       │
│  Routes: /auth → 8001, /tutors → 8002, etc.               │
└────┬──────────┬──────────┬──────────┬──────────┬────────────┘
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
   8001       8002       8003       8004       8005
   Auth      Tutor     Booking    Payment    Review
  Service    Service    Service    Service    Service
     │          │          │          │          │
     ▼          ▼          ▼          ▼          ▼
 Prisma      MongoDB    Prisma      Stripe    MongoDB
  (PG)                   (PG)
```

### Technology Stack

| Component               | Technology                     | Port  | Purpose             |
| ----------------------- | ------------------------------ | ----- | ------------------- |
| Frontend                | Next.js 14 + React 18          | 3000  | UI/UX               |
| API Gateway             | Express + http-proxy           | 8000  | Request routing     |
| Auth Service            | Express + Prisma + JWT         | 8001  | User authentication |
| Tutor Service           | Express + MongoDB + Cloudinary | 8002  | Tutor management    |
| Booking Service         | Express + Prisma               | 8003  | Booking management  |
| Payment Service         | Express + Stripe               | 8004  | Payment processing  |
| Chat Service            | Express + Socket.IO + MongoDB  | 8006  | Real-time chat      |
| Admin Service           | Express + Prisma               | 8008  | Admin dashboard     |
| Database: PostgreSQL    | Relational DB                  | 5432  | User, booking data  |
| Database: MongoDB       | NoSQL DB                       | 27017 | Chat, reviews data  |
| Cache: Redis            | In-memory cache                | 6379  | Sessions, caching   |
| Message Queue: RabbitMQ | Message broker                 | 5672  | Async operations    |

---

## 🔌 Port Configuration

### Frontend & Gateway

| Service     | Port | Environment Variable | Status             |
| ----------- | ---- | -------------------- | ------------------ |
| Frontend    | 3000 | -                    | Development server |
| API Gateway | 8000 | `GATEWAY_PORT`       | Default: 3000      |

⚠️ **Note**: Gateway default in code is 3000, but should be 8000 in production. Check `.env` file.

### Microservices (Internal Communication)

| Service      | Port | Environment Variable        |
| ------------ | ---- | --------------------------- |
| Auth         | 8001 | `AUTH_SERVICE_PORT`         |
| Tutor        | 8002 | `TUTOR_SERVICE_PORT`        |
| Booking      | 8003 | `BOOKING_SERVICE_PORT`      |
| Payment      | 8004 | `PAYMENT_SERVICE_PORT`      |
| Review       | 8005 | `REVIEW_SERVICE_PORT`       |
| Chat         | 8006 | `CHAT_SERVICE_PORT`         |
| Notification | 8007 | `NOTIFICATION_SERVICE_PORT` |
| Admin        | 8008 | `ADMIN_SERVICE_PORT`        |

### External Services

| Service    | Port  | Purpose                        |
| ---------- | ----- | ------------------------------ |
| PostgreSQL | 5432  | User, booking, admin data      |
| MongoDB    | 27017 | Chat, review data              |
| Redis      | 6379  | Session cache, token blacklist |
| RabbitMQ   | 5672  | Message queue for async tasks  |

---

## ✅ Current Issues & Fixes

### Issue 1: Port Confusion

**Status**: ✅ RESOLVED (as per PORT_CONFIGURATION_REPORT.md)

**Problem**: Gateway port was 3000, conflicting with frontend.  
**Fix**: Changed to port 8000 (internal) and 3001 (exposed).  
**Verification**: Check `.env` and gateway/index.ts line 13.

### Issue 2: CORS Configuration

**Status**: ✅ RESOLVED (as per CORS_AND_GATEWAY_FIX_COMPLETE.md)

**Problem**: CORS was blocking frontend requests.  
**Fix**: Applied CORS middleware to all services with proper origin whitelist.  
**Verification**: Check `apps/backend/src/shared/config/cors.config.ts`.

### Issue 3: Gateway Proxy Routes

**Status**: ✅ MOSTLY RESOLVED

**Problem**: Some services might not be properly registered in gateway proxy routes.  
**Fix**: Verify all microservices have proxy middleware in gateway/index.ts.  
**Verification**: Check gateway/index.ts lines 50-250.

### Issue 4: Request/Response Flow

**Status**: ⚠️ NEEDS VERIFICATION (Task 6 & 7)

**Problem**: Unclear which requests are reaching backend and if responses are returned.  
**Fix**: Add console.log statements in each route (Task 6).  
**Verification**: Task 6 implementation.

### Issue 5: Response Structure Inconsistency

**Status**: ⚠️ NEEDS VERIFICATION (Task 7)

**Problem**: Some endpoints might return inconsistent response structures.  
**Fix**: Ensure all endpoints use ApiResponse utility (Task 7).  
**Verification**: Task 7 implementation.

---

## 📊 Task Completion Tracking

| #   | Task                         | Status  | Notes                         |
| --- | ---------------------------- | ------- | ----------------------------- |
| 1   | Frontend-Backend Integration | ⏳ TODO | Architecture verification     |
| 2   | CORS Configuration           | ⏳ TODO | Middleware verification       |
| 3   | Port Conflict Detection      | ⏳ TODO | All ports check               |
| 4   | Frontend API Validation      | ⏳ TODO | Request endpoints & body      |
| 5   | API Gateway Routing          | ⏳ TODO | Proxy middleware verification |
| 6   | Console Logging Setup        | ⏳ TODO | Add logs to all routes        |
| 7   | Response Structure           | ⏳ TODO | Standardize all responses     |

---

## 🚀 How to Use This Document

1. **Start with Task 1** - Understand the architecture
2. **Complete each task in order** - Each builds on the previous
3. **Mark tasks as you complete them** - Update the status
4. **Reference the checklists** - Don't skip any verification steps
5. **Test each task** - Use the provided testing steps
6. **Document findings** - Note any issues found and how they were fixed

---

## 📞 Support & Debugging

If you encounter issues:

1. **Check browser console** - Look for CORS or network errors
2. **Check backend terminal** - Look for console.log output (Task 6)
3. **Check network tab** - Inspect actual HTTP requests and responses
4. **Review error messages** - Backend should return helpful error messages
5. **Check .env files** - Ensure all URLs and ports are correct
6. **Restart services** - Sometimes ports get stuck
7. **Check ports** - Verify no port conflicts with `netstat -ano`

---

**Last Updated**: December 8, 2025  
**Project**: TutorGo Platform  
**Version**: 1.0
