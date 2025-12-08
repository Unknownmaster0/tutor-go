# 📚 API Endpoints Reference & Response Structures

**Document Purpose**: Quick reference for all API endpoints, request/response structures, and data types.

---

## 🔐 Authentication Service `/auth`

### 1. Register User

```http
POST /auth/register
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe",
  "role": "student" | "tutor" | "admin"
}

Response (201 Created):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "user-uuid-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2025-12-08T10:00:00Z"
  }
}

Error Response (400 Bad Request):
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

### 2. Login User

```http
POST /auth/login
Content-Type: application/json

Request Body:
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response (200 OK):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-uuid-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "student"
    }
  }
}

Error Response (401 Unauthorized):
{
  "success": false,
  "message": "Invalid email or password"
}
```

### 3. Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

Request Body:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response (200 OK):
{
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}

Error Response (401 Unauthorized):
{
  "success": false,
  "message": "Invalid or expired refresh token"
}
```

### 4. Get Current User Profile

```http
GET /auth/me
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "User profile retrieved",
  "data": {
    "id": "user-uuid-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "createdAt": "2025-12-08T10:00:00Z"
  }
}

Error Response (401 Unauthorized):
{
  "success": false,
  "message": "Unauthorized - Invalid or missing token"
}
```

### 5. Logout

```http
POST /auth/logout
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Logged out successfully",
  "data": {}
}
```

---

## 👨‍🏫 Tutor Service `/tutors`

### 1. Search Tutors (Public)

```http
GET /tutors/search?subject=Math&location=New York&minRating=4&maxPrice=100
Content-Type: application/json

Query Parameters:
- subject: string (Math, English, Science, etc.)
- location: string (city name)
- minRating: number (0-5)
- maxPrice: number (price per hour)
- page: number (pagination)
- limit: number (items per page)

Response (200 OK):
{
  "success": true,
  "message": "Tutors found",
  "data": [
    {
      "id": "tutor-uuid-456",
      "userId": "user-uuid-123",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "subject": "Math",
      "bio": "Experienced math tutor with 5 years experience",
      "location": "New York",
      "pricePerHour": 75,
      "rating": 4.8,
      "reviews": 42,
      "videoUrl": "https://cloudinary.com/...",
      "certifications": ["B.S. Mathematics", "Teaching Certificate"],
      "availability": {
        "Monday": ["09:00-12:00", "14:00-18:00"],
        "Tuesday": ["09:00-12:00", "14:00-18:00"]
      }
    },
    // ... more tutors
  ]
}

Error Response (400 Bad Request):
{
  "success": false,
  "message": "Invalid search parameters"
}
```

### 2. Get Tutor Profile by ID (Public)

```http
GET /tutors/{tutorId}

Response (200 OK):
{
  "success": true,
  "message": "Tutor profile retrieved",
  "data": {
    "id": "tutor-uuid-456",
    "userId": "user-uuid-123",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Math",
    "bio": "Experienced math tutor with 5 years experience",
    "location": "New York",
    "pricePerHour": 75,
    "rating": 4.8,
    "reviews": 42,
    "videoUrl": "https://cloudinary.com/...",
    "certifications": ["B.S. Mathematics", "Teaching Certificate"],
    "availability": {
      "Monday": ["09:00-12:00", "14:00-18:00"],
      "Tuesday": ["09:00-12:00", "14:00-18:00"]
    }
  }
}

Error Response (404 Not Found):
{
  "success": false,
  "message": "Tutor not found"
}
```

### 3. Create Tutor Profile (Protected - Requires Auth)

```http
POST /tutors/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "subject": "Math",
  "bio": "Experienced math tutor with 5 years experience",
  "location": "New York",
  "pricePerHour": 75,
  "certifications": ["B.S. Mathematics", "Teaching Certificate"]
}

Response (201 Created):
{
  "success": true,
  "message": "Tutor profile created successfully",
  "data": {
    "id": "tutor-uuid-456",
    "userId": "user-uuid-123",
    "subject": "Math",
    "bio": "Experienced math tutor with 5 years experience",
    "location": "New York",
    "pricePerHour": 75,
    "certifications": ["B.S. Mathematics", "Teaching Certificate"],
    "createdAt": "2025-12-08T10:00:00Z"
  }
}

Error Response (400 Bad Request):
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "pricePerHour",
      "message": "Price must be a positive number"
    }
  ]
}
```

### 4. Update Tutor Profile (Protected)

```http
PUT /tutors/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "subject": "Advanced Math",
  "bio": "Experienced math tutor with 6 years experience",
  "pricePerHour": 80,
  "certifications": ["B.S. Mathematics", "Teaching Certificate", "Advanced Calculus"]
}

Response (200 OK):
{
  "success": true,
  "message": "Tutor profile updated successfully",
  "data": {
    "id": "tutor-uuid-456",
    "userId": "user-uuid-123",
    "subject": "Advanced Math",
    "bio": "Experienced math tutor with 6 years experience",
    "pricePerHour": 80,
    "certifications": ["B.S. Mathematics", "Teaching Certificate", "Advanced Calculus"],
    "updatedAt": "2025-12-08T11:00:00Z"
  }
}
```

