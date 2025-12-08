# Quick Start Guide - After API Gateway Fix

## What Changed?
Your application now uses an **API Gateway** pattern to handle all requests. This fixes the 404 errors you were experiencing on the dashboard.

## Starting the Application

### 1. Start All Services (Recommended for Development)
```bash
cd apps/backend
npm run dev
```

You should see output like:
```
🚀 API Gateway is running on http://localhost:3001
🚀 Auth Service is running on http://localhost:3008
🚀 Tutor Service is running on http://localhost:3002
🚀 Booking Service is running on http://localhost:3003
🚀 Payment Service is running on http://localhost:3004
🚀 Chat Service is running on http://localhost:3006
🚀 Review Service is running on http://localhost:3005
🚀 Notification Service is running on http://localhost:3007
🚀 Admin Service is running on http://localhost:3009
```

### 2. Start Frontend (In a new terminal)
```bash
cd apps/frontend
npm run dev
```

Navigate to: `http://localhost:3000`

## What to Test

1. **Dashboard**: `http://localhost:3000/dashboard`
   - Should now load teacher list without 404 errors
   - API Gateway will route `/tutors/search` → Tutor Service

2. **Bookings**: `http://localhost:3000/dashboard` (Booking section)
   - Should display bookings without errors
   - API Gateway will route `/bookings/*` → Booking Service

3. **Login**: `http://localhost:3000/auth/login`
   - Should work as before
   - API Gateway will route `/auth/*` → Auth Service

## If You Get Errors

### Still getting 404 on dashboard?
1. Check all services are running in the terminal
2. Look for "API Gateway is running on http://localhost:3001"
3. Check browser console for exact API endpoint being called
4. Verify the service port matches the configuration

### Port already in use?
```bash
# Windows: Kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or change port in .env
GATEWAY_PORT=3001  # Change 3001 to another port
```

## Architecture Summary

```
Your Browser (localhost:3000)
         ↓
API Gateway (localhost:3001) ← All requests go here
         ↓
Distributes to appropriate service:
- /auth → Auth Service (3008)
- /tutors → Tutor Service (3002)  
- /bookings → Booking Service (3003)
- /payments → Payment Service (3004)
- /chat → Chat Service (3006)
- /reviews → Review Service (3005)
- /notifications → Notification Service (3007)
- /admin → Admin Service (3009)
```

## Key Points

✅ **Frontend always uses**: `http://localhost:3001`
✅ **Gateway handles routing**: To appropriate microservices
✅ **Services run independently**: But connected via gateway
✅ **No changes needed**: In frontend configuration
✅ **Easy to debug**: All requests flow through gateway

## Need Help?

Check these files for more info:
- `API_GATEWAY_SETUP.md` - Detailed documentation
- `apps/backend/src/api-gateway/index.ts` - Gateway implementation
- `apps/backend/.env` - Port configuration

## Next Session

Just run `npm run dev` in `apps/backend` folder and you're good to go!
