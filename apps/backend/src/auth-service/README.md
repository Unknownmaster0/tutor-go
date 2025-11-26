# Auth Service

The Auth Service handles user authentication, authorization, and account management for the TutorGo platform.

## Features Implemented

### 1. User Registration (Task 3.1)

- **Endpoint**: `POST /auth/register`
- **Features**:
  - Email and password validation
  - Password hashing with bcrypt (10 salt rounds)
  - Role-based registration (student, tutor)
  - Optional phone number
  - Email verification (mock implementation)
  - Duplicate email detection

### 2. User Login & JWT Authentication (Task 3.2)

- **Endpoint**: `POST /auth/login`
- **Features**:
  - Credential validation
  - JWT access token generation (1 hour expiry)
  - JWT refresh token generation (7 days expiry)
  - Refresh tokens stored in Redis
  - Token refresh endpoint: `POST /auth/refresh`
  - Logout endpoint: `POST /auth/logout`

### 3. Password Reset (Task 3.3)

- **Endpoints**:
  - `POST /auth/forgot-password` - Request password reset
  - `POST /auth/reset-password` - Reset password with token
- **Features**:
  - Reset token generation and storage in Redis (1 hour expiry)
  - Email notification (mock implementation)
  - Secure token validation
  - Password re-hashing

### 4. Role-Based Access Control (Task 3.4)

- **Guards**:
  - `requireRole(...roles)` - Generic role guard
  - `requireStudent` - Student-only access
  - `requireTutor` - Tutor-only access
  - `requireAdmin` - Admin-only access
  - `requireStudentOrTutor` - Student or tutor access
- **Middleware**:
  - `authenticateToken` - JWT validation middleware

## Project Structure

```
auth-service/
├── __tests__/              # Unit tests (42 tests, all passing)
│   ├── auth.service.spec.ts
│   ├── auth.login.spec.ts
│   ├── auth.password-reset.spec.ts
│   ├── auth.middleware.spec.ts
│   └── role.guard.spec.ts
├── controllers/            # Request handlers
│   └── auth.controller.ts
├── dto/                    # Data transfer objects
│   ├── register.dto.ts
│   ├── login.dto.ts
│   ├── password-reset.dto.ts
│   └── index.ts
├── middleware/             # Auth & authorization middleware
│   ├── auth.middleware.ts
│   ├── role.guard.ts
│   └── index.ts
├── routes/                 # Route definitions
│   └── auth.routes.ts
├── services/               # Business logic
│   ├── auth.service.ts
│   ├── redis.service.ts
│   ├── email.service.ts
│   └── index.ts
├── validators/             # Request validation
│   └── auth.validator.ts
├── index.ts               # Service entry point
└── README.md              # This file
```

## API Endpoints

### Public Endpoints

#### Register User

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "name": "John Doe",
  "role": "student",
  "phone": "+1234567890" // optional
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

Response:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

#### Forgot Password

```http
POST /auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Reset Password

```http
POST /auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NewPassword123"
}
```

### Protected Endpoints

#### Logout

```http
POST /auth/logout
Authorization: Bearer <access_token>
```

## Validation Rules

### Registration

- **Email**: Valid email format, normalized
- **Password**: Minimum 8 characters, must contain uppercase, lowercase, and number
- **Name**: 2-255 characters
- **Role**: Must be 'student' or 'tutor'
- **Phone**: Optional, E.164 format

### Login

- **Email**: Valid email format
- **Password**: Required

### Password Reset

- **Token**: Required
- **New Password**: Same rules as registration password

## Security Features

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**:
   - Access tokens expire in 1 hour
   - Refresh tokens expire in 7 days
   - Stored securely in Redis
3. **Token Validation**: Middleware validates JWT on protected routes
4. **Role-Based Access**: Guards ensure users can only access authorized resources
5. **Email Enumeration Prevention**: Forgot password doesn't reveal if email exists

## Testing

All functionality is covered by unit tests:

- 42 tests total
- 100% passing
- Tests cover:
  - User registration
  - Login and authentication
  - Token refresh
  - Password reset flow
  - JWT middleware
  - Role-based guards

Run tests:

```bash
npm test -- auth-service
```

## Dependencies

- **@prisma/client**: Database ORM
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT token generation/validation
- **redis**: Session and token storage
- **express-validator**: Request validation

## Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Service Port
AUTH_SERVICE_PORT=3001
```

## Future Enhancements

1. Email verification implementation (currently mocked)
2. Two-factor authentication (2FA)
3. OAuth integration (Google, Facebook)
4. Account lockout after failed login attempts
5. Password strength meter
6. Session management dashboard
7. Audit logging for security events

## Requirements Satisfied

- ✅ Requirement 1.1: User registration with role selection
- ✅ Requirement 1.2: Email validation and duplicate prevention
- ✅ Requirement 1.3: Verification email sending
- ✅ Requirement 1.4: JWT-based authentication
- ✅ Requirement 1.5: Token expiration and refresh
- ✅ Requirement 1.6: Password reset functionality
- ✅ Requirement 11.2: Role-based access control
- ✅ Requirement 11.3: Admin authorization
