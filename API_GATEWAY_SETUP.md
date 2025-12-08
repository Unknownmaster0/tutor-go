# API Gateway Implementation - Fix for 404 Errors

## Problem
The frontend was getting 404 errors when trying to access API endpoints on the dashboard because:
1. Multiple microservices were running on separate ports (3001-3007)
2. Frontend was configured to hit `http://localhost:3001` (Auth Service port)
3. Requests for `/tutors/search`, `/bookings/*`, etc. were not being routed to their respective services

## Solution
Implemented an **API Gateway** that acts as a centralized entry point for all microservice requests.

## Architecture Overview

```
Frontend (http://localhost:3000)
         ↓
API Gateway (http://localhost:3001)
     ↓ ↓ ↓ ↓ ↓ ↓ ↓ ↓
[Auth] [Tutor] [Booking] [Payment] [Chat] [Review] [Notification] [Admin]
(3008)  (3002)   (3003)   (3004)  (3006) (3005)   (3007)        (3009)
```

## Port Configuration

| Service | Port | Environment Variable |
|---------|------|----------------------|
| **API Gateway** | **3001** | `GATEWAY_PORT` |
| Auth Service | 3008 | `AUTH_SERVICE_PORT` |
| Tutor Service | 3002 | `TUTOR_SERVICE_PORT` |
| Booking Service | 3003 | `BOOKING_SERVICE_PORT` |
| Payment Service | 3004 | `PAYMENT_SERVICE_PORT` |
| Chat Service | 3006 | `CHAT_SERVICE_PORT` |
| Review Service | 3005 | `REVIEW_SERVICE_PORT` |
| Notification Service | 3007 | `NOTIFICATION_SERVICE_PORT` |
| Admin Service | 3009 | `ADMIN_SERVICE_PORT` |

## Route Mapping

The API Gateway routes incoming requests to the appropriate microservice:

| Request Path | Routes To | Service Port |
|-------------|-----------|--------------|
| `/auth/*` | Auth Service | 3008 |
| `/tutors/*` | Tutor Service | 3002 |
| `/bookings/*` | Booking Service | 3003 |
| `/payments/*` | Payment Service | 3004 |
| `/chat/*` | Chat Service | 3006 |
| `/messages/*` | Chat Service | 3006 |
| `/reviews/*` | Review Service | 3005 |
| `/notifications/*` | Notification Service | 3007 |
| `/admin/*` | Admin Service | 3009 |

## How It Works

1. **Frontend makes a request** to `http://localhost:3001/tutors/search`
2. **API Gateway receives the request** at port 3001
3. **Gateway matches the route** to `/tutors/*` 
4. **Gateway proxies the request** to Tutor Service at `http://localhost:3002/tutors/search`
5. **Tutor Service responds** with data
6. **Gateway passes response back** to the frontend

## Files Modified

1. **Created**: `apps/backend/src/api-gateway/index.ts`
   - New API Gateway service with route proxying
   - Uses `express-http-proxy` to forward requests to microservices

2. **Updated**: `apps/backend/package.json`
   - Added `express-http-proxy` dependency
   - Added `dev:gateway` script
   - Updated `dev` script to start gateway first

3. **Updated**: `apps/backend/.env` and `.env.example`
   - Added `GATEWAY_PORT=3001`
   - Changed `AUTH_SERVICE_PORT` from 3001 to 3008
   - Added missing service ports

4. **Updated Service Files**:
   - `src/auth-service/index.ts` - Port changed to 3008
   - `src/review-service/index.ts` - Port changed to 3005
   - `src/admin-service/index.ts` - Port changed to 3009

## Running the Application

### Development Mode (All Services + Gateway)
```bash
cd apps/backend
npm run dev
```

This will start:
- API Gateway on port 3001
- Auth Service on port 3008
- Tutor Service on port 3002
- Booking Service on port 3003
- Payment Service on port 3004
- Chat Service on port 3006
- Review Service on port 3005
- Notification Service on port 3007
- Admin Service on port 3009

### Run Individual Service
```bash
npm run dev:auth    # Auth Service only
npm run dev:tutor   # Tutor Service only
npm run dev:booking # Booking Service only
# ... etc
```

## Frontend Configuration

The frontend is already configured to hit the gateway:
- **API URL**: `http://localhost:3001` (via `NEXT_PUBLIC_API_URL` env variable)
- All requests are automatically routed through the gateway to the correct service

## Benefits

✅ **Single Entry Point**: Frontend doesn't need to know about individual service ports
✅ **Service Isolation**: Microservices can run independently
✅ **Easy Routing**: Central location to manage all API routes
✅ **Scalability**: Easy to add new services and routes
✅ **Security**: Can add middleware for authentication, rate limiting, etc.
✅ **Error Handling**: Centralized error handling and logging

## Troubleshooting

### 404 Errors
- Make sure API Gateway is running on port 3001
- Check that the specific microservice is running on its configured port
- Verify the request path matches the route in the gateway

### Service Not Found
- Check `.env` file has correct service URLs
- Verify each service is listening on its designated port
- Check gateway logs for routing errors

### Port Already in Use
- Kill any processes on the required port
- Or change the port in `.env` file and restart services

## Next Steps (Optional Enhancements)

1. **Add Authentication Middleware** - Validate JWT tokens at gateway level
2. **Add Rate Limiting** - Prevent abuse on specific routes
3. **Add Logging** - Log all requests/responses for debugging
4. **Add Load Balancing** - Distribute requests across multiple service instances
5. **Add Circuit Breaker** - Handle service failures gracefully
