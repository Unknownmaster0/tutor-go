# Google Maps API Integration Guide for TutorGo

**Date**: December 9, 2025  
**Purpose**: Setup and configuration guide for Google Maps API integration in TutorGo frontend  
**Scope**: Location-based tutor search, profile mapping, availability visualization

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Google Cloud Project Setup](#google-cloud-project-setup)
3. [API Key Generation](#api-key-generation)
4. [Frontend Integration](#frontend-integration)
5. [Environment Configuration](#environment-configuration)
6. [Usage Examples](#usage-examples)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices & Security](#best-practices--security)

---

## Prerequisites

- Google Cloud Account (create at [console.cloud.google.com](https://console.cloud.google.com))
- Billing account configured
- Node.js and npm installed
- Tutor-Go frontend running locally

---

## Google Cloud Project Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `TutorGo-Maps` (or your preference)
5. Click **"Create"**
6. Wait for the project to be created (2-3 minutes)
7. Select the new project from the dropdown

### Step 2: Enable Required APIs

In the Google Cloud Console:

1. Click **"APIs & Services"** → **"Library"**
2. Search for and enable each of the following APIs:
   - **Maps JavaScript API**
     - Click on it
     - Click **"Enable"**
     - Wait for activation (1-2 minutes)
   - **Places API**
     - Search for "Places API"
     - Click **"Enable"**
   - **Geocoding API**
     - Search for "Geocoding API"
     - Click **"Enable"**
   - **Distance Matrix API** (optional, for distance calculations)
     - Search for "Distance Matrix API"
     - Click **"Enable"**

### Step 3: Set Up Billing

1. In Google Cloud Console, go to **"Billing"**
2. If no billing account exists, click **"Create Billing Account"**
3. Fill in payment details
4. Link the billing account to your project
5. Configure budget alerts (recommended):
   - Go to **Billing** → **Budgets and alerts**
   - Set monthly budget (e.g., $50)
   - Enable notifications when 50%, 90%, 100% reached

---

## API Key Generation

### Step 1: Create API Key

1. In Google Cloud Console, go to **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** → **"API Key"**
3. A dialog will show your API key
4. Click **"Copy"** to copy the key
5. **Important**: Save this key securely (keep it private!)

### Step 2: Restrict API Key (Highly Recommended)

In the Credentials page:

1. Click on the API key you just created
2. Under **"Application restrictions"**:
   - Select **"HTTP referrers"**
   - Add allowed referrers:
     ```
     http://localhost:3000/*
     http://localhost:3000
     https://yourdomain.com/*
     https://yourdomain.com
     ```

3. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check the following APIs:
     - Maps JavaScript API
     - Places API
     - Geocoding API
     - Distance Matrix API (if using)

4. Click **"Save"**

### Step 3: Get Maps Embed API Key (Optional, for iframes)

If you want to embed maps in iframes, create a separate API key:

1. Repeat steps 1-2 above
2. Restrict to "Embed" application type
3. Use this key only for iframe embeds

---

## Frontend Integration

### Step 1: Install Required Packages

```bash
cd apps/frontend

# Install Google Maps libraries
npm install @react-google-maps/api
npm install @react-google-maps/js-api-loader
npm install @googlemaps/js-api-loader

# Optional: for advanced features
npm install google-map-react
```

### Step 2: Add Environment Variables

Create/update `.env.local` in `apps/frontend/`:

```env
# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY_HERE
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=YOUR_MAP_ID_HERE

# API Gateway
NEXT_PUBLIC_API_URL=http://localhost:8000

# App Config
NEXT_PUBLIC_APP_NAME=TutorGo
NEXT_PUBLIC_APP_ENV=development
```

**Important**:

- `NEXT_PUBLIC_` prefix makes variables accessible in browser
- Never commit API keys to repository
- Use `.env.local` which should be in `.gitignore`

### Step 3: Create Maps Service Hook

Create `apps/frontend/src/hooks/useGoogleMaps.ts`:

```typescript
import { useEffect, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface UseGoogleMapsOptions {
  libraries?: ('places' | 'geometry' | 'drawing' | 'visualization')[];
}

export const useGoogleMaps = (options: UseGoogleMapsOptions = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<Error | null>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: 'weekly',
      libraries: options.libraries || ['places', 'geometry'],
    });

    loader
      .load()
      .then(() => {
        setIsLoaded(true);
      })
      .catch((err: Error) => {
        setLoadError(err);
        console.error('Google Maps loading error:', err);
      });
  }, [options]);

  return { isLoaded, loadError };
};
```

### Step 4: Create Map Component

Create `apps/frontend/src/components/search/TutorMap.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface MapProps {
  lat: number;
  lng: number;
  tutors: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    rating: number;
  }>;
  onTutorSelect: (tutorId: string) => void;
}

export const TutorMap: React.FC<MapProps> = ({ lat, lng, tutors, onTutorSelect }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const { isLoaded, loadError } = useGoogleMaps();

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.google) return;

    // Initialize map
    googleMapRef.current = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat, lng },
      mapTypeControl: true,
      fullscreenControl: true,
    });

    // Add user location marker
    new window.google.maps.Marker({
      position: { lat, lng },
      map: googleMapRef.current,
      title: 'Your Location',
      icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    });
  }, [isLoaded, lat, lng]);

  useEffect(() => {
    if (!googleMapRef.current || !window.google) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add tutor markers
    tutors.forEach((tutor) => {
      const marker = new window.google.maps.Marker({
        position: { lat: tutor.lat, lng: tutor.lng },
        map: googleMapRef.current,
        title: tutor.name,
      });

      marker.addListener('click', () => {
        onTutorSelect(tutor.id);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds if tutors exist
    if (tutors.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      tutors.forEach((tutor) => {
        bounds.extend({ lat: tutor.lat, lng: tutor.lng });
      });
      googleMapRef.current.fitBounds(bounds);
    }
  }, [tutors, onTutorSelect]);

  if (loadError) {
    return <div className="p-4 text-red-600">Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div className="p-4 text-gray-600">Loading map...</div>;
  }

  return (
    <div
      ref={mapRef}
      className="w-full h-96 rounded-lg shadow-md"
      style={{ minHeight: '400px' }}
    />
  );
};
```

### Step 5: Create Location Input with Autocomplete

Create `apps/frontend/src/components/search/LocationInput.tsx`:

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

interface LocationInputProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  placeholder?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  onLocationSelect,
  placeholder = 'Enter your location...',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded } = useGoogleMaps(['places']);

  useEffect(() => {
    if (!isLoaded || !inputRef.current || !window.google) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode'],
      componentRestrictions: {}, // Restrict to specific countries if needed
    });

    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (!place || !place.geometry) return;

      const lat = place.geometry.location?.lat();
      const lng = place.geometry.location?.lng();
      const address = place.formatted_address;

      if (lat !== undefined && lng !== undefined) {
        onLocationSelect({ lat, lng, address });
      }
    });

    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [isLoaded, onLocationSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
};
```

### Step 6: Create Geolocation Hook

Create `apps/frontend/src/hooks/useGeolocation.ts`:

```typescript
import { useState, useEffect } from 'react';

interface GeolocationCoordinates {
  lat: number;
  lng: number;
  accuracy: number;
}

interface UseGeolocationReturn {
  location: GeolocationCoordinates | null;
  error: string | null;
  isLoading: boolean;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setIsLoading(false);
      },
      (err) => {
        setError(err.message);
        setIsLoading(false);
      },
    );
  }, []);

  return { location, error, isLoading };
};
```

---

## Environment Configuration

### Development (.env.local)

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_DEV_API_KEY
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_ENV=development
```

