# Auth & Navigation Fix - Testing Plan

## Pre-Testing Setup

### Step 1: Restart Frontend
```bash
cd apps/frontend
npm run dev
```

The frontend will reload with the new middleware and auth checks.

### Step 2: Clear Browser Cache
- Press `F12` to open DevTools
- Go to **Application** tab
- Clear all cookies for `localhost:3000`
- Close DevTools

### Step 3: Verify Backend is Running
```bash
# Make sure all services are running
cd apps/backend
npm run dev
```

---

## Test Scenarios

### TEST 1: Login Flow (Authenticated User Cannot Re-access Login)

**Scenario:** Logged-in user tries to visit login page

**Steps:**
1. ✅ Login with valid credentials:
   - Email: `rahul.verma@example.com`
   - Password: `Password123`
2. ✅ Verify redirected to dashboard (not staying on login)
3. ✅ Check URL should be: `http://localhost:3000/dashboard`
4. ✅ Note browser history

**Expected Results:**
- ✅ Successfully logged in
- ✅ Redirected immediately to dashboard
- ✅ Dashboard shows "Welcome, Rahul Verma"

**Critical Test:**
5. ✅ Open new tab: `http://localhost:3000/auth/login`
6. ✅ Verify immediately redirected to `/dashboard`
7. ✅ NOT shown login form

**Success Criteria:** ✅ Login page redirects authenticated users to dashboard

---

### TEST 2: Browser Back Button From Dashboard

**Scenario:** User in dashboard clicks browser back button

**Steps:**
1. ✅ Make sure you're logged in at dashboard
2. ✅ Look at browser history (should show: home → login → dashboard)
3. ✅ Click browser back button (← arrow in top-left)

**Expected Results:**
- ✅ NOT redirected to login page
- ✅ Stays on dashboard OR goes back to home
- ✅ If goes to login/home - middleware redirects back to dashboard
- ✅ NOT stuck in infinite redirect loop

**Verification:**
- ✅ Check browser console (F12 → Console)
- ✅ Look for any redirect errors
- ✅ Smooth experience without constant redirects

**Success Criteria:** ✅ Back button doesn't trap user on login page

---

### TEST 3: Protect Dashboard from Unauthenticated Access

**Scenario:** Logged-out user tries to access dashboard

**Steps:**
1. ✅ Click "Logout" button on dashboard
2. ✅ Wait for redirect to home page (or login)
3. ✅ Try direct URL: `http://localhost:3000/dashboard`

**Expected Results:**
- ✅ Redirected to login page
- ✅ URL shows: `/auth/login?redirect=%2Fdashboard`
- ✅ After logging in, redirected back to dashboard

**Success Criteria:** ✅ Unauthenticated users cannot access dashboard

---

### TEST 4: Home Page Authentication Check

**Scenario:** Logged-in user visits home page

**Steps:**
1. ✅ Make sure you're logged in
2. ✅ Go directly to: `http://localhost:3000/`
3. ✅ Observe what happens

**Expected Results:**
- ✅ Immediately redirected to `/dashboard`
- ✅ NOT shown home page search form
- ✅ Smooth redirect without delays

**Alternative - Logged Out:**
4. ✅ Logout completely
5. ✅ Visit home page: `http://localhost:3000/`
6. ✅ Verify home page shows with search bar

**Success Criteria:** ✅ Home page properly checks auth status

---

### TEST 5: Signup Page Protection

**Scenario:** Logged-in user tries to signup again

**Steps:**
1. ✅ Make sure you're logged in
2. ✅ Go to: `http://localhost:3000/auth/register`

**Expected Results:**
- ✅ Immediately redirected to `/dashboard`
- ✅ NOT shown signup form
- ✅ URL changes to `/dashboard`

**Verify New Signup:**
3. ✅ Logout completely
4. ✅ Visit: `http://localhost:3000/auth/register`
5. ✅ Signup form should display normally

**Success Criteria:** ✅ Signup page blocks authenticated users

---

### TEST 6: Back Button Visibility

**Scenario:** Check back button on dashboard

**Steps:**
1. ✅ Login to dashboard
2. ✅ Look at top header area
3. ✅ Find "Home" button next to TutorGo logo

**Expected Results:**
- ✅ Back button visible on desktop (hidden on mobile)
- ✅ Button has back arrow icon and "Home" text
- ✅ Clicking it navigates to previous page

**Success Criteria:** ✅ Back button present and functional

---

### TEST 7: Protected Routes - Booking

