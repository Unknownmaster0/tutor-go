# TutorGo Frontend Implementation Tasks

**Status**: In Progress  
**Date**: December 9, 2025  
**Priority**: High  
**Scope**: Complete Frontend Implementation for 10 Key Features

---

## 📋 Table of Contents

1. [Backend Readiness Checklist](#backend-readiness-checklist)
2. [Task Overview](#task-overview)
3. [Detailed Implementation Tasks](#detailed-implementation-tasks)
4. [Architecture Notes](#architecture-notes)
5. [Testing & Deployment](#testing--deployment)

---

## ✅ Backend Readiness Checklist

### Status: BACKEND READY

The backend microservices are properly initialized with the following status:

#### ✓ Authentication Service (Port 8001)

- **Status**: Implemented
- **Endpoints**:
  - `POST /register` - User registration (student/tutor)
  - `POST /login` - User login with JWT
  - `POST /refresh` - Token refresh
  - `POST /forgot-password` - Password reset request
  - `POST /reset-password` - Password reset confirmation
  - `GET /me` - Get current user (protected)
  - `POST /logout` - User logout
- **Database**: PostgreSQL via Prisma
- **Dependencies**: bcrypt, JWT, nodemailer, Redis

#### ✓ Tutor Service (Port 8002)

- **Status**: Implemented
- **Features**:
  - Tutor profile management
  - Video upload (Cloudinary integration)
  - Geolocation indexing (MongoDB)
  - Subject/proficiency management
- **Endpoints**: Tutor CRUD, search, location-based filtering
- **Database**: MongoDB for geospatial data

#### ✓ Booking Service (Port 8003)

- **Status**: Implemented
- **Features**:
  - Create/confirm/cancel bookings
  - Availability slot management
  - Double-booking prevention
- **Database**: PostgreSQL via Prisma

#### ✓ Payment Service (Port 8004)

- **Status**: Implemented
- **Features**:
  - Stripe/Razorpay integration
  - Payment processing
  - Refund handling
- **Database**: PostgreSQL via Prisma

#### ✓ Chat Service (Port 8006)

- **Status**: Implemented
- **Features**:
  - Real-time messaging via Socket.io
  - Message history storage
  - Online/offline status tracking
- **Database**: PostgreSQL

#### ✓ Notification Service (Port 8007)

- **Status**: Implemented
- **Features**:
  - RabbitMQ message queue
  - Email notifications
  - In-app notifications
- **Database**: PostgreSQL

#### ✓ Review Service (Port 8005)

- **Status**: Implemented
- **Features**:
  - Rating/review submission
  - Average rating calculation
  - Moderation flagging
- **Database**: PostgreSQL

#### ✓ Admin Service (Port 8008)

- **Status**: Implemented
- **Features**:
  - User management
  - Activity monitoring
  - Content moderation
  - Transaction history
- **Database**: PostgreSQL

#### ✓ API Gateway (Port 8000)

- **Status**: Implemented
- **Features**:
  - Request routing to microservices
  - CORS configuration
  - Error handling
  - Authentication middleware

---

## 🎯 Task Overview

**Total Tasks**: 10 Major Implementation Tasks  
**Estimated Time**: 40-50 hours  
**Difficulty**: Intermediate to Advanced  
**Framework**: Next.js 14, React 18, TypeScript, Tailwind CSS

### Task Breakdown

| Task | Feature                            | Status      | Priority |
| ---- | ---------------------------------- | ----------- | -------- |
| 1    | User Registration & Authentication | Not Started | High     |
| 2    | Tutor Profile Management           | Not Started | High     |
| 3    | Location-Based Tutor Search        | Not Started | High     |
| 4    | Tutor Profile Viewing              | Not Started | High     |
| 5    | Session Booking                    | Not Started | High     |
| 6    | Real-Time Chat                     | Not Started | Medium   |
| 7    | Review & Rating System             | Not Started | Medium   |
| 8    | Tutor Availability Management      | Not Started | Medium   |
| 9    | Admin Dashboard                    | Not Started | Medium   |
| 10   | Session History & Management       | Not Started | Medium   |

---

## 📝 Detailed Implementation Tasks

### TASK 1: User Registration and Authentication Frontend

**Requirements Reference**: Requirement 1  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 4-5 hours  
**Dependencies**: Auth Service (8001)

#### Objectives

1. Create registration page with student/tutor role selection
2. Implement login page with JWT token handling
3. Add password reset functionality
4. Implement token refresh mechanism
5. Create protected routes with auth guard
6. Add email verification flow

#### Frontend Components to Create

```
apps/frontend/src/
├── app/auth/
│   ├── register/
│   │   ├── page.tsx
│   │   ├── student-form.tsx
│   │   └── tutor-form.tsx
│   ├── login/
│   │   ├── page.tsx
│   │   └── login-form.tsx
│   ├── forgot-password/
│   │   ├── page.tsx
│   │   └── forgot-password-form.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── auth/
│   │   ├── AuthGuard.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AuthContext.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useLogin.ts
│   └── useRegister.ts
└── contexts/
    └── AuthContext.tsx
```

#### API Endpoints to Consume

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`

#### Key Features

- Form validation with error messages
- Loading states and error handling
- Token persistence (localStorage/cookies)
- Automatic token refresh on expiry
- Role-based redirection (student/tutor dashboard)

#### Acceptance Criteria Status

- [ ] Registration form with role selection displays correctly
- [ ] New user account creates successfully with email verification
- [ ] Duplicate email registration returns proper error
- [ ] Login with valid credentials grants JWT token
- [ ] Expired JWT token triggers re-authentication
- [ ] Password reset via email works end-to-end

---

### TASK 2: Tutor Profile Management

**Requirements Reference**: Requirement 2  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 6-8 hours  
**Dependencies**: Tutor Service (8002), Cloudinary

#### Objectives

1. Create tutor profile edit form
2. Implement video upload to Cloudinary
3. Add subject/proficiency selection
4. Implement location picker (manual + geolocation)
5. Create tutor dashboard showing profile preview
6. Add profile validation and error handling

#### Frontend Components to Create

```
apps/frontend/src/
├── app/
│   ├── dashboard/tutor/
│   │   ├── profile/
│   │   │   ├── page.tsx
│   │   │   ├── edit-form.tsx
│   │   │   └── video-upload.tsx
│   │   └── layout.tsx
├── components/
│   ├── tutor/
│   │   ├── ProfileEditor.tsx
│   │   ├── VideoUploader.tsx
│   │   ├── SubjectSelector.tsx
│   │   ├── LocationPicker.tsx
│   │   └── ProfilePreview.tsx
├── hooks/
│   ├── useTutorProfile.ts
│   ├── useVideoUpload.ts
│   └── useLocationPicker.ts
└── types/
    └── tutor.ts
```

#### Cloudinary Setup

- Integration via `next-cloudinary` or direct API
- Video upload with validation (format, size)
- Streaming delivery configuration
- Security tokens for uploads

#### API Endpoints to Consume

- `GET /api/tutors/me`
- `PUT /api/tutors/me`
- `POST /api/tutors/me/video`
- `DELETE /api/tutors/me/video/:videoId`
- `GET /api/tutors/me/subjects`
- `POST /api/tutors/me/subjects`

#### Key Features

- Multi-step profile setup wizard
- Real-time profile preview
- Video preview before submission
- Location autocomplete (Google Places)
- Subject proficiency levels (Beginner/Intermediate/Advanced)
- Profile completion percentage indicator

#### Acceptance Criteria Status

- [ ] Editable profile fields for bio, qualifications, subjects
- [ ] Demo video upload to Cloudinary with secure storage
- [ ] Location with geospatial data stored correctly
- [ ] All required fields validated before save
- [ ] Multiple subjects with proficiency levels supported
- [ ] Video size/format validation with clear error messages

---

### TASK 3: Location-Based Tutor Search with Google Maps

**Requirements Reference**: Requirement 3  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 7-9 hours  
**Dependencies**: Tutor Service (8002), Google Maps API

#### Objectives

1. Set up Google Maps API integration
2. Create search/filter interface
3. Implement map-based tutor display
4. Add location input with autocomplete
5. Implement distance calculation and filtering
6. Create search results list view with map

#### Google Maps Configuration

**See**: `google-map-initialization.md` (provided separately)

- API Key setup
- Required scopes
- Billing configuration
- Integration points in Next.js

#### Frontend Components to Create

```
apps/frontend/src/
├── app/search/
│   ├── page.tsx
│   ├── search-layout.tsx
│   └── [[...filters]]/page.tsx
├── components/
│   ├── search/
│   │   ├── SearchFilters.tsx
│   │   ├── TutorMap.tsx
│   │   ├── SearchResults.tsx
│   │   ├── LocationInput.tsx
│   │   ├── SubjectFilter.tsx
│   │   └── RangeFilter.tsx
├── hooks/
│   ├── useMapSearch.ts
│   ├── useTutorSearch.ts
│   └── useLocationAutoComplete.ts
└── types/
    └── search.ts
```

#### API Endpoints to Consume

- `POST /api/tutors/search` - Location-based search
- `GET /api/tutors/search` - With query parameters
- `GET /api/tutors/:tutorId` - Tutor details

#### Key Features

- Interactive Google Map with tutor markers
- Search radius control (slider)
- Subject filtering with checkboxes
- Rating/price filters
- Results count and sorting options
- Responsive design (mobile-first)
- Map zoom/pan controls

#### Acceptance Criteria Status

- [ ] Location input with geocoding returns tutors
- [ ] Subject filter returns matching tutors only
- [ ] Search results show name, subject, rating, rate, distance
- [ ] Clicking tutor navigates to detail page
- [ ] No results message with expand radius suggestion
- [ ] Manual location entry when geolocation unavailable

---

### TASK 4: Tutor Profile Viewing

**Requirements Reference**: Requirement 4  
**Acceptance Criteria**: 5 items  
**Estimated Time**: 5-6 hours  
**Dependencies**: Tutor Service (8002), Review Service (8005)

#### Objectives

1. Create detailed tutor profile page
2. Implement video player for demo videos
3. Display reviews and ratings
4. Show availability calendar
5. Add book now button/CTA

#### Frontend Components to Create

```
apps/frontend/src/
├── app/tutors/
│   └── [tutorId]/
│       ├── page.tsx
│       └── layout.tsx
├── components/
│   ├── tutor-profile/
│   │   ├── ProfileHeader.tsx
│   │   ├── BioSection.tsx
│   │   ├── QualificationsSection.tsx
│   │   ├── VideoPlayer.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── RatingDisplay.tsx
│   │   ├── AvailabilityCalendar.tsx
│   │   └── BookNowButton.tsx
└── types/
    └── profile.ts
```

#### API Endpoints to Consume

- `GET /api/tutors/:tutorId`
- `GET /api/tutors/:tutorId/videos`
- `GET /api/reviews/tutor/:tutorId`
- `GET /api/tutors/:tutorId/availability`

#### Key Features

- Complete bio, qualifications, experience
- Subject expertise with years of experience
- Video player with streaming (Cloudinary)
- Star rating display with review count
- Individual review comments with timestamps
- Hourly rate and availability status
- "Book Session" CTA button

#### Acceptance Criteria Status

- [ ] Profile displays bio, qualifications, subjects, rates, location, videos
- [ ] Video player streams demo videos
- [ ] Reviews show average rating and individual comments
- [ ] Calendar shows available time slots
- [ ] "New to platform" message when no reviews exist

---

### TASK 5: Session Booking

**Requirements Reference**: Requirement 5  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 6-7 hours  
**Dependencies**: Booking Service (8003), Payment Service (8004)

#### Objectives

1. Create booking request form
2. Implement time slot selection
3. Add booking confirmation dialog
4. Create booking summary with pricing
5. Implement cancel booking functionality
6. Add booking status tracking

#### Frontend Components to Create

```
apps/frontend/src/
├── app/
│   ├── booking/
│   │   ├── [tutorId]/
│   │   │   ├── page.tsx
│   │   │   └── confirmation-page.tsx
│   └── dashboard/bookings/
│       ├── page.tsx
│       └── [bookingId]/
│           └── page.tsx
├── components/
│   ├── booking/
│   │   ├── TimeSlotSelector.tsx
│   │   ├── BookingForm.tsx
│   │   ├── BookingSummary.tsx
│   │   ├── ConfirmationDialog.tsx
│   │   └── CancelBookingDialog.tsx
└── types/
    └── booking.ts
```

#### API Endpoints to Consume

- `POST /api/bookings` - Create booking
- `GET /api/bookings/:bookingId` - Get booking details
- `PATCH /api/bookings/:bookingId/confirm` - Confirm booking
- `PATCH /api/bookings/:bookingId/cancel` - Cancel booking
- `GET /api/tutors/:tutorId/availability` - Get available slots

#### Key Features

- Calendar view of available slots
- Session duration selection (30min, 60min, 90min, etc.)
- Subject selection
- Special notes/requirements field
- Total cost calculation
- Double-booking prevention
- Email confirmation on booking creation
- Cancellation with deadline warning

#### Acceptance Criteria Status

- [ ] Time slot selection displays correctly with cost
- [ ] Booking confirmation creates record with "pending payment" status
- [ ] Reserved time slots prevent double-booking
- [ ] Cancellation before deadline works with refund eligibility
- [ ] Unavailable slot notification refreshes availability
- [ ] Both users receive notifications on booking confirmation

---

### TASK 6: Real-Time Chat Communication

**Requirements Reference**: Requirement 7  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 5-6 hours  
**Dependencies**: Chat Service (8006), Socket.io

#### Objectives

1. Set up Socket.io client connection
2. Create chat interface
3. Implement message sending/receiving
4. Add message history loading
5. Implement online/offline status
6. Add typing indicators

#### Frontend Components to Create

```
apps/frontend/src/
├── app/chat/
│   └── [conversationId]/
│       ├── page.tsx
│       └── layout.tsx
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── ConversationList.tsx
│   │   ├── OnlineStatus.tsx
│   │   └── TypingIndicator.tsx
├── hooks/
│   ├── useChat.ts
│   ├── useSocket.ts
│   └── useConversations.ts
└── types/
    └── chat.ts
```

#### Socket.io Events

```typescript
// Emit
- 'join_room': { userId, bookingId }
- 'send_message': { message, receiverId, conversationId }
- 'typing': { isTyping }

// Listen
- 'message_received': message
- 'user_online': userId
- 'user_offline': userId
- 'typing_indicator': { userId, isTyping }
```

#### API Endpoints to Consume

- `GET /api/chat/conversations` - List conversations
- `GET /api/chat/conversations/:conversationId/messages` - Message history
- `POST /api/chat/messages` - Save message to DB
- `PATCH /api/chat/messages/:messageId/read` - Mark as read

#### Key Features

- Real-time message delivery
- Message history pagination
- Typing indicators
- Online/offline status
- Unread message badges
- Message timestamps
- Read receipts
- Automatic conversation creation

#### Acceptance Criteria Status

- [ ] Chat enabled only for confirmed bookings
- [ ] Messages deliver in real-time via Socket.io
- [ ] New message notifications appear
- [ ] Previous message history loads on open
- [ ] Messages queue when offline
- [ ] Inappropriate content flagged for review

---

### TASK 7: Review and Rating System

**Requirements Reference**: Requirement 9  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 4-5 hours  
**Dependencies**: Review Service (8005), Booking Service (8003)

#### Objectives

1. Create review submission form after session
2. Implement star rating component
3. Add review display on tutor profile
4. Implement review moderation flagging
5. Add review filtering/sorting

#### Frontend Components to Create

```
apps/frontend/src/
├── app/
│   └── dashboard/bookings/
│       └── [bookingId]/review/
│           └── page.tsx
├── components/
│   ├── review/
│   │   ├── ReviewForm.tsx
│   │   ├── StarRating.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewsList.tsx
│   │   └── ReviewModal.tsx
└── types/
    └── review.ts
```

#### API Endpoints to Consume

- `POST /api/reviews` - Submit review
- `GET /api/reviews/tutor/:tutorId` - Get tutor reviews
- `PATCH /api/reviews/:reviewId` - Update review
- `DELETE /api/reviews/:reviewId` - Delete review
- `POST /api/reviews/:reviewId/flag` - Flag inappropriate content

#### Key Features

- 1-5 star rating with visual feedback
- Optional text comment (max 500 chars)
- Only available after session completion
- Review prompt notification
- Average rating calculation
- Review sorting (newest, highest rated)
- Moderation flag button
- Edit/delete own reviews

#### Acceptance Criteria Status

- [ ] Review form appears after completed session
- [ ] Rating (1-5 stars) with optional comment accepted
- [ ] Review submission recalculates tutor rating
- [ ] Reviews display chronologically (newest first)
- [ ] Incomplete session prevents review submission
- [ ] Inappropriate content can be flagged for moderation

---

### TASK 8: Tutor Availability Management

**Requirements Reference**: Requirement 10  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 5-6 hours  
**Dependencies**: Booking Service (8003)

#### Objectives

1. Create availability calendar interface
2. Implement time slot creation
3. Add bulk availability settings
4. Implement blocked time management
5. Add availability rules/recurrence
6. Real-time availability updates

#### Frontend Components to Create

```
apps/frontend/src/
├── app/dashboard/tutor/
│   └── availability/
│       ├── page.tsx
│       └── layout.tsx
├── components/
│   ├── availability/
│   │   ├── AvailabilityCalendar.tsx
│   │   ├── TimeSlotCreator.tsx
│   │   ├── BulkAvailabilityForm.tsx
│   │   ├── BlockedTimeManager.tsx
│   │   ├── RecurrenceSettings.tsx
│   │   └── AvailabilitySummary.tsx
└── types/
    └── availability.ts
```

#### API Endpoints to Consume

- `GET /api/availability` - Get all time slots
- `POST /api/availability` - Create time slots
- `PATCH /api/availability/:slotId` - Update slot
- `DELETE /api/availability/:slotId` - Delete slot
- `POST /api/availability/bulk` - Bulk create slots

#### Key Features

- Monthly calendar view
- Click to add availability slots
- Time range selection (start/end times)
- Recurring availability (daily, weekly)
- Block unavailable times
- Duration selection (30, 60, 90 min slots)
- Visual indication of booked slots
- Export/import availability

#### Acceptance Criteria Status

- [ ] Calendar interface displays time slots
- [ ] Available slots created and visible to students
- [ ] Unavailable times prevent student bookings
- [ ] Availability updates immediately reflected
- [ ] Booked slots prevent deletion with warning
- [ ] Recurring patterns supported

---

### TASK 9: Admin Dashboard

**Requirements Reference**: Requirement 11  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 8-10 hours  
**Dependencies**: Admin Service (8008)

#### Objectives

1. Create admin dashboard with key metrics
2. Implement user management (students/tutors)
3. Add user suspension controls
4. Create content moderation interface
5. Implement transaction history viewer
6. Add activity analytics

#### Frontend Components to Create

```
apps/frontend/src/
├── app/admin/
│   ├── page.tsx (dashboard)
│   ├── users/
│   │   ├── page.tsx
│   │   ├── [userId]/page.tsx
│   │   └── student-filters.tsx
│   ├── content-moderation/
│   │   ├── page.tsx
│   │   ├── reviews/page.tsx
│   │   └── messages/page.tsx
│   ├── transactions/
│   │   └── page.tsx
│   └── layout.tsx
├── components/
│   ├── admin/
│   │   ├── DashboardCard.tsx
│   │   ├── MetricsChart.tsx
│   │   ├── UserTable.tsx
│   │   ├── SuspensionModal.tsx
│   │   ├── ContentModerationCard.tsx
│   │   └── TransactionTable.tsx
└── types/
    └── admin.ts
```

#### API Endpoints to Consume

- `GET /api/admin/dashboard` - Key metrics
- `GET /api/admin/users` - User listing with filters
- `GET /api/admin/users/:userId` - User details
- `PATCH /api/admin/users/:userId/suspend` - Suspend user
- `GET /api/admin/content/flagged` - Flagged content
- `PATCH /api/admin/content/:contentId/approve` - Approve content
- `DELETE /api/admin/content/:contentId` - Remove content
- `GET /api/admin/transactions` - Transaction history

#### Key Features

- Dashboard with KPIs (users, bookings, revenue)
- User list with search/filter (role, status)
- Suspend/activate user accounts
- Reason for suspension logging
- Flagged reviews display
- Flagged messages display
- Moderation actions (approve/delete)
- Payment transaction table with export
- Date range filtering
- Charts for analytics

#### Acceptance Criteria Status

- [ ] Dashboard displays total users, bookings, revenue metrics
- [ ] User lists filterable by type with search
- [ ] User suspension with reason logging works
- [ ] Flagged content reviewable with moderation actions
- [ ] Transaction history filterable by date/user/status
- [ ] Suspicious activity alerts on dashboard

---

### TASK 10: Session History and Management

**Requirements Reference**: Requirement 12  
**Acceptance Criteria**: 6 items  
**Estimated Time**: 4-5 hours  
**Dependencies**: Booking Service (8003), Notification Service (8007)

#### Objectives

1. Create session history page
2. Implement booking categorization (upcoming/completed/cancelled)
3. Add session detail view
4. Implement filtering and sorting
5. Add reminder notifications
6. Create session cancellation flow

#### Frontend Components to Create

```
apps/frontend/src/
├── app/dashboard/
│   ├── sessions/
│   │   ├── page.tsx
│   │   └── [sessionId]/page.tsx
│   └── layout.tsx
├── components/
│   ├── session-history/
│   │   ├── SessionList.tsx
│   │   ├── SessionCard.tsx
│   │   ├── SessionDetail.tsx
│   │   ├── SessionFilters.tsx
│   │   ├── ReminderNotification.tsx
│   │   └── CancellationFlow.tsx
└── types/
    └── session.ts
```

#### API Endpoints to Consume

- `GET /api/bookings` - List user bookings
- `GET /api/bookings/:bookingId` - Booking details
- `GET /api/bookings?status=upcoming` - Filter by status
- `PATCH /api/bookings/:bookingId/cancel` - Cancel booking
- `GET /api/notifications` - User notifications

#### Key Features

- Tabbed interface (upcoming, completed, cancelled)
- Session card showing key info
- Detailed session view with all data
- Filter by date range
- Filter by subject
- Sort by date (asc/desc)
- Reminder notifications 15 min before
- Empty state messaging
- Quick action buttons (view profile, chat, cancel)

#### Acceptance Criteria Status

- [ ] Session history displays upcoming, completed, cancelled bookings
- [ ] Upcoming session shows date, time, tutor/student, subject
- [ ] Completed session displays details and reviews
- [ ] Date range and subject filtering works
- [ ] Reminder notification 15 min before session
- [ ] Empty state message with CTA displayed

---

## 🏗️ Architecture Notes

### Frontend Structure

```
apps/frontend/src/
├── app/                    # Next.js 14 app router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # User dashboards
│   ├── tutors/            # Tutor discovery
│   ├── search/            # Tutor search
│   ├── admin/             # Admin pages
│   └── chat/              # Chat interface
├── components/            # Reusable React components
│   ├── auth/
│   ├── tutor/
│   ├── booking/
│   ├── search/
│   ├── review/
│   └── shared/
├── contexts/              # React Context API
│   ├── AuthContext.tsx
│   ├── BookingContext.tsx
│   └── ChatContext.tsx
├── hooks/                 # Custom React hooks
│   ├── useAuth.ts
│   ├── useTutorProfile.ts
│   └── useChat.ts
├── lib/                   # Utility functions
│   ├── api-client.ts
│   ├── token-storage.ts
│   └── constants.ts
├── types/                 # TypeScript types
│   ├── auth.ts
│   ├── tutor.ts
│   ├── booking.ts
│   └── chat.ts
└── __tests__/             # Unit tests

```

### Key Technologies

- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context + Custom Hooks
- **Real-time**: Socket.io Client
- **Maps**: Google Maps API
- **Video Streaming**: Cloudinary
- **Testing**: Vitest + React Testing Library
- **Form Handling**: React Hook Form (recommended)

### API Integration Flow

```
Frontend Component
    ↓
useCustomHook (handles state + API)
    ↓
axios/ApiClient.ts
    ↓
API Gateway (localhost:8000)
    ↓
Microservices (8001-8008)
    ↓
Databases (PostgreSQL, MongoDB, Redis)
```

### State Management Strategy

1. **Global State**: Auth context, user profile, notifications
2. **Local State**: Form inputs, UI toggles, page-specific data
3. **Server State**: Cached API responses, real-time updates
4. **Custom Hooks**: Encapsulate API calls and side effects

---

## 🧪 Testing & Deployment

### Unit Testing

- Components: test rendering, props, user interactions
- Hooks: test state updates, API calls
- Utilities: test helper functions

### Integration Testing

- Auth flow: register → login → access protected routes
- Booking flow: search → view → book → payment
- Chat flow: connect → send message → receive

### E2E Testing (Optional)

- Full user journeys
- Cross-browser testing
- Mobile responsiveness

### Deployment Checklist

- [ ] Environment variables configured
- [ ] API endpoints updated for production
- [ ] CORS configuration verified
- [ ] Authentication tokens secure (httpOnly cookies)
- [ ] Images/videos optimized
- [ ] Performance budgets met
- [ ] Accessibility audit passed
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] Error tracking configured

---

## 📞 Support & References

### External Services Setup

1. **Google Maps API**: See `google-map-initialization.md`
2. **Cloudinary**: Video upload configuration
3. **Stripe/Razorpay**: Payment gateway setup
4. **SendGrid/Nodemailer**: Email service

### Backend Documentation

- API Gateway: `API_ENDPOINTS_REFERENCE.md`
- Microservices: Individual service README files
- Database Schema: Prisma schema file

### Development Workflow

1. Create feature branch: `feat/feature-name`
2. Implement component with TypeScript
3. Add unit tests
4. Test API integration
5. Create PR with description
6. Code review before merge

---

**Last Updated**: December 9, 2025  
**Version**: 1.0  
**Author**: Development Team
