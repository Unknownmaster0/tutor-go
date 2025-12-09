# TutorGo Frontend Development - Getting Started Checklist

**Date**: December 9, 2025  
**Status**: Ready for Implementation  
**Prepared For**: Development Team

---

## ✅ Pre-Development Setup Checklist

### 1. Environment Setup (30 minutes)

- [ ] Clone latest code: `git checkout feat/adding-frontend-features`
- [ ] Install frontend dependencies: `cd apps/frontend && npm install`
- [ ] Install backend dependencies: `cd apps/backend && npm install`
- [ ] Create `.env.local` in frontend directory
- [ ] Copy environment variables from `.env.example`
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000`

### 2. Backend Verification (15 minutes)

- [ ] Backend starts without errors: `npm run dev` (from apps/backend)
- [ ] Gateway is accessible: http://localhost:8000/health (should return JSON)
- [ ] All 9 services show as operational in logs
- [ ] PostgreSQL database is configured and running
- [ ] MongoDB (if needed) is configured and running
- [ ] Redis is configured and running

### 3. Frontend Verification (15 minutes)

- [ ] Frontend starts without errors: `npm run dev` (from apps/frontend)
- [ ] Frontend accessible at: http://localhost:3000
- [ ] No critical TypeScript errors
- [ ] No console errors/warnings
- [ ] API client can communicate with gateway

### 4. Documentation Review (30 minutes)

- [ ] Read: `FRONTEND_PHASE_1_SUMMARY.md`
- [ ] Read: `IMPLEMENTATION_TASKS.md`
- [ ] Read: `QUICK_REFERENCE.md`
- [ ] Bookmark: `GOOGLE_MAPS_INTEGRATION.md` (needed for Task 3)
- [ ] Understand: 10-task roadmap and priority order
- [ ] Review: API endpoints reference

### 5. Google Maps Setup (Optional - needed for Task 3)

- [ ] Create Google Cloud project: [Google Cloud Console](https://console.cloud.google.com)
- [ ] Enable Maps JavaScript API
- [ ] Enable Places API
- [ ] Enable Geocoding API
- [ ] Generate API key
- [ ] Restrict API key to localhost:3000 and production domain
- [ ] Add API key to `.env.local`: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

### 6. Development Tools Setup (15 minutes)

- [ ] Install VS Code extensions:
  - [ ] ES7+ React/Redux/React-Native snippets
  - [ ] Prettier - Code formatter
  - [ ] ESLint
  - [ ] Tailwind CSS IntelliSense
  - [ ] Thunder Client (or Postman for API testing)
- [ ] Configure VS Code settings for project
- [ ] Test debugging: F5 to start debugger
- [ ] Test formatter: Shift+Alt+F

---

## 📋 Task 1: User Registration & Authentication (4-5 hours)

### Acceptance Criteria

- [ ] Registration form with student/tutor role selection
- [ ] New user account creation with email verification
- [ ] Proper error message for duplicate email
- [ ] Login with valid credentials returns JWT
- [ ] Expired token triggers re-authentication
- [ ] Password reset via email works end-to-end

### Components to Create

- [ ] `apps/frontend/src/app/auth/register/page.tsx`
- [ ] `apps/frontend/src/app/auth/register/student-form.tsx`
- [ ] `apps/frontend/src/app/auth/register/tutor-form.tsx`
- [ ] `apps/frontend/src/app/auth/login/page.tsx`
- [ ] `apps/frontend/src/app/auth/login/login-form.tsx`
- [ ] `apps/frontend/src/app/auth/forgot-password/page.tsx`
- [ ] `apps/frontend/src/app/auth/forgot-password/forgot-password-form.tsx`
- [ ] `apps/frontend/src/app/auth/reset-password/page.tsx`
- [ ] `apps/frontend/src/components/auth/AuthGuard.tsx`
- [ ] `apps/frontend/src/components/auth/ProtectedRoute.tsx`
- [ ] `apps/frontend/src/contexts/AuthContext.tsx`
- [ ] `apps/frontend/src/hooks/useAuth.ts`
- [ ] `apps/frontend/src/hooks/useLogin.ts`
- [ ] `apps/frontend/src/hooks/useRegister.ts`

### Testing Checklist

- [ ] Can register as student
- [ ] Can register as tutor
- [ ] Duplicate email shows error
- [ ] Can login with correct credentials
- [ ] Invalid credentials show error
- [ ] Token persists across page refresh
- [ ] Protected routes redirect to login
- [ ] Logout clears token
- [ ] Password reset email sends

### API Endpoints to Test

- [ ] POST `/api/auth/register`
- [ ] POST `/api/auth/login`
- [ ] POST `/api/auth/refresh`
- [ ] POST `/api/auth/forgot-password`
- [ ] POST `/api/auth/reset-password`
- [ ] GET `/api/auth/me`
- [ ] POST `/api/auth/logout`

---

## 📋 Task 2: Tutor Profile Management (6-8 hours)

### Acceptance Criteria

- [ ] Editable profile fields display correctly
- [ ] Demo video uploads to Cloudinary securely
- [ ] Location with geospatial data stores correctly
- [ ] All required fields validated before save
- [ ] Multiple subjects with proficiency levels supported
- [ ] Video size/format validation with clear errors

### Components to Create

- [ ] `apps/frontend/src/app/dashboard/tutor/profile/page.tsx`
- [ ] `apps/frontend/src/app/dashboard/tutor/profile/edit-form.tsx`
- [ ] `apps/frontend/src/app/dashboard/tutor/profile/video-upload.tsx`
- [ ] `apps/frontend/src/components/tutor/ProfileEditor.tsx`
- [ ] `apps/frontend/src/components/tutor/VideoUploader.tsx`
- [ ] `apps/frontend/src/components/tutor/SubjectSelector.tsx`
- [ ] `apps/frontend/src/components/tutor/LocationPicker.tsx`
- [ ] `apps/frontend/src/components/tutor/ProfilePreview.tsx`
- [ ] `apps/frontend/src/hooks/useTutorProfile.ts`
- [ ] `apps/frontend/src/hooks/useVideoUpload.ts`
- [ ] `apps/frontend/src/hooks/useLocationPicker.ts`
- [ ] `apps/frontend/src/types/tutor.ts`

### Cloudinary Setup

- [ ] Create Cloudinary account
- [ ] Get cloud name
- [ ] Get upload preset (or generate unsigned upload)
- [ ] Configure video upload settings
- [ ] Set up streaming delivery

### Testing Checklist

- [ ] Can load profile form
- [ ] Can update bio/qualifications
- [ ] Can upload demo video
- [ ] Video preview before upload works
- [ ] Can select subjects with proficiency
- [ ] Location picker works with autocomplete
- [ ] Can save profile
- [ ] Profile loads correctly after save
- [ ] Video size validation works
- [ ] Required field validation works

### API Endpoints to Test

- [ ] GET `/api/tutors/me`
- [ ] PUT `/api/tutors/me`
- [ ] POST `/api/tutors/me/video`
- [ ] DELETE `/api/tutors/me/video/:videoId`
- [ ] GET `/api/tutors/me/subjects`
- [ ] POST `/api/tutors/me/subjects`

---

## 📋 Task 3: Location-Based Tutor Search (7-9 hours)

### Prerequisites

- [ ] Google Maps API key generated and configured
- [ ] Read: GOOGLE_MAPS_INTEGRATION.md completely
- [ ] Required packages installed: `@react-google-maps/api`

### Acceptance Criteria

- [ ] Location input with geocoding returns tutors
- [ ] Subject filter returns matching tutors only
- [ ] Search results show name, subject, rating, rate, distance
- [ ] Clicking tutor navigates to detail page
- [ ] No results message with expand radius suggestion
- [ ] Manual location entry works when geolocation unavailable

### Components to Create

- [ ] `apps/frontend/src/app/search/page.tsx`
- [ ] `apps/frontend/src/app/search/search-layout.tsx`
- [ ] `apps/frontend/src/app/search/[[...filters]]/page.tsx`
- [ ] `apps/frontend/src/components/search/SearchFilters.tsx`
- [ ] `apps/frontend/src/components/search/TutorMap.tsx`
- [ ] `apps/frontend/src/components/search/SearchResults.tsx`
- [ ] `apps/frontend/src/components/search/LocationInput.tsx`
- [ ] `apps/frontend/src/components/search/SubjectFilter.tsx`
- [ ] `apps/frontend/src/components/search/RangeFilter.tsx`
- [ ] `apps/frontend/src/hooks/useMapSearch.ts`
- [ ] `apps/frontend/src/hooks/useTutorSearch.ts`
- [ ] `apps/frontend/src/hooks/useLocationAutoComplete.ts`
- [ ] `apps/frontend/src/hooks/useGeolocation.ts`
- [ ] `apps/frontend/src/types/search.ts`

### Maps Implementation Checklist

- [ ] Google Maps script loads
- [ ] Map displays with user location
- [ ] Tutor markers appear on map
- [ ] Clicking marker selects tutor
- [ ] Map auto-fits bounds
- [ ] Location autocomplete works
- [ ] Distance slider filters results
- [ ] Subject checkboxes filter results

### Testing Checklist

- [ ] Map displays without errors
- [ ] Geolocation works (desktop: allow permission)
- [ ] Can enter location manually
- [ ] Search returns tutors nearby
- [ ] Can filter by subject
- [ ] Can filter by radius
- [ ] Results list updates with map
- [ ] No results message displays
- [ ] Mobile responsive layout
- [ ] Performance acceptable with multiple tutors

### API Endpoints to Test

- [ ] POST `/api/tutors/search`
- [ ] GET `/api/tutors/search`
- [ ] GET `/api/tutors/:tutorId`

---

## 📋 Task 4: Tutor Profile Viewing (5-6 hours)

### Acceptance Criteria

- [ ] Profile displays bio, qualifications, subjects, rates, location, videos
- [ ] Video player streams demo videos
- [ ] Reviews show average rating and individual comments
- [ ] Calendar shows available time slots
- [ ] "New to platform" message when no reviews exist

### Components to Create

- [ ] `apps/frontend/src/app/tutors/[tutorId]/page.tsx`
- [ ] `apps/frontend/src/app/tutors/[tutorId]/layout.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/ProfileHeader.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/BioSection.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/QualificationsSection.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/VideoPlayer.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/ReviewsSection.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/RatingDisplay.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/AvailabilityCalendar.tsx`
- [ ] `apps/frontend/src/components/tutor-profile/BookNowButton.tsx`
- [ ] `apps/frontend/src/types/profile.ts`

### Testing Checklist

- [ ] Page loads with tutor data
- [ ] All profile sections render
- [ ] Video player works and streams correctly
- [ ] Reviews display with ratings
- [ ] Average rating calculation correct
- [ ] Availability calendar shows slots
- [ ] "Book Now" button visible and clickable
- [ ] Mobile responsive layout
- [ ] Back navigation works

### API Endpoints to Test

- [ ] GET `/api/tutors/:tutorId`
- [ ] GET `/api/tutors/:tutorId/videos`
- [ ] GET `/api/reviews/tutor/:tutorId`
- [ ] GET `/api/tutors/:tutorId/availability`

---

## 📋 Task 5: Session Booking (6-7 hours)

### Acceptance Criteria

- [ ] Time slot selection displays correctly with cost
- [ ] Booking confirmation creates record with "pending payment"
- [ ] Reserved time slots prevent double-booking
- [ ] Cancellation before deadline works with refund eligibility
- [ ] Unavailable slot notification refreshes availability
- [ ] Both users receive notifications on confirmation

### Components to Create

- [ ] `apps/frontend/src/app/booking/[tutorId]/page.tsx`
- [ ] `apps/frontend/src/app/booking/[tutorId]/confirmation-page.tsx`
- [ ] `apps/frontend/src/app/dashboard/bookings/page.tsx`
- [ ] `apps/frontend/src/app/dashboard/bookings/[bookingId]/page.tsx`
- [ ] `apps/frontend/src/components/booking/TimeSlotSelector.tsx`
- [ ] `apps/frontend/src/components/booking/BookingForm.tsx`
- [ ] `apps/frontend/src/components/booking/BookingSummary.tsx`
- [ ] `apps/frontend/src/components/booking/ConfirmationDialog.tsx`
- [ ] `apps/frontend/src/components/booking/CancelBookingDialog.tsx`
- [ ] `apps/frontend/src/types/booking.ts`

### Testing Checklist

- [ ] Calendar displays available slots
- [ ] Can select time slot and duration
- [ ] Total cost calculates correctly
- [ ] Booking form validates inputs
- [ ] Can confirm booking
- [ ] Confirmation page shows booking details
- [ ] Booking appears in user's booking list
- [ ] Can cancel pending booking
- [ ] Cancellation removes booking
- [ ] Selected slot no longer available for others

### API Endpoints to Test

- [ ] POST `/api/bookings`
- [ ] GET `/api/bookings/:bookingId`
- [ ] PATCH `/api/bookings/:bookingId/confirm`
- [ ] PATCH `/api/bookings/:bookingId/cancel`
- [ ] GET `/api/tutors/:tutorId/availability`

---

## 📋 Task 6: Real-Time Chat (5-6 hours)

### Prerequisites

- [ ] Socket.io client installed: `npm install socket.io-client`
- [ ] Chat service running: Port 8006

### Acceptance Criteria

- [ ] Chat enabled only for confirmed bookings
- [ ] Messages deliver in real-time via Socket.io
- [ ] New message notifications appear
- [ ] Previous message history loads on open
- [ ] Messages queue when offline
- [ ] Inappropriate content flagged for review

### Components to Create

- [ ] `apps/frontend/src/app/chat/[conversationId]/page.tsx`
- [ ] `apps/frontend/src/app/chat/[conversationId]/layout.tsx`
- [ ] `apps/frontend/src/components/chat/ChatWindow.tsx`
- [ ] `apps/frontend/src/components/chat/MessageList.tsx`
- [ ] `apps/frontend/src/components/chat/MessageInput.tsx`
- [ ] `apps/frontend/src/components/chat/ConversationList.tsx`
- [ ] `apps/frontend/src/components/chat/OnlineStatus.tsx`
- [ ] `apps/frontend/src/components/chat/TypingIndicator.tsx`
- [ ] `apps/frontend/src/hooks/useChat.ts`
- [ ] `apps/frontend/src/hooks/useSocket.ts`
- [ ] `apps/frontend/src/hooks/useConversations.ts`
- [ ] `apps/frontend/src/types/chat.ts`

### Socket.io Events to Test

- [ ] join_room: { userId, bookingId }
- [ ] send_message: { message, receiverId, conversationId }
- [ ] message_received: listener
- [ ] user_online: listener
- [ ] user_offline: listener
- [ ] typing: listener

### Testing Checklist

- [ ] Socket connects on page load
- [ ] Can send message
- [ ] Message appears immediately
- [ ] Receiver gets message in real-time
- [ ] Message history loads
- [ ] Online status updates
- [ ] Typing indicator works
- [ ] Unread badge appears
- [ ] Mobile responsive chat interface

### API Endpoints to Test

- [ ] GET `/api/chat/conversations`
- [ ] GET `/api/chat/conversations/:conversationId/messages`
- [ ] POST `/api/chat/messages`
- [ ] PATCH `/api/chat/messages/:messageId/read`

---

## 📋 Task 7: Review & Rating System (4-5 hours)

### Acceptance Criteria

- [ ] Review form appears after completed session
- [ ] Rating (1-5 stars) with optional comment accepted
- [ ] Review submission recalculates tutor rating
- [ ] Reviews display chronologically (newest first)
- [ ] Incomplete session prevents review submission
- [ ] Inappropriate content can be flagged for moderation

### Components to Create

- [ ] `apps/frontend/src/app/dashboard/bookings/[bookingId]/review/page.tsx`
- [ ] `apps/frontend/src/components/review/ReviewForm.tsx`
- [ ] `apps/frontend/src/components/review/StarRating.tsx`
- [ ] `apps/frontend/src/components/review/ReviewCard.tsx`
- [ ] `apps/frontend/src/components/review/ReviewsList.tsx`
- [ ] `apps/frontend/src/components/review/ReviewModal.tsx`
- [ ] `apps/frontend/src/types/review.ts`

### Testing Checklist

- [ ] Review form displays after completed booking
- [ ] Can select 1-5 stars
- [ ] Can enter review text (max 500 chars)
- [ ] Can submit review
- [ ] Average rating updates on tutor profile
- [ ] Review appears on tutor profile
- [ ] Can flag inappropriate review
- [ ] Cannot review same session twice
- [ ] Cannot review before session completion

### API Endpoints to Test

- [ ] POST `/api/reviews`
- [ ] GET `/api/reviews/tutor/:tutorId`
- [ ] PATCH `/api/reviews/:reviewId`
- [ ] DELETE `/api/reviews/:reviewId`
- [ ] POST `/api/reviews/:reviewId/flag`

---

## 📋 Task 8: Tutor Availability Management (5-6 hours)

### Acceptance Criteria

- [ ] Calendar interface displays time slots
- [ ] Available slots created and visible to students
- [ ] Unavailable times prevent student bookings
- [ ] Availability updates immediately reflected
- [ ] Booked slots prevent deletion with warning
- [ ] Recurring patterns supported

### Components to Create

- [ ] `apps/frontend/src/app/dashboard/tutor/availability/page.tsx`
- [ ] `apps/frontend/src/app/dashboard/tutor/availability/layout.tsx`
- [ ] `apps/frontend/src/components/availability/AvailabilityCalendar.tsx`
- [ ] `apps/frontend/src/components/availability/TimeSlotCreator.tsx`
- [ ] `apps/frontend/src/components/availability/BulkAvailabilityForm.tsx`
- [ ] `apps/frontend/src/components/availability/BlockedTimeManager.tsx`
- [ ] `apps/frontend/src/components/availability/RecurrenceSettings.tsx`
- [ ] `apps/frontend/src/components/availability/AvailabilitySummary.tsx`
- [ ] `apps/frontend/src/types/availability.ts`

### Testing Checklist

- [ ] Calendar displays correctly
- [ ] Can click to add time slot
- [ ] Can set time range
- [ ] Can set slot duration
- [ ] Can block unavailable times
- [ ] Can set recurring availability
- [ ] Changes save immediately
- [ ] Booked slots show as unavailable
- [ ] Cannot delete booked slot
- [ ] Bulk availability import/export

### API Endpoints to Test

- [ ] GET `/api/availability`
- [ ] POST `/api/availability`
- [ ] PATCH `/api/availability/:slotId`
- [ ] DELETE `/api/availability/:slotId`
- [ ] POST `/api/availability/bulk`

---

## 📋 Task 9: Admin Dashboard (8-10 hours)

### Acceptance Criteria

- [ ] Dashboard displays total users, bookings, revenue metrics
- [ ] User lists filterable by type with search
- [ ] User suspension with reason logging works
- [ ] Flagged content reviewable with moderation actions
- [ ] Transaction history filterable by date/user/status
- [ ] Suspicious activity alerts on dashboard

### Components to Create

- [ ] `apps/frontend/src/app/admin/page.tsx`
- [ ] `apps/frontend/src/app/admin/users/page.tsx`
- [ ] `apps/frontend/src/app/admin/users/[userId]/page.tsx`
- [ ] `apps/frontend/src/app/admin/users/student-filters.tsx`
- [ ] `apps/frontend/src/app/admin/content-moderation/page.tsx`
- [ ] `apps/frontend/src/app/admin/content-moderation/reviews/page.tsx`
- [ ] `apps/frontend/src/app/admin/content-moderation/messages/page.tsx`
- [ ] `apps/frontend/src/app/admin/transactions/page.tsx`
- [ ] `apps/frontend/src/app/admin/layout.tsx`
- [ ] `apps/frontend/src/components/admin/DashboardCard.tsx`
- [ ] `apps/frontend/src/components/admin/MetricsChart.tsx`
- [ ] `apps/frontend/src/components/admin/UserTable.tsx`
- [ ] `apps/frontend/src/components/admin/SuspensionModal.tsx`
- [ ] `apps/frontend/src/components/admin/ContentModerationCard.tsx`
- [ ] `apps/frontend/src/components/admin/TransactionTable.tsx`
- [ ] `apps/frontend/src/types/admin.ts`

### Testing Checklist

- [ ] Admin can access dashboard (role-based)
- [ ] Dashboard shows KPIs
- [ ] Can view all users
- [ ] Can filter by role/status
- [ ] Can search users
- [ ] Can suspend user
- [ ] Can view flagged content
- [ ] Can approve/delete content
- [ ] Can view transaction history
- [ ] Can export reports
- [ ] Charts display correctly

### API Endpoints to Test

- [ ] GET `/api/admin/dashboard`
- [ ] GET `/api/admin/users`
- [ ] GET `/api/admin/users/:userId`
- [ ] PATCH `/api/admin/users/:userId/suspend`
- [ ] GET `/api/admin/content/flagged`
- [ ] PATCH `/api/admin/content/:contentId/approve`
- [ ] DELETE `/api/admin/content/:contentId`
- [ ] GET `/api/admin/transactions`

---

## 📋 Task 10: Session History & Management (4-5 hours)

### Acceptance Criteria

- [ ] Session history displays upcoming, completed, cancelled bookings
- [ ] Upcoming session shows date, time, tutor/student, subject
- [ ] Completed session displays details and reviews
- [ ] Date range and subject filtering works
- [ ] Reminder notification 15 min before session
- [ ] Empty state message with CTA displayed

### Components to Create

- [ ] `apps/frontend/src/app/dashboard/sessions/page.tsx`
- [ ] `apps/frontend/src/app/dashboard/sessions/[sessionId]/page.tsx`
- [ ] `apps/frontend/src/app/dashboard/layout.tsx`
- [ ] `apps/frontend/src/components/session-history/SessionList.tsx`
- [ ] `apps/frontend/src/components/session-history/SessionCard.tsx`
- [ ] `apps/frontend/src/components/session-history/SessionDetail.tsx`
- [ ] `apps/frontend/src/components/session-history/SessionFilters.tsx`
- [ ] `apps/frontend/src/components/session-history/ReminderNotification.tsx`
- [ ] `apps/frontend/src/components/session-history/CancellationFlow.tsx`
- [ ] `apps/frontend/src/types/session.ts`

### Testing Checklist

- [ ] Session list loads for logged-in user
- [ ] Upcoming sessions display correctly
- [ ] Completed sessions display with reviews
- [ ] Can filter by date range
- [ ] Can filter by subject
- [ ] Can sort by date
- [ ] Can view session details
- [ ] Reminder notification triggers 15 min before
- [ ] Empty state shows when no sessions
- [ ] Mobile responsive

### API Endpoints to Test

- [ ] GET `/api/bookings`
- [ ] GET `/api/bookings/:bookingId`
- [ ] GET `/api/bookings?status=upcoming`
- [ ] PATCH `/api/bookings/:bookingId/cancel`
- [ ] GET `/api/notifications`

---

## 🎬 After Development Checklist

### Code Quality

- [ ] ESLint passes: `npm run lint`
- [ ] TypeScript strict mode: No errors
- [ ] Prettier formatted: `npm run format`
- [ ] No console.log statements left
- [ ] No commented-out code

### Testing

- [ ] Unit tests written for utilities
- [ ] Component tests for complex components
- [ ] Hook tests for custom hooks
- [ ] Test coverage > 80%
- [ ] All tests passing: `npm run test`

### Performance

- [ ] No React warnings in console
- [ ] No performance issues in DevTools
- [ ] Images optimized
- [ ] Bundle size acceptable
- [ ] Load time < 3 seconds

### Security

- [ ] No API keys in code
- [ ] Environment variables used for secrets
- [ ] Input validation on forms
- [ ] HTTPS in production
- [ ] CORS properly configured

### Documentation

- [ ] Comments on complex logic
- [ ] TypeScript interfaces for all data
- [ ] README updated if needed
- [ ] API integration patterns documented

### Deployment

- [ ] Environment variables configured in hosting
- [ ] Build passes: `npm run build`
- [ ] Production URLs in env
- [ ] Database migrations ready
- [ ] Backup plan in place

---

## 📞 Support & Resources

### Key Documents

- **IMPLEMENTATION_TASKS.md**: Detailed specs for each feature
- **GOOGLE_MAPS_INTEGRATION.md**: Maps API setup and integration
- **QUICK_REFERENCE.md**: Quick lookup for patterns and commands
- **FRONTEND_PHASE_1_SUMMARY.md**: Overall project summary

### Helpful Commands

```bash
# Development
npm run dev              # Start dev server
npm run test            # Run tests
npm run test:watch      # Run tests in watch mode
npm run lint            # Run ESLint
npm run format          # Format with Prettier
npm run build           # Build for production

# Debugging
npm run dev -- --inspect  # Run with Node debugger
```

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)

---

## 🏁 Summary

**Total Estimated Time**: 40-50 hours  
**Recommended Timeline**: 5-6 weeks (8-10 hours/week)  
**Priority Order**: Task 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10

### Success Criteria

- ✅ All 10 tasks completed with acceptance criteria met
- ✅ Zero critical bugs
- ✅ All tests passing
- ✅ TypeScript strict mode
- ✅ Performance optimized
- ✅ Security reviewed
- ✅ Deployed to production

---

**Document Version**: 1.0  
**Last Updated**: December 9, 2025  
**Status**: ✅ Ready for Implementation

**Next Step**: Start with Task 1 (User Registration & Authentication)
