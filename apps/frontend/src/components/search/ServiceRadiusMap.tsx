'use client';

import { useState, useRef, useEffect } from 'react';

interface ServiceRadiusMapProps {
  latitude: number;
  longitude: number;
  radius: number;
  onRadiusChange: (radius: number) => void;
}

export const ServiceRadiusMap: React.FC<ServiceRadiusMapProps> = ({
  latitude,
  longitude,
  radius,
  onRadiusChange,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const circleRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Load Google Maps script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      const googleMaps = (window as any).google.maps;

      // Create map
      const newMap = new googleMaps.Map(mapRef.current!, {
        center: { lat: latitude, lng: longitude },
        zoom: 12,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });

      // Add marker at center
      new googleMaps.Marker({
        position: { lat: latitude, lng: longitude },
        map: newMap,
        title: 'Your Location',
        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      });

      // Draw service radius circle
      const circle = new googleMaps.Circle({
        center: { lat: latitude, lng: longitude },
        radius: radius * 1000, // Convert km to meters
        fillColor: '#4F46E5',
        fillOpacity: 0.2,
        strokeColor: '#4F46E5',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        map: newMap,
      });

      setMap(newMap);
      circleRef.current = circle;
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Update circle when radius changes
  useEffect(() => {
    if (circleRef.current) {
      circleRef.current.setRadius(radius * 1000);
    }
  }, [radius]);

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Service Radius</h3>

      {/* Map */}
      <div
        ref={mapRef}
        className="w-full h-80 rounded-lg border border-gray-300"
        style={{ minHeight: '400px' }}
      />

      {/* Radius Slider */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label htmlFor="radius" className="text-sm font-medium text-gray-700">
            Service Radius
          </label>
          <span className="text-sm font-bold text-blue-600">{radius} km</span>
        </div>

        <input
          type="range"
          id="radius"
          min="1"
          max="50"
          step="1"
          value={radius}
          onChange={(e) => onRadiusChange(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />

        <p className="text-xs text-gray-500">
          Adjust the radius to set how far you're willing to travel for tutoring sessions
        </p>
      </div>

      {/* Distance Info */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Radius</p>
          <p className="text-lg font-bold text-blue-600">{radius} km</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Diameter</p>
          <p className="text-lg font-bold text-blue-600">{radius * 2} km</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Area</p>
          <p className="text-lg font-bold text-blue-600">
            {Math.round(Math.PI * radius * radius)} km²
          </p>
        </div>
      </div>
    </div>
  );
};
