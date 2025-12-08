# ✅ Setup Checklist - API Gateway Fix

Use this checklist to ensure everything is properly configured.

---

## Pre-Setup

- [ ] Node.js 16+ installed
- [ ] PostgreSQL running on localhost:5432
- [ ] MongoDB running on localhost:27017
- [ ] Redis running on localhost:6379

---

## Installation & Configuration

### Step 1: Install Dependencies
- [ ] Run: `cd apps/backend && npm install`
- [ ] Check for errors in terminal
- [ ] Verify `express-http-proxy` is installed

### Step 2: Database Setup
- [ ] Run: `npm run prisma:migrate`
- [ ] Run: `npm run db:seed`
- [ ] Verify no errors in terminal

### Step 3: Environment Variables
- [ ] `.env` file exists in `apps/backend/`
- [ ] `.env` contains `GATEWAY_PORT=3001`
- [ ] `.env` contains `AUTH_SERVICE_PORT=3008`
- [ ] All other service ports are correct
- [ ] Database URLs are correct

---

## Services Running

### Check Backend Services
In terminal, run: `cd apps/backend && npm run dev`

You should see:
- [ ] `🚀 API Gateway is running on http://localhost:3001`
- [ ] `🚀 Auth Service is running on http://localhost:3008`
- [ ] `🚀 Tutor Service is running on http://localhost:3002`
- [ ] `🚀 Booking Service is running on http://localhost:3003`
- [ ] `🚀 Payment Service is running on http://localhost:3004`
- [ ] `🚀 Chat Service is running on http://localhost:3006`
- [ ] `🚀 Review Service is running on http://localhost:3005`
- [ ] `🚀 Notification Service is running on http://localhost:3007`
- [ ] `🚀 Admin Service is running on http://localhost:3009`

### Check Frontend Services
In new terminal, run: `cd apps/frontend && npm run dev`

You should see:
- [ ] Next.js server started
- [ ] Ready on http://localhost:3000
- [ ] No build errors

---

## Testing Gateway Health

Open new terminal and run:

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "service": "api-gateway",
  "status": "healthy",
  "timestamp": "2025-12-08...",
  "uptime": 123.456
}
```

- [ ] Request succeeds
- [ ] Status is "healthy"

---

## Testing Dashboard

### Step 1: Access Dashboard
- [ ] Visit `http://localhost:3000/dashboard` in browser
- [ ] Page loads without errors
- [ ] No 404 errors in console

### Step 2: Check Network Requests
- [ ] Open DevTools (F12)
- [ ] Go to Network tab
- [ ] Reload page
- [ ] Look for request to `http://localhost:3001/tutors/search`
- [ ] Status code is 200 (not 404)

### Step 3: Verify Data Display
- [ ] Teacher list loads
- [ ] Teachers display with names, ratings
- [ ] No error messages shown

---

## Testing Other Features

### Authentication
- [ ] Go to `http://localhost:3000/auth/login`
- [ ] Login works without errors
- [ ] Redirects to dashboard after login

### Bookings
- [ ] Click on bookings section
- [ ] Booking list loads without errors
- [ ] Can view booking details

### Reviews
- [ ] Navigate to reviews
- [ ] Review list loads
- [ ] Can submit new review

### Chat (if available)
- [ ] Open chat section
- [ ] Messages load without errors
- [ ] Can send messages

---

## Performance Checks

### Request Speed
- [ ] API requests complete in < 500ms
- [ ] Dashboard loads in < 2 seconds
- [ ] No hanging requests in Network tab

### Memory Usage
- [ ] Terminal shows reasonable memory usage
- [ ] No memory leak warnings
- [ ] Services stable after 5 minutes of use

### Error Logs
- [ ] Terminal shows no ERROR messages
- [ ] Browser console shows no errors
- [ ] All INFO/LOG messages are normal

---

## Documentation Verification

- [ ] Can find `FIX_SUMMARY.md`
- [ ] Can find `API_GATEWAY_SETUP.md`
- [ ] Can find `ARCHITECTURE_DIAGRAM.md`
- [ ] Can find `TROUBLESHOOTING.md`
- [ ] Can find `QUICK_START_API_GATEWAY.md`
- [ ] Can find `INDEX.md`

---

## File & Config Verification

### Backend Files
- [ ] `apps/backend/src/api-gateway/index.ts` exists
- [ ] `apps/backend/src/auth-service/index.ts` has port 3008
- [ ] `apps/backend/src/review-service/index.ts` has port 3005
- [ ] `apps/backend/src/admin-service/index.ts` has port 3009

