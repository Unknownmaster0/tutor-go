# 🔧 Network Error Fix Guide

## Problem
You're seeing "Network Error" messages on the dashboard with the message:
```
Network Error: API Gateway is not responding. Make sure the backend services are running with "npm run dev"
```

Or seeing "Network error" written in every box on the page.

---

## Root Cause
The **API Gateway is not running** or the **microservices are not responding**.

---

## Solution

### Step 1: Kill Any Running Processes
Open PowerShell and run:
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force

# Or kill specific port
netstat -ano | findstr :3001
taskkill /PID <PID_NUMBER> /F
```

### Step 2: Install Dependencies (if needed)
```bash
cd apps/backend
npm install
```

### Step 3: Start Backend Services
In **Terminal 1**:
```bash
cd apps/backend
npm run dev
```

Wait for output showing:
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

### Step 4: Start Frontend (in new terminal)
In **Terminal 2**:
```bash
cd apps/frontend
npm run dev
```

### Step 5: Test
Open browser and visit:
```
http://localhost:3000/dashboard
```

**All errors should be gone!** ✅

---

## Checklist

- [ ] All services printed in terminal? (shows 🚀 for each service)
- [ ] No error messages in terminal?
- [ ] Dashboard loads at http://localhost:3000/dashboard?
- [ ] Teacher list displays (no "Network error" messages)?
- [ ] No errors in browser console (F12)?

---

## If Still Getting Errors

### Check 1: Is API Gateway running on 3001?
```bash
curl http://localhost:3001/health
```

Should return:
```json
{"service":"api-gateway","status":"healthy",...}
```

If not, the gateway didn't start. Check terminal for errors.

### Check 2: Are all services running?
Look in terminal - you should see all 9 services started:
- ✅ API Gateway (3001)
- ✅ Auth Service (3008)
- ✅ Tutor Service (3002)
- ✅ Booking Service (3003)
- ✅ Payment Service (3004)
- ✅ Chat Service (3006)
- ✅ Review Service (3005)
- ✅ Notification Service (3007)
- ✅ Admin Service (3009)

If any is missing, that service crashed. Check the error above it.

### Check 3: Check browser console
Press **F12** and go to **Console** tab:
- Look for error messages
- Note the exact error
- Check the Network tab for failed requests

### Check 4: Check databases
Make sure these are running:
- **PostgreSQL**: `localhost:5432`
- **MongoDB**: `localhost:27017`  
- **Redis**: `localhost:6379`

Start them if needed:
```bash
# PostgreSQL
# Start your PostgreSQL service

# MongoDB
mongod

# Redis
redis-server
```

---

## Common Errors & Fixes

### Error: Port 3001 already in use
```powershell
netstat -ano | findstr :3001
taskkill /PID <PID> /F
npm run dev  # Try again
```

### Error: Cannot find module 'express-http-proxy'
```bash
cd apps/backend
npm install
npm run dev
```

### Error: Database connection failed
- Check PostgreSQL is running on localhost:5432
- Check MongoDB is running on localhost:27017
- Check .env file has correct DB URLs

### Error: EADDRINUSE on multiple ports
```powershell
# Kill all node processes
Get-Process node | Stop-Process -Force
npm run dev  # Start fresh
```

---

## Quick Restart

Fastest way to restart everything:

```powershell
# Terminal 1
cd apps/backend
npm run dev

# Terminal 2 (new window/tab)
cd apps/frontend  
npm run dev
```

Then refresh browser at `http://localhost:3000/dashboard`

---

## Network Error Messages Explained

| Error | Meaning | Fix |
|-------|---------|-----|
| "Network Error: Unable to reach the server" | Gateway not running | `npm run dev` in backend |
| "Service Unavailable" | Specific service down | Check which service crashed |
| "404 Not Found" | Wrong endpoint | Check frontend code |
| "401 Unauthorized" | Not authenticated | Login first |

---

## Prevention Tips

1. **Always start backend first**
   ```bash
   # Terminal 1 - Backend
   cd apps/backend && npm run dev
   
   # Wait 5 seconds for all services to start
   # Then Terminal 2 - Frontend
   cd apps/frontend && npm run dev
   ```

2. **Keep terminal windows visible**
   - You can see service startup logs
   - You can spot errors immediately

3. **Check .env file**
   - Make sure it has all the ports configured
   - Make sure database URLs are correct

4. **Monitor the terminal**
   - Watch for errors after starting services
   - Green checkmarks mean services started
   - Red errors mean something failed

---

## Still Stuck?

1. Check **TROUBLESHOOTING.md** in the root directory
2. Read **API_GATEWAY_SETUP.md** for detailed setup
3. Run **VERIFY_SETUP.ps1** to check configuration
4. Check all terminal output carefully - errors usually tell you what's wrong

---

**Remember**: The API Gateway **must** be running on port 3001 for the frontend to work!
