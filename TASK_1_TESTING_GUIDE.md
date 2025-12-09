# Task 1 Testing Quick Reference

## Authentication Flow Testing

### 1. Registration Flow

**Student Registration:**

```
1. Navigate to http://localhost:3000/auth/register
2. Click "I'm a Student"
3. Fill in:
   - Email: student@example.com
   - Password: Password123
   - Confirm: Password123
   - Name: John Student
4. Click "Register"
5. Expected: Redirect to /dashboard/student
```

**Tutor Registration:**

```
1. Navigate to http://localhost:3000/auth/register
2. Click "I'm a Tutor"
3. Fill in:
   - Email: tutor@example.com
   - Password: Password123
   - Confirm: Password123
   - Name: Jane Tutor
4. Click "Register"
5. Expected: Redirect to /dashboard/tutor/profile
```

### 2. Login Flow

**Valid Credentials:**

```
1. Navigate to http://localhost:3000/auth/login
2. Enter email and password from registration
3. Click "Sign In"
4. Expected: Redirect to appropriate dashboard
```

**Invalid Credentials:**

```
1. Navigate to http://localhost:3000/auth/login
2. Enter wrong password
3. Click "Sign In"
4. Expected: Error message displayed
```

### 3. Password Reset Flow

**Request Reset:**

```
1. Navigate to http://localhost:3000/auth/forgot-password
2. Enter registered email
3. Click "Send Reset Link"
4. Expected: Success message with email confirmation
5. Check email for reset link
```

**Reset Password:**

```
1. Click reset link from email
2. Enter new password (8+ characters)
3. Confirm password
4. Click "Reset Password"
5. Expected: Success message, auto-redirect to login
6. Login with new password
```

### 4. Protected Routes

**Without Authentication:**

```
1. Navigate to http://localhost:3000/dashboard
2. Expected: Redirect to /auth/login
```

**After Authentication:**

```
1. Login first
2. Navigate to http://localhost:3000/dashboard
3. Expected: Dashboard loads successfully
```

**Role-Based Access:**

```
1. Login as student
2. Try to access tutor-only routes (if any)
3. Expected: Redirect to appropriate page or error
```

## Form Validation Testing

### Email Validation

```
Valid: user@example.com
Invalid: user@example (missing domain)
Invalid: @example.com (missing local part)
Invalid: user.example.com (missing @)
```

### Password Validation

```
Valid: Password123 (8+ chars)
Invalid: Pass (less than 8 chars)
Password Match: Both fields must match
```

### Field Requirements

```
Student Form: email, password, name (required)
Tutor Form: email, password, name (required)
Login Form: email, password (required)
```

## Token Management Testing

### Session Persistence

```
1. Login to the application
2. Refresh the page
3. Expected: User still logged in (session persists)
```

### Token Refresh

```
1. Open browser DevTools
2. Go to Application > LocalStorage
3. Find 'accessToken' and 'refreshToken'
4. Expected: Both tokens present after login
5. Make API calls after token expiry
6. Expected: Automatic refresh (no user notice)
```

### Logout

```
1. Login to the application
2. Click logout (if implemented in dashboard)
3. Navigate to /dashboard
4. Expected: Redirect to /auth/login
5. Check LocalStorage
6. Expected: Tokens cleared
```

## Error Scenarios

### Network Errors

```
1. Turn off internet during login
2. Try to submit form
3. Expected: Network error message displayed
```

### Server Errors

```
1. Try to register with existing email
2. Expected: Server error message displayed
3. Example: "Email already registered"
```

### Validation Errors

```
1. Leave required field empty
2. Try to submit
3. Expected: Inline validation error message
```

## API Integration Verification

### Check Network Requests

```
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Perform login
4. Look for POST /api/auth/login
5. Verify response contains:
   - accessToken
   - refreshToken
   - user object
```

### Check Local Storage

```
1. Open DevTools > Application > LocalStorage
2. After login, verify:
   - accessToken (JWT token)
   - refreshToken (refresh token)
3. After logout, verify tokens are cleared
```

## Responsive Design Testing

### Mobile Testing

```
1. Resize browser to 375px width (mobile)
2. Navigate to /auth/login
3. Expected: Form still readable and usable
```

### Tablet Testing

```
1. Resize browser to 768px width (tablet)
2. Navigate to /auth/register
3. Expected: Layout adapts properly
```

## Accessibility Testing

### Keyboard Navigation

```
1. Use Tab key to navigate form fields
2. Use Enter to submit form
3. Expected: All interactive elements accessible
```

### Screen Reader Testing

```
1. Use ARIA labels: <label htmlFor="email">
2. Expected: Labels read correctly
3. Error messages announced properly
```

## Performance Testing

### Load Time

```
1. Open DevTools > Performance
2. Load /auth/login
3. Expected: Fast load time (< 2s)
```

### Bundle Size

```
1. Check bundle.js size
2. Expected: Auth components < 50kb
```

## Security Testing

### Password Security

```
1. Check password is masked (**** in input)
2. Expected: Password not visible
```

### Token Security

```
1. Check tokens in LocalStorage (not ideal but acceptable)
2. Best practice: Move to httpOnly cookie
3. Current: Refresh token in httpOnly (backend)
```

### CSRF Protection

```
1. Check axios headers
2. Expected: CSRF token if applicable
```

## Known Limitations & Future Improvements

- [ ] Social login (Google, GitHub)
- [ ] Two-factor authentication
- [ ] Email verification on signup
- [ ] Account lockout after failed attempts
- [ ] Password complexity requirements
- [ ] Remember me functionality
- [ ] Single sign-on (SSO)
- [ ] Rate limiting on auth endpoints

## Troubleshooting

### Issue: Login fails with "Invalid credentials"

**Solution:**

1. Verify backend auth service is running
2. Check API gateway configuration
3. Verify CORS settings
4. Check network requests in DevTools

### Issue: Token not stored

**Solution:**

1. Check localStorage is enabled
2. Verify API response includes tokens
3. Check token storage configuration
4. Inspect DevTools > Application > Storage

### Issue: Form validation not working

**Solution:**

1. Check browser console for errors
2. Verify form field names match validation rules
3. Check React state management
4. Inspect component props

### Issue: Redirect loops

**Solution:**

1. Check protected route configuration
2. Verify token refresh logic
3. Check auth context initialization
4. Clear cache and LocalStorage

## Success Criteria Verification

- [ ] Users can register as student
- [ ] Users can register as tutor
- [ ] Users can login
- [ ] Users can request password reset
- [ ] Users can reset password
- [ ] Protected routes work
- [ ] Tokens refresh automatically
- [ ] Form validation works
- [ ] Error messages display
- [ ] Responsive design works
- [ ] Accessibility features work
- [ ] No console errors

Once all criteria are verified, Task 1 is production-ready!
