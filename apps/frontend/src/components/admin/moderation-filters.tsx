'use client';

import React, { useState } from 'react';

interface ModerationFiltersProps {
  onFilterChange: (filters: ModerationFilters) => void;
}

export interface ModerationFilters {
  type?: 'review' | 'message' | '';
  status?: 'pending' | 'approved' | 'removed' | '';
}

export const ModerationFilters: React.FC<ModerationFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<ModerationFilters>({
    type: '',
    status: '',
  });

  const handleFilterChange = (key: keyof ModerationFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="moderation-filters">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type Filter */}
        <div>
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Content Type
          </label>
          <select
            id="type-filter"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="type-filter"
          >
            <option value="">All Types</option>
            <option value="review">Reviews</option>
            <option value="message">Messages</option>
          </select>
        </div>

        {/* Status Filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="status-filter"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>
    </div>
  );
};
