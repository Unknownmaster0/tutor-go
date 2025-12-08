# 🔧 Troubleshooting & Common Issues Guide

**Purpose**: Quick solutions for common problems that might arise during task implementation.

---

## 🚨 Common Issues & Solutions

### ❌ Issue 1: "Port Already in Use" Error

**Error Message**:

```
Error: listen EADDRINUSE :::8000
Error: listen EADDRINUSE :::8001
```

**Cause**: A service is already running on that port

**Solutions**:

**Option A: Kill the existing process**

```bash
# Find and kill process on port 8000
netstat -ano | findstr :8000
# Get the PID from output, then:
taskkill /PID <PID> /F

# Or kill all Node processes
taskkill /F /IM node.exe 2>nul
```

**Option B: Change the port in .env**

```env
GATEWAY_PORT=8001
AUTH_SERVICE_PORT=8002
# Etc.
```

**Option C: Restart Docker services**

```bash
docker-compose down
docker-compose up -d
```

---

### ❌ Issue 2: CORS Error - "Access to XMLHttpRequest blocked"

**Error in Browser Console**:

```
Access to XMLHttpRequest at 'http://localhost:8000/auth/login'
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Cause**: Frontend origin not in allowed origins list

**Solution**:

**Check CORS config**:

```typescript
// File: apps/backend/src/shared/config/cors.config.ts

const allowedOrigins = [
  'http://localhost:3000', // ✓ Frontend
  'http://localhost:8000', // ✓ Gateway
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000',
];
```

**If missing, add your frontend URL**:

```typescript
const allowedOrigins = [
  'http://localhost:3000', // Add this
  'http://127.0.0.1:3000', // Add this
  // ... rest
];
```

**Verify CORS is applied in all services**:

```typescript
// In each service's index.ts (gateway, auth, tutor, etc.)
app.use(cors(getCorsConfig())); // Must be early in middleware stack
```

---

### ❌ Issue 3: Frontend API URL Configuration Wrong

**Problem**: Frontend is trying to call wrong URL

**Check your configuration**:

**File**: `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:8000  # ✓ Should point to Gateway
```

**If using .env.example**:

```bash
# Copy template
cp apps/frontend/.env.example apps/frontend/.env.local

# Edit the file
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Verify in code**:

```typescript
// File: apps/frontend/src/lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
//                                                    ^^^^^^^^^^^^^^^^^^^^^^^^
//                                      Default should match your setup
```

---

### ❌ Issue 4: Backend Service Not Responding (503 Service Unavailable)

**Error Response**:

```json
{
  "success": false,
  "message": "Auth service is unavailable",
  "error": "connection refused"
}
```

**Cause**: Microservice is not running or gateway has wrong URL

**Solutions**:

**Check if services are running**:

```bash
# Terminal 1 - Start backend
cd d:\WEB DEV\Tutor-go
npm run dev:backend

# Should see:
# ✓ Auth Service is running on http://localhost:8001
# ✓ Tutor Service is running on http://localhost:8002
# etc.
```

**Check service URLs in gateway**:

```typescript
// File: apps/backend/src/gateway/index.ts line 15-23

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
const TUTOR_SERVICE_URL = process.env.TUTOR_SERVICE_URL || 'http://localhost:8002';
//                                                           ^^^^^^^^^^^^^^^^^^^
// Must match actual service port
```

**Check .env file has correct service URLs**:

```env
# apps/backend/.env
AUTH_SERVICE_URL=http://localhost:8001
TUTOR_SERVICE_URL=http://localhost:8002
BOOKING_SERVICE_URL=http://localhost:8003
# etc.
```

---

### ❌ Issue 5: Authorization Header Not Sent

**Problem**: Protected endpoints return 401 Unauthorized

**Error Response**:

```json
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

**Check Token Storage**:

```typescript
// File: apps/frontend/src/lib/token-storage.ts

// Should have:
-getAccessToken() - // Get stored token
  setAccessToken() - // Save token after login
  getRefreshToken() - // Get refresh token
  clearTokens(); // Clear after logout
```

**Check Request Interceptor**:

```typescript
// File: apps/frontend/src/lib/api-client.ts

this.client.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // ✓ Should add header
  }
  return config;
});
```

**Test Manually**:

```bash
# First login to get token
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Response will include accessToken

# Then use token for protected endpoint
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer <accessToken>"
```

---

### ❌ Issue 6: Response Format Mismatch

**Problem**: Frontend can't parse response properly

**Error in Console**:

```
TypeError: Cannot read property 'data' of undefined
Uncaught (in promise) TypeError: response.data is undefined
```

**Check Backend Response Format**:

```typescript
// ✓ CORRECT format (using ApiResponse)
{
  "success": true,
  "message": "Success message",
  "data": {
    // actual data
  }
}

// ❌ WRONG format (raw data, no wrapper)
{
  "id": "user-123",
  "name": "John"
}
```

**Fix Backend Controllers**:

```typescript
// ❌ WRONG
res.json({ id: user.id, name: user.name });

