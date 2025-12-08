# Quick Start Guide - Fixed CORS & Gateway

## The Problem (Fixed ✅)

Your sign-in was failing because:

1. **CORS Error**: Frontend (localhost:3000) couldn't talk to backend services
2. **Port Conflict**: Auth Service was on port 3000, same as frontend
3. **Wrong Gateway URLs**: Gateway didn't know where to find auth service

## The Solution (Implemented ✅)

- Moved Auth Service from port **3000 → 3010**
- Fixed CORS to only allow port **3000** (frontend) and **3001** (gateway)
- Updated gateway to route auth requests to port **3010**
- Fixed all error handlers and logging

## Port Summary

```
Frontend:           http://localhost:3000
API Gateway:        http://localhost:3001  ← Frontend talks to this
Auth Service:       http://localhost:3010  ← Gateway talks to this
Other services:     3002, 3003, 3004, 3005, 3006, 3007, 3008
```

## Setup & Run (3 Simple Steps)

### Step 1: Install Dependencies

```bash
cd apps/backend
npm install http-proxy-middleware
```

### Step 2: Start All Services

From `apps/backend` directory:

```bash
npm run dev
```

You should see all services starting:

```
🚀 API Gateway is running on http://localhost:3001
🚀 Auth Service is running on http://localhost:3010
🚀 Tutor Service is running on http://localhost:3002
🚀 Booking Service is running on http://localhost:3003
🚀 Payment Service is running on http://localhost:3004
🚀 Review Service is running on http://localhost:3005
🚀 Chat Service is running on http://localhost:3006
🚀 Notification Service is running on http://localhost:3007
🚀 Admin Service is running on http://localhost:3008
```

### Step 3: Start Frontend

In a new terminal, from `apps/frontend`:

```bash
npm run dev
```

Frontend starts on **http://localhost:3000**

## Test It Works

### 1. Open Browser

```
http://localhost:3000
```

### 2. Try to Sign In

- Email: `john.student@example.com`
- Password: `password123`

### 3. Check Browser Console

✅ **No CORS errors!**
✅ **Login succeeds!**
✅ **Dashboard loads!**

## Verify Services Are Running

Open a new terminal and run:

```bash
# Check gateway
curl http://localhost:3001/health

# Check auth
curl http://localhost:3010/health

# Check tutor
curl http://localhost:3002/health

# And so on...
```

All should return 200 OK with status information.

## What Changed

### Auth Service Port

```typescript
// ❌ BEFORE: Port 3000 (conflict with frontend)
const PORT = 3000;

// ✅ AFTER: Port 3010 (no conflict)
const PORT = 3010;
```

### CORS Configuration

```typescript
// ❌ BEFORE: Allowed all backend ports
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002', // ❌ Not needed
  'http://localhost:3003', // ❌ Not needed
  'http://localhost:3004', // ❌ Not needed
  ...
];

// ✅ AFTER: Only frontend and gateway
const allowedOrigins = [
  'http://localhost:3000',  // Frontend
  'http://localhost:3001',  // Gateway
];
```

### Gateway Service URL

```typescript
// ❌ BEFORE: Pointed to wrong port
const AUTH_SERVICE_URL = 'http://localhost:3001';

// ✅ AFTER: Correct port
const AUTH_SERVICE_URL = 'http://localhost:3010';
```

## If It Still Doesn't Work

### Check 1: Is Gateway Running?

```bash
curl http://localhost:3001/health
# Should return: {"success": true, "data": {"service": "api-gateway", ...}}
```

### Check 2: Is Auth Service Running?

```bash
curl http://localhost:3010/health
# Should return: {"success": true, "data": {"service": "auth-service", ...}}
```

### Check 3: Can Gateway Talk to Auth?

```bash
# Try auth endpoint through gateway
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.student@example.com","password":"password123"}'

# Should return token, not error
```

### Check 4: Browser Console

1. Open http://localhost:3000
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for error messages
5. Share the error if any

### Check 5: Port Conflicts

```bash
# Windows: Check if ports are in use
netstat -ano | findstr :3000
netstat -ano | findstr :3001
netstat -ano | findstr :3010

# macOS/Linux
lsof -i :3000
lsof -i :3001
lsof -i :3010
```

## Architecture (How It Works)

```
Your Browser
    ↓ You click "Sign In"
    ↓ Sends login to http://localhost:3001
    ↓
API Gateway (Port 3001)
    ↓ Checks: "Is request from localhost:3000?" → YES ✅
    ↓ Checks: "Is path /auth/login?" → YES ✅
    ↓ Routes to Auth Service (Port 3010)
    ↓
Auth Service (Port 3010)
    ↓ Validates credentials
    ↓ Creates JWT token
    ↓ Returns token
    ↓
API Gateway
    ↓ Returns token to browser
    ↓
Your Browser
    ✅ Login successful!
    ✅ Dashboard loads!
```

## Key Points

🔐 **Security**:

- Only port 3000 (frontend) and 3001 (gateway) are exposed to CORS
- All other services (3002-3010) are internal only

🚀 **Performance**:

- Gateway handles routing (1 entry point)
- Services handle business logic
- No circular dependencies

✅ **CORS Fixed**:

- No more cross-origin errors
- Proper preflight handling
- Correct origin validation

## Environment Variables (Optional)

If you want to customize ports, create `.env` in `apps/backend`:

```bash
GATEWAY_PORT=3001
AUTH_SERVICE_PORT=3010
TUTOR_SERVICE_PORT=3002
BOOKING_SERVICE_PORT=3003
PAYMENT_SERVICE_PORT=3004
REVIEW_SERVICE_PORT=3005
CHAT_SERVICE_PORT=3006
NOTIFICATION_SERVICE_PORT=3007
ADMIN_SERVICE_PORT=3008

FRONTEND_URL=http://localhost:3000
```

## That's It! 🎉

You should now be able to:

- ✅ Sign in without CORS errors
- ✅ See the dashboard
- ✅ Access all features
- ✅ Chat with tutors
- ✅ Book sessions
- ✅ View bookings

Happy coding!
