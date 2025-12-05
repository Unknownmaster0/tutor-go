'use client';

import { useEffect, useRef, useState } from 'react';
import { TutorProfile } from '@/types/tutor.types';

interface TutorMapProps {
  tutors: TutorProfile[];
  center?: [number, number]; // [longitude, latitude]
  onMarkerClick?: (tutor: TutorProfile) => void;
  className?: string;
}

export function TutorMap({ tutors, center, onMarkerClick, className = '' }: TutorMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Mapbox token is available
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    
    if (!mapboxToken) {
      setMapError('Map configuration is missing. Please add NEXT_PUBLIC_MAPBOX_TOKEN to your environment variables.');
      return;
    }

    // Dynamic import of mapbox-gl to avoid SSR issues
    import('mapbox-gl').then((mapboxgl) => {
      if (!mapContainerRef.current) return;

      mapboxgl.default.accessToken = mapboxToken;

      const map = new mapboxgl.default.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center || [-74.5, 40], // Default to New York area
        zoom: 11,
      });

      // Add navigation controls
      map.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

      // Add markers for each tutor
      tutors.forEach((tutor) => {
        if (tutor.location?.coordinates) {
          const [lng, lat] = tutor.location.coordinates;

          // Create a custom marker element
          const el = document.createElement('div');
          el.className = 'tutor-marker';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = '#3B82F6';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          el.style.cursor = 'pointer';

          // Add marker to map
          const marker = new mapboxgl.default.Marker(el)
            .setLngLat([lng, lat])
            .addTo(map);

          // Add popup
          const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(`
            <div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px;">${tutor.name}</h3>
              <p style="font-size: 14px; color: #666;">$${tutor.hourlyRate}/hr</p>
              <p style="font-size: 14px; color: #666;">⭐ ${tutor.rating.toFixed(1)} (${tutor.totalReviews} reviews)</p>
            </div>
          `);

          marker.setPopup(popup);

          // Handle marker click
          el.addEventListener('click', () => {
            if (onMarkerClick) {
              onMarkerClick(tutor);
            }
          });
        }
      });

      // Fit map to show all markers
      if (tutors.length > 0) {
        const bounds = new mapboxgl.default.LngLatBounds();
        tutors.forEach((tutor) => {
          if (tutor.location?.coordinates) {
            bounds.extend(tutor.location.coordinates as [number, number]);
          }
        });
        map.fitBounds(bounds, { padding: 50 });
      }

      return () => {
        map.remove();
      };
    }).catch((error) => {
      console.error('Error loading map:', error);
      setMapError('Failed to load map. Please try again later.');
    });
  }, [tutors, center, onMarkerClick]);

  if (mapError) {
    return (
      <div className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center p-8">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-gray-600">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={mapContainerRef} className={className} />
  );
}