### Production (.env.production)

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_PROD_API_KEY
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_ENV=production
```

### Vercel Deployment

If deploying to Vercel:

1. Go to your Vercel project settings
2. Click **"Environment Variables"**
3. Add:
   - Key: `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
   - Value: Your API key
   - Environments: Production, Preview, Development
4. Click **"Save"**

---

## Usage Examples

### Example 1: Search Page with Map

```typescript
'use client';

import { useState } from 'react';
import { LocationInput } from '@/components/search/LocationInput';
import { TutorMap } from '@/components/search/TutorMap';
import { useGeolocation } from '@/hooks/useGeolocation';
import { apiClient } from '@/lib/api-client';

export default function SearchPage() {
  const { location } = useGeolocation();
  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(location ? { ...location, address: '' } : null);
  const [tutors, setTutors] = useState([]);
  const [radius, setRadius] = useState(5);

  const handleSearch = async () => {
    if (!searchLocation) return;

    try {
      const response = await apiClient.get('/api/tutors/search', {
        params: {
          lat: searchLocation.lat,
          lng: searchLocation.lng,
          radius,
        },
      });
      setTutors(response.data.tutors);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <LocationInput
          onLocationSelect={setSearchLocation}
          placeholder="Enter your location"
        />
        <input
          type="range"
          min="1"
          max="50"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          className="mt-4 w-full"
        />
        <p className="mt-2">Search radius: {radius} km</p>
        <button
          onClick={handleSearch}
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Search Tutors
        </button>
      </div>

      {searchLocation && (
        <TutorMap
          lat={searchLocation.lat}
          lng={searchLocation.lng}
          tutors={tutors}
          onTutorSelect={(tutorId) => {
            // Navigate to tutor profile
            window.location.href = `/tutors/${tutorId}`;
          }}
        />
      )}
    </div>
  );
}
```

