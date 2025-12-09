'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SearchFiltersProps {
  onFiltersChange: (filters: {
    maxDistance: number;
    minRating: number;
    priceRange: [number, number];
    subjects: string[];
    availability: 'any' | 'flexible' | 'specific';
  }) => void;
}

const SUBJECTS = [
  'Mathematics',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'History',
  'Geography',
  'Computer Science',
  'Economics',
  'Foreign Languages',
];

export const SearchFilters: React.FC<SearchFiltersProps> = ({ onFiltersChange }) => {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    'distance',
    'price',
    'rating',
  ]);
  const [maxDistance, setMaxDistance] = useState(25);
  const [minRating, setMinRating] = useState(4);
  const [priceRange, setPriceRange] = useState<[number, number]>([10, 100]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [availability, setAvailability] = useState<'any' | 'flexible' | 'specific'>('any');

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section],
    );
  };

  const handleDistanceChange = (value: number) => {
    setMaxDistance(value);
    notifyChanges(value, minRating, priceRange, selectedSubjects, availability);
  };

  const handleRatingChange = (value: number) => {
    setMinRating(value);
    notifyChanges(maxDistance, value, priceRange, selectedSubjects, availability);
  };

  const handlePriceChange = (index: 0 | 1, value: number) => {
    const newRange: [number, number] = [...priceRange] as [number, number];
    newRange[index] = value;
    if (newRange[0] <= newRange[1]) {
      setPriceRange(newRange);
      notifyChanges(maxDistance, minRating, newRange, selectedSubjects, availability);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    const newSubjects = selectedSubjects.includes(subject)
      ? selectedSubjects.filter((s) => s !== subject)
      : [...selectedSubjects, subject];
    setSelectedSubjects(newSubjects);
    notifyChanges(maxDistance, minRating, priceRange, newSubjects, availability);
  };

  const handleAvailabilityChange = (value: 'any' | 'flexible' | 'specific') => {
    setAvailability(value);
    notifyChanges(maxDistance, minRating, priceRange, selectedSubjects, value);
  };

  const notifyChanges = (
    distance: number,
    rating: number,
    price: [number, number],
    subjects: string[],
    avail: 'any' | 'flexible' | 'specific',
  ) => {
    onFiltersChange({
      maxDistance: distance,
      minRating: rating,
      priceRange: price,
      subjects: subjects,
      availability: avail,
    });
  };

  const clearFilters = () => {
    setMaxDistance(25);
    setMinRating(4);
    setPriceRange([10, 100]);
    setSelectedSubjects([]);
    setAvailability('any');
    onFiltersChange({
      maxDistance: 25,
      minRating: 4,
      priceRange: [10, 100],
      subjects: [],
      availability: 'any',
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full ${i < rating ? 'bg-yellow-400' : 'bg-gray-300'}`}
          />
        ))}
        <span className="text-sm font-medium text-gray-700 ml-2">{rating}+</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Clear All
        </button>
      </div>

      {/* Distance Filter */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('distance')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-gray-900">Distance</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.includes('distance') ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.includes('distance') && (
          <div className="mt-3 space-y-3">
            <input
              type="range"
              min="1"
              max="50"
              value={maxDistance}
              onChange={(e) => handleDistanceChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">1 km</span>
              <span className="font-bold text-blue-600">{maxDistance} km</span>
              <span className="text-gray-600">50 km</span>
            </div>
          </div>
        )}
      </div>

      {/* Rating Filter */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-gray-900">Minimum Rating</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.includes('rating') ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.includes('rating') && (
          <div className="mt-4 space-y-3">
            {[3, 3.5, 4, 4.5, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => handleRatingChange(rating)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  minRating === rating ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-50'
                }`}
              >
                {renderStars(rating)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-gray-900">Price Range</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.includes('price') ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.includes('price') && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum: ${priceRange[0]}/hr
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={priceRange[0]}
                onChange={(e) => handlePriceChange(0, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum: ${priceRange[1]}/hr
              </label>
              <input
                type="range"
                min="10"
                max="200"
                value={priceRange[1]}
                onChange={(e) => handlePriceChange(1, Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-blue-900">
                ${priceRange[0]} - ${priceRange[1]} per hour
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Subjects Filter */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('subjects')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-gray-900">Subjects</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.includes('subjects') ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.includes('subjects') && (
          <div className="mt-3 space-y-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectToggle(subject)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSubjects.includes(subject)
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {selectedSubjects.includes(subject) ? '✓ ' : ''} {subject}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Availability Filter */}
      <div className="border-t pt-4">
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full"
        >
          <span className="font-medium text-gray-900">Availability</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform ${
              expandedSections.includes('availability') ? 'rotate-180' : ''
            }`}
          />
        </button>

        {expandedSections.includes('availability') && (
          <div className="mt-3 space-y-2">
            {[
              { value: 'any', label: 'Any Time' },
              { value: 'flexible', label: 'Flexible Schedule' },
              { value: 'specific', label: 'Specific Hours Only' },
            ].map(({ value, label }) => (
              <button
                key={value}
                onClick={() => handleAvailabilityChange(value as 'any' | 'flexible' | 'specific')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  availability === value
                    ? 'bg-blue-100 text-blue-900 border border-blue-300'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {availability === value ? '✓ ' : ''} {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Count */}
      {(maxDistance !== 25 ||
        minRating !== 4 ||
        priceRange[0] !== 10 ||
        priceRange[1] !== 100 ||
        selectedSubjects.length > 0 ||
        availability !== 'any') && (
        <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900">
            {[
              maxDistance !== 25 && '1 distance filter',
              minRating !== 4 && '1 rating filter',
              (priceRange[0] !== 10 || priceRange[1] !== 100) && '1 price filter',
              selectedSubjects.length > 0 && `${selectedSubjects.length} subject(s)`,
              availability !== 'any' && '1 availability filter',
            ]
              .filter(Boolean)
              .join(' • ')}
          </p>
        </div>
      )}
    </div>
  );
};