### Configuration Files
- [ ] `apps/backend/.env` updated with new ports
- [ ] `apps/backend/.env.example` updated
- [ ] `apps/backend/package.json` has `dev:gateway` script
- [ ] `apps/backend/package.json` has `express-http-proxy` dependency

### Frontend Configuration
- [ ] `apps/frontend/src/lib/api-client.ts` uses `localhost:3001`
- [ ] No hardcoded service ports in frontend code

---

## Port Verification

Run this in new terminal:

```bash
# Windows
netstat -ano | findstr LISTENING | findstr ":300"

# Mac/Linux
lsof -i :3000-3010
```

Check these ports are in use:
- [ ] 3000 (Frontend)
- [ ] 3001 (API Gateway)
- [ ] 3002 (Tutor Service)
- [ ] 3003 (Booking Service)
- [ ] 3004 (Payment Service)
- [ ] 3005 (Review Service)
- [ ] 3006 (Chat Service)
- [ ] 3007 (Notification Service)
- [ ] 3008 (Auth Service)
- [ ] 3009 (Admin Service)
- [ ] 5432 (PostgreSQL)
- [ ] 27017 (MongoDB)
- [ ] 6379 (Redis)

---

## Optional Verification Script

### Windows (PowerShell)
Run: `.\VERIFY_SETUP.ps1`

Check that all checks pass:
- [ ] .env file found
- [ ] express-http-proxy installed
- [ ] API Gateway file exists
- [ ] Port configuration correct
- [ ] Service files updated
- [ ] Scripts configured
- [ ] Documentation files found

### Mac/Linux (Bash)
Run: `bash VERIFY_SETUP.sh`

Check same items as above.

---

## Troubleshooting Checklist

### If getting 404 errors:
- [ ] All services running? (check terminal)
- [ ] API Gateway running on 3001? (check output)
- [ ] Tutor Service running on 3002? (check output)
- [ ] Browser cache cleared? (Ctrl+Shift+Delete)
- [ ] Correct endpoint being called? (check Network tab)

### If services won't start:
- [ ] All dependencies installed? (`npm install`)
- [ ] Databases running? (PostgreSQL, MongoDB, Redis)
- [ ] Ports not in use? (check with netstat/lsof)
- [ ] Environment variables correct? (check .env)
- [ ] File permissions correct?

### If frontend won't load:
- [ ] Frontend running on 3000? (check terminal)
- [ ] Browser has no cache? (hard refresh)
- [ ] Console shows errors? (check DevTools)
- [ ] Network requests to 3001? (check Network tab)

---

## Success Criteria

✅ **Setup is successful when:**

1. All services start without errors
2. Dashboard loads without 404 errors
3. Teacher list displays on dashboard
4. API requests show status 200
5. No errors in browser console
6. No errors in terminal
7. All features work (auth, bookings, reviews, etc.)
8. Performance is good (< 500ms request time)

---

## Final Sign-Off

- [ ] Read SOLUTION_SUMMARY.md
- [ ] Completed all checklist items above
- [ ] Services running successfully
- [ ] Dashboard displaying data
- [ ] No errors in console or terminal
- [ ] **✅ READY FOR PRODUCTION**

---

## Next Steps

1. Use application normally
2. Monitor terminal for any errors
3. Report issues using TROUBLESHOOTING.md
4. Refer to API_GATEWAY_SETUP.md for advanced configuration

---

## Quick Reference

**To restart:**
```bash
# Kill current processes (Ctrl+C in terminals)
cd apps/backend && npm run dev        # Terminal 1
cd apps/frontend && npm run dev       # Terminal 2
```

**To verify:**
```bash
.\VERIFY_SETUP.ps1                    # Windows
bash VERIFY_SETUP.sh                  # Mac/Linux
```

**To test:**
```bash
curl http://localhost:3001/health
```

**To debug:**
1. Check terminal output
2. Check browser DevTools Network tab
3. Read TROUBLESHOOTING.md

---

## Support Resources

| Issue | Resource |
|-------|----------|
| Setup help | QUICK_START_API_GATEWAY.md |
| Technical details | API_GATEWAY_SETUP.md |
| Problem solving | TROUBLESHOOTING.md |
| Visual explanation | ARCHITECTURE_DIAGRAM.md |
| File changes | FIX_SUMMARY.md |
| Navigation | INDEX.md |

---

**Date Completed**: _______________

**Completed By**: _______________

**Notes**: _______________________________________________________________

---

**✅ All done!** Your application is now properly configured with the API Gateway. Enjoy! 🚀