### Example 2: Tutor Profile with Location Map

```typescript
'use client';

import { useEffect, useState } from 'react';
import { TutorMap } from '@/components/search/TutorMap';

interface TutorProfile {
  id: string;
  name: string;
  bio: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
}

export default function TutorProfilePage({ params }: { params: { tutorId: string } }) {
  const [tutor, setTutor] = useState<TutorProfile | null>(null);

  useEffect(() => {
    // Fetch tutor profile
    fetch(`/api/tutors/${params.tutorId}`)
      .then((res) => res.json())
      .then((data) => setTutor(data));
  }, [params.tutorId]);

  if (!tutor) return <div>Loading...</div>;

  return (
    <div>
      <h1>{tutor.name}</h1>
      <p>{tutor.bio}</p>
      {tutor.location && (
        <div className="mt-6">
          <h2>Location</h2>
          <TutorMap
            lat={tutor.location.lat}
            lng={tutor.location.lng}
            tutors={[tutor]}
            onTutorSelect={() => {}}
          />
          <p className="mt-2">{tutor.location.address}</p>
        </div>
      )}
    </div>
  );
}
```

---

## Troubleshooting

### Issue: "Google Maps API not loaded"

**Solution**:

1. Verify API key is correct in `.env.local`
2. Check if Maps JavaScript API is enabled in Google Cloud Console
3. Clear browser cache and reload
4. Check browser console for specific error messages

### Issue: "You have exceeded your rate limit"

**Solution**:

1. Check your usage in Google Cloud Console
2. Increase rate limits or upgrade billing plan
3. Implement request caching in your app

### Issue: "Invalid API key"

**Solution**:

1. Generate a new API key from Google Cloud Console
2. Copy the complete key (not truncated)
3. Update `.env.local` with new key
4. Restart Next.js development server

### Issue: "Geolocation not working"

**Solution**:

1. Check browser permissions for location access
2. Only works on HTTPS (except localhost)
3. User must grant permission when prompted
4. Some browsers may block geolocation

### Issue: "Places autocomplete not working"

**Solution**:

1. Verify Places API is enabled in Google Cloud Console
2. API key must be restricted to include Places API
3. Check browser console for CORS errors
4. Ensure input element is accessible

### Common CORS Error

If you get CORS errors, it's likely due to:

1. **Development**: Ensure localhost:3000 is added to API key restrictions
2. **Production**: Add your production domain to API key restrictions

---

## Best Practices & Security

### Security

1. **Never expose sensitive API keys in git**:

   ```bash
   # In .gitignore
   .env.local
   .env.*.local
   ```

2. **Use `NEXT_PUBLIC_` prefix only for safe variables**:
   - Maps API key: OK (public use)
   - Backend API keys: NOT OK (keep in server-only env)

3. **Restrict API key usage**:
   - Specify HTTP referrers
   - Specify API restrictions
   - Monitor usage regularly

4. **Rotate keys periodically**:
   - Generate new keys every 6-12 months
   - Disable old keys after transition period

### Performance

1. **Load maps lazily**:

   ```typescript
   const [mapsLoaded, setMapsLoaded] = useState(false);
   // Load only when user navigates to search page
   ```

2. **Optimize marker rendering**:
   - Use marker clustering for 50+ markers
   - Implement pagination for large datasets

3. **Cache geocoding results**:

   ```typescript
   const geocodingCache = new Map();
   ```

4. **Lazy load Places autocomplete**:
   - Load library only when input is focused

### Cost Optimization

1. **Monitor API usage**:
   - Set up billing alerts
   - Review monthly costs in Google Cloud Console

2. **Use Sessions for multiple requests**:
   - Reduces API calls for autocomplete + search

3. **Implement client-side caching**:
   - Cache search results
   - Cache geocoding data

4. **Use Maps Studio for custom styling**:
   - Reduces calls by using custom map IDs

---

## Additional Resources

- [Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript)
- [Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Geocoding API Documentation](https://developers.google.com/maps/documentation/geocoding/overview)
- [React Google Maps Documentation](https://react-google-maps-api-docs.netlify.app/)
- [Google Cloud Console](https://console.cloud.google.com)

---

## Summary Checklist

- [ ] Google Cloud Project created
- [ ] Billing account configured
- [ ] Required APIs enabled (Maps, Places, Geocoding)
- [ ] API key generated and restricted
- [ ] Environment variables configured
- [ ] Dependencies installed (`@react-google-maps/api`)
- [ ] Hooks implemented (useGoogleMaps, useGeolocation)
- [ ] Map component created and tested
- [ ] LocationInput with autocomplete working
- [ ] Deployed to production with correct API key
- [ ] Usage monitored in Google Cloud Console

---

**Document Version**: 1.0  
**Last Updated**: December 9, 2025  
**Next Review**: December 16, 2025