// ✓ CORRECT
ApiResponse.success(res, { id: user.id, name: user.name });
```

**Check Frontend Response Parsing**:

```typescript
// File: apps/frontend/src/lib/api-client.ts

async get<T>(url: string, config?: AxiosRequestConfig) {
  const response = await this.client.get<{ success: boolean; message: string; data: T }>(
    url,
    config,
  );
  return response.data.data;  // ✓ Extract data from wrapper
}
```

---

### ❌ Issue 7: Database Connection Failed

**Error**:

```
Error: connect ECONNREFUSED 127.0.0.1:5432
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Cause**: Database services not running

**Solution**:

**Start Docker services**:

```bash
docker-compose up -d
# Wait a few seconds for services to start

# Verify:
docker-compose ps
# Should show: postgres, mongodb, redis, rabbitmq all UP
```

**Check Database Credentials**:

```env
# apps/backend/.env

POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tutorgo
POSTGRES_PASSWORD=password
POSTGRES_DB=tutorgo

MONGODB_URI=mongodb://localhost:27017/tutorgo

REDIS_HOST=localhost
REDIS_PORT=6379
```

**Test Connection**:

```bash
# Test PostgreSQL
psql -h localhost -U tutorgo -d tutorgo -c "SELECT 1"

# Test MongoDB
mongo mongodb://localhost:27017/tutorgo

# Test Redis
redis-cli ping
```

---

### ❌ Issue 8: TypeScript/Compilation Errors

**Error**:

```
error TS2322: Type 'string' is not assignable to type 'number'
error TS7006: Parameter 'req' implicitly has an 'any' type
```

**Solution**:

**Check tsconfig.json exists**:

```bash
# In backend folder
ls apps/backend/tsconfig.json

# In frontend folder
ls apps/frontend/tsconfig.json
```

**Rebuild TypeScript**:

```bash
# In backend
cd apps/backend
npm run build

# In frontend
cd apps/frontend
npm run build
```

**Or restart dev server** (it auto-compiles):

```bash
# Kill current process (Ctrl+C)
# Then restart
npm run dev:backend
npm run dev:frontend
```

---

### ❌ Issue 9: 404 Not Found on API Endpoint

**Error Response**:

```json
{
  "success": false,
  "message": "Cannot POST /auth/login"
}
```

**Cause**: Route not registered or wrong path

**Check Route Registration**:

```typescript
// File: apps/backend/src/auth-service/index.ts

app.use('/auth', createAuthRoutes(authController));
//      ^^^^^^
// Prefix must match gateway route
```

**Check Gateway Proxy Route**:

```typescript
// File: apps/backend/src/gateway/index.ts

app.use(
  '/auth',
  createProxyMiddleware({
    target: AUTH_SERVICE_URL,
    //      ^^^^^^^^^^^^^^^^
    // Must point to correct service
  }),
);
```

**Verify Complete Path**:

```
Frontend calls:  POST /auth/login
                      ^^^^^ (route in gateway)
Gateway proxies to:  http://localhost:8001/auth/login
                                            ^^^^^ (route in auth service)

So auth.routes.ts must have:
  POST /login (not /auth/login)
```

---

### ❌ Issue 10: Validation Errors Not Displayed

**Problem**: Server returns 400 but frontend doesn't show error

**Check Response Format**:

```typescript
// ✓ CORRECT - with errors array
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" },
    { "field": "password", "message": "Too short" }
  ]
}

// ❌ WRONG - without errors
{
  "success": false,
  "message": "Validation failed"
}
```

**Check Backend Error Handler**:

```typescript
// File: apps/backend/src/shared/middleware/errorHandler.ts

// Should format validation errors properly
ApiResponse.error(res, message, 400, validationErrors);
```

**Check Frontend Error Handling**:

```typescript
// Should parse and display errors
catch (error) {
  if (error.response?.data?.errors) {
    // Display errors from array
  }
}
```

---

### ❌ Issue 11: CORS Preflight Request Failing

**Error**:

```
Response to preflight request doesn't pass access control check
No 'Access-Control-Allow-Origin' header
```

**Cause**: OPTIONS requests not handled properly

**Solution**:

**Add explicit OPTIONS handling**:

```typescript
// File: apps/backend/src/gateway/index.ts

// Add before proxy middleware
app.options('*', cors(getCorsConfig()));

// Or add to each service's index.ts
app.use(cors(getCorsConfig()));
```

**Verify CORS is early in middleware stack**:

```typescript
// ✓ CORRECT order
app.use(helmet());
app.use(cors(getCorsConfig())); // EARLY
app.use(morgan('dev'));
app.use(express.json());
// ... then routes and proxy
```

---

### ❌ Issue 12: Token Refresh Not Working

**Problem**: Session expires, token refresh fails

**Check Refresh Endpoint**:

```bash
# Test refresh endpoint
curl -X POST http://localhost:8000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"your-refresh-token"}'
```

**Check Frontend Interceptor**:

