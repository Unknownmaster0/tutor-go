# Quick Setup Guide - Enhanced Dashboard & Search Features

## Prerequisites
- Node.js 16+ installed
- MongoDB running (for tutor data)
- PostgreSQL running (for user/review data)
- Mapbox account and API token

## Setup Instructions

### 1. Backend Setup

#### Create/Update Environment Variables
Create or update `apps/backend/.env`:
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/tutors

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/tutorgo

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Other configs
MAPBOX_TOKEN=your_mapbox_token_here
```

#### Install Dependencies
```bash
cd apps/backend
npm install
```

#### Database Migration
```bash
npm run prisma:migrate
# or
npm run prisma:seed # Seeds sample data
```

#### Start Backend Server
```bash
npm run dev
# Server runs on http://localhost:5000
```

### 2. Frontend Setup

#### Create/Update Environment Variables
Create or update `apps/frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
```

#### Install Dependencies
```bash
cd apps/frontend
npm install
```

#### Start Frontend Development Server
```bash
npm run dev
# Frontend runs on http://localhost:3000
```

### 3. Verify Setup

#### Test Dashboard
1. Navigate to `http://localhost:3000/dashboard`
2. Should see "Available Teachers" section with top-rated tutors
3. Click "Advanced Search" button to go to search page

#### Test Search Page
1. Navigate to `http://localhost:3000/search`
2. You should see:
   - Filters sidebar with location, subject, price, rating filters
   - Map toggle button
   - "Current Location" button
   - List of tutors with distances

#### Test Map Feature
1. On search page, click "Show Map" button
2. Click "Current Location" to enable geolocation
3. Grant browser permission for location access
4. Map should display with:
   - Green marker for your location
   - Blue markers for tutors
   - Click markers to see details

---

## Feature Walkthrough

### Dashboard - Top-Rated Teachers

**What to Expect:**
- List of highest-rated tutors
- Rating badges with star emoji
- Subject pills
- Search bar for local filtering
- "Advanced Search" button

**How to Use:**
1. Visit `/dashboard`
2. Browse available tutors
3. Use local search to filter by name/subject
4. Click "Advanced Search" for more options

---

### Search Page - Advanced Filtering

**Available Filters:**
1. **Location**
   - Enter city or address
   - "📍 Current Location" button to use GPS location
   - Distance radius slider (1-50 km)

2. **Subject**
   - Dropdown with subject options
   - Mathematics, Physics, Chemistry, Biology, English, etc.

3. **Hourly Rate**
   - Min price input
   - Max price input

4. **Minimum Rating**
   - Filter by 4.5+, 4.0+, 3.5+, or 3.0+ stars

5. **Action Buttons**
   - "Apply Filters" - Apply current filter selection
   - "Clear All" - Reset all filters to default

---

### Map Visualization

**Features:**
1. **Show/Hide Map Toggle**
   - Click "Show Map" button in header
   - Displays interactive map of tutors

2. **Markers on Map:**
   - 🟢 Green circle: Your current location
   - 👨‍🏫 Blue circle: Tutor locations

3. **Click Marker to See:**
   - Tutor name
   - Distance from you (e.g., "2.5 km")
   - Hourly rate
   - Rating and reviews
   - "View Profile" button

4. **Map Controls:**
   - Zoom in/out (scroll or buttons)
   - Pan around (click and drag)
   - Rotate map (right-click drag)

---

## API Endpoints Reference

### Get Top-Rated Tutors (New)
```
GET /api/tutors/top-rated?limit=10
```

**Response:**
```json
[
  {
    "id": "tutor123",
    "name": "John Smith",
    "hourlyRate": 50,
    "rating": 4.8,
    "totalReviews": 145,
    "subjects": [{"name": "Mathematics"}],
    "location": {
      "coordinates": [-74.006, 40.7128],
      "address": "New York, NY"
    }
  }
]
```

### Search Tutors (Enhanced)
```
GET /api/tutors/search?latitude=40.7128&longitude=-74.006&radius=10&subject=Math&minRate=30&maxRate=100&minRating=4
```

---

## Troubleshooting

