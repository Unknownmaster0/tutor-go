'use client';

import { useState } from 'react';

interface SearchFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
  className?: string;
}

export interface FilterValues {
  subject?: string;
  minRate?: number;
  maxRate?: number;
  minRating?: number;
  radius?: number;
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

export function SearchFilters({ onFilterChange, className = '' }: SearchFiltersProps) {
  const [filters, setFilters] = useState<FilterValues>({
    radius: 10,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterValues = { radius: 10 };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="lg:hidden text-blue-600 text-sm font-medium"
        >
          {isExpanded ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className={`space-y-4 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Subject Filter */}
        <div>
          <label htmlFor="subject-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Subject
          </label>
          <select
            id="subject-filter"
            value={filters.subject || ''}
            onChange={(e) => handleFilterChange('subject', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Subjects</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>

        {/* Radius Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Distance: {filters.radius} km
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={filters.radius || 10}
            onChange={(e) => handleFilterChange('radius', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1 km</span>
            <span>50 km</span>
          </div>
        </div>

        {/* Rate Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <input
                type="number"
                placeholder="Min"
                value={filters.minRate || ''}
                onChange={(e) => handleFilterChange('minRate', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxRate || ''}
                onChange={(e) => handleFilterChange('maxRate', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Minimum Rating
          </label>
          <select
            id="rating-filter"
            value={filters.minRating || ''}
            onChange={(e) => handleFilterChange('minRating', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Any Rating</option>
            <option value="4.5">4.5+ ⭐</option>
            <option value="4.0">4.0+ ⭐</option>
            <option value="3.5">3.5+ ⭐</option>
            <option value="3.0">3.0+ ⭐</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Reset Filters
        </button>
      </div>
    </div>
  );
}
