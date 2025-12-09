import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { TeacherCard } from './TeacherCard';
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';
import { Teacher } from '@/types/dashboard.types';

export interface TeacherListProps {
  teachers: Teacher[];
  isLoading?: boolean;
  onTeacherClick?: (teacherId: string) => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  isLoading = false,
  onTeacherClick,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query with 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter teachers based on debounced search query
  const filteredTeachers = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return teachers;
    }

    const query = debouncedQuery.toLowerCase().trim();

    return teachers.filter((teacher) => {
      // Search by name
      const nameMatch = teacher.name.toLowerCase().includes(query);

      // Search by subjects
      const subjects = Array.isArray(teacher.subjects)
        ? teacher.subjects.map((s) => (typeof s === 'string' ? s : s.name))
        : [];
      const subjectMatch = subjects.some((subject) => subject.toLowerCase().includes(query));

      return nameMatch || subjectMatch;
    });
  }, [teachers, debouncedQuery]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  // Render loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl">
          <SkeletonLoader variant="input" />
          <div className="w-full sm:w-32 h-10 bg-neutral-200 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <SkeletonLoader key={index} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" role="region" aria-label="Teachers list">
      {/* Header with Search and Filter Button */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="w-full sm:flex-1 max-w-md">
          <label htmlFor="teacher-search" className="sr-only">
            Search teachers by name or subject
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-neutral-400"
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
            </div>
            <input
              id="teacher-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by name or subject..."
              className="block w-full pl-10 pr-10 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              aria-label="Search teachers"
              aria-describedby="search-results-count"
            />
            {searchQuery && (
              <button
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-neutral-600 transition-colors"
                aria-label="Clear search"
                type="button"
              >
                <svg
                  className="h-5 w-5 text-neutral-400 hover:text-neutral-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <div id="search-results-count" className="sr-only">
            {filteredTeachers.length} {filteredTeachers.length === 1 ? 'teacher' : 'teachers'} found
          </div>
        </div>

        {/* Advanced Filter Button */}
        <Link
          href="/search"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-sm"
          aria-label="Open advanced search and filters"
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span className="hidden sm:inline">Advanced Search</span>
          <span className="sm:hidden">Search</span>
        </Link>
      </div>

      {/* Teacher Grid */}
      {filteredTeachers.length > 0 ? (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label={`Available teachers (${filteredTeachers.length})`}
        >
          {filteredTeachers.map((teacher) => (
            <div key={teacher.id} role="listitem">
              <TeacherCard teacher={teacher} onClick={onTeacherClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow-soft" role="status" aria-live="polite">
          <svg
            className="mx-auto h-12 w-12 text-neutral-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-neutral-900">No teachers found</h3>
          <p className="mt-2 text-sm text-neutral-500">
            {searchQuery
              ? "Try adjusting your search to find what you're looking for."
              : 'No teachers are currently available.'}
          </p>
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              type="button"
            >
              Clear search
            </button>
          )}
        </div>
      )}
    </div>
  );
};