### Map Not Showing
**Problem:** "Map configuration is missing" error

**Solution:**
1. Check `.env.local` has `NEXT_PUBLIC_MAPBOX_TOKEN`
2. Verify token is valid in Mapbox dashboard
3. Restart frontend server after changing env vars

### Geolocation Not Working
**Problem:** "Use Current Location" button does nothing

**Solution:**
1. Ensure you're on HTTPS (or localhost for development)
2. Check browser has geolocation permission enabled
3. Allow permission when browser asks
4. Check browser console for permission denied message

### Distances Not Showing
**Problem:** Distance badges not visible on tutor cards/map

**Solution:**
1. Verify API is returning location coordinates
2. Check backend MongoDB has tutor location data
3. Verify `distance-calculator.ts` is properly imported
4. Check browser console for errors

### Filters Not Applying
**Problem:** Clicking "Apply Filters" doesn't update results

**Solution:**
1. Ensure you have location (either GPS or default)
2. Check network tab in DevTools for API calls
3. Verify backend search endpoint is working
4. Try "Clear All" then apply single filter

### Backend Search Endpoint Failing
**Problem:** API returns 500 error when searching

**Solution:**
1. Check MongoDB connection is working
2. Verify tutor documents have location field with coordinates
3. Check server logs for detailed error
4. Ensure prisma migrations are run

---

## Database Seeding

### Sample Data
To populate with sample tutors:

```bash
cd apps/backend
npm run prisma:seed
```

This creates:
- Sample tutor profiles with locations
- Sample user accounts
- Sample ratings and reviews

### Manual Tutor Creation
1. User registers as tutor
2. Navigate to `/dashboard/tutor/profile`
3. Create tutor profile with:
   - Bio
   - Subjects
   - Hourly rate
   - Location (address will be geocoded)
   - Qualifications

---

## Performance Tips

1. **Caching**
   - Top-rated tutors cached for 30 minutes
   - Search results cached for 5 minutes
   - Clear cache by restarting backend

2. **Geolocation**
   - Only requests location once per session
   - Subsequent searches use cached location
   - Can request new location with "Current Location" button

3. **Map**
   - Only renders map when "Show Map" is clicked
   - Loads Mapbox GL JS on demand
   - Automatically fits bounds for all tutors

4. **Pagination**
   - 20 tutors per page
   - Load more with "Load More" button
   - Improves initial page load time

---

## Browser Compatibility

### Recommended
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- JavaScript enabled
- ES6+ support
- Geolocation API support (for location features)
- Mapbox GL JS compatible browser

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Blank page on load | Check browser console for errors, verify API URL |
| Tutors not loading | Check backend is running, verify MongoDB connection |
| Map blank/white | Check Mapbox token, verify browser console for errors |
| Location permission denied | Click "Current Location" again, check browser settings |
| Filters not working | Click "Apply Filters" button, check network in DevTools |
| Distance showing as NaN | Ensure tutors have valid coordinates, restart frontend |
| Slow map loading | Check network tab, may need Mapbox token upgrade |

---

## Next Steps

1. **Production Deployment**
   - Set up SSL certificates
   - Configure environment variables for production
   - Enable CORS for your domain
   - Use production database

2. **Monitoring**
   - Set up error tracking (Sentry, LogRocket)
   - Monitor API response times
   - Track user geolocation usage

3. **Optimization**
   - Implement image optimization for tutor profiles
   - Add service workers for offline support
   - Optimize bundle size
   - Implement lazy loading for tutor images

4. **Enhanced Features**
   - Add tutor reviews display on cards
   - Implement favorite tutors
   - Add booking directly from search
   - Show availability calendar

---

## Support

For issues or questions:
1. Check browser console for error messages
2. Review network tab in DevTools
3. Check server logs for backend errors
4. Verify all environment variables are set correctly
5. Ensure all services (MongoDB, PostgreSQL) are running

---

## Version Info

- **Node.js:** 16+ required
- **Next.js:** 14+
- **React:** 18+
- **TypeScript:** 5+
- **Mapbox GL JS:** Latest
- **Tailwind CSS:** Latest

---

Last Updated: December 9, 2025