### 5. Get My Profile (Protected)

```http
GET /tutors/profile
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Your tutor profile",
  "data": {
    "id": "tutor-uuid-456",
    "userId": "user-uuid-123",
    "subject": "Math",
    "bio": "Experienced math tutor with 5 years experience",
    "location": "New York",
    "pricePerHour": 75,
    "rating": 4.8,
    "certifications": ["B.S. Mathematics", "Teaching Certificate"]
  }
}
```

### 6. Set Availability (Protected)

```http
PUT /tutors/availability
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "availability": {
    "Monday": ["09:00-12:00", "14:00-18:00"],
    "Tuesday": ["09:00-12:00", "14:00-18:00"],
    "Wednesday": ["09:00-12:00", "14:00-18:00"],
    "Thursday": ["09:00-12:00", "14:00-18:00"],
    "Friday": ["09:00-17:00"],
    "Saturday": ["10:00-16:00"],
    "Sunday": []
  }
}

Response (200 OK):
{
  "success": true,
  "message": "Availability updated successfully",
  "data": {
    "availability": {
      "Monday": ["09:00-12:00", "14:00-18:00"],
      "Tuesday": ["09:00-12:00", "14:00-18:00"]
      // ... rest of days
    }
  }
}
```

---

## 📅 Booking Service `/bookings`

### 1. Create Booking (Protected)

```http
POST /bookings
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "tutorId": "tutor-uuid-456",
  "scheduledTime": "2025-12-15T14:00:00Z",
  "duration": 60,
  "sessionType": "online" | "in-person",
  "notes": "Need help with calculus"
}

Response (201 Created):
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": "booking-uuid-789",
    "studentId": "user-uuid-123",
    "tutorId": "tutor-uuid-456",
    "tutorName": "Jane Smith",
    "scheduledTime": "2025-12-15T14:00:00Z",
    "duration": 60,
    "sessionType": "online",
    "status": "pending",
    "totalPrice": 75,
    "notes": "Need help with calculus",
    "createdAt": "2025-12-08T10:00:00Z"
  }
}

Error Response (400 Bad Request):
{
  "success": false,
  "message": "Tutor is not available at this time"
}
```

### 2. Get Booking by ID (Protected)

```http
GET /bookings/{bookingId}
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Booking retrieved",
  "data": {
    "id": "booking-uuid-789",
    "studentId": "user-uuid-123",
    "studentName": "John Doe",
    "tutorId": "tutor-uuid-456",
    "tutorName": "Jane Smith",
    "scheduledTime": "2025-12-15T14:00:00Z",
    "duration": 60,
    "sessionType": "online",
    "status": "confirmed",
    "totalPrice": 75,
    "notes": "Need help with calculus",
    "createdAt": "2025-12-08T10:00:00Z"
  }
}
```

### 3. Get User's Bookings (Protected)

```http
GET /bookings/user/{userId}
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "User bookings retrieved",
  "data": [
    {
      "id": "booking-uuid-789",
      "studentId": "user-uuid-123",
      "tutorId": "tutor-uuid-456",
      "tutorName": "Jane Smith",
      "scheduledTime": "2025-12-15T14:00:00Z",
      "duration": 60,
      "status": "confirmed",
      "totalPrice": 75
    },
    // ... more bookings
  ]
}
```

### 4. Update Booking Status (Protected)

```http
PATCH /bookings/{bookingId}/status
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "status": "confirmed" | "completed" | "cancelled"
}

Response (200 OK):
{
  "success": true,
  "message": "Booking status updated",
  "data": {
    "id": "booking-uuid-789",
    "status": "confirmed",
    "updatedAt": "2025-12-08T11:00:00Z"
  }
}
```

### 5. Cancel Booking (Protected)

```http
PATCH /bookings/{bookingId}/cancel
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "reason": "Schedule conflict"
}

Response (200 OK):
{
  "success": true,
  "message": "Booking cancelled successfully",
  "data": {
    "id": "booking-uuid-789",
    "status": "cancelled",
    "refundAmount": 75,
    "refundStatus": "processed"
  }
}
```

---

## 💳 Payment Service `/payments`

### 1. Create Payment Intent (Protected)

```http
POST /payments/create-intent
Authorization: Bearer <accessToken>
Content-Type: application/json

Request Body:
{
  "bookingId": "booking-uuid-789",
  "amount": 7500,
  "currency": "usd"
}

Response (200 OK):
{
  "success": true,
  "message": "Payment intent created",
  "data": {
    "clientSecret": "pi_1234567890_secret_abcdefg",
    "amount": 7500,
    "currency": "usd",
    "status": "requires_payment_method"
  }
}
```

