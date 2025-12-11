# Backend Routes Reference

Complete collection of all backend routes with their request requirements.

---

## Authentication Service Routes

### Base URL: `/auth`

#### 1. Register User

- **Endpoint:** `POST /auth/register`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `registerValidation`
- **Description:** Register a new user account

#### 2. Login User

- **Endpoint:** `POST /auth/login`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `loginValidation`
- **Description:** Authenticate user and receive JWT tokens

#### 3. Refresh Token

- **Endpoint:** `POST /auth/refresh`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `refreshTokenValidation`
- **Description:** Refresh expired JWT token

#### 4. Forgot Password

- **Endpoint:** `POST /auth/forgot-password`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `forgotPasswordValidation`
- **Description:** Request password reset email

#### 5. Reset Password

- **Endpoint:** `POST /auth/reset-password`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `resetPasswordValidation`
- **Description:** Reset user password with token

#### 6. Logout

- **Endpoint:** `POST /auth/logout`
- **Authentication:** ✅ Required (JWT Token)
- **Description:** Logout user and invalidate session

#### 7. Get Current User

- **Endpoint:** `GET /auth/me`
- **Authentication:** ✅ Required (JWT Token)
- **Description:** Get authenticated user profile information

---

## Tutor Service Routes

### Base URL: `/tutors`

#### 1. Search Tutors

- **Endpoint:** `GET /tutors/search`
- **Authentication:** ❌ Public
- **Query Parameters Validators:**
  - `searchTutorsValidation`
- **Description:** Search for tutors with filters

#### 2. Get Profile by ID

- **Endpoint:** `GET /tutors/:id`
- **Authentication:** ❌ Public
- **URL Parameters:** `id` (tutor ID)
- **Description:** Get public tutor profile information

#### 3. Get Tutor Availability

- **Endpoint:** `GET /tutors/:id/availability`
- **Authentication:** ❌ Public
- **URL Parameters:** `id` (tutor ID)
- **Description:** Get tutor's availability schedule

#### 4. Create Tutor Profile

- **Endpoint:** `POST /tutors/profile`
- **Authentication:** ✅ Required (JWT Token)
- **Request Body Validators:**
  - `createTutorProfileValidation`
- **Description:** Create a new tutor profile

#### 5. Update Tutor Profile

- **Endpoint:** `PUT /tutors/profile`
- **Authentication:** ✅ Required (JWT Token)
- **Request Body Validators:**
  - `updateTutorProfileValidation`
- **Description:** Update existing tutor profile

#### 6. Get Own Tutor Profile

- **Endpoint:** `GET /tutors/profile`
- **Authentication:** ✅ Required (JWT Token)
- **Description:** Get authenticated tutor's own profile

#### 7. Delete Tutor Profile

- **Endpoint:** `DELETE /tutors/profile`
- **Authentication:** ✅ Required (JWT Token)
- **Description:** Delete tutor profile

#### 8. Upload Video

- **Endpoint:** `POST /tutors/upload-video`
- **Authentication:** ✅ Required (JWT Token)
- **Request Type:** Multipart Form Data
- **File Field:** `video` (single file)
- **Description:** Upload tutor introduction video

#### 9. Delete Video

- **Endpoint:** `DELETE /tutors/delete-video`
- **Authentication:** ✅ Required (JWT Token)
- **Description:** Delete tutor's uploaded video

#### 10. Set Availability

- **Endpoint:** `PUT /tutors/availability`
- **Authentication:** ✅ Required (JWT Token)
- **Request Body Validators:**
  - `setAvailabilityValidation`
- **Description:** Update tutor's overall availability settings

#### 11. Add Availability Slot

- **Endpoint:** `POST /tutors/availability/slot`
- **Authentication:** ✅ Required (JWT Token)
- **Request Body Validators:**
  - `dayOfWeek` (integer 0-6)
  - `startTime` (HH:MM format)
  - `endTime` (HH:MM format)
- **Description:** Add a specific time slot to tutor's availability

#### 12. Remove Availability Slot

- **Endpoint:** `DELETE /tutors/availability/slot`
- **Authentication:** ✅ Required (JWT Token)
- **Description:** Remove a time slot from tutor's availability

---

## Booking Service Routes

### Base URL: `/bookings`

#### 1. Create Booking

- **Endpoint:** `POST /bookings`
- **Authentication:** ✅ Required (JWT Token)
- **Request Body Validators:**
  - `createBookingValidator`
- **Description:** Create a new booking with a tutor

#### 2. Get Booking by ID

- **Endpoint:** `GET /bookings/:id`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `id` (booking ID)
- **Query Validators:**
  - `getBookingValidator`
- **Description:** Retrieve specific booking details

#### 3. Get User's Bookings

- **Endpoint:** `GET /bookings/user/:userId`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `userId` (user ID)
- **Query Validators:**
  - `getUserBookingsValidator`
- **Description:** Get all bookings for a user

