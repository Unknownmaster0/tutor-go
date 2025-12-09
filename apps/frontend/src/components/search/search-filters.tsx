'use client';

import { useState, useCallback } from 'react';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  onApplyFilters?: (filters: FilterValues) => void;
  className?: string;
}

export interface FilterValues {
  subject?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  radius?: number;
  location?: string;
}

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Computer Science',
  'Spanish',
  'French',
  'Music',
  'Art',
];

export function SearchFilters({ onFilterChange, onApplyFilters, className = '' }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    radius: 10,
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    // Don't call onFilterChange here - only update local state
    // This prevents automatic searching on every change
    setHasChanges(true);
  };

  const handleApplyFilters = useCallback(() => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    setHasChanges(false);
  }, [filters, onApplyFilters]);

  const handleReset = useCallback(() => {
    const resetFilters: FilterValues = { radius: 10 };
    setFilters(resetFilters);
    if (onFilterChange) {
      onFilterChange(resetFilters);
    }
    if (onApplyFilters) {
      onApplyFilters(resetFilters);
    }
    setHasChanges(false);
  }, [onFilterChange, onApplyFilters]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <svg
            className="h-6 w-6 text-primary-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-neutral-900">Filters</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden px-3 py-1 text-primary-600 text-sm font-medium hover:bg-primary-50 rounded-md transition-colors"
          aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className={`space-y-5 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Location Filter */}
        <div>
          <label htmlFor="location-filter" className="block text-sm font-medium text-neutral-700 mb-2">
            Location
          </label>
          <div className="flex gap-2">
            <input
              id="location-filter"
              type="text"
              placeholder="City or address..."
              value={filters.location || ''}
              onChange={(e) => handleFilterChange('location', e.target.value || undefined)}
              className="flex-1 px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
              aria-label="Search location"
            />
            <button
              type="button"
              className="px-4 py-2.5 bg-neutral-100 text-neutral-700 rounded-lg hover:bg-neutral-200 transition-colors text-sm font-medium"
              title="Use current location"
              aria-label="Use current location"
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
            </button>
          </div>
        </div>

        {/* Subject Filter */}
        <div>
          <label htmlFor="subject-filter" className="block text-sm font-medium text-neutral-700 mb-2">
            Subject
          </label>
          <select
            id="subject-filter"
            value={filters.subject || ''}
            onChange={(e) => handleFilterChange('subject', e.target.value || undefined)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Distance/Radius Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="radius-filter" className="block text-sm font-medium text-neutral-700">
              Search Distance
            </label>
            <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-md">
              {filters.radius} km
            </span>
          </div>
          <input
            id="radius-filter"
            type="range"
            min="1"
            max="50"
            value={filters.radius || 10}
            onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
            className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
            aria-label="Search distance radius"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-2">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Rate Range Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-3">
            Hourly Rate
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="number"
                placeholder="Min ($)"
                value={filters.minRate || ''}
                onChange={(e) => handleFilterChange('minRate', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                aria-label="Minimum hourly rate"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max ($)"
                value={filters.maxRate || ''}
                onChange={(e) => handleFilterChange('maxRate', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-sm"
                aria-label="Maximum hourly rate"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating-filter" className="block text-sm font-medium text-neutral-700 mb-2">
            Minimum Rating
          </label>
          <select
            id="rating-filter"
            value={filters.minRating || ''}
            onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.0">4.0+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
            <option value="3.0">3.0+ ⭐</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-neutral-200">
          <button
            onClick={handleApplyFilters}
            disabled={!hasChanges}
            className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium text-sm"
            aria-label="Apply filters"
          >
            Apply Filters
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors font-medium text-sm"
            aria-label="Reset all filters"
          >
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
}
