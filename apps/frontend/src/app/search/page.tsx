'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { SearchFilters, FilterValues } from '@/components/search/search-filters';
import { TutorMap } from '@/components/map/tutor-map';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';
import { useGeolocation } from '@/hooks/use-geolocation';
import { calculateDistance, formatDistance } from '@/lib/distance-calculator';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const { latitude: userLat, longitude: userLng, getCurrentLocation, error: geoError } = useGeolocation();
  
  const [tutors, setTutors] = useState<(TutorProfile & { distance?: number })[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterValues>({});
  const [selectedTutor, setSelectedTutor] = useState<TutorProfile | null>(null);
  const filtersApplied = useRef(false);

  // Get search parameters
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '10';

  // Use user location if available, otherwise use search params, otherwise use default
  const currentLat = userLat || (lat ? parseFloat(lat) : 40.7128);
  const currentLng = userLng || (lng ? parseFloat(lng) : -74.006);

  const fetchTutors = useCallback(
    async (pageNum: number = 1, currentFilters: FilterValues = {}) => {
      try {
        if (pageNum === 1) {
          setLoading(true);
        }
        setError(null);

        // Build query parameters
        const params: any = {
          page: pageNum,
          limit: 20,
          radius: currentFilters.radius || radius,
          latitude: currentLat,
          longitude: currentLng,
        };

        if (currentFilters.subject) params.subject = currentFilters.subject;
        if (currentFilters.minRate) params.minRate = currentFilters.minRate;
        if (currentFilters.maxRate) params.maxRate = currentFilters.maxRate;
        if (currentFilters.minRating) params.minRating = currentFilters.minRating;

        const queryString = new URLSearchParams(params).toString();
        const response = await apiClient.get(`/tutors/search?${queryString}`);

        // Backend returns a paginated object { data, total, page, limit }
        const result = response as { data: TutorProfile[]; total: number; page: number; limit: number };

        // Calculate distances and enhance tutor data
        const tutorsWithDistance = (Array.isArray(result?.data) ? result.data : []).map((tutor) => {
          let distance = undefined;
          if (tutor.location?.coordinates) {
            const [tutorLng, tutorLat] = tutor.location.coordinates;
            distance = calculateDistance(currentLat, currentLng, tutorLat, tutorLng);
          }
          return { ...tutor, distance };
        });

        if (pageNum === 1) {
          setTutors(tutorsWithDistance);
        } else {
          setTutors((prev) => [...prev, ...tutorsWithDistance]);
        }
        // Determine if more pages are available
        const total = result?.total ?? tutorsWithDistance.length;
        setHasMore((pageNum * params.limit) < total);
      } catch (err: any) {
        console.error('Search error:', err);
        setError(err.response?.data?.message || 'Failed to search tutors. Please try again.');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [currentLat, currentLng, radius],
  );

  // Load initial tutors on page mount
  // On initial mount, show top-rated teachers if no filters are applied
  useEffect(() => {
    if (!filtersApplied.current && tutors.length === 0) {
      // Fetch top-rated teachers by default
      (async () => {
        setLoading(true);
        setError(null);
        try {
          // Use a dedicated endpoint for top-rated tutors
          const response = await apiClient.get('/tutors/top-rated?limit=8');
          const result = Array.isArray(response) ? response : (response?.data || []);
          // Calculate distances if user location is available
          const tutorsWithDistance = result.map((tutor: TutorProfile) => {
            let distance = undefined;
            if (tutor.location?.coordinates && userLat && userLng) {
              const [tutorLng, tutorLat] = tutor.location.coordinates;
              distance = calculateDistance(userLat, userLng, tutorLat, tutorLng);
            }
            return { ...tutor, distance };
          });
          setTutors(tutorsWithDistance);
          setHasMore(false); // No pagination for top-rated default
        } catch (err: any) {
          setError('Failed to load top-rated tutors.');
        } finally {
          setLoading(false);
          setInitialLoading(false);
        }
      })();
    }
  }, [fetchTutors, tutors.length, userLat, userLng]);

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setPage(1);
    // Don't fetch here - wait for Apply Filters button
  };

  const handleApplyFilters = useCallback((appliedFilters: FilterValues) => {
    setFilters(appliedFilters);
    setPage(1);
    filtersApplied.current = true;
    fetchTutors(1, appliedFilters);
  }, [fetchTutors]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchTutors(nextPage, filters);
  };

  const handleUseCurrentLocation = () => {
    getCurrentLocation();
  };

  const handleTutorSelect = (tutor: TutorProfile) => {
    setSelectedTutor(tutor);
  };

  // Auto-fetch tutors when current location is obtained
  useEffect(() => {
    if (userLat && userLng && !filtersApplied.current && tutors.length > 0) {
      // Already have data, don't refetch unless filters are applied
      return;
    }
    
    if (userLat && userLng && !filtersApplied.current && tutors.length === 0) {
      // Initial load with user location
      fetchTutors(1, {});
    }
  }, [userLat, userLng]);

  if (initialLoading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading tutors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Find Tutors</h1>
              <p className="text-sm text-neutral-600 mt-1">
                {tutors.length} {tutors.length === 1 ? 'tutor' : 'tutors'} found
                {userLat && userLng && ' near your location'}
                {geoError && <span className="text-error text-xs ml-2">({geoError})</span>}
              </p>
            </div>

            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={handleUseCurrentLocation}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium text-sm"
                title="Use current location for search"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="hidden sm:inline">📍 Current Location</span>
                <span className="sm:hidden">📍</span>
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  showMap
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
                <span className="hidden sm:inline">🗺️ {showMap ? 'Hide Map' : 'Show Map'}</span>
                <span className="sm:hidden">🗺️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-32">
              <SearchFilters 
                onFilterChange={handleFilterChange}
                onApplyFilters={handleApplyFilters}
                className="shadow-sm"
              />
            </div>
          </aside>

          {/* Results Section */}
          <div className="lg:col-span-3">
            {/* Map View */}
            {showMap && (tutors.length > 0 || userLat && userLng) && (
              <div className="mb-8 rounded-lg overflow-hidden border border-neutral-200 shadow-sm">
                <div className="bg-white p-4">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-2">Tutors Near You</h3>
                  <p className="text-sm text-neutral-600">
                    {userLat && userLng
                      ? `Showing tutors near your location (${userLat.toFixed(4)}, ${userLng.toFixed(4)})`
                      : 'Showing tutors in your search area'}
                  </p>
                </div>
                <div className="relative bg-gray-200 w-full" style={{ minHeight: '400px' }}>
                  {tutors.length > 0 ? (
                    <TutorMap
                      tutors={tutors}
                      center={[currentLng, currentLat]}
                      onMarkerClick={handleTutorSelect}
                      className="w-full h-full"
                      userLocation={
                        userLat && userLng
                          ? { latitude: userLat, longitude: userLng }
                          : undefined
                      }
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                      <div className="text-center">
                        <svg
                          className="w-12 h-12 mx-auto text-neutral-400 mb-2"
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
                        <p className="text-neutral-600">No tutors to display on map</p>
                        <p className="text-sm text-neutral-500 mt-1">
                          Apply filters to find tutors in your area
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Selected Tutor Info */}
                {selectedTutor && selectedTutor.distance !== undefined && (
                  <div className="bg-white border-t border-neutral-200 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-neutral-900 text-lg">{selectedTutor.name}</h4>
                          {selectedTutor.rating !== undefined && (
                            <div className="flex items-center gap-1">
                              <span className="text-sm font-bold text-neutral-900">
                                {selectedTutor.rating.toFixed(1)}
                              </span>
                              <span className="text-sm">⭐</span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-neutral-600 mb-2">
                          📍 {formatDistance(selectedTutor.distance)} away
                        </p>
                        {selectedTutor.hourlyRate && (
                          <p className="text-sm text-neutral-600 mb-2">
                            💰 ${selectedTutor.hourlyRate}/hour
                          </p>
                        )}
                        {selectedTutor.subjects && Array.isArray(selectedTutor.subjects) && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {selectedTutor.subjects.slice(0, 3).map((subject, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs font-medium"
                              >
                                {typeof subject === 'string' ? subject : subject.name}
                              </span>
                            ))}
                          </div>
                        )}
                        {selectedTutor.totalReviews !== undefined && (
                          <p className="text-xs text-neutral-600">
                            {selectedTutor.totalReviews} reviews
                          </p>
                        )}
                      </div>
                      <button className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 transition-colors font-medium">
                        View Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 text-error flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4v2m-6-4a9 9 0 1118 0 9 9 0 01-18 0z"
                    />
                  </svg>
                  <p className="text-error-dark">{error}</p>
                </div>
              </div>
            )}

            {/* Tutor Cards */}
            {tutors.length > 0 ? (
              <div className="space-y-4">
                {tutors.map((tutor) => (
                  <div
                    key={tutor.id}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row gap-4 p-6">
                      {/* Left Side - Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-neutral-900">{tutor.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {Array.isArray(tutor.subjects) &&
                                tutor.subjects.slice(0, 3).map((subject, idx) => (
                                  <span
                                    key={idx}
                                    className="inline-block px-2.5 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                                  >
                                    {typeof subject === 'string' ? subject : subject.name}
                                  </span>
                                ))}
                            </div>
                          </div>
                          {tutor.rating !== undefined && (
                            <div className="text-right">
                              <div className="flex items-center gap-1">
                                <span className="text-lg font-bold text-neutral-900">
                                  {tutor.rating.toFixed(1)}
                                </span>
                                <span className="text-lg">⭐</span>
                              </div>
                              <p className="text-xs text-neutral-600">({tutor.totalReviews} reviews)</p>
                            </div>
                          )}
                        </div>

                        {tutor.bio && (
                          <p className="text-sm text-neutral-600 mt-3 line-clamp-2">{tutor.bio}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-neutral-200">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-primary-600">
                              ${tutor.hourlyRate}
                            </span>
                            <span className="text-sm text-neutral-600">/hour</span>
                          </div>

                          {tutor.distance !== undefined && (
                            <div className="flex items-center gap-2 text-neutral-600">
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              <span className="text-sm font-medium">{formatDistance(tutor.distance)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Actions */}
                      <div className="flex flex-col gap-2 sm:w-32">
                        <button className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm">
                          Book Now
                        </button>
                        <button className="w-full px-4 py-2.5 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium text-sm">
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Load More Button */}
                {hasMore && (
                  <div className="text-center pt-6">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
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
                        'Load More Tutors'
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                  <svg
                    className="w-16 h-16 mx-auto text-neutral-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <h3 className="text-xl font-semibold text-neutral-900 mb-2">No tutors found</h3>
                  <p className="text-neutral-600 mb-6">
                    Try adjusting your filters or expanding your search radius
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium text-sm"
                  >
                    Refresh Search
                  </button>
                </div>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
