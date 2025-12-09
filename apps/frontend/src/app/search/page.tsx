'use client';

import { useState } from 'react';
import { LocationPicker } from '@/components/search/LocationPicker';
import { ServiceRadiusMap } from '@/components/search/ServiceRadiusMap';
import { SearchFilters } from '@/components/search/SearchFilters';
import { TutorSearchResults } from '@/components/search/TutorSearchResults';
import { MapPin, ChevronRight } from 'lucide-react';

export default function SearchPage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);

  const [serviceRadius, setServiceRadius] = useState(10);

  const [filters, setFilters] = useState({
    maxDistance: 25,
    minRating: 4,
    priceRange: [10, 100] as [number, number],
    subjects: [] as string[],
    availability: 'any' as 'any' | 'flexible' | 'specific',
  });

  const [hasSearched, setHasSearched] = useState(false);

  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setSelectedLocation(location);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
  const handleSearch = () => {
    if (!selectedLocation) {
      alert('Please select a location first');
      return;
    }
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Find Your Perfect Tutor</h1>
          <p className="text-blue-100">Search by location and find qualified tutors near you</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!hasSearched ? (
          // Search Setup Screen
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Location Picker */}
            <div className="lg:col-span-1">
              <LocationPicker onLocationSelect={handleLocationSelect} />

              {/* Selected Location Display */}
              {selectedLocation && (
                <div className="mt-6 bg-white rounded-lg shadow p-6 space-y-3">
                  <h3 className="font-semibold text-gray-900">Selected Location</h3>
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">{selectedLocation.address}</p>
                        <p className="text-sm text-gray-600">
                          {selectedLocation.latitude.toFixed(4)}, {selectedLocation.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Service Radius Map and Filters */}
            <div className="lg:col-span-2 space-y-6">
              {selectedLocation && (
                <ServiceRadiusMap
                  latitude={selectedLocation.latitude}
                  longitude={selectedLocation.longitude}
                  radius={serviceRadius}
                  onRadiusChange={setServiceRadius}
                />
              )}

              <SearchFilters onFiltersChange={handleFiltersChange} />

              {/* Search Button */}
              <button
                onClick={handleSearch}
                disabled={!selectedLocation}
                className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
                  selectedLocation
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Search Tutors
                <ChevronRight className="w-5 h-5" />
              </button>

              {/* Quick Tips */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Search Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Use your current location or enter an address</li>
                  <li>• Adjust the service radius to expand/limit search area</li>
                  <li>• Use filters to find tutors that match your needs</li>
                  <li>• Compare tutors by distance, rating, and hourly rate</li>
                </ul>
              </div>
            </div>
          </div>
        ) : (
          // Search Results Screen
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar with Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <SearchFilters onFiltersChange={handleFiltersChange} />

                {/* Back Button */}
                <button
                  onClick={() => setHasSearched(false)}
                  className="mt-4 w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  ← Back to Filters
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              {selectedLocation && (
                <TutorSearchResults
                  latitude={selectedLocation.latitude}
                  longitude={selectedLocation.longitude}
                  filters={filters}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