**Scenario:** Unauthenticated user tries to access booking

**Steps:**
1. ✅ Logout completely
2. ✅ Try to visit: `http://localhost:3000/booking/123`
3. ✅ Observe redirect behavior

**Expected Results:**
- ✅ Redirected to login page
- ✅ URL includes redirect param: `/auth/login?redirect=%2Fbooking%2F123`
- ✅ After login, redirected back to booking page

**Success Criteria:** ✅ Booking route requires authentication

---

### TEST 8: Protected Routes - Chat

**Scenario:** Unauthenticated user tries to access chat

**Steps:**
1. ✅ Logout completely
2. ✅ Try to visit: `http://localhost:3000/chat`

**Expected Results:**
- ✅ Redirected to login page with redirect param

**Success Criteria:** ✅ Chat route requires authentication

---

## Browser Console Checks

While testing, check browser console (F12 → Console):

### ✅ Healthy Signs
- Clean console (no errors)
- Only normal React/Next.js logs
- No infinite redirect warnings
- Auth tokens logged appropriately

### ❌ Warning Signs
- `Uncaught ReferenceError` - Script error
- `Redirect loop detected` - Auth check infinite loop
- `Cannot read property 'accessToken'` - Cookie issue
- CORS errors - Backend not responding

---

## Common Issues & Solutions

### Issue: Still seeing login page after login
**Solution:**
- Middleware not loaded - restart frontend with `npm run dev`
- Clear browser cache and cookies
- Check backend auth endpoint working: `POST /auth/login`

### Issue: Constantly redirecting between pages
**Solution:**
- Check browser console for errors
- Clear all cookies
- Make sure middleware.ts exists in root
- Verify auth context providing correct `isAuthenticated` value

### Issue: Back button not working
**Solution:**
- Browser history might be empty
- Try navigating to 2+ pages first, then use back button
- Check if using iOS Safari (might have history issues)

### Issue: Still can access login while logged in
**Solution:**
- Middleware not applying - restart frontend
- Check `accessToken` cookie in Application tab
- Verify `useEffect` hook running in login page (F12 → Console should show auth checks)

---

## Test Results Template

Copy and fill out this checklist:

```
DATE: ___________
TESTER: ___________

TEST 1: Login Redirect ___________
TEST 2: Back Button ___________
TEST 3: Dashboard Protection ___________
TEST 4: Home Page Auth ___________
TEST 5: Signup Protection ___________
TEST 6: Back Button Visible ___________
TEST 7: Booking Route ___________
TEST 8: Chat Route ___________

CONSOLE ERRORS: ___________
OVERALL STATUS: ✅ PASS / ❌ FAIL

NOTES:
_____________________________________________
_____________________________________________
_____________________________________________
```

---

## Performance Checks

While testing, verify performance:

- ✅ Login to dashboard: < 2 seconds
- ✅ Page redirects: < 1 second  
- ✅ Back button navigation: Instant
- ✅ No noticeable lag or freezing

---

## Test Execution Order

**Recommended order for testing:**

1. First: TEST 1 - Make sure login works
2. Then: TEST 2 - Browser back button (core issue)
3. Then: TEST 3 & 4 - Dashboard/home protection
4. Then: TEST 5 - Signup protection
5. Then: TEST 6 - Back button visibility
6. Finally: TEST 7 & 8 - Other protected routes

---

## Success Criteria

✅ **All of these must pass:**

1. ✅ Logged-in users cannot access `/auth/login`
2. ✅ Logged-in users cannot access `/auth/register`
3. ✅ Logged-in users cannot access `/` 
4. ✅ Unauthenticated users cannot access `/dashboard`
5. ✅ Browser back button doesn't trap user on login
6. ✅ Back button present and working on dashboard
7. ✅ All protected routes require authentication
8. ✅ Smooth redirects without infinite loops
9. ✅ No console errors
10. ✅ Good performance (< 2s page loads)

**Once ALL 10 criteria pass, the fix is complete!** ✅

---

## Post-Testing

If all tests pass:
1. ✅ Document test results
2. ✅ Test on different browsers if possible (Chrome, Firefox, Safari)
3. ✅ Test on mobile devices if available
4. ✅ Document any edge cases found
5. ✅ Deploy to staging/production

If issues found:
1. ❌ Note the specific test that failed
2. ❌ Check browser console for errors
3. ❌ Verify middleware.ts exists and syntax is correct
4. ❌ Check auth-context is properly initialized
5. ❌ Consult troubleshooting section above