#### 4. Update Booking Status

- **Endpoint:** `PATCH /bookings/:id/status`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `id` (booking ID)
- **Request Body Validators:**
  - `updateBookingStatusValidator`
- **Description:** Update booking status (e.g., confirmed, completed)

#### 5. Cancel Booking

- **Endpoint:** `PATCH /bookings/:id/cancel`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `id` (booking ID)
- **Request Body Validators:**
  - `cancelBookingValidator`
- **Description:** Cancel an existing booking

---

## Chat Service Routes

### Base URL: `/chat`

**Note:** All chat routes require authentication via JWT token

#### 1. Get Conversations

- **Endpoint:** `GET /chat/conversations/:userId`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `userId` (user ID)
- **Description:** Get all conversations for a user

#### 2. Get Messages

- **Endpoint:** `GET /chat/messages/:conversationId`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `conversationId` (conversation ID)
- **Description:** Get all messages in a conversation

#### 3. Mark Conversation as Read

- **Endpoint:** `PATCH /chat/conversations/:conversationId/read`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `conversationId` (conversation ID)
- **Description:** Mark conversation as read

---

## Review Service Routes

### Base URL: `/reviews`

#### 1. Create Review

- **Endpoint:** `POST /reviews`
- **Authentication:** ✅ Required (JWT Token)
- **Request Body Validators:**
  - `createReviewValidator`
- **Description:** Create a new review for a tutor

#### 2. Get Tutor Reviews

- **Endpoint:** `GET /reviews/tutor/:tutorId`
- **Authentication:** ❌ Public
- **URL Parameters:** `tutorId` (tutor ID)
- **Query Validators:**
  - `getTutorReviewsValidator`
- **Description:** Get all reviews for a specific tutor

#### 3. Flag Review

- **Endpoint:** `PATCH /reviews/:reviewId/flag`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `reviewId` (review ID)
- **Request Body Validators:**
  - `flagReviewValidator`
- **Description:** Flag or unflag a review as inappropriate

---

## Payment Service Routes

### Base URL: `/payments`

#### 1. Create Payment Intent

- **Endpoint:** `POST /payments/create-intent`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `PaymentValidator.createPaymentIntent()`
- **Description:** Create a payment intent for Stripe

#### 2. Confirm Payment

- **Endpoint:** `POST /payments/confirm`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `PaymentValidator.confirmPayment()`
- **Description:** Confirm payment transaction

#### 3. Process Refund

- **Endpoint:** `POST /payments/refund`
- **Authentication:** ❌ Public
- **Request Body Validators:**
  - `PaymentValidator.refundPayment()`
- **Description:** Process payment refund

#### 4. Stripe Webhook

- **Endpoint:** `POST /payments/webhook`
- **Authentication:** ❌ Public
- **Description:** Handle Stripe webhook events

---

## Notification Service Routes

### Base URL: `/notifications`

#### 1. Get User Notifications

- **Endpoint:** `GET /notifications/:userId`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `userId` (user ID)
- **Query Validators:**
  - `getUserNotificationsValidation`
- **Description:** Get all notifications for a user

#### 2. Mark Notification as Read

- **Endpoint:** `PATCH /notifications/:id/read`
- **Authentication:** ✅ Required (JWT Token)
- **URL Parameters:** `id` (notification ID)
- **Request Body Validators:**
  - `markAsReadParamValidation`
  - `markAsReadValidation`
- **Description:** Mark notification as read/unread

---

## Admin Service Routes

### Base URL: `/admin`

**Note:** All admin routes require authentication (JWT token) AND admin role

#### 1. Get Dashboard Metrics

- **Endpoint:** `GET /admin/metrics`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Description:** Get dashboard metrics and statistics

#### 2. Get Recent Activity

- **Endpoint:** `GET /admin/activity`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Description:** Get recent activity log

#### 3. Get Revenue Data

- **Endpoint:** `GET /admin/revenue`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Description:** Get revenue statistics

#### 4. Get Bookings Data

- **Endpoint:** `GET /admin/bookings`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Description:** Get bookings statistics

#### 5. Search Users

- **Endpoint:** `GET /admin/users`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Query Validators:**
  - `searchUsersSchema`
- **Description:** Search and filter users

#### 6. Suspend User

- **Endpoint:** `PATCH /admin/users/:id/suspend`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **URL Parameters:** `id` (user ID)
- **Request Body Validators:**
  - `suspendUserSchema`
- **Description:** Suspend a user account

#### 7. Unsuspend User

- **Endpoint:** `PATCH /admin/users/:id/unsuspend`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **URL Parameters:** `id` (user ID)
- **Description:** Unsuspend a user account

#### 8. Get Flagged Content

- **Endpoint:** `GET /admin/flagged-content`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Description:** Get all flagged content

#### 9. Moderate Content

