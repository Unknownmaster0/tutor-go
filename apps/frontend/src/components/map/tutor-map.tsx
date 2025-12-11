'use client';

import { useEffect, useRef, useState } from 'react';
import { TutorProfile } from '@/types/tutor.types';
import { calculateDistance, formatDistance } from '@/lib/distance-calculator';

interface TutorMapProps {
  tutors: TutorProfile[];
  center?: [number, number]; // [longitude, latitude]
  onMarkerClick?: (tutor: TutorProfile) => void;
  className?: string;
  userLocation?: { latitude: number; longitude: number };
}

export function TutorMap({
  tutors,
  center,
  onMarkerClick,
  className = '',
  userLocation,
}: TutorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    // Check if Google Maps API key is available
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      setMapError(
        'Map configuration is missing. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.',
      );
      return;
    }

    // Load Google Maps library dynamically
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=marker`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (!mapContainerRef.current) return;

      // Convert center from [longitude, latitude] to {lat, lng}
      const centerLat = center ? center[1] : 40;
      const centerLng = center ? center[0] : -74.5;

      // Create map instance
      mapRef.current = new google.maps.Map(mapContainerRef.current, {
        zoom: 12,
        center: { lat: centerLat, lng: centerLng },
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        zoomControl: true,
      });

      // Clear previous markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }

      // Add user location marker if available
      if (userLocation && mapRef.current) {
        const userMarker = new google.maps.Marker({
          position: { lat: userLocation.latitude, lng: userLocation.longitude },
          map: mapRef.current,
          title: 'Your Location',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10B981',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
          },
        });

        const userInfoWindow = new google.maps.InfoWindow({
          content:
            '<div style="padding: 8px;"><h3 style="font-weight: bold; margin-bottom: 4px;">Your Location</h3></div>',
        });

        userMarker.addListener('click', () => {
          userInfoWindow.open(mapRef.current, userMarker);
        });

        userMarkerRef.current = userMarker;
      }

      // Add markers for each tutor
      tutors.forEach((tutor) => {
        if (tutor.location?.coordinates && mapRef.current) {
          const [lng, lat] = tutor.location.coordinates;

          // Use a red pin for tutors
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: mapRef.current,
            title: tutor.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#EF4444', // Red
              fillOpacity: 1,
              strokeColor: '#B91C1C',
              strokeWeight: 2,
            },
          });

          // Calculate distance from user location if available
          let distanceHtml = '';
          let isNearby = false;
          if (userLocation) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng,
            );
            isNearby = distance <= 5; // e.g., within 5km is considered 'nearby'
            distanceHtml = `<p style="font-size: 14px; color: ${isNearby ? '#10B981' : '#EF4444'}; font-weight: 600;">📍 ${formatDistance(distance)}${isNearby ? ' (Near you)' : ''}</p>`;
          }

          // Create info window with tutor details
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div style="padding: 12px; min-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
                <h3 style="font-weight: bold; margin-bottom: 8px; font-size: 16px; margin: 0 0 8px 0;">${tutor.name}</h3>
                <p style="font-size: 14px; color: #666; margin-bottom: 4px; margin: 0 0 4px 0;">⭐ ${tutor.rating?.toFixed(1) || 'N/A'} (${tutor.totalReviews || 0} reviews)</p>
                <p style="font-size: 14px; color: #666; margin-bottom: 6px; margin: 0 0 6px 0;">💰 $${tutor.hourlyRate}/hr</p>
                ${distanceHtml}
                <button style="width: 100%; padding: 8px; margin-top: 8px; background-color: #3B82F6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600; font-size: 14px;">View Profile</button>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(mapRef.current, marker);
            if (onMarkerClick) {
              onMarkerClick(tutor);
            }
          });

          markersRef.current.push(marker);
        }
      });

      // Fit map to show all markers
      if (tutors.length > 0 && mapRef.current) {
        const bounds = new google.maps.LatLngBounds();

        // Add user location to bounds if available
        if (userLocation) {
          bounds.extend({ lat: userLocation.latitude, lng: userLocation.longitude });
        }

        tutors.forEach((tutor) => {
          if (tutor.location?.coordinates) {
            const [lng, lat] = tutor.location.coordinates;
            bounds.extend({ lat, lng });
          }
        });

        mapRef.current.fitBounds(bounds, 50);
      }
    };

    script.onerror = () => {
      setMapError('Failed to load Google Maps. Please check your API key.');
    };

    // Only add script if not already loaded
    if (!document.querySelector(`script[src*="maps.googleapis.com"]`)) {
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup: Remove markers
      markersRef.current.forEach((marker) => marker.setMap(null));
      if (userMarkerRef.current) {
        userMarkerRef.current.setMap(null);
      }
    };
  }, [tutors, center, onMarkerClick, userLocation]);

  if (mapError) {
    return (
      <div className={`bg-neutral-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <svg
            className="w-16 h-16 mx-auto text-neutral-400 mb-4"
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
          <p className="text-neutral-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainerRef} className={className} />;
}
