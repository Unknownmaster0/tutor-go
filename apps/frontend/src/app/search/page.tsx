'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { TutorCard } from '@/components/tutor/tutor-card';
import { SearchFilters, FilterValues } from '@/components/search/search-filters';
import { TutorMap } from '@/components/map/tutor-map';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [tutors, setTutors] = useState<TutorProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});

  // Get search parameters
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const location = searchParams.get('location');
  const radius = searchParams.get('radius') || '10';

  const fetchTutors = useCallback(
    async (pageNum: number = 1, currentFilters: FilterValues = {}) => {
      try {
        setLoading(true);
        setError(null);

        // Build query parameters
        const params: any = {
          page: pageNum,
          limit: 10,
          radius: currentFilters.radius || radius,
        };

        if (lat && lng) {
          params.latitude = lat;
          params.longitude = lng;
        } else if (location) {
          // For now, use a default location if geocoding is not implemented
          // In production, you would geocode the location string
          params.latitude = 40.7128;
          params.longitude = -74.006;
        }

        if (currentFilters.subject) params.subject = currentFilters.subject;
        if (currentFilters.minRate) params.minRate = currentFilters.minRate;
        if (currentFilters.maxRate) params.maxRate = currentFilters.maxRate;
        if (currentFilters.minRating) params.minRating = currentFilters.minRating;

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get<TutorProfile[]>(`/tutors/search?${queryString}`);

        if (pageNum === 1) {
          setTutors(Array.isArray(response) ? response : []);
        } else {
          setTutors((prev) => [...prev, ...(Array.isArray(response) ? response : [])]);
        }

        setHasMore((Array.isArray(response) ? response.length : 0) === (params.limit || 10));
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.response?.data?.message || 'Failed to search tutors. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [lat, lng, location, radius],
  );

  useEffect(() => {
    fetchTutors(1, filters);
  }, [fetchTutors, filters]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTutors(nextPage, filters);
  };

  const handleTutorClick = (_tutor: TutorProfile) => {
    // Navigate to tutor profile (handled by Link in TutorCard)
  };

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Searching for tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tutors Near You</h1>
              <p className="text-sm text-gray-600 mt-1">
                {tutors.length} {tutors.length === 1 ? 'tutor' : 'tutors'} found
              </p>
            </div>

            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              {showMap ? 'Hide Map' : 'Show Map'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <SearchFilters onFilterChange={handleFilterChange} />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Map View */}
            {showMap && tutors.length > 0 && (
              <div className="mb-6">
                <TutorMap
                  tutors={tutors}
                  center={lat && lng ? [parseFloat(lng), parseFloat(lat)] : undefined}
                  onMarkerClick={handleTutorClick}
                  className="h-96 rounded-lg"
                />
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Tutor Cards */}
            {tutors.length > 0 ? (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <TutorCard key={tutor.id} tutor={tutor} />
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-4">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                              fill="none"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        'Load More'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-12">
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
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
                  <p className="text-gray-600">
                    Try adjusting your filters or expanding your search radius
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