- **Endpoint:** `POST /admin/flagged-content/:id/moderate`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **URL Parameters:** `id` (content ID)
- **Request Body Validators:**
  - `moderateContentSchema`
- **Description:** Moderate flagged content

#### 10. Get Transactions

- **Endpoint:** `GET /admin/transactions`
- **Authentication:** ✅ Required (JWT Token + Admin Role)
- **Query Validators:**
  - `getTransactionsSchema`
- **Description:** Get transaction history

---

## Summary Table

| Service      | Method | Endpoint                                   | Auth Required | Protected  |
| ------------ | ------ | ------------------------------------------ | ------------- | ---------- |
| Auth         | POST   | `/auth/register`                           | ❌            | Public     |
| Auth         | POST   | `/auth/login`                              | ❌            | Public     |
| Auth         | POST   | `/auth/refresh`                            | ❌            | Public     |
| Auth         | POST   | `/auth/forgot-password`                    | ❌            | Public     |
| Auth         | POST   | `/auth/reset-password`                     | ❌            | Public     |
| Auth         | POST   | `/auth/logout`                             | ✅            | Protected  |
| Auth         | GET    | `/auth/me`                                 | ✅            | Protected  |
| Tutor        | GET    | `/tutors/search`                           | ❌            | Public     |
| Tutor        | GET    | `/tutors/:id`                              | ❌            | Public     |
| Tutor        | GET    | `/tutors/:id/availability`                 | ❌            | Public     |
| Tutor        | POST   | `/tutors/profile`                          | ✅            | Protected  |
| Tutor        | PUT    | `/tutors/profile`                          | ✅            | Protected  |
| Tutor        | GET    | `/tutors/profile`                          | ✅            | Protected  |
| Tutor        | DELETE | `/tutors/profile`                          | ✅            | Protected  |
| Tutor        | POST   | `/tutors/upload-video`                     | ✅            | Protected  |
| Tutor        | DELETE | `/tutors/delete-video`                     | ✅            | Protected  |
| Tutor        | PUT    | `/tutors/availability`                     | ✅            | Protected  |
| Tutor        | POST   | `/tutors/availability/slot`                | ✅            | Protected  |
| Tutor        | DELETE | `/tutors/availability/slot`                | ✅            | Protected  |
| Booking      | POST   | `/bookings`                                | ✅            | Protected  |
| Booking      | GET    | `/bookings/:id`                            | ✅            | Protected  |
| Booking      | GET    | `/bookings/user/:userId`                   | ✅            | Protected  |
| Booking      | PATCH  | `/bookings/:id/status`                     | ✅            | Protected  |
| Booking      | PATCH  | `/bookings/:id/cancel`                     | ✅            | Protected  |
| Chat         | GET    | `/chat/conversations/:userId`              | ✅            | Protected  |
| Chat         | GET    | `/chat/messages/:conversationId`           | ✅            | Protected  |
| Chat         | PATCH  | `/chat/conversations/:conversationId/read` | ✅            | Protected  |
| Review       | POST   | `/reviews`                                 | ✅            | Protected  |
| Review       | GET    | `/reviews/tutor/:tutorId`                  | ❌            | Public     |
| Review       | PATCH  | `/reviews/:reviewId/flag`                  | ✅            | Protected  |
| Payment      | POST   | `/payments/create-intent`                  | ❌            | Public     |
| Payment      | POST   | `/payments/confirm`                        | ❌            | Public     |
| Payment      | POST   | `/payments/refund`                         | ❌            | Public     |
| Payment      | POST   | `/payments/webhook`                        | ❌            | Public     |
| Notification | GET    | `/notifications/:userId`                   | ✅            | Protected  |
| Notification | PATCH  | `/notifications/:id/read`                  | ✅            | Protected  |
| Admin        | GET    | `/admin/metrics`                           | ✅            | Admin Only |
| Admin        | GET    | `/admin/activity`                          | ✅            | Admin Only |
| Admin        | GET    | `/admin/revenue`                           | ✅            | Admin Only |
| Admin        | GET    | `/admin/bookings`                          | ✅            | Admin Only |
| Admin        | GET    | `/admin/users`                             | ✅            | Admin Only |
| Admin        | PATCH  | `/admin/users/:id/suspend`                 | ✅            | Admin Only |
| Admin        | PATCH  | `/admin/users/:id/unsuspend`               | ✅            | Admin Only |
| Admin        | GET    | `/admin/flagged-content`                   | ✅            | Admin Only |
| Admin        | POST   | `/admin/flagged-content/:id/moderate`      | ✅            | Admin Only |
| Admin        | GET    | `/admin/transactions`                      | ✅            | Admin Only |

---

## Request Validation Legend

- **✅ Required** - Must be provided in the request
- **❌ Not Required** - Optional parameter
- **Validators** - Custom validation rules applied to request data
- **JWT Token** - Bearer token in Authorization header: `Authorization: Bearer <token>`
- **Multipart Form Data** - Used for file uploads
