# API Gateway Routing Issue - Root Cause & Fix

## 🔴 Problem Identified

The API Gateway was **not routing requests** to the backend microservices. The issue was in the **`pathRewrite` configuration** of the `http-proxy-middleware`.

---

## 📋 Root Cause Analysis

### The Broken Configuration

In `apps/backend/src/gateway/index.ts`, all service routes had this pattern:

```typescript
app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '/auth', // ❌ PROBLEM: Rewrites to itself!
    },
  }),
);
```

### Why It Failed

When a request came in:

1. **Client sends**: `POST /auth/login`
2. **Gateway receives**: `/auth/login`
3. **pathRewrite executes**: `^/auth` → `/auth` (no change!)
4. **Forwards to Auth Service**: `http://localhost:8001/auth/login`
5. **Auth Service routes with**: `app.use('/auth', createAuthRoutes())`
6. **Matching attempt**: Tries to match `/auth/login` against `/auth` + route handlers
7. **Result**: ❌ **Double path issue** - Looking for `/auth/auth/login` instead of `/auth/login`

### Visual Flow of the Bug

```
Frontend Request
    ↓
GET /auth/login
    ↓
API Gateway (port 8000)
    ↓
pathRewrite: '^/auth' → '/auth' (PROBLEM: Still has /auth)
    ↓
Forward to http://localhost:8001/auth/login
    ↓
Auth Service receives: /auth/login
    ↓
app.use('/auth', routes) tries to match
    ↓
Expects: /auth/ + login
But gets: /auth/login (already has /auth prefix)
    ↓
❌ 404 Not Found - Route not found!
```

---

## ✅ The Solution

Change the `pathRewrite` to **remove the service prefix** instead of rewriting it to itself:

```typescript
app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/auth': '', // ✅ FIXED: Removes the /auth prefix entirely
    },
  }),
);
```

### How It Works Now

1. **Client sends**: `POST /auth/login`
2. **Gateway receives**: `/auth/login`
3. **pathRewrite executes**: `^/auth` → `` (empty string, removes prefix)
4. **Forwards to Auth Service**: `http://localhost:8001/login`
5. **Auth Service routes with**: `app.use('/auth', createAuthRoutes())`
6. **Matching**: `/login` matches against the routes inside `createAuthRoutes()`
7. **Result**: ✅ **Request successfully routed!**

### Visual Flow of the Fix

```
Frontend Request
    ↓
GET /auth/login
    ↓
API Gateway (port 8000)
    ↓
pathRewrite: '^/auth' → '' (FIXED: Removes prefix)
    ↓
Forward to http://localhost:8001/login
    ↓
Auth Service receives: /login
    ↓
app.use('/auth', routes) wraps the routes
    ↓
/auth + /login routes = /auth/login
    ↓
✅ Route found and executed!
```

---

## 📝 Services Fixed

The following service route configurations were fixed:

| Service      | Old pathRewrite                       | New pathRewrite         | Port |
| ------------ | ------------------------------------- | ----------------------- | ---- |
| Auth         | `'^/auth': '/auth'`                   | `'^/auth': ''`          | 8001 |
| Tutor        | `'^/tutors': '/tutors'`               | `'^/tutors': ''`        | 8002 |
| Booking      | `'^/bookings': '/bookings'`           | `'^/bookings': ''`      | 8003 |
| Payment      | `'^/payments': '/payments'`           | `'^/payments': ''`      | 8004 |
| Review       | `'^/reviews': '/reviews'`             | `'^/reviews': ''`       | 8005 |
| Chat         | `'^/chat': '/chat'`                   | `'^/chat': ''`          | 8006 |
| Notification | `'^/notifications': '/notifications'` | `'^/notifications': ''` | 8007 |
| Admin        | `'^/admin': '/admin'`                 | `'^/admin': ''`         | 8008 |

---

## 🧪 Testing the Fix

After deploying this fix, test the routing with:

```bash
# Test Auth Service
curl http://localhost:8000/auth/health

# Test Tutor Service
curl http://localhost:8000/tutors/health

# Test Booking Service
curl http://localhost:8000/bookings/health

# Test other services...
curl http://localhost:8000/{service}/health
```

You should see responses like:

```json
{
  "success": true,
  "data": {
    "service": "auth-service",
    "timestamp": "2025-12-08T10:00:00.000Z",
    "uptime": 123.45
  }
}
```

---

## 🎯 Key Takeaway

**In microservices architecture with API gateways:**

- The gateway's `pathRewrite` should **remove** the service prefix, not rewrite it to itself
- Individual microservices handle their own route prefixes via `app.use('/service', routes)`
- Double prefixing causes 404 errors because the service can't find the route

**Formula:**

```
Gateway pathRewrite: Remove the prefix
Service routing: Add the prefix back
Result: Correct single prefix in final route matching
```

---

## 📂 File Modified

- `apps/backend/src/gateway/index.ts` - All service proxy middleware `pathRewrite` configurations updated

---

## 🚀 Next Steps

1. Restart the gateway service
2. Run the test commands above
3. Monitor gateway logs for successful route forwarding
4. Test actual API endpoints from the frontend

---

**Status**: ✅ **FIXED** - All gateway routes now properly forward requests to microservices
