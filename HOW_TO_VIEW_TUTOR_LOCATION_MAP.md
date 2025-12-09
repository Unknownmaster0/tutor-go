# How to View Tutor Location on Google Map - Frontend Guide

**Date**: December 9, 2025  
**Objective**: Display tutor location on Google Maps when student is viewing tutor profile

---

## 📋 Current Implementation Status

Your application already has:

✅ **Google Maps API Key configured** - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in `.env.local`  
✅ **Google Maps integration** - For search results with multiple tutors  
✅ **Google Maps integration** - For service radius visualization  
✅ **Tutor location data structure** - Stores coordinates `[longitude, latitude]` and address  
✅ **TutorMap component** - Uses Google Maps API for all marker displays

---

## 🚀 Current Implementation

### 1. **Search Page** (`/search`)

Currently displays:

- **ServiceRadiusMap** - Shows student's selected location with a service radius circle using Google Maps
- **TutorSearchResults** - Lists tutors in a list/grid view with distance, rating, price
- Tutors can be sorted by: distance, rating, price

### 2. **Tutor Profile Page** (`/tutors/[id]`)

Currently displays:

- Tutor name, rating, hourly rate
- Bio, qualifications, subjects taught
- Demo videos
- Availability calendar
- Reviews
- **MISSING**: Google Map showing tutor's location

---

## 🎯 How to Proceed - Step by Step

### **Step 1: Create a Google Maps Component for Tutor Location**

Create a new component: `apps/frontend/src/components/map/tutor-location-map.tsx`

```tsx
'use client';

import { useEffect, useRef } from 'react';

interface TutorLocationMapProps {
  latitude: number;
  longitude: number;
  tutorName: string;
  address: string;
  className?: string;
}

export const TutorLocationMap: React.FC<TutorLocationMapProps> = ({
  latitude,
  longitude,
  tutorName,
  address,
  className = 'w-full h-80 rounded-lg',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const googleMaps = (window as any).google.maps;

      // Create map centered on tutor location
      const map = new googleMaps.Map(mapRef.current!, {
        center: { lat: latitude, lng: longitude },
        zoom: 15, // Closer zoom for individual tutor location
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: true,
      });

      // Add marker at tutor location
      new googleMaps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: tutorName,
        icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png', // Red marker for tutor
      });

      // Add info window
      const infoWindow = new googleMaps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 250px;">
            <h3 style="font-weight: bold; margin-bottom: 5px; color: #1f2937;">${tutorName}</h3>
            <p style="margin: 0; color: #6b7280; font-size: 14px;">📍 ${address}</p>
            <p style="margin-top: 5px; color: #3b82f6; font-size: 12px;">
              ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </p>
          </div>
        `,
      });

      // Show info window by default
      infoWindow.open(
        map,
        new googleMaps.Marker({
          position: { lat: latitude, lng: longitude },
          map: map,
        }),
      );
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [latitude, longitude, tutorName, address]);

  return <div ref={mapRef} className={className} style={{ minHeight: '400px' }} />;
};
```

---

### **Step 2: Import and Add Map to Tutor Profile Page**

Edit: `apps/frontend/src/app/tutors/[id]/page.tsx`

**Add import at top:**

```tsx
import { TutorLocationMap } from '@/components/map/tutor-location-map';
```

**Add after the Demo Videos section (around line 170) in the sidebar or main content:**

```tsx
{
  /* Location Map */
}
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-900 mb-4">📍 Location</h2>

  <TutorLocationMap
    latitude={tutor.location.coordinates[1]} // latitude (second element)
    longitude={tutor.location.coordinates[0]} // longitude (first element)
    tutorName={tutor.name}
    address={tutor.location.address}
    className="w-full h-96 rounded-lg border border-gray-200"
  />

  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
    <p className="text-gray-700">
      <span className="font-semibold">Service Location:</span> {tutor.location.address}
    </p>
  </div>
</div>;
```

---

### **Step 3: Update Tutor Profile Page Layout**

In `apps/frontend/src/app/tutors/[id]/page.tsx`, the grid structure should be:

**Option A: Full-width Map (Below Demo Videos)**

```tsx
<div className="lg:col-span-2">
  {/* Demo Videos */}
  {/* ... existing code ... */}

  {/* Location Map */}
  {/* ... new code ... */}

  {/* Tabs with About & Reviews */}
  {/* ... existing code ... */}
</div>
```

**Option B: Map in Sidebar (Right side)**

```tsx
<div className="lg:col-span-1">
  {/* Existing Availability Calendar */}

  {/* Location Map */}
  {/* ... new code ... */}
</div>
```

---

## 🔑 Key Data Points

Your tutor data structure includes:

```typescript
interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  address: string;
}

