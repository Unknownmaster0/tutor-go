'use client';

import { useState } from 'react';
import { useGeolocation } from '@/hooks/use-geolocation';

interface SearchBarProps {
  onSearch: (location: string, latitude?: number, longitude?: number) => void;
  className?: string;
}

export function SearchBar({ onSearch, className = '' }: SearchBarProps) {
  const [location, setLocation] = useState('');
  const { latitude, longitude, error, loading, getCurrentLocation } = useGeolocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      onSearch(location, latitude || undefined, longitude || undefined);
    }
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  // Auto-search when geolocation is obtained
  if (latitude && longitude && !location) {
    onSearch('Current Location', latitude, longitude);
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (city, address, or zip code)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {error && (
            <p className="absolute text-xs text-red-500 mt-1">{error}</p>
          )}
        </div>
        
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={loading}
          className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Getting location...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Use My Location
            </span>
          )}
        </button>

        <button
          type="submit"
          disabled={!location.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          Search Tutors
        </button>
      </div>
    </form>
  );
}