### 2. Payment Webhook (Stripe)

```http
POST /payments/webhook
Content-Type: application/json

(Stripe automatically sends webhook events to this endpoint)

Response (200 OK):
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

### 3. Get Payment History (Protected)

```http
GET /payments/history
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Payment history retrieved",
  "data": [
    {
      "id": "payment-uuid-123",
      "bookingId": "booking-uuid-789",
      "tutorName": "Jane Smith",
      "amount": 7500,
      "currency": "usd",
      "status": "succeeded",
      "createdAt": "2025-12-08T10:00:00Z"
    },
    // ... more payments
  ]
}
```

---

## 👥 Admin Service `/admin`

### 1. Get Metrics (Protected - Admin Only)

```http
GET /admin/metrics
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Metrics retrieved",
  "data": {
    "totalUsers": 1234,
    "totalTutors": 456,
    "activeBookings": 89,
    "totalRevenue": 12450.50,
    "averageRating": 4.7,
    "newUsersThisMonth": 145
  }
}
```

### 2. Get Activity Log (Protected - Admin Only)

```http
GET /admin/activity
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Activity log retrieved",
  "data": [
    {
      "id": "activity-uuid-123",
      "userId": "user-uuid-123",
      "userName": "John Doe",
      "action": "login",
      "timestamp": "2025-12-08T10:00:00Z"
    },
    {
      "id": "activity-uuid-124",
      "userId": "user-uuid-456",
      "userName": "Jane Smith",
      "action": "created_booking",
      "details": {
        "bookingId": "booking-uuid-789"
      },
      "timestamp": "2025-12-08T10:05:00Z"
    }
    // ... more activities
  ]
}
```

### 3. Get Revenue Data (Protected - Admin Only)

```http
GET /admin/revenue
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Revenue data retrieved",
  "data": [
    {
      "date": "2025-12-01",
      "revenue": 1250.00,
      "bookings": 15,
      "platformFee": 62.50
    },
    {
      "date": "2025-12-02",
      "revenue": 1500.00,
      "bookings": 18,
      "platformFee": 75.00
    }
    // ... more dates
  ]
}
```

### 4. Get Users List (Protected - Admin Only)

```http
GET /admin/users?page=1&limit=20&role=student
Authorization: Bearer <accessToken>

Response (200 OK):
{
  "success": true,
  "message": "Users retrieved",
  "data": [
    {
      "id": "user-uuid-123",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "student",
      "createdAt": "2025-12-01T10:00:00Z",
      "lastLogin": "2025-12-08T09:00:00Z",
      "status": "active"
    }
    // ... more users
  ]
}
```

---

## ⚡ Common Request Headers

**All authenticated requests should include**:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
X-Requested-With: XMLHttpRequest
```

**CORS Preflight (Automatic)**:

```http
OPTIONS /path
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization
```

---

## 📊 Common HTTP Status Codes

| Code | Meaning             | When Used                         |
| ---- | ------------------- | --------------------------------- |
| 200  | OK                  | Successful GET, PUT, PATCH        |
| 201  | Created             | Successful POST creating resource |
| 204  | No Content          | Successful DELETE                 |
| 400  | Bad Request         | Validation error in request       |
| 401  | Unauthorized        | Missing/invalid auth token        |
| 403  | Forbidden           | Insufficient permissions          |
| 404  | Not Found           | Resource doesn't exist            |
| 409  | Conflict            | Resource already exists           |
| 500  | Server Error        | Backend error                     |
| 503  | Service Unavailable | Service is down                   |

---

## 🔗 Base URL Configuration

**Frontend uses** (in `apps/frontend/src/lib/api-client.ts`):

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

**So all requests go to**: `http://localhost:8000/[endpoint]`

**Then gateway routes to**: `http://localhost:8001-8008/[endpoint]`

---

## 💾 Response Data Types (TypeScript)

```typescript
// User Type
interface User {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'tutor' | 'admin';
  createdAt: string;
}

// Tutor Profile Type
interface TutorProfile {
  id: string;
  userId: string;
  subject: string;
  bio: string;
  location: string;
  pricePerHour: number;
  rating: number;
  certifications: string[];
  availability: Record<string, string[]>;
}

// Booking Type
interface Booking {
  id: string;
  studentId: string;
  tutorId: string;
  tutorName: string;
  scheduledTime: string;
  duration: number;
  sessionType: 'online' | 'in-person';
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  totalPrice: number;
  notes?: string;
}

// API Response Wrapper
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}
```

---

**Last Updated**: December 8, 2025  
**For Use With**: `tasks.md` and `TASKS_QUICK_START.md`