interface TutorProfile {
  location: Location; // Contains the map coordinates
  // ... other fields
}
```

**Important**: Coordinates are stored as `[longitude, latitude]` (GeoJSON format)

- `coordinates[0]` = longitude
- `coordinates[1]` = latitude

---

## 🌍 View Locations Where Maps Will Appear

After implementing, as a **signed-in student**, you can:

### **1. Search Page → View Service Radius**

- **URL**: `/search`
- **Shows**: Student's selected location with service radius circle
- **Status**: ✅ Already working with Google Maps

### **2. Tutor Profile Page → View Tutor's Location**

- **URL**: `/tutors/[tutorId]` (e.g., `/tutors/123`)
- **Shows**: Specific tutor's location on interactive map
- **Status**: 🔧 Needs implementation (follow Step 1-3 above)

### **3. Search Results → See Tutors on Map**

- **URL**: `/search` (after searching)
- **Shows**: All tutors found near student on interactive Google Map
- **Status**: ✅ Uses `TutorMap` component with Google Maps API

---

## 🛠️ Implementation Summary

| Feature                      | Component                | Status        | Action            |
| ---------------------------- | ------------------------ | ------------- | ----------------- |
| Google Maps API Key          | `.env.local`             | ✅ Configured | None              |
| Service Radius Map           | `ServiceRadiusMap.tsx`   | ✅ Working    | None              |
| Tutor List Display           | `TutorSearchResults.tsx` | ✅ Working    | None              |
| **Tutor Location Map**       | `tutor-location-map.tsx` | 🔧 **TODO**   | Create component  |
| **Profile Page Integration** | `tutors/[id]/page.tsx`   | 🔧 **TODO**   | Add map component |

---

## 📱 User Flow for Students

1. **Sign in** as student
2. **Go to Search** (`/search`)
3. **Select location** and set service radius (see Google Map)
4. **View tutors** in results list
5. **Click tutor card** to view profile
6. **See tutor's location on map** (NEW - you'll implement this)
7. **Click "Book a Session"** to proceed with booking

---

## 🔐 Environment Setup Verification

Check that your `.env.local` has:

```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="AIzaSyDt1VyrlYWy5XWTyjZiK9ifAUX_6DSVyXo"
```

Google Maps API is already configured ✅

---

## 📚 Additional Enhancements (Optional)

### **A. Show Multiple Tutors on One Map**

The `TutorMap` component now uses Google Maps API to display all tutors found in search results on an interactive map with markers for each tutor.

### **B. Add Distance Display**

```tsx
const distanceKm = calculateDistance(studentLat, studentLng, tutorLat, tutorLng);
<p>Distance: {distanceKm.toFixed(1)} km</p>;
```

### **C. Add Directions Link**

```tsx
<a
  href={`https://maps.google.com/maps?daddr=${latitude},${longitude}`}
  target="_blank"
  className="text-blue-600 hover:underline"
>
  Get Directions
</a>
```

### **D. Add Navigation Controls**

- Full-screen toggle
- Zoom in/out
- Street view
- Already enabled in the component code

---

## ✅ Testing Checklist

After implementation:

- [ ] Google Maps loads without errors in browser console
- [ ] Map displays at correct tutor coordinates
- [ ] Info window shows tutor name and address
- [ ] Marker is visible (red dot)
- [ ] Zoom controls work
- [ ] Street view available (click on map)
- [ ] Full-screen mode works
- [ ] Responsive on mobile devices
- [ ] Works for multiple tutors (each profile loads correct location)

---

## 🐛 Troubleshooting

### **Map not loading?**

- Check if `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is set in `.env.local`
- Verify API key has Maps JavaScript API enabled
- Check browser console for errors
- Ensure domain is whitelisted in Google Cloud Console

### **Marker not showing?**

- Verify coordinates are valid: `latitude` should be -90 to 90, `longitude` -180 to 180
- Check that `tutor.location.coordinates` exists in the data
- Try zooming the map (press +/-)

### **Info window not appearing?**

- Ensure tutor name and address are not empty
- Check console for JavaScript errors

---

## 🎓 Code References in Your Project

| File                                                       | Purpose                    | Status                     |
| ---------------------------------------------------------- | -------------------------- | -------------------------- |
| `apps/frontend/src/components/map/tutor-map.tsx`           | Google Maps implementation | ✅ Migrated to Google Maps |
| `apps/frontend/src/components/search/ServiceRadiusMap.tsx` | Google Maps for search     | ✅ Exists                  |
| `apps/frontend/src/app/tutors/[id]/page.tsx`               | Tutor profile page         | ✅ Exists (needs map)      |
| `apps/frontend/src/types/tutor.types.ts`                   | Type definitions           | ✅ Defines Location        |
| `.env.local`                                               | API keys                   | ✅ Google Maps key present |

---

## 🚀 Next Steps

1. **Create** `tutor-location-map.tsx` component (copy code from Step 1)
2. **Update** tutor profile page to import and use new component
3. **Test** by navigating to any tutor profile page
4. **Verify** map loads and shows correct location
5. **Optional**: Add additional features from "Additional Enhancements" section

---

**Happy mapping! 🗺️**
