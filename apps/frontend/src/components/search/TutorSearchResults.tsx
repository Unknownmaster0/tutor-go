'use client';

import { useState, useEffect } from 'react';
import { Star, MapPin, Briefcase, DollarSign } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api-client';

interface Tutor {
  id: string;
  name: string;
  bio: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  expertise: string[];
  distance: number;
  latitude: number;
  longitude: number;
  profileImage?: string;
  experienceLevel: string;
  availableHours: number;
}

interface TutorSearchResultsProps {
  latitude: number;
  longitude: number;
  filters: {
    maxDistance: number;
    minRating: number;
    priceRange: [number, number];
    subjects: string[];
    availability: 'any' | 'flexible' | 'specific';
  };
}

export const TutorSearchResults: React.FC<TutorSearchResultsProps> = ({
  latitude,
  longitude,
  filters,
}) => {
  const router = useRouter();
  const [tutors, setTutors] = useState<Tutor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'price'>('distance');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<Tutor[]>('/tutors/search', {
          params: {
            latitude,
            longitude,
            maxDistance: filters.maxDistance,
            minRating: filters.minRating,
            minPrice: filters.priceRange[0],
            maxPrice: filters.priceRange[1],
            subjects: filters.subjects.join(','),
            availability: filters.availability,
          },
        });

        const tutorsData = response || [];

        // Sort tutors
        const sorted = sortTutors(tutorsData, sortBy);
        setTutors(sorted);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load tutors');
        setTutors([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTutors();
  }, [latitude, longitude, filters]);

  const sortTutors = (tutorList: Tutor[], sortType: 'distance' | 'rating' | 'price') => {
    const sorted = [...tutorList];

    switch (sortType) {
      case 'distance':
        return sorted.sort((a, b) => a.distance - b.distance);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'price':
        return sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
      default:
        return sorted;
    }
  };

  const handleSortChange = (newSort: 'distance' | 'rating' | 'price') => {
    setSortBy(newSort);
    setTutors((prev) => sortTutors(prev, newSort));
  };

  const handleViewTutorProfile = (tutorId: string) => {
    router.push(`/tutor/${tutorId}`);
  };

  const handleBookSession = (tutorId: string) => {
    router.push(`/booking/${tutorId}`);
  };

  const handleSaveTutor = (tutorId: string) => {
    toast.success('Tutor saved to favorites');
    // TODO: Implement save to favorites logic
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-gray-600">Loading tutors...</p>
      </div>
    );
  }

  if (tutors.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tutors Found</h3>
        <p className="text-gray-600 mb-6">
          Try adjusting your filters or expanding your search area
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-gray-600">
            Found <span className="font-bold text-gray-900">{tutors.length}</span> tutors
          </p>

          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <div className="flex gap-2">
              {['distance', 'rating', 'price'].map((sort) => (
                <button
                  key={sort}
                  onClick={() => handleSortChange(sort as 'distance' | 'rating' | 'price')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    sortBy === sort
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sort.charAt(0).toUpperCase() + sort.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex gap-2 border border-gray-300 rounded-lg p-1">
            {['list', 'grid'].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'list' | 'grid')}
                className={`px-3 py-1 rounded transition-colors text-sm font-medium ${
                  viewMode === mode ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {mode === 'list' ? 'List' : 'Grid'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      <div
        className={
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'
        }
      >
        {tutors.map((tutor) => (
          <div
            key={tutor.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-4"
          >
            {/* Header with Avatar and Basic Info */}
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {tutor.name.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{tutor.name}</h3>
                <p className="text-sm text-gray-600 truncate">{tutor.experienceLevel}</p>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-2">
                  {renderStars(tutor.rating)}
                  <span className="text-sm font-medium text-gray-900">
                    {tutor.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">({tutor.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-gray-600 line-clamp-2 mt-3">{tutor.bio}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-blue-50 rounded-lg p-2 text-center">
                <DollarSign className="w-4 h-4 text-blue-600 mx-auto" />
                <p className="text-xs text-gray-600 mt-1">${tutor.hourlyRate}/hr</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2 text-center">
                <MapPin className="w-4 h-4 text-green-600 mx-auto" />
                <p className="text-xs text-gray-600 mt-1">{tutor.distance.toFixed(1)} km</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-2 text-center">
                <Briefcase className="w-4 h-4 text-purple-600 mx-auto" />
                <p className="text-xs text-gray-600 mt-1">{tutor.availableHours} hrs</p>
              </div>
            </div>

            {/* Expertise */}
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-700 mb-2">Expertise</p>
              <div className="flex flex-wrap gap-2">
                {tutor.expertise.slice(0, 3).map((subject) => (
                  <span
                    key={subject}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                  >
                    {subject}
                  </span>
                ))}
                {tutor.expertise.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                    +{tutor.expertise.length - 3}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => handleViewTutorProfile(tutor.id)}
                className="flex-1 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium text-sm"
              >
                View Profile
              </button>
              <button
                onClick={() => handleBookSession(tutor.id)}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                Book Now
              </button>
              <button
                onClick={() => handleSaveTutor(tutor.id)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                title="Save to favorites"
              >
                ♥
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