```typescript
// File: apps/frontend/src/lib/api-client.ts

if (error.response?.status === 401 && !originalRequest._retry) {
  originalRequest._retry = true;

  const refreshToken = tokenStorage.getRefreshToken();
  // Should make refresh request here
}
```

**Check Token Storage**:

```typescript
// Both tokens must be stored
tokenStorage.setAccessToken(newAccessToken);
tokenStorage.setRefreshToken(newRefreshToken);
```

---

### ❌ Issue 13: File Upload Fails

**Error**:

```
TypeError: Cannot read property 'file' of undefined
Error: Unexpected end of form
```

**Check Multer Middleware**:

```typescript
// File: apps/backend/src/tutor-service/middleware/upload.middleware.ts

// Should be properly configured
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow video files
  },
});
```

**Check Route Setup**:

```typescript
// Must use upload middleware
router.post(
  '/upload-video',
  authenticateToken,
  upload.single('video'), // ✓ Middleware
  asyncHandler(tutorController.uploadVideo),
);
```

**Check Frontend Form Data**:

```typescript
// Must use FormData
const formData = new FormData();
formData.append('video', file);
apiClient.post('/tutors/upload-video', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
```

---

## 🆘 Debugging Techniques

### Technique 1: Check Browser Network Tab

1. Open DevTools (F12)
2. Go to Network tab
3. Perform action in frontend
4. Look for failed requests (red)
5. Click on request to inspect:
   - **Headers**: Check Authorization header
   - **Request**: Check body data structure
   - **Response**: Check response format
   - **Status**: Should be 200, 201, 400, 401, etc.

### Technique 2: Monitor Backend Terminal

1. Start backend with `npm run dev:backend`
2. Watch terminal for logs:
   ```
   [Gateway] Routing POST /auth/login to Auth Service
   [Auth] ✓ In route: auth/login
   Auth Service response sent
   ```
3. If logs don't appear, request isn't reaching backend

### Technique 3: Test with Curl

```bash
# Test login without frontend
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test with authorization
curl http://localhost:8000/auth/me \
  -H "Authorization: Bearer eyJhbGc..."

# Test CORS preflight
curl -X OPTIONS http://localhost:8000/auth/login \
  -H "Origin: http://localhost:3000"
```

### Technique 4: Check Environment Variables

```bash
# Print all env vars
env | grep -i port
env | grep -i url
env | grep -i database

# Or check .env file directly
cat apps/backend/.env
cat apps/frontend/.env.local
```

### Technique 5: Enable Debug Logging

```typescript
// Temporary: Add to service for debugging
import debug from 'debug';
const log = debug('app:*');

// Use in code
log('Detailed info about request', req.body);
log('Response being sent', response);

// Run with debug enabled
DEBUG=app:* npm run dev:backend
```

---

## 📋 Pre-Check Checklist

Before starting tasks, verify:

```
☐ Docker is running
  docker-compose up -d

☐ All ports are free
  netstat -ano | findstr :8000
  netstat -ano | findstr :8001

☐ .env files exist and are configured
  apps/backend/.env (copy from .example if needed)
  apps/frontend/.env.local (copy from .example if needed)

☐ Dependencies are installed
  npm install (from root)
  npm install (from apps/backend)
  npm install (from apps/frontend)

☐ Backend starts without errors
  npm run dev:backend (should show all services running)

☐ Frontend starts without errors
  npm run dev:frontend (should show "ready" message)

☐ Can access frontend
  http://localhost:3000

☐ Can access gateway health
  curl http://localhost:8000/health
```

---

## 🎯 Quick Reference: What to Check

| Problem                 | Check                              | File                                |
| ----------------------- | ---------------------------------- | ----------------------------------- |
| 503 Service Unavailable | Service running on correct port    | `gateway/index.ts`, `.env`          |
| CORS error              | Allowed origins                    | `shared/config/cors.config.ts`      |
| 401 Unauthorized        | Token in storage, interceptor      | `api-client.ts`, `token-storage.ts` |
| 404 Not Found           | Route registration                 | Routes files, gateway proxy         |
| Response parsing error  | Response format using ApiResponse  | Controllers, `utils/response.ts`    |
| API_URL wrong           | Environment variable               | `api-client.ts`, `.env.local`       |
| Port in use             | Other process, kill or change port | Use `netstat` or `taskkill`         |
| Database error          | Docker services running            | `docker-compose up -d`              |

---

## 💬 When to Ask for Help

Document before asking:

1. **Full error message** - Copy entire error text
2. **Steps to reproduce** - What did you do before error?
3. **Expected vs actual** - What should happen vs what happens?
4. **Logs** - Terminal output and browser console errors
5. **Environment** - OS, Node version, etc.

Example good bug report:

```
When I login at http://localhost:3000/auth/login:
- Email: test@example.com
- Password: password123
- Expected: Redirect to dashboard
- Actual: Error "Cannot POST /auth/login"
- Browser: Chrome 120
- Backend logs show: No output (request not reaching backend)
- .env NEXT_PUBLIC_API_URL: http://localhost:8000
```

---

**Last Updated**: December 8, 2025  
**Part of**: Complete Task Documentation Set
