'use client';

import { useEffect, useRef, useState } from 'react';
import { TutorProfile } from '@/types/tutor.types';

interface TutorMapProps {
  tutors: TutorProfile[];
  center?: [number, number]; // [longitude, latitude]
  onMarkerClick?: (tutor: TutorProfile) => void;
  className?: string;
}

/**
 * TutorMap Component - Google Maps Version
 *
 * Displays multiple tutors on a single interactive Google Map.
 * Shows all tutors with markers and info windows.
 *
 * @param tutors - Array of tutor profiles to display
 * @param center - Optional center coordinates [longitude, latitude]
 * @param onMarkerClick - Callback when marker is clicked
 * @param className - Optional CSS classes
 */
export function TutorMap({ tutors, center, onMarkerClick, className = '' }: TutorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowsRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || tutors.length === 0) return;

    // Check if Google Maps API key is available
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setMapError('Google Maps API key is not configured');
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
      // Cleanup
      markersRef.current.forEach((marker) => marker.setMap(null));
      infoWindowsRef.current.forEach((iw) => iw.close());
      markersRef.current = [];
      infoWindowsRef.current = [];
    };
  }, [tutors]);

  const initializeMap = () => {
    if (!mapContainerRef.current || !tutors.length) return;

    try {
      const googleMaps = (window as any).google.maps;

      // Calculate center and bounds
      let centerLat = 40;
      let centerLng = -74.5;
      const bounds = new googleMaps.LatLngBounds();

      // Get center from tutors data or use provided center
      if (tutors.length > 0 && tutors[0].location?.coordinates) {
        const [lng, lat] = tutors[0].location.coordinates;
        centerLng = center ? center[0] : lng;
        centerLat = center ? center[1] : lat;
      } else if (center) {
        centerLng = center[0];
        centerLat = center[1];
      }

      // Create map
      const map = new googleMaps.Map(mapContainerRef.current, {
        center: { lat: centerLat, lng: centerLng },
        zoom: 12,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
        gestureHandling: 'auto',
      });

      mapInstanceRef.current = map;

      // Add markers for each tutor
      tutors.forEach((tutor) => {
        if (tutor.location?.coordinates) {
          const [lng, lat] = tutor.location.coordinates;
          bounds.extend(new googleMaps.LatLng(lat, lng));

          // Create marker
          const marker = new googleMaps.Marker({
            position: { lat, lng },
            map: map,
            title: tutor.name,
            icon: {
              path: googleMaps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: '#3B82F6', // Blue color
              fillOpacity: 1,
              strokeColor: '#fff',
              strokeWeight: 2,
            },
          });

          markersRef.current.push(marker);

          // Create info window
          const infoWindow = new googleMaps.InfoWindow({
            content: `
              <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
                <h3 style="
                  font-weight: bold; 
                  margin: 0 0 8px 0; 
                  color: #1f2937;
                  font-size: 16px;
                ">
                  ${escapeHtml(tutor.name)}
                </h3>
                <div style="
                  margin: 8px 0;
                  color: #6b7280;
                  font-size: 13px;
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                ">
                  <span style="color: #3b82f6; margin-top: 2px;">💵</span>
                  <span>$${tutor.hourlyRate}/hr</span>
                </div>
                <div style="
                  margin: 8px 0;
                  color: #6b7280;
                  font-size: 13px;
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                ">
                  <span style="color: #fbbf24;">⭐</span>
                  <span>${tutor.rating.toFixed(1)} (${tutor.totalReviews} reviews)</span>
                </div>
                <div style="
                  margin: 8px 0;
                  color: #6b7280;
                  font-size: 13px;
                  display: flex;
                  align-items: flex-start;
                  gap: 8px;
                ">
                  <span>📍</span>
                  <span>${escapeHtml(tutor.location.address)}</span>
                </div>
              </div>
            `,
          });

          infoWindowsRef.current.push(infoWindow);

          // Show info window on marker click
          marker.addListener('click', () => {
            // Close all other info windows
            infoWindowsRef.current.forEach((iw) => iw.close());
            infoWindow.open(map, marker);

            // Trigger callback
            if (onMarkerClick) {
              onMarkerClick(tutor);
            }
          });

          // Show first tutor's info window by default
          if (tutors.indexOf(tutor) === 0) {
            infoWindow.open(map, marker);
          }
        }
      });

      // Fit map to bounds
      if (tutors.length > 1) {
        map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      } else {
        map.setZoom(15);
      }

      setMapError(null);
    } catch (error) {
      console.error('Error initializing map:', error);
      setMapError('Failed to initialize map');
    }
  };

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
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
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
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className={className} style={{ minHeight: '500px' }} />;
}
