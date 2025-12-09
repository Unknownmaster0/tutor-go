# Ready to Start Task 2: Tutor Profile Management

## Current Status

✅ **Task 1 Complete** - Full authentication system implemented and ready
⏳ **Task 2 Ready to Begin** - Tutor profile system implementation

## What's Next

Task 2 will implement the complete tutor profile management system:

### 2.1 Tutor Profile Structure

- Professional information (bio, expertise, qualifications)
- Availability management (weekly schedule)
- Hourly rate configuration
- Subject/expertise tags
- Experience level and certification

### 2.2 Video Upload (Cloudinary)

- Intro video upload
- Video preview in profile
- Video management and replacement

### 2.3 Geolocation Features

- Address/location management
- Google Maps integration
- Service radius configuration
- Location-based discovery

### 2.4 Profile Completion

- Profile completion percentage
- Onboarding checklist
- Verification badges

## Prerequisites for Task 2

Before starting Task 2, ensure:

```bash
# 1. Backend is running
npm run dev --workspace=apps/backend

# 2. Frontend is running
npm run dev --workspace=apps/frontend

# 3. Create a tutor account at http://localhost:3000/auth/register
# Select "I'm a Tutor" role during registration

# 4. Test login works
# Verify you can login with the tutor account
```

## Task 2 Implementation Plan

### Phase 1: Tutor Profile Schema & Components

- [ ] Create TutorProfile type/interface
- [ ] Create TutorProfileForm component
- [ ] Create ProfileCompletionTracker component
- [ ] Create AddressForm component

### Phase 2: Cloudinary Integration

- [ ] Configure Cloudinary SDK
- [ ] Create VideoUploadComponent
- [ ] Create VideoPreview component
- [ ] Implement upload progress tracking

### Phase 3: Google Maps Integration

- [ ] Configure Google Maps API
- [ ] Create LocationPicker component
- [ ] Create ServiceRadiusMap component
- [ ] Implement geolocation

### Phase 4: Tutor Dashboard

- [ ] Create /dashboard/tutor/profile page
- [ ] Create /dashboard/tutor/edit page
- [ ] Create /dashboard/tutor/settings page
- [ ] Profile completion checklist

### Phase 5: Testing & Polish

- [ ] Form validation
- [ ] Error handling
- [ ] Loading states
- [ ] Integration testing

## File Structure to Create

```
apps/frontend/src/
├── app/
│   └── dashboard/
│       └── tutor/
│           ├── layout.tsx
│           ├── page.tsx              # Tutor dashboard
│           ├── profile/
│           │   └── page.tsx          # Profile view
│           ├── edit/
│           │   └── page.tsx          # Profile edit
│           └── settings/
│               └── page.tsx          # Settings
├── components/
│   ├── tutor/
│   │   ├── TutorProfileForm.tsx
│   │   ├── TutorProfileCard.tsx
│   │   ├── VideoUpload.tsx
│   │   ├── VideoPreview.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── ServiceRadiusMap.tsx
│   │   ├── AvailabilitySchedule.tsx
│   │   ├── ProfileCompletionTracker.tsx
│   │   └── ExpertiseTags.tsx
├── types/
│   ├── tutor.types.ts               # New
│   └── profile.types.ts              # New
└── lib/
    └── cloudinary.ts                 # New
```

## API Endpoints to Use

Task 2 will use these backend endpoints:

```
GET    /api/tutor/profile           - Get tutor profile
POST   /api/tutor/profile           - Create tutor profile
PUT    /api/tutor/profile           - Update tutor profile
PUT    /api/tutor/profile/video     - Upload intro video
GET    /api/tutor/availability      - Get availability schedule
PUT    /api/tutor/availability      - Update availability
GET    /api/tutor/location          - Get location info
PUT    /api/tutor/location          - Update location
GET    /api/tutor/expertise         - Get expertise tags
PUT    /api/tutor/expertise         - Update expertise
```

## Key Features to Implement

### 1. Profile Form

- [ ] Name, bio, hourly rate, experience level
- [ ] Education/qualifications
- [ ] Subject specializations
- [ ] Real-time form validation

### 2. Video Upload

- [ ] Drag-and-drop upload
- [ ] Progress bar
- [ ] Preview thumbnail
- [ ] Replace video option
- [ ] Delete video option

### 3. Location Management

- [ ] Address input with validation
- [ ] Google Maps autocomplete
- [ ] Service radius slider (1-50 km)
- [ ] Map visualization

### 4. Availability

- [ ] Weekly schedule selector
- [ ] Time slot selection
- [ ] Recurring availability
- [ ] Quick presets (standard hours)

### 5. Expertise

- [ ] Multi-select expertise tags
- [ ] Auto-suggest from predefined list
- [ ] Custom expertise entry
- [ ] Certification upload

## Design Patterns to Use

From Task 1 (carry forward):

```typescript
// Form validation pattern
const validateForm = (): boolean => {
  const errors: Record<string, string> = {};
  // validation logic
  setValidationErrors(errors);
  return Object.keys(errors).length === 0;
};

// Error handling pattern
try {
  await updateProfile(formData);
  toast.success('Profile updated!');
  router.push('/dashboard/tutor/profile');
} catch (err) {
  toast.error(error || 'Failed to update profile');
}

// API integration pattern
import { useAuth } from '@/hooks/useAuth';
const { user } = useAuth();
// Use apiClient with axios interceptors
```

## Dependencies to Install

If not already installed:

```bash
npm install --save cloudinary next-cloudinary
npm install --save @react-google-maps/api
npm install --save react-google-places-library
npm install --save react-hook-form      # Optional, for complex forms
npm install --save zod                   # Optional, for validation
```

## Testing Task 2

After implementation:

```bash
# 1. Test profile creation
# Register as tutor -> Complete profile form

# 2. Test video upload
# Upload intro video -> Verify preview

# 3. Test location features
# Enter address -> Verify on map -> Set radius

# 4. Test availability
# Set weekly schedule -> Verify save

# 5. Test profile view
# View completed profile -> All info displays
```

## Environment Variables Needed

Add to `.env.local`:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=<your_cloud_name>
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your_api_key>
NEXT_PUBLIC_GOOGLE_PLACES_API_KEY=<your_api_key>
```

## Performance Considerations

- Lazy load map component
- Compress video before upload
- Use Next.js Image optimization
- Cache profile data in React Query (if added)
- Pagination for expertise tags if many

## Estimated Timeline

- Phase 1 (Schema & Components): 2-3 hours
- Phase 2 (Cloudinary): 2-3 hours
- Phase 3 (Maps): 2-3 hours
- Phase 4 (Dashboard): 2-3 hours
- Phase 5 (Testing): 1-2 hours

**Total: 9-14 hours of development**

## Success Criteria

✅ Tutor can complete full profile
✅ Video upload works with preview
✅ Location/address works with maps
✅ Availability schedule saves correctly
✅ Expertise tags save correctly
✅ Profile completion percentage shows
✅ All form validation works
✅ Error handling works
✅ Responsive design works
✅ No console errors

## Ready to Begin?

When you're ready to start Task 2, let me know and I'll:

1. Create all necessary types and interfaces
2. Set up Cloudinary integration
3. Set up Google Maps integration
4. Begin implementing components

**Next command:** "Start Task 2" or "Begin Task 2: Tutor Profile Management"
