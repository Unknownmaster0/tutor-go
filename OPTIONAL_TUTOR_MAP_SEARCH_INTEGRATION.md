# 🗺️ Optional: Display All Tutors on Map in Search Results

**Date**: December 9, 2025  
**Note**: This shows how to optionally add TutorMap to search results page

---

## 📍 Current Search Results

The search results currently show:

- ✅ List/grid view of tutors
- ✅ Distance, rating, price sorting
- ✅ Individual tutor cards

**Optional Addition**:

- Show all tutors on one Google Map view

---

## 🗺️ How to Add TutorMap to Search Results

### Step 1: Import TutorMap in Search Results Component

**File**: `apps/frontend/src/components/search/TutorSearchResults.tsx`

```typescript
import { TutorMap } from '@/components/map/tutor-map';
```

### Step 2: Add Map View Toggle

Add this after the sorting/view mode buttons (around line 170):

```tsx
{
  /* Map View Toggle */
}
<button
  onClick={() => setMapView(!mapView)}
  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
    mapView ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
  }`}
>
  🗺️ Map View
</button>;
```

### Step 3: Add State for Map View

In the component, add:

```typescript
const [mapView, setMapView] = useState(false);
```

### Step 4: Render Map When Toggled

Replace the current results section with:

```tsx
{
  mapView ? (
    // Map View
    <div className="bg-white rounded-lg shadow p-4">
      <TutorMap
        tutors={tutors}
        center={[longitude, latitude]} // From search parameters
        onMarkerClick={(tutor) => handleViewTutorProfile(tutor.id)}
        className="w-full rounded-lg"
      />
    </div>
  ) : (
    // List View (existing code)
    <div className="space-y-4">{/* existing list rendering code */}</div>
  );
}
```

---

## 🎯 Example: Complete Addition

### In TutorSearchResults.tsx

**Add to imports**:

```typescript
import { TutorMap } from '@/components/map/tutor-map';
```

**Add to component**:

```typescript
const [mapView, setMapView] = useState(false);
```

**Update the view mode section**:

```tsx
{
  /* View Mode Toggle */
}
<div className="flex gap-2 border border-gray-300 rounded-lg p-1">
  {['list', 'grid', 'map'].map((mode) => (
    <button
      key={mode}
      onClick={() => {
        if (mode === 'map') {
          setMapView(true);
        } else {
          setMapView(false);
          setViewMode(mode as 'list' | 'grid');
        }
      }}
      className={`px-3 py-1 rounded transition-colors text-sm font-medium ${
        (mode === 'map' && mapView) || (mode !== 'map' && !mapView && viewMode === mode)
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {mode === 'list' ? '📋 List' : mode === 'grid' ? '📊 Grid' : '🗺️ Map'}
    </button>
  ))}
</div>;
```

**Update results rendering**:

```tsx
{mapView ? (
  <TutorMap
    tutors={tutors}
    onMarkerClick={(tutor) => handleViewTutorProfile(tutor.id)}
    className="w-full h-96"
  />
) : (
  // existing list/grid rendering
)}
```

---

## 🎨 Benefits of This Addition

### User Experience

- ✅ See all tutors at once on map
- ✅ Visual distance assessment
- ✅ Cluster nearby tutors
- ✅ Click markers to see details
- ✅ Easy comparison

### Features

- ✅ Blue markers for all tutors
- ✅ Info window with price/rating
- ✅ Auto-fit to show all tutors
- ✅ Zoom and pan controls
- ✅ Street view available

### Responsiveness

- ✅ Works on desktop
- ✅ Works on tablet
- ✅ Works on mobile
- ✅ Touch gestures supported

---

## 📊 Visual Layout

```
Search Results Page
├─ Header
│  └─ "Found X tutors"
├─ Controls
│  ├─ Sort by: Distance | Rating | Price
│  └─ View: 📋 List | 📊 Grid | 🗺️ Map  ← NEW
├─ Results
│  ├─ If List/Grid:
│  │  └─ [Tutor Card 1]
│  │     [Tutor Card 2]
│  │     [Tutor Card 3]
│  │
│  └─ If Map:
│     └─ [Google Map with all tutors]
│        - Blue markers
│        - Clickable
│        - Info windows
└─ Sidebar Filters
   └─ Distance, Rating, Price
```

---

## 🔧 Complete Example Code

Here's a minimal example of how to integrate:

```typescript
'use client';

import { useState } from 'react';
import { TutorMap } from '@/components/map/tutor-map';
import { TutorProfile } from '@/types/tutor.types';

interface SearchResultsProps {
  tutors: TutorProfile[];
  latitude: number;
  longitude: number;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  tutors,
  latitude,
  longitude,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('list');

  const handleMarkerClick = (tutor: TutorProfile) => {
    // Navigate to tutor profile or show modal
    window.location.href = `/tutors/${tutor.id}`;
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
        {[
          { id: 'list', label: '📋 List' },
          { id: 'grid', label: '📊 Grid' },
          { id: 'map', label: '🗺️ Map' },
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id as 'list' | 'grid' | 'map')}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              viewMode === mode.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {viewMode === 'map' ? (
        <TutorMap
          tutors={tutors}
          center={[longitude, latitude]}
          onMarkerClick={handleMarkerClick}
          className="w-full h-96 rounded-lg"
        />
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'list' ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-3'
        }`}>
          {tutors.map((tutor) => (
            <div
              key={tutor.id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => (window.location.href = `/tutors/${tutor.id}`)}
            >
              <h3 className="font-bold text-lg">{tutor.name}</h3>
              <p className="text-blue-600 font-semibold">${tutor.hourlyRate}/hr</p>
              <p className="text-yellow-500">⭐ {tutor.rating.toFixed(1)}</p>
              <p className="text-gray-600 text-sm">{tutor.location.address}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 🚀 When to Use Each View

### 📋 List View

- ✅ Best for: Details, sorting, comparing specific attributes
- ✅ Shows: All information at once
- ✅ Best on: Mobile, when scrolling

### 📊 Grid View

- ✅ Best for: Visual browsing, thumbnail view
- ✅ Shows: Cards arranged in grid
- ✅ Best on: Desktop, tablets

### 🗺️ Map View

- ✅ Best for: Geographic awareness, location comparison
- ✅ Shows: Spatial distribution of tutors
- ✅ Best on: Desktop with map-aware users

---

## ⚙️ Notes

- The TutorMap component already handles all map initialization
- Just pass the tutors array and callback
- The component manages markers, info windows, and bounds automatically
- No additional setup needed beyond the 4 steps above

---

## 🎯 Optional Features

### Add Search Location on Map

```typescript
// Add marker for student location
const studentMarker = new google.maps.Marker({
  position: { lat: latitude, lng: longitude },
  map: map,
  title: 'Your Location',
  icon: '🔵',
});
```

### Add Service Radius Circle

```typescript
// Show radius on TutorMap
const circle = new google.maps.Circle({
  center: { lat: latitude, lng: longitude },
  radius: searchRadius * 1000,
  fillColor: '#4F46E5',
  fillOpacity: 0.1,
  map: map,
});
```

---

## 📝 Summary

The TutorMap component is **already built and ready to use**. You can optionally add it to search results to give users a map view of all available tutors.

- ✅ Component exists: `apps/frontend/src/components/map/tutor-map.tsx`
- ✅ Uses Google Maps API
- ✅ Fully functional and responsive
- ✅ Just add an import and use it!

**No additional setup needed beyond the component integration shown above.** 🗺️
