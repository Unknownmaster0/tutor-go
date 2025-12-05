'use client';

import React, { useState } from 'react';

interface UserSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: UserFilters) => void;
}

export interface UserFilters {
  role?: 'student' | 'tutor' | 'admin' | '';
  status?: 'active' | 'suspended' | 'unverified' | '';
}

export const UserSearch: React.FC<UserSearchProps> = ({ onSearch, onFilterChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<UserFilters>({
    role: '',
    status: '',
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: keyof UserFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6" data-testid="user-search">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search Input */}
        <div className="md:col-span-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Users
          </label>
          <input
            id="search"
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name or email..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="search-input"
          />
        </div>

        {/* Role Filter */}
        <div>
          <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Role
          </label>
          <select
            id="role-filter"
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            data-testid="role-filter"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="tutor">Tutor</option>
            <option value="admin">Admin</option>
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
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>
      </div>
    </div>
  );
};
