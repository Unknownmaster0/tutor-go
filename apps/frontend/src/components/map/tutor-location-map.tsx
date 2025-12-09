'use client';

import { useEffect, useRef, useState } from 'react';

interface TutorLocationMapProps {
  latitude: number;
  longitude: number;
  tutorName: string;
  address: string;
  className?: string;
}

/**
 * TutorLocationMap Component
 *
 * Displays a Google Map showing the tutor's service location.
 * Used on the tutor profile page to show where the tutor operates.
 *
 * @param latitude - Tutor's latitude coordinate
 * @param longitude - Tutor's longitude coordinate
 * @param tutorName - Name of the tutor (displayed in marker info)
 * @param address - Full address of the tutor's location
 * @param className - Optional CSS classes for styling
 */
export const TutorLocationMap: React.FC<TutorLocationMapProps> = ({
  latitude,
  longitude,
  tutorName,
  address,
  className = 'w-full h-80 rounded-lg',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Check if Google Maps API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('Google Maps API key is not configured');
      return;
    }

    // Validate coordinates
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      setMapError('Invalid coordinates provided');
      return;
    }

    // Check if Google Maps is already loaded
    if ((window as any).google?.maps) {
      initializeMap();
    } else {
      // Load Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initializeMap();
      };

      script.onerror = () => {
        setMapError('Failed to load Google Maps');
      };

      document.head.appendChild(script);
    }

    return () => {
      // Cleanup if needed
      if (mapInstanceRef.current) {
        // Google Maps doesn't require explicit cleanup
      }
    };
  }, [latitude, longitude, tutorName, address]);

  const initializeMap = () => {
    if (!mapRef.current || !latitude || !longitude) return;

    try {
      const googleMaps = (window as any).google.maps;

      // Create map centered on tutor location
      const map = new googleMaps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15, // Closer zoom for individual tutor location
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
        gestureHandling: 'auto',
        styles: [
          {
            featureType: 'all',
            elementType: 'labels.text.fill',
            stylers: [{ color: '#616161' }],
          },
        ],
      });

      mapInstanceRef.current = map;

      // Create a marker at tutor location
      const marker = new googleMaps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: tutorName,
        icon: {
          path: googleMaps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#ef4444', // Red color
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        animation: googleMaps.Animation.DROP,
      });

      // Create info window with tutor details
      const infoWindow = new googleMaps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
            <h3 style="
              font-weight: bold; 
              margin: 0 0 8px 0; 
              color: #1f2937;
              font-size: 16px;
            ">
              ${escapeHtml(tutorName)}
            </h3>
            <div style="
              margin: 8px 0;
              color: #6b7280;
              font-size: 13px;
              display: flex;
              align-items: flex-start;
              gap: 8px;
            ">
              <span style="color: #ef4444; margin-top: 2px;">📍</span>
              <span>${escapeHtml(address)}</span>
            </div>
            <div style="
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px solid #e5e7eb;
              color: #3b82f6;
              font-size: 12px;
            ">
              📌 Coordinates: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}
            </div>
          </div>
        `,
      });

      // Open info window by default
      infoWindow.open(map, marker);

      // Also open info window when marker is clicked
      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });

      // Fit bounds to show marker comfortably
      const bounds = new googleMaps.LatLngBounds();
      bounds.extend(marker.getPosition());
      map.fitBounds(bounds);

      setMapError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  };

  // Helper function to escape HTML special characters
  const escapeHtml = (text: string): string => {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (char) => map[char]);
  };

  if (mapError) {
    return (
      <div className={`${className} bg-gray-100 rounded-lg flex items-center justify-center`}>
        <div className="text-center p-6">
          <svg
            className="w-12 h-12 mx-auto text-gray-400 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p className="text-gray-600 text-sm font-medium">{mapError}</p>
          <p className="text-gray-500 text-xs mt-2">Please refresh and try again</p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className={className} style={{ minHeight: '400px' }} />;
};
